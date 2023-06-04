'use strict'

module.exports = app => {
    const rof = require('../controllers/ringOfFire.controller.js')

    var router = require("express").Router();

    router.get('/home', async (req, res) => {
        rof.home(req, res, app)
    })

    router.post('/standings', async (req, res) => {

        const standingsROF = app.get('standingsROF_' + req.body.season) || []
        res.send(standingsROF)
    })

    app.use('/rof', router);
}