'use strict'

module.exports = app => {
    const leagues = require("../controllers/league.controller.js");

    const router = require("express").Router();

    router.post('/find', (req, res) => {
        leagues.find(req, res, app)
    });

    router.post('/sync', (req, res) => {
        leagues.sync(req, res, app)
    })

    router.post("/draft", async (req, res) => {
        leagues.picktracker(req, res, app)
    })

    app.use('/league', router);
}