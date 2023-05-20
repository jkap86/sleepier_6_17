export const filterData = (leagues, type1, type2, tab, season) => {
    let filteredLeagues;
    console.log({
        type1: type1,
        type2: type2,
        tab: tab,
        leagues: leagues
    })
    switch (type1) {
        case ('Redraft'):
            filteredLeagues = leagues.filter(x => x.settings.type !== 2);
            break;
        case ('All'):
            filteredLeagues = leagues;
            break;
        case ('Dynasty'):
            filteredLeagues = leagues.filter(x => x.settings.type === 2);
            break;
        default:
            filteredLeagues = leagues;
            break;
    }
    let filteredLeagues2 = filteredLeagues

    switch (type2) {
        case ('Bestball'):
            filteredLeagues2 = filteredLeagues.filter(x => x.settings.best_ball === 1);
            break;
        case ('All'):
            filteredLeagues2 = filteredLeagues;
            break;
        case ('Standard'):
            filteredLeagues2 = filteredLeagues.filter(x => x.settings.best_ball !== 1);
            break;
        default:
            filteredLeagues2 = filteredLeagues;
            break;
    }



    let filteredData;

    switch (tab) {
        case 'Players':
            const players_dict = {}
            filteredLeagues2
                .forEach(league => {
                    league.rosters
                        ?.forEach(roster => {
                            roster.players
                                ?.forEach(player_id => {
                                    let player_leagues = players_dict[player_id] || {
                                        id: player_id,
                                        leagues_owned: [],
                                        leagues_taken: []
                                    }

                                    if (roster.user_id === league.userRoster.user_id) {
                                        player_leagues.leagues_owned.push(league)
                                    } else {
                                        player_leagues.leagues_taken.push({
                                            ...league,
                                            lmRoster: roster
                                        })
                                    }

                                    players_dict[player_id] = player_leagues
                                })

                            if (roster.draft_picks && roster.draft_picks.length > 0) {
                                roster.draft_picks.map(pick => {
                                    const pick_text = `${pick.season}_${pick.round}_${pick.order?.toLocaleString("en-US", { minimumIntegerDigits: 2 })}`
                                    let pick_leagues = players_dict[pick_text] || {
                                        id: pick_text,
                                        leagues_owned: [],
                                        leagues_taken: []
                                    }

                                    if (pick.season === parseInt(season) && parseInt(pick.order)) {
                                        if (roster.user_id === league.userRoster.user_id) {
                                            pick_leagues.leagues_owned.push({
                                                ...league
                                            })
                                        } else {
                                            pick_leagues.leagues_taken.push({
                                                ...league,
                                                lmRoster: roster,
                                            })
                                        }
                                        players_dict[pick_text] = pick_leagues
                                    }

                                })
                            }
                        })
                })


            filteredData = Object.values(players_dict).map(player => {
                return {
                    ...player,
                    leagues_available: player.id.includes('_') ? [] : leagues
                        .filter(l => !l.rosters?.find(r => r.players?.includes(player.id)))
                }
            })
            break;
        case 'Leagues':
            filteredData = filteredLeagues2
            break;
        case 'Leaguemates':
            const lm_dict = {}
            filteredLeagues2
                .forEach(league => {
                    league.rosters
                        ?.filter(roster => parseInt(roster.user_id) > 0 && roster.user_id !== league.userRoster.user_id && league.userRoster?.players?.length > 0)
                        ?.forEach(roster => {
                            let lm_leagues = lm_dict[roster.user_id] || {
                                user_id: roster.user_id,
                                username: roster.username,
                                avatar: roster.avatar,
                                leagues: []
                            }

                            lm_leagues.leagues.push({
                                ...league,
                                lmRoster: roster
                            })

                            lm_dict[roster.user_id] = lm_leagues
                        })
                })


            filteredData = Object.values(lm_dict)
            break;
        case 'Lineups':
            filteredData = filteredLeagues2
            break;
        default:
            break;
    }

    return {
        filteredData: filteredData,
        filteredLeagueCount: filteredLeagues2?.length
    }
}