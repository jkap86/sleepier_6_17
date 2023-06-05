import axios from 'axios';
import { filterData } from '../functions/filterData';
import { getTradeTips } from '../functions/getTradeTips';


export const RESET_STATE = 'RESET_STATE';

export const resetState = () => ({
    type: RESET_STATE
});

export const setType1 = (type1) => ({
    type: 'SET_TYPE1',
    payload: type1,
});

export const setType2 = (type2) => ({
    type: 'SET_TYPE2',
    payload: type2,
});

export const setTab = (tab) => ({
    type: 'SET_TAB',
    payload: tab
});

export const setTrendDateStart = (date) => ({
    type: 'SET_TRENDDATESTART',
    payload: date
});

export const setTrendDateEnd = (date) => ({
    type: 'SET_TRENDDATEEND',
    payload: date
})

export const fetchUser = (username) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_USER_START' });

        try {
            const response = await axios.post('/user/create', { username });
            if (!response.data?.error) {
                dispatch({ type: 'FETCH_USER_SUCCESS', payload: response.data[0] });
            } else {
                dispatch({ type: 'FETCH_USER_FAILURE', payload: response.data });
            }
        } catch (error) {
            dispatch({ type: 'FETCH_USER_FAILURE', payload: error.message });
        }
    };
};

export const fetchLeagues = (user_id) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_LEAGUES_START' });

        try {
            const [home, leagues] = await Promise.all([
                axios.get('/home'),
                axios.post('/league/find', { user_id: user_id }),
            ]);

            console.log(home.data)

            dispatch({
                type: 'FETCH_LEAGUES_SUCCESS', payload: {
                    state: home.data.state,
                    allPlayers: home.data.allplayers,
                    schedule: home.data.schedule,
                    projections: home.data.projections,
                    leagues: leagues.data
                        .filter(league => league.rosters
                            ?.find(r => r.user_id === user_id || r.co_owners?.find(co => co?.user_id === user_id))
                        )
                        .map(league => {
                            const userRoster = league.rosters
                                ?.find(r => r.user_id === user_id || r.co_owners?.find(co => co?.user_id === user_id))

                            return {
                                ...league,
                                userRoster: userRoster,
                            }

                        })
                }
            })

        } catch (error) {
            console.log(error)
            dispatch({ type: 'FETCH_LEAGUES_FAILURE', payload: error.message });
        }
    };
};

export const fetchFilteredData = (leagues, type1, type2, tab, season) => async (dispatch) => {
    dispatch({ type: 'FETCH_FILTERED_DATA_START' });

    try {
        const filteredData = filterData(leagues, type1, type2, tab, season);

        console.log(filteredData)
        dispatch({
            type: 'FETCH_FILTERED_DATA_SUCCESS',
            payload: filteredData
        });
    } catch (error) {
        dispatch({ type: 'FETCH_FILTERED_DATA_FAILURE', payload: error.message });
    }
};

export const fetchStats = (trendDateStart, trendDateEnd, players, league) => async (dispatch) => {
    dispatch({ type: 'FETCH_STATS_START' })

    try {
        const stats = await axios.post('/dynastyrankings/stats', {
            players: players,
            date1: trendDateStart,
            date2: trendDateEnd
        });



        dispatch({ type: 'FETCH_STATS_SUCCESS', payload: { ...stats.data, league: league } })
    } catch (error) {
        dispatch({ type: 'FETCH_STATS_FAILURE', payload: error.message })
    }
};

export const fetchValues = (trendDateStart, trendDateEnd, dates) => async (dispatch, getState) => {
    dispatch({ type: 'FETCH_DYNASTY_VALUES_START' })
    console.log(trendDateStart)
    let dynastyValues;
    try {
        if (dates) {
            dynastyValues = await axios.post('/dynastyrankings/findrange', {
                dates: dates
            })
        } else {
            dynastyValues = await axios.post('/dynastyrankings/find', {

                date1: trendDateStart,
                date2: trendDateEnd
            });
        }

        console.log(dynastyValues.data)
        dispatch({ type: 'FETCH_DYNASTY_VALUES_SUCCESS', payload: dynastyValues.data })
    } catch (error) {
        dispatch({ type: 'FETCH_DYNASTY_VALUES_FAILURE', payload: error.message })
    }
};

