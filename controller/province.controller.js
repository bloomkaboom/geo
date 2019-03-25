const db = require('../models/index');
const utils = require('../helpers/utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const sorter = require('../helpers/sorter');
const Province = db.Province;

// CREATE
const post = (req, res) => {
    Province.create(req.body)
    .then(postProvince => {res.send(postProvince);
    })
    .catch(err => {
        console.log(err);
    });
}

// GET ALL
const getAll = (req, res) => {
    Province.findAll({
        paranoid: false
    }).then(all => {
        res.send(all);
    }).catch(err => {
        console.log(err);
    });
}

// FIND BY ID
const getById = (req, res) => {
    Province.findByPk(req.params.id, {paranoid: false})
    .then(province => {res.send(province);
    });
}

// UPDATE
const put = (req, res) => {
    const id = req.params.id;
    Province.update({...req.body}, {
        where: {id: id}
        }).then(() => {res.send(`Updated Province ID: ${id}`)
    });
}

// DELETE
const deleteById = (req, res) => {
    let id = req.params.id;
    Province.destroy({where: {id: id}
    }).then(() => {res.send(`Deleted Province ID: ${id}`)});
}

// IMPORT CSV FILE
const importcsv = async (req, res) => {
    const file = req.file ? req.file.path : null;
    console.log('File', file);
    if(!file) return ReE(res, {message: 'CSV file not found'}, 400);
    const csv = require('../helpers/csv_validator');
    const headers = {
        province_name: '',
        province_code: ''
    }

    async function insert(json) {
        let err, province;
        [err, province] = await to(Province.bulkCreate(json));
        if(err) return ReE(res, err, 500);
        return ReS(res, {
            message: 'Successfully imported CSV file',
            data: province
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
    let err, province;
    [err, province] = await to(Province.findAll());
    if(err) return ReE(res, err, 500);
    if(!province) return ReE(res, {message: 'No data to download'}, 400);

    province = utils.clone(province);
    const json2csv = require('json2csv').Parser;
    const parser = new json2csv({encoding: 'utf-8', withBOM: true});
    const csv = parser.parse(province);
    res.setHeader('Content-disposition', 'attachment; filename=Provinces.csv')
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

    Province.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('province_name'), ', ', db.sequelize.col('province_code')), 'Result: ']
		],
        where: condition,
        order: sort,
        limit: 10,
        paranoid: false
    }).then(province => {
        res.send(province);
    }).catch(err => {
        console.log(err);
    });
}

// SEARCH (LIKE) 
const search = async (req, res) => {
    res.setHeader('Content-type','application/json');
    const {
        id,
        province_name,
        province_code
    } = req.query;
    [err, province] = await to(Province.findAll({
        attributes: [
            [db.sequelize.fn('concat', db.sequelize.col('province_name'), ', ', db.sequelize.col('province_code')), 'Result: ']
		],
        where: {
            [Sequelize.Op.or]: [
                {id: {[Sequelize.Op.like]: '%' +id+ '%'}},
                {province_name: {[Sequelize.Op.like]: '%' +province_name+ '%'}},
                {province_code: {[Sequelize.Op.like]: '%' +province_code+ '%'}}
            ]
        },
        limit: 10,
        paranoid: false
    }));
    if(err) return ReE(res, err, 500);
    return ReS(res, {
        message: 'Search result: ',
        data: province
    }, 200);
 }

//  PAGINATION
const getProvinceList = (req, res) => {
    let limit = 10;
    let offset = 0;
    Province.findAndCountAll()
    .then((data) => {
        let page = req.params.page;
        let pages = Math.ceil(data.count / limit);
        let offset = limit * (page -1);
        Province.findAll({
            attributes: ['id', 'province_name', 'province_code'],
            limit: limit,
            offset: offset,
            $sort: { id: 1 },
            paranoid: false
            })
            .then((provinces) => {
                res.status(200).json({'Province Count': provinces, 'count': data.count, 'pages': pages});
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
    getProvinceList
}