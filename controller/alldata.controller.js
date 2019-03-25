const db = require('../models/index');
const utils = require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Region = db.Region;
const Province = db.Province;
const Municipality = db.Municipality;

const getGeoList = (req, res) => {
    Region.findAll({paranoid: false,
        include: [
            {paranoid: false,
                model: Province,
                include: [
                    {paranoid: false,
                        model: Municipality
                    }
                ]
            }
        ]
    }).then( geo => {
        res.send({GeoList: geo});
    });
}

module.exports = {
    getGeoList
}