'use strict'
const db = require("../models");
const DynastyRankings = db.dynastyrankings;
const Op = db.Sequelize.Op;

exports.find = async (req, res) => {
    const values = await DynastyRankings.findAll({
        where: {
            [Op.or]: [
                {
                    date: req.body.date1
                },
                {
                    date: req.body.date2
                }
            ]
        },

    })

    res.send(values)
}

exports.findrange = async (req, res) => {
    const values = await DynastyRankings.findAll({
        where: {
            date: req.body.dates
        }

    })

    res.send(values)
}

exports.stats = async (req, res) => {
    const stats = require('../../stats.json');

    const stats_data = {}

    stats
        .filter(s =>
            (new Date(s.date).getTime() + 1 * 24 * 60 * 60 * 1000) > new Date(req.body.date1).getTime()
            && (new Date(s.date).getTime() - 1 * 24 * 60 * 60 * 1000) < new Date(req.body.date2).getTime()
            && req.body.players.includes(s.player_id)
            && s.stats.pts_ppr
        )
        .map(stats_object => {
            if (!stats_data[stats_object.player_id]) {
                stats_data[stats_object.player_id] = []
            }

            stats_data[stats_object.player_id].push(stats_object)
        })

    res.send(stats_data)
}

