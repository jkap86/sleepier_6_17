import { RESET_STATE } from '../actions/actions';

const initialState = {
    filteredData: [],
    filteredLeagueCount: 0
};

const filteredDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_FILTERED_DATA_START':
            return { ...state };
        case 'FETCH_FILTERED_DATA_SUCCESS':
            return {
                ...state,
                filteredData: action.payload.filteredData,
                filteredLeagueCount: action.payload.filteredLeagueCount
            };
        case 'FETCH_FILTERED_DATA_FAILURE':
            return { ...state, error: action.payload };
        case RESET_STATE:
            return {
                ...initialState
            };
        default:
            return state;
    }
};

export default filteredDataReducer;