export const syncLeague = (league_id, user_id) => {
    return async (dispatch) => {
        dispatch({ type: 'SYNC_LEAGUE_START' })

        try {
            const updated_league = await axios.post(`/league/sync`, {
                league_id: league_id,
                user_id: user_id
            })

            const userRoster = updated_league.data.rosters
                ?.find(r => r.user_id === user_id || r.co_owners?.find(co => co?.user_id === user_id))

            dispatch({
                type: 'SYNC_LEAGUES_SUCCESS',
                payload: {
                    ...updated_league.data,
                    userRoster: userRoster
                }
            })
        } catch (error) {
            console.log(error)
            dispatch({ type: 'SYNC_LEAGUES_FAILURE' })
        }

    };
}

export const fetchLmTrades = (user_id, leagues, season, offset, limit) => {
    return async (dispatch) => {
        dispatch({ type: 'FETCH_LMTRADES_START' });

        try {
            const trades = await axios.post('/trade/leaguemate', {
                user_id: user_id,
                offset: offset,
                limit: limit
            })



            const trades_tips = getTradeTips(trades.data.rows, leagues, season)
            console.log({ trades_tips: trades_tips })
            dispatch({
                type: 'FETCH_LMTRADES_SUCCESS', payload: {
                    count: trades.data.count,
                    trades: trades_tips
                }
            });
        } catch (error) {
            dispatch({ type: 'FETCH_LMTRADES_ERROR', payload: error.message })
        }
    }
}

export const fetchFilteredLmTrades = (searchedPlayerId, searchedManagerId, league_season, offset, limit) => async (dispatch, getState) => {
    dispatch({ type: 'FETCH_FILTERED_LMTRADES_START' });

    const state = getState();

    const { user, leagues } = state;

    try {
        const trades = await axios.post('/trade/leaguemate', {
            user_id: user.user.user_id,
            player: searchedPlayerId,
            manager: searchedManagerId,
            offset: offset,
            limit: limit,
        });
        console.log(trades.data)
        const trades_tips = getTradeTips(trades.data.rows, leagues.leagues, league_season)
        console.log(trades_tips)
        dispatch({
            type: 'FETCH_FILTERED_LMTRADES_SUCCESS',
            payload: {
                player: searchedPlayerId,
                manager: searchedManagerId,
                trades: trades_tips,
                count: trades.data.count,
            },
        });
    } catch (error) {
        dispatch({ type: 'FETCH_FILTERED_LMTRADES_FAILURE', payload: error.message });
    }


};

export const fetchPriceCheckTrades = (pricecheck_player, pricecheck_player2, offset, limit) => async (dispatch, getState) => {
    dispatch({ type: 'FETCH_PRICECHECK_START' });

    const state = getState();

    const { user, leagues } = state;

    try {
        const player_trades = await axios.post('/trade/pricecheck', {
            player: pricecheck_player,
            player2: pricecheck_player2,
            offset: offset,
            limit: limit
        })

        const trades_tips = getTradeTips(player_trades.data.rows, leagues.leagues, leagues.leaguematesDict, leagues.state.league_season)
        console.log(trades_tips)
        dispatch({
            type: 'FETCH_PRICECHECK_SUCCESS',
            payload: {
                pricecheck_player: pricecheck_player,
                pricecheck_player2: pricecheck_player2,
                trades: trades_tips,
                count: player_trades.data.count,
            },
        });
    } catch (error) {
        dispatch({ type: 'FETCH_PRICECHECK_FAILURE', payload: error.message });
    }

};

export const uploadRankings = (uploadedRankings) => ({
    type: 'UPLOAD_RANKINGS',
    payload: uploadedRankings
})

export const updateSleeperRankings = (updatedRankings) => ({
    type: 'UPDATE_SLEEPER_RANKINGS',
    payload: updatedRankings
})