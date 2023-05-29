import TableMain from "../Home/tableMain";
import { useState, useRef, useEffect } from "react";
//  import LeagueInfo from "../Leagues/leagueInfo";
import { useSelector } from 'react-redux';
import LeagueInfo from "../Leagues/leagueInfo";
import { getPlayerBreakdown } from "../../functions/misc";
import PlayerModal from "./playerModal";

const PlayerLeagues = ({
    leagues_owned,
    leagues_taken,
    leagues_available,
    trend_games,
    snapPercentageMin,
    snapPercentageMax,
    getPlayerScore,
    player_id,
    allPlayers,
    tooltipVisible,
    setTooltipVisible
}) => {
    const [tab, setTab] = useState('Owned');
    const [page, setPage] = useState(1)
    const [itemActive, setItemActive] = useState('');
    const { allPlayers: stateAllPlayers } = useSelector(state => state.leagues)
    const { stats: stateStats } = useSelector(state => state.stats)
    const [playerModalVisible2, setPlayerModalVisible2] = useState(false)
    const playerModalRef = useRef(null)


    useEffect(() => {
        if (playerModalRef.current) {
            playerModalRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }
    }, [playerModalVisible2])

    useEffect(() => {
        const handleExitModal = (ref, setState) => {
            return (event) => {
                if (!ref.current || !ref.current.contains(event.target)) {

                    setState(false)
                }
            }
        };


        const handleExitPlayerModal = handleExitModal(playerModalRef, setPlayerModalVisible2)

        document.addEventListener('mousedown', handleExitPlayerModal)
        document.addEventListener('touchstart', handleExitPlayerModal)

        return () => {
            document.removeEventListener('mousedown', handleExitPlayerModal);
            document.removeEventListener('touchstart', handleExitPlayerModal);
        };
    }, [])

    let player_leagues_headers = [
        [
            {
                text: 'League',
                colSpan: 3,
                className: 'half'
            },
            {
                text: 'PPG',
                colSpan: 1
            },
            {
                text: 'Rank',
                colSpan: 1,
                className: 'half'
            }
        ]
    ]

    if (tab === 'Taken') {
        player_leagues_headers[0].push(
            {
                text: 'Manager',
                colSpan: 2,
                className: 'half'
            }
        )
    }

    const leagues_display = tab === 'Owned' ? leagues_owned :
        tab === 'Taken' ? leagues_taken :
            tab === 'Available' ? leagues_available :
                null

    const player_leagues_body = leagues_display.map(lo => {
        const player_score = getPlayerScore(trend_games, lo.scoring_settings)
        return {
            id: lo.league_id,
            list: [
                {
                    text: lo.name,
                    colSpan: 3,
                    className: 'left',
                    image: {
                        src: lo.avatar,
                        alt: lo.name,
                        type: 'league'
                    }
                },
                {
                    text: getPlayerBreakdown(
                        lo.league_id,
                        trend_games,
                        tooltipVisible,
                        setTooltipVisible,
                        setPlayerModalVisible2,
                        allPlayers,
                        trend_games?.length > 0
                        && (Object.keys(player_score || {})
                            .reduce(
                                (acc, cur) => acc + player_score[cur].points, 0) / trend_games.length)
                            .toFixed(1)
                        || '-',
                        lo.scoring_settings,
                        lo
                    ),
                    colSpan: 1
                },
                {
                    text: lo.userRoster?.rank,
                    colSpan: 1,
                    className: lo.userRoster?.rank / lo.rosters.length <= .25 ? 'green' :
                        lo.userRoster?.rank / lo.rosters.length >= .75 ? 'red' :
                            null
                },
                tab === 'Taken' ?
                    {
                        text: lo.lmRoster?.username || 'Orphan',
                        colSpan: 2,
                        className: 'left end',
                        image: {
                            src: lo.lmRoster?.avatar,
                            alt: lo.lmRoster?.username,
                            type: 'user'
                        }
                    }
                    : ''

            ],
            secondary_table: (
                <LeagueInfo
                    stateAllPlayers={stateAllPlayers}
                    scoring_settings={lo.scoring_settings}
                    league={lo}
                    stateStats={stateStats}
                    getPlayerScore={getPlayerScore}
                    snapPercentageMin={snapPercentageMin}
                    snapPercentageMax={snapPercentageMax}
                    setPlayerModalVisible2={setPlayerModalVisible2}
                    type='tertiary'

                />
            )
        }
    })


    return <>

        <div className="secondary nav">
            <button
                className={tab === 'Owned' ? 'active click' : 'click'}
                onClick={() => setTab('Owned')}
            >
                Owned
            </button>
            <button
                className={tab === 'Taken' ? 'active click' : 'click'}
                onClick={() => setTab('Taken')}
            >
                Taken
            </button>
            <button
                className={tab === 'Available' ? 'active click' : 'click'}
                onClick={() => setTab('Available')}
            >
                Available
            </button>
        </div>
        <div className="relative">
            {
                !playerModalVisible2 ?
                    null
                    :
                    <div className="modal" ref={playerModalRef} >
                        <PlayerModal
                            setPlayerModalVisible={setPlayerModalVisible2}
                            player={{
                                ...allPlayers[player_id],
                                ...playerModalVisible2
                            }}
                            getPlayerScore={getPlayerScore}
                            league={playerModalVisible2?.league}
                        />
                    </div>
            }
            <TableMain
                type={'secondary'}
                headers={player_leagues_headers}
                body={player_leagues_body}
                itemActive={itemActive}
                setItemActive={setItemActive}
                page={page}
                setPage={setPage}
            />
        </div>
    </>
}

export default PlayerLeagues;