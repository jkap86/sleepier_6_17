module.exports = async (app) => {
    const axios = require('../api/axiosInstance');

    const getProjections = async (season, week) => {

        const projections = await axios.get(`https://api.sleeper.com/projections/nfl/${season}/${week}?season_type=regular&position[]=QB&position[]=RB&position[]=TE&position[]=WR&order_by=ppr`)

        app.set('projections', projections.data.filter(p => p.stats.pts_ppr))
    }

    setTimeout(() => {
        const state = app.get('state')
        if (state.display_week > 0 && state.display_week < 19) {
            getProjections(state.league_season, state.display_week)
        }
    }, 5000)

    setInterval(() => {
        const state = app.get('state')
        if (state.display_week > 0 && state.display_week < 19) {
            getProjections(state.league_season, state.display_week)
        }
    }, 15 * 60 * 1000)
}