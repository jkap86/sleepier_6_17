'use strict'

exports.home = (req, res, app) => {
    const state = app.get('state')
    const allplayers = app.get('allplayers')

    res.send({
        state: state,
        allplayers: allplayers
    })
} 