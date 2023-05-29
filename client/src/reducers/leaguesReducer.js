
import { RESET_STATE } from '../actions/actions';

const initialState = {
    isLoadingLeagues: false,
    syncing: false,
    state: {},
    allPlayers: {},
    nflSchedule: {},
    projections: [],
    leagues: [],
    errorLeagues: null
};


const leaguesReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_LEAGUES_START':
            return { ...state, isLoadingLeagues: true, errorLeagues: null };
        case 'FETCH_LEAGUES_SUCCESS':
            const projections = {}

            action.payload.projections
                .sort((a, b) => b.stats.pts_ppr - a.stats.pts_ppr)
                .map((proj, index) => {
                    projections[proj.player_id] = {
                        ...proj,
                        prevRank: index + 1,
                        newRank: index + 1
                    }
                })

            return {
                ...state,
                state: action.payload.state,
                allPlayers: action.payload.allPlayers,
                nflSchedule: action.payload.schedule,
                leagues: action.payload.leagues,
                projections: projections,
                isLoadingLeagues: false
            };
        case 'FETCH_LEAGUES_FAILURE':
            return { ...state, isLoadingLeagues: false, errorLeagues: action.payload };
        case 'SYNC_LEAGUES_START':
            return { ...state, syncing: true, errorSyncing: null };
        case 'SYNC_LEAGUES_SUCCESS':
            const updated_leagues = state.leagues.map(l => {
                if (l.league_id === action.payload.league_id) {
                    return action.payload
                }
                return l
            })
            return {
                ...state,
                leagues: updated_leagues,
                syncing: false
            }
        case 'SYNC_LEAGUES_FAILURE':
            return { ...state, syncing: false, errorSyncing: action.payload }
        case 'UPDATE_SLEEPER_RANKINGS':
            return { ...state, projections: action.payload }
        case RESET_STATE:
            return {
                ...initialState
            };
        default:
            return state;
    }
};

export default leaguesReducer