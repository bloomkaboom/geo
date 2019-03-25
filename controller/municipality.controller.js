const db = require('../models/index');
const utils = require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sorter = require('../helpers/sorter');
const Municipality = db.Municipality;

// CREATE
const post = (req, res) => {
    Municipality.create(req.body)
    .then(postMunicipality => {res.send(postMunicipality);
    })
    .catch(err => {
        console.log(err);
    });
}

// GET ALL
const getAll = (req, res) => {
    Municipality.findAll({
        paranoid: false
    }).then(all => {
        res.send(all);
    }).catch(err => {
        console.log(err);
    });
}

// FIND BY ID
const getById = (req, res) => {
    Municipality.findByPk(req.params.id, {paranoid: false})
    .then(municipality => {res.send(municipality);
    });
}

// UPDATE
const put = (req, res) => {
    const id = req.params.id;
    Municipality.update({...req.body}, {
        where: {id: id}
        }).then(() => {res.send(`Updated municipality ID: ${id}`)
    });
}

// DELETE
const deleteById = (req, res) => {
    let id = req.params.id;
    Municipality.destroy({where: {id: id}
    }).then(() => {res.send(`Deleted municipality ID: ${id}`)});
}


// IMPORT CSV FILE
const importcsv = async (req, res) => {
    const file = req.file ? req.file.path : null;
    console.log('File', file);
    if(!file) return ReE(res, {message: 'CSV file not found'}, 400);
    const csv = require('../helpers/csv_validator');
    const headers = {
        municipality_name: '',
        municipality_code: ''
    }

    async function insert(json) {
        let err, municipality;
        [err, municipality] = await to(Municipality.bulkCreate(json));
        if(err) return ReE(res, err, 500);
        return ReS(res, {
            message: 'Successfully imported CSV file',
            data: municipality
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
    let err, municipality;
    [err, municipality] = await to(Municipality.findAll());
    if(err) return ReE(res, err, 500);
    if(!municipality) return ReE(res, {message: 'No data to download'}, 400);

    municipality = utils.clone(municipality);
    const json2csv = require('json2csv').Parser;
    const parser = new json2csv({encoding: 'utf-8', withBOM: true});
    const csv = parser.parse(municipality);
    res.setHeader('Content-disposition', 'attachment; filename=Municipalities.csv')
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

    Municipality.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('municipality_name'), ', ', db.sequelize.col('municipality_code')), 'Result: ']
		],
        where: condition,
        order: sort,
        limit: 10,
        paranoid: false
    }).then(municipality => {
        res.send(municipality);
    }).catch(err => {
        console.log(err);
    });
}

// SEARCH (LIKE) 
const search = async (req, res) => {
    res.setHeader('Content-type','application/json');
    const {
        id,
        municipality_name,
        municipality_code
    } = req.query;
    [err, municipality] = await to(Municipality.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('municipality_name'), ', ', db.sequelize.col('municipality_code')), 'Result: ']
		],
        where: {
            [Sequelize.Op.or]: [
                {id: {[Sequelize.Op.like]: '%' +id+ '%'}},
                {municipality_name: {[Sequelize.Op.like]: '%' +municipality_name+ '%'}},
                {municipality_code: {[Sequelize.Op.like]: '%' +municipality_code+ '%'}}
            ]
        },
        limit: 10,
        paranoid: false
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        message: 'Search result: ',
        data: municipality
    }, 200);
 }

//  PAGINATION
const getMunicipalityList = (req, res) => {
    let limit = 10;
    let offset = 0;
    Municipality.findAndCountAll()
    .then((data) => {
        let page = req.params.page;
        let pages = Math.ceil(data.count / limit);
        let offset = limit * (page -1);
        Municipality.findAll({
            attributes: ['id', 'municipality_name', 'municipality_code'],
            limit: limit,
            offset: offset,
            $sort: { id: 1 },
            paranoid: false
            })
            .then((municipalities) => {
                res.status(200).json({'Municipality Count': municipalities, 'count': data.count, 'pages': pages});
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
    getMunicipalityList
}