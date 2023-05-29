import { RESET_STATE } from '../actions/actions';

const initialState = {
    isLoadingUser: false,
    user: {},
    tab: 'Players',
    type1: 'All',
    type2: 'All',
    trendDateStart: new Date(new Date() - 365 * 24 * 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    trendDateEnd: new Date(new Date() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0],
    errorUser: null
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_USER_START':
            return { ...state, isLoadingUser: true, errorUser: null };
        case 'FETCH_USER_SUCCESS':
            return { ...state, isLoadingUser: false, user: action.payload };
        case 'FETCH_USER_FAILURE':
            return { ...state, isLoadingUser: false, errorUser: action.payload };
        case 'SET_TAB':
            return {
                ...state,
                tab: action.payload
            };
        case 'SET_TYPE1':
            return {
                ...state,
                type1: action.payload
            };
        case 'SET_TYPE2':
            return {
                ...state,
                type2: action.payload
            };
        case 'SET_TRENDDATESTART':
            return {
                ...state,
                trendDateStart: action.payload
            };
        case 'SET_TRENDDATEEND':
            return {
                ...state,
                trendDateEnd: action.payload
            };

        case RESET_STATE:
            return {
                ...initialState
            };
        default:
            return state;
    }
};

export default userReducer
