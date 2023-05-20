import { useParams, Link } from "react-router-dom";
import React, { useEffect } from "react";
import { loadingIcon } from "../../functions/misc";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, fetchLeagues, fetchFilteredData, fetchLmTrades } from "../../actions/actions";
import Heading from "./heading";
import '../css/main.css';
import Players from "../Players/players";
import Trades from '../Trades/trades';
import Leagues from "../Leagues/leagues";
import Leaguemates from "../Leaguemates/leaguemates";
import Lineups from "../Lineups/lineups";

const Main = () => {
    const params = useParams();
    const dispatch = useDispatch();
    const { isLoadingUser, errorUser, type1, type2, tab, user } = useSelector((state) => state.user);
    const { isLoadingLeagues, state, leagues } = useSelector(state => state.leagues);
    const { isLoading: isLoadingLmTrades } = useSelector(state => state.lmTrades);
    const { isLoadingData } = useSelector(state => state.filteredData);

    useEffect(() => {
        dispatch(fetchUser(params.username));
    }, [params.username, dispatch])

    useEffect(() => {
        if (user.user_id) {
            dispatch(fetchLeagues(user.user_id))
        }
    }, [user, dispatch])

    useEffect(() => {
        if (user.user_id && leagues?.length > 0) {
            dispatch(fetchLmTrades(user.user_id, leagues, state.league_season, 0, 125))
        }
    }, [user, leagues, dispatch])


    useEffect(() => {
        if (user.user_id) {
            dispatch(fetchFilteredData(leagues, type1, type2, tab, state.league_season));

        }
    }, [leagues, type1, type2, tab])


    let display;

    switch (tab) {
        case 'Players':
            display = !isLoadingData && <Players /> || loadingIcon
            break;
        case 'Trades':
            display = !isLoadingLmTrades && <Trades /> || loadingIcon
            break;
        case 'Leagues':
            display = !isLoadingData && <Leagues /> || loadingIcon
            break;
        case 'Leaguemates':
            display = !isLoadingData && <Leaguemates /> || loadingIcon
            break;
        case 'Lineups':
            display = !isLoadingData && <Lineups /> || loadingIcon
            break;
        default:
            break;
    }


    return <>
        {
            (isLoadingUser || isLoadingLeagues) ? loadingIcon
                : errorUser
                    ? <h1>{errorUser.error}</h1>
                    :
                    <>
                        <Link to="/" className="home">
                            Home
                        </Link>
                        <Heading />
                        {display}
                    </>
        }
    </>
}

export default Main;