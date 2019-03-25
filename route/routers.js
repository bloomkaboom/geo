'use strict';

const express = require('express');
const multer = require('multer');
const router = require('express').Router();
const upload = multer({ dest: './uploads/'})
const region = require('../controller/region.controller');
const province = require('../controller/province.controller');
const municipality = require('../controller/municipality.controller');
const data = require('../controller/alldata.controller');

// All Data Mapper
router.get('/data/get', data.getGeoList);
//Region
router.post('/region/post', region.post);
router.get('/region/get', region.getAll);
router.get('/region/get/:id', region.getById);
router.put('/region/put/:id', region.put);
router.delete('/region/delete/:id', region.deleteById);
router.post('/region/import', upload.single('file') , region.importcsv);
router.get('/region/export', region.exportcsv);
router.get('/region/filter', region.filter);
router.get('/region/search', region.search);
router.get('/region/page/:page', region.getRegionList);

//Province
router.post('/province/post', province.post)
router.get('/province/get', province.getAll);
router.get('/province/get/:id', province.getById);
router.put('/province/put/:id', province.put);
router.delete('/province/delete/:id', province.deleteById);
router.post('/province/import', upload.single('file') , province.importcsv);
router.get('/province/export', province.exportcsv);
router.get('/province/filter', province.filter);
router.get('/province/search', province.search);
router.get('/province/page/:page', province.getProvinceList);

//Municipality
router.post('/municipality/post', municipality.post)
router.get('/municipality/get', municipality.getAll);
router.get('/municipality/get/:id', municipality.getById);
router.put('/municipality/put/:id', municipality.put);
router.delete('/municipality/delete/:id', municipality.deleteById);
router.post('/municipality/import', upload.single('file') , municipality.importcsv);
router.get('/municipality/export', municipality.exportcsv);
router.get('/municipality/filter', municipality.filter);
router.get('/municipality/search', municipality.search);
router.get('/municipality/page/:page', municipality.getMunicipalityList);

module.exports = router;