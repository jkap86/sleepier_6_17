import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import TableMain from '../Home/tableMain';
import PlayerModal from "./playerModal";
import PlayerLeagues from "./playerLeagues";
import headshot from '../../images/headshot.png';
import { getLocalDate } from '../../functions/dates';
import { fetchStats, fetchValues, setTrendDateStart, setTrendDateEnd } from '../../actions/actions';
import '../css/players.css';
import { loadingIcon, getPlayerBreakdown, getTrendColor } from "../../functions/misc";
import { draftClassFilterIcon, positionFilterIcon, teamFilterIcon } from "../../functions/filterIcons";

const Players = ({ }) => {
    const dispatch = useDispatch();
    const [itemActive, setItemActive] = useState('');
    const [page, setPage] = useState(1)
    const [searched, setSearched] = useState('')
    const [filterPosition, setFilterPosition] = useState('W/R/T/Q')
    const [filterTeam, setFilterTeam] = useState('All')
    const [filterDraftClass, setFilterDraftClass] = useState('All')
    const [statType1, setStatType1] = useState('KTC SF')
    const [statType2, setStatType2] = useState('SF Trend')
    const [optionsVisible, setOptionsVisible] = useState(false)
    const [playerModalVisible, setPlayerModalVisible] = useState(false)
    const [snapPercentageMin, setSnapPercentageMin] = useState(0)
    const [snapPercentageMax, setSnapPercentageMax] = useState(100)
    const [sortBy, setSortBy] = useState('Owned')
    const { trendDateStart, trendDateEnd } = useSelector((state) => state.user);
    const { filteredData: playersharesFiltered, filteredLeagueCount } = useSelector(state => state.filteredData);
    const { allPlayers, state, leagues } = useSelector(state => state.leagues);
    const { stats } = useSelector(state => state.stats)
    const { dynastyValues } = useSelector(state => state.dynastyValues)
    const modalRef = useRef(null)
    const playerModalRef = useRef(null)
    const [tooltipVisible, setTooltipVisible] = useState(false)

    useEffect(() => {

        if (trendDateStart && trendDateEnd && playersharesFiltered?.length > 0) {

            dispatch(fetchStats(trendDateStart, trendDateEnd, playersharesFiltered.map(player => player.id)))

            dispatch(fetchValues(trendDateStart, trendDateEnd))

        }
    }, [trendDateStart, trendDateEnd, playersharesFiltered])

    useEffect(() => {
        if (modalRef.current) {
            modalRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }
    }, [optionsVisible])

    useEffect(() => {
        if (playerModalRef.current) {
            playerModalRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }
    }, [playerModalVisible])

    useEffect(() => {
        const handleExitModal = (ref, setState) => {
            return (event) => {
                if (!ref.current || !ref.current.contains(event.target)) {

                    setState(false)
                }
            }
        };

        const handleExitFiltersModal = handleExitModal(modalRef, setOptionsVisible)
        const handleExitPlayerModal = handleExitModal(playerModalRef, setPlayerModalVisible)

        document.addEventListener('mousedown', handleExitFiltersModal)
        document.addEventListener('touchstart', handleExitFiltersModal)

        document.addEventListener('mousedown', handleExitPlayerModal)
        document.addEventListener('touchstart', handleExitPlayerModal)

        return () => {
            document.removeEventListener('mousedown', handleExitFiltersModal);
            document.removeEventListener('touchstart', handleExitFiltersModal);

            document.removeEventListener('mousedown', handleExitPlayerModal);
            document.removeEventListener('touchstart', handleExitPlayerModal);
        };
    }, [])

    const handleMaxMinChange = (type, value) => {

        switch (type) {
            case 'minsnappct':
                snapPercentageMin > snapPercentageMax && setSnapPercentageMax(value)
                break;
            case 'maxsnappct':
                snapPercentageMin > snapPercentageMax && setSnapPercentageMin(value)
                break;
            case 'mintrend':
                trendDateStart > trendDateEnd && dispatch(setTrendDateEnd(value))
                break;
            case 'maxtrend':
                trendDateStart > trendDateEnd && dispatch(setTrendDateStart(value))
                break;
            default:
                break
        }
    }

    const getPlayerScore = (stats_array, scoring_settings) => {
        let total_breakdown = {};

        stats_array?.map(stats_game => {
            Object.keys(stats_game.stats || {})
                .filter(x => Object.keys(scoring_settings).includes(x) && scoring_settings[x] > 0)
                .map(key => {
                    if (!total_breakdown[key]) {
                        total_breakdown[key] = {
                            stats: 0,
                            points: 0
                        }
                    }
                    total_breakdown[key] = {
                        stats: total_breakdown[key].stats + stats_game.stats[key],
                        points: total_breakdown[key].points + (stats_game.stats[key] * scoring_settings[key])
                    }
                })
        })

        return total_breakdown;
    }

    const stat_categories = Array.from(
        new Set(leagues
            .flatMap(league =>
                Object.keys(league.scoring_settings || {})
                    .filter(
                        setting => (
                            setting.startsWith('pass')
                            || setting.startsWith('rush')
                            || setting.startsWith('rec')
                            || setting.startsWith('bonus')
                            || setting.startsWith('fum ')
                        ) && (
                                league.scoring_settings[setting] > 0
                            )
                    )
            )
        )
    )




    const category_dropdown = (statType, setStatType) => {
        const otherType = statType === statType1 ? statType2 : statType1

        return <label className="select">
            <p>{statType.replace(/_/g, ' ')}</p>

            <select className="hidden_behind click" value={statType} onChange={(e) => setStatType(e.target.value)}>
                {
                    ['KTC SF', 'KTC 1QB', 'SF Trend', '1QB Trend']
                        .filter(x => x !== otherType)
                        .map(cat => {
                            return <option value={cat}>
                                {cat}
                            </option>
                        })
                }
                {
                    stat_categories
                        .filter(x => x.startsWith('pass') && x !== otherType)
                        .sort((a, b) => a.length < b.length ? -1 : 1)
                        .map(cat => {
                            return <option value={cat}>
                                {cat.replace(/_/g, ' ')}
                            </option>
                        })
                }
                {
                    stat_categories
                        .filter(x => x.startsWith('rush') && x !== otherType)
                        .sort((a, b) => a.length < b.length ? -1 : 1)
                        .map(cat => {
                            return <option value={cat}>
                                {cat.replace(/_/g, ' ')}
                            </option>
                        })
                }
                {
                    stat_categories
                        .filter(x => x.startsWith('rec') && x !== otherType)
                        .sort((a, b) => a.length < b.length ? -1 : 1)
                        .map(cat => {
                            return <option value={cat}>
                                {cat.replace(/_/g, ' ')}
                            </option>
                        })
                }
                {
                    stat_categories
                        .filter(x => !x.startsWith('pass') && !x.startsWith('rush') && !x.startsWith('rec') && x !== otherType)
                        .sort((a, b) => a.length < b.length ? -1 : 1)
                        .map(cat => {
                            return <option value={cat}>
                                {cat.replace(/_/g, ' ')}
                            </option>
                        })
                }
            </select>
        </label>
    }

    const playerShares_headers = [
        [
            {
                text: <> Player</>,
                colSpan: 10,

            },

            {
                text: 'Owned',
                colSpan: 5,
            },
            {
                text: category_dropdown(statType1, setStatType1),
                colSpan: 3,
                className: 'small'
            },
            {
                text: category_dropdown(statType2, setStatType2),
                colSpan: 3,
                className: 'small'
            },
            {
                text: 'PPG',
                colSpan: 2
            },


            {
                text: 'GP',
                colSpan: 2,
            }
        ]
    ]

    const playerShares_body = playersharesFiltered
        ?.filter(x =>
            (
                x.id?.includes('_') || allPlayers[x.id])
            && (
                filterPosition === allPlayers[x.id]?.position
                || filterPosition.split('/').includes(allPlayers[x.id]?.position?.slice(0, 1))
                || (
                    filterPosition === 'Picks' && x.id?.includes('_')
                )
            ) && (
                filterTeam === 'All' || allPlayers[x.id]?.team === filterTeam
            ) && (
                filterDraftClass === 'All' || parseInt(filterDraftClass) === (state.league_season - allPlayers[parseInt(x.id)]?.years_exp)
            )
        )
        ?.map(player => {
            let pick_name;
            let ktc_name;
            let cur_value;
            let prev_value;
            if (player.id?.includes('_')) {
                const pick_split = player.id.split('_')
                pick_name = `${pick_split[0]} ${pick_split[1]}.${pick_split[2].toLocaleString("en-US", { minimumIntegerDigits: 2 })}`
                ktc_name = `${pick_split[0]} ${parseInt(pick_split[2]) <= 4 ? 'Early' : parseInt(pick_split[2]) >= 9 ? 'Late' : 'Mid'} ${pick_split[1]}`


                cur_value = dynastyValues
                    ?.find(dr => getLocalDate(dr.date) === getLocalDate(trendDateEnd))
                    ?.values[ktc_name]


                prev_value = dynastyValues
                    ?.find(dr => getLocalDate(dr.date) === getLocalDate(trendDateStart))
                    ?.values[ktc_name]

            } else {


                cur_value = dynastyValues
                    ?.find(dr => dr.date.toString() === trendDateEnd.toString())
                    ?.values[player.id]


                prev_value = dynastyValues
                    ?.find(dr => dr.date.toString() === trendDateStart.toString())
                    ?.values[player.id]


            }



            const trend_games = stats?.[player.id]
                ?.filter(
                    s =>
                        s.stats.tm_off_snp > 0
                        && ((s.stats.snp || s.stats.off_snp || 0) / (s.stats.tm_off_snp) * 100 >= snapPercentageMin)
                        && ((s.stats.snp || s.stats.off_snp || 0) / (s.stats.tm_off_snp) * 100 <= snapPercentageMax)

                ) || []


            const stat_trend1 = statType1 === 'KTC SF'
                ? cur_value?.sf || '-'
                : statType1 === 'KTC 1QB'
                    ? cur_value?.oneqb || '-'
                    : statType1 === 'SF Trend'
                        ? (cur_value?.sf && prev_value?.sf && cur_value?.sf - prev_value?.sf) || '-'
                        : statType1 === '1QB Trend'
                            ? (cur_value?.oneqb && prev_value?.oneqb && cur_value?.oneqb - prev_value?.oneqb) || '-'
                            : trend_games?.length > 0
                            && (trend_games?.reduce((acc, cur) => acc + (cur.stats?.[statType1] || 0), 0) / trend_games?.length)?.toFixed(1)
                            || '-'

            const stat_trend2 = statType2 === 'KTC SF'
                ? cur_value?.sf || '-'
                : statType2 === 'KTC 1QB'
                    ? cur_value?.oneqb || '-'
                    : statType2 === 'SF Trend'
                        ? (cur_value?.sf && prev_value?.sf && cur_value?.sf - prev_value?.sf) || '-'
                        : statType2 === '1QB Trend'
                            ? (cur_value?.oneqb && prev_value?.oneqb && cur_value?.oneqb - prev_value?.oneqb) || '-'
                            : trend_games?.length > 0
                            && (trend_games?.reduce((acc, cur) => acc + (cur.stats?.[statType2] || 0), 0) / trend_games?.length)?.toFixed(1)
                            || '-'

            return {
                id: player.id,
                search: {
                    text: allPlayers[player.id] && `${allPlayers[player.id]?.full_name} ${allPlayers[player.id]?.position} ${allPlayers[player.id]?.team || 'FA'}` || pick_name,
                    image: {
                        src: player.id,
                        alt: 'player photo',
                        type: 'player'
                    }
                },
                list: [
                    {
                        text: player.id.includes('_') ? pick_name : `${allPlayers[player.id]?.position} ${allPlayers[player.id]?.full_name} ${player.id.includes('_') ? '' : allPlayers[player.id]?.team || 'FA'}` || `INACTIVE PLAYER`,
                        colSpan: 10,
                        className: 'left',
                        image: {
                            src: allPlayers[player.id] ? player.id : headshot,
                            alt: allPlayers[player.id]?.full_name || player.id,
                            type: 'player'
                        }
                    },

                    {
                        text: player.leagues_owned.length.toString(),
                        colSpan: 2
                    },
                    {
                        text: < em >
                            {((player.leagues_owned.length / filteredLeagueCount) * 100).toFixed(1) + '%'}
                        </em >,
                        colSpan: 3
                    },
                    {
                        text: <p
                            className={statType1.endsWith('Trend') && (stat_trend1 > 0 ? ' green stat' : stat_trend1 < 0 ? ' red stat' : 'stat') || 'stat'}
                            style={statType1.endsWith('Trend') && getTrendColor(stat_trend1, 1.5) || {}}
                        >
                            {(statType1.endsWith('Trend') && stat_trend1 > 0 ? '+' : '') + stat_trend1}
                        </p>,
                        colSpan: 3,

                    },
                    {
                        text: <p
                            className={statType2.endsWith('Trend') && (stat_trend2 > 0 ? 'green stat' : stat_trend2 < 0 ? 'red stat' : 'stat') || 'stat'}
                            style={statType2.endsWith('Trend') && getTrendColor(stat_trend2, 1.5) || {}}
                        >
                            {(statType2.endsWith('Trend') && stat_trend2 > 0 ? '+' : '') + stat_trend2}
                        </p>,
                        colSpan: 3,
                        className: "stat"

                    },
                    {
                        text: getPlayerBreakdown(
                            player.id,
                            trend_games,
                            tooltipVisible,
                            setTooltipVisible,
                            setPlayerModalVisible,
                            allPlayers,
                            (
                                trend_games?.length > 0
                                && (trend_games?.reduce((acc, cur) => acc + cur.stats.pts_ppr, 0) / trend_games?.length)?.toFixed(1)
                                || '-'
                            )
                        ),
                        colSpan: 2,
                        className: "stat"

                    },
                    {
                        text: <p className="stat">{trend_games?.length || '-'}</p>,
                        colSpan: 2,
                        className: "stat"
                    },
                ],
                secondary_table: (
                    <PlayerLeagues
                        leagues_owned={player.leagues_owned}
                        leagues_taken={player.leagues_taken}
                        leagues_available={player.leagues_available}
                        stateStats={stats}
                        trend_games={trend_games}
                        snapPercentageMin={snapPercentageMin}
                        snapPercentageMax={snapPercentageMax}
                        player_id={player.id}
                        allPlayers={allPlayers}
                        getPlayerScore={getPlayerScore}
                        tooltipVisible={tooltipVisible}
                        setTooltipVisible={setTooltipVisible}
                        playerModalVisible={playerModalVisible}
                        setPlayerModalVisible={setPlayerModalVisible}
                    />
                )
            }
        })
        .sort(
            (a, b) => (sortBy === statType1.replace(/_/g, ' ')
                ? (parseInt(b.list[3].text.props.children) || 0) - (parseInt(a.list[3].text.props.children) || 0)
                : sortBy === statType2.replace(/_/g, ' ')
                    ? (parseFloat(b.list[4].text.props.children) || 0) - (parseFloat(a.list[4].text.props.children) || 0)
                    : sortBy === 'PPG'
                        ? (parseFloat(b.list[5].text.props.children) || 0) - (parseFloat(a.list[5].text.props.children) || 0)
                        : sortBy === 'GP'
                            ? (parseInt(b.list[6].text) || 0) - (parseInt(a.list[6].text) || 0)

                            : (parseInt(b.list[1].text) || 0) - (parseInt(a.list[1].text) || 0)

            ) || parseInt(a.id.split('_')[0]) - parseInt(b.id.split('_')[0])
                || parseInt(a.id.split('_')[1]) - parseInt(b.id.split('_')[1])
                || parseInt(a.id.split('_')[2]) - parseInt(b.id.split('_')[2])
        )



    const teamFilter = teamFilterIcon(filterTeam, setFilterTeam)

    const positionFilter = positionFilterIcon(filterPosition, setFilterPosition, true)

    const player_ids = playersharesFiltered?.filter(p => parseInt(allPlayers[parseInt(p.id)]?.years_exp) >= 0)?.map(p => parseInt(p.id))

    const draftClassYears = Array.from(
        new Set(
            player_ids
                ?.map(player_id => state.league_season - allPlayers[parseInt(player_id)]?.years_exp)
        )
    )?.sort((a, b) => b - a)

    const draftClassFilter = draftClassFilterIcon(filterDraftClass, setFilterDraftClass, draftClassYears)

    return !playersharesFiltered
        ? loadingIcon
        : <>

            {
                optionsVisible ?
                    <div className="modal" >
                        <div className="modal-grid" ref={modalRef}>
                            <button className="close" onClick={() => setOptionsVisible(false)}>X</button>
                            <div className="modal-grid-item">
                                <div className="modal-grid-content header"><strong>Trend Range</strong>
                                </div>
                                <div className="modal-grid-content one">

                                    <input
                                        type={'date'}
                                        value={trendDateStart}
                                        onChange={(e) => e.target.value && dispatch(setTrendDateStart(new Date(e.target.value).toISOString().split('T')[0]))}
                                        onBlur={(e) => handleMaxMinChange('mintrend', e.target.value)}
                                        onMouseLeave={(e) => handleMaxMinChange('mintrend', e.target.value)}
                                        onMouseEnter={(e) => handleMaxMinChange('maxtrend', e.target.value)}
                                    />

                                </div>
                                <div className="modal-grid-content three">

                                    <input
                                        type={'date'}
                                        value={trendDateEnd}
                                        onChange={(e) => e.target.value && dispatch(setTrendDateEnd(new Date(e.target.value).toISOString().split('T')[0]))}
                                        onBlur={(e) => handleMaxMinChange('maxtrend', e.target.value)}
                                        onMouseLeave={(e) => handleMaxMinChange('maxtrend', e.target.value)}
                                        onMouseEnter={(e) => handleMaxMinChange('mintrend', e.target.value)}
                                    />

                                </div>
                            </div>
                            <div className="modal-grid-item">
                                <div className="modal-grid-content header">
                                    <strong>Game Filters</strong>
                                </div>
                            </div>
                            <div className="modal-grid-item">
                                <div className="modal-grid-content one">
                                    <strong>Snap %</strong>
                                </div>
                                <div className="modal-grid-content two">
                                    Min <input
                                        type={'number'}
                                        min={'0'}
                                        max={'100'}
                                        value={snapPercentageMin}
                                        onChange={(e) => setSnapPercentageMin(e.target.value)}
                                        onBlur={(e) => handleMaxMinChange('minsnappct', e.target.value)}
                                        onMouseLeave={(e) => handleMaxMinChange('minsnappct', e.target.value)}
                                        onMouseEnter={(e) => handleMaxMinChange('maxsnappct', e.target.value)}
                                    /> %
                                </div>
                                <div className="modal-grid-content three">
                                    Min <input
                                        type={'number'}
                                        min={'0'}
                                        max={'100'}
                                        value={snapPercentageMax}
                                        onChange={(e) => setSnapPercentageMax(e.target.value)}
                                        onBlur={(e) => handleMaxMinChange('maxsnappct', e.target.value)}
                                        onMouseLeave={(e) => handleMaxMinChange('maxsnappct', e.target.value)}
                                        onMouseEnter={(e) => handleMaxMinChange('minsnappct', e.target.value)}
                                    /> %
                                </div>
                            </div>
                        </div>
                    </div >
                    :
                    null
            }

            <div className="trend-range">
                <label className="sort">
                    <i class="fa-solid fa-beat fa-sort click"></i>
                    <select
                        className="hidden_behind click"
                        onChange={(e) => setSortBy(e.target.value)}
                        value={sortBy}
                    >
                        <option>OWNED</option>
                        <option>{statType1}</option>
                        <option>{statType2}</option>
                        <option>GP</option>
                        <option>PPG</option>
                    </select>
                </label>
                &nbsp;
                {new Date(new Date(trendDateStart).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' })}
                &nbsp;-&nbsp;
                {new Date(new Date(trendDateEnd).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' })}
                &nbsp;<label className="sort">
                    <i
                        className="fa-solid fa-filter fa-beat click"
                        onClick={async () => setOptionsVisible(true)}
                    >
                    </i>
                </label>
            </div>
            <div className="relative">
                {
                    !playerModalVisible ?
                        null
                        :
                        <div className="modal" ref={playerModalRef} >
                            <PlayerModal
                                setPlayerModalVisible={setPlayerModalVisible}
                                player={playerModalVisible}
                                getPlayerScore={getPlayerScore}
                            />
                        </div>
                }
                <TableMain
                    id={'Players'}
                    type={'primary'}
                    headers={playerShares_headers}
                    body={playerShares_body}
                    page={page}
                    setPage={setPage}
                    itemActive={itemActive}
                    setItemActive={setItemActive}
                    search={true}
                    searched={searched}
                    setSearched={setSearched}
                    options1={[teamFilter]}
                    options2={[positionFilter, draftClassFilter]}

                />
            </div>
        </>
}

export default Players;