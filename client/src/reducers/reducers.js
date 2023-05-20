import { combineReducers } from 'redux';
import userReducer from './userReducer';
import leaguesReducer from './leaguesReducer';
import filteredDataReducer from './filteredDataReducer';
import dynastyValuesReducer from './valuesReducer';
import statsReducer from './statsReducer';
import lmTradesReducer from './lmTradesReducer';
import filteredLmTradesReducer from './filteredLmTradesReducer';
import pricecheckTradesReducer from './pricecheckTradesReducer';
import lineupsReducer from './lineupsReducer';


const rootReducer = combineReducers({
    user: userReducer,
    leagues: leaguesReducer,
    filteredData: filteredDataReducer,
    dynastyValues: dynastyValuesReducer,
    stats: statsReducer,
    lmTrades: lmTradesReducer,
    filteredLmTrades: filteredLmTradesReducer,
    pricecheckTrades: pricecheckTradesReducer,
    lineups: lineupsReducer
});

export default rootReducer;


