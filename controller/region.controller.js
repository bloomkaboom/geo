const db = require('../models/index');
const utils = require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sorter = require('../helpers/sorter');
const Region = db.Region;

// CREATE
const post = (req, res) => {
    Region.create(req.body)
    .then(postRegion => {res.send(postRegion);
    })
    .catch(err => {
        console.log(err);
    });
}

// GET ALL
const getAll = (req, res) => {
    Region.findAll({
        paranoid: false
    }).then(all => {
        res.send(all);
    }).catch(err => {
        console.log(err);
    });
}

// FIND BY ID
const getById = (req, res) => {
    Region.findByPk(req.params.id, {paranoid: false})
    .then(region => {res.send(region);
    });
}

// UPDATE
const put = (req, res) => {
    const id = req.params.id;
    Region.update({...req.body}, {
        where: {id: id}
        }).then(() => {res.send(`Updated Region ID: ${id}`)
    });
}

// DELETE
const deleteById = (req, res) => {
    let id = req.params.id;
    Region.destroy({where: {id: id}
    }).then(() => {
        res.send(`Deleted Region ID: ${id}`);
    });
}

// IMPORT CSV FILE
const importcsv = async (req, res) => {
    const file = req.file ? req.file.path : null;
    console.log('File', file);
    if(!file) return ReE(res, {message: 'CSV file not found'}, 400);
    const csv = require('../helpers/csv_validator');
    const headers = {
        region_name: '',
        region_code: ''
    }

    async function insert(json) {
        let err, region;
        [err, region] = await to(Region.bulkCreate(json));
        if(err) return ReE(res, err, 500);
        return ReS(res, {
            message: 'Successfully imported CSV file',
            data: region
        }, 200);
    }

    async function validateJSON(json) {
        insert(json);
    }

    function start() {
        csv(file, headers)
        .then(result => {
            validateJSON(result);
        })
        .catch(err => {
            return ReE(res, {
                message: 'Failed to import csv file',
                data: err
            }, 400);
        });
    }
    start();
}

// EXPORT CSV FILE
const exportcsv = async (req, res) => {
    let err, region;
    [err, region] = await to(Region.findAll());
    if(err) return ReE(res, err, 500);
    if(!region) return ReE(res, {message: 'No data to download'}, 400);

    region = utils.clone(region);
    const json2csv = require('json2csv').Parser;
    const parser = new json2csv({encoding: 'utf-8', withBOM: true});
    const csv = parser.parse(region);
    res.setHeader('Content-disposition', 'attachment; filename=Regions.csv')
    res.set('Content-type', 'text/csv');
    res.send(csv);
}

// FILTER: SPECIFIC FIELDS
const filter = async (req, res, next) => {
	let reqQuery = req.query;
	let reqQuery_Sort = req.query.sortBy;
	let condition = {};
	let sort = [];
    if (Object.keys(reqQuery).length > 0) {
        if (reqQuery_Sort) {
            sort = await sorter.convertToArrSort(reqQuery_Sort); //get Array Sort
            delete reqQuery.sortBy; //remove sortBy key from req.query
        }
        condition = reqQuery; //get Condition(s)
    }

    Region.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('region_name'), ', ', db.sequelize.col('region_code')), 'Result: ']
		],
        where: condition,
        order: sort,
        limit: 10,
        paranoid: false
    }).then(region => {
        res.send(region);
    }).catch(err => {
        console.log(err);
    });
}

// SEARCH (LIKE) 
const search = async (req, res) => {
    res.setHeader('Content-type','application/json');
    const {
        id,
        region_name,
        region_code
    } = req.query;
    [err, region] = await to(Region.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('region_name'), ', ', db.sequelize.col('region_code')), 'Result: ']
		],
        where: {
            [Sequelize.Op.or]: [
                {id: {[Sequelize.Op.like]: '%' +id+ '%'}},
                {region_name: {[Sequelize.Op.like]: '%' +region_name+ '%'}},
                {region_code: {[Sequelize.Op.like]: '%' +region_code+ '%'}}
            ]
        },
        limit: 10,
        paranoid: false
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        message: 'Search result: ',
        data: region
    }, 200);
 }

//  PAGINATION
const getRegionList = (req, res) => {
    let limit = 10;
    let offset = 0;
    Region.findAndCountAll({paranoid: false})
    .then((data) => {
        let page = req.params.page;
        let pages = Math.ceil(data.count / limit);
        let offset = limit * (page -1);
        Region.findAll({
            attributes: ['id', 'region_name', 'region_code'],
            limit: limit,
            offset: offset,
            $sort: { id: 1 },
            paranoid: false
            })
            .then((regions) => {
                res.status(200).json({'Region Count': regions, 'count': data.count, 'pages': pages});
            });
    })
    .catch(function(error) {
        res.status(500).send('Internal Server Error');
    });
}

module.exports = {
    post,
    getAll,
    getById,
    put,
    deleteById,
    importcsv,
    exportcsv,
    filter,
    search,
    getRegionList
}