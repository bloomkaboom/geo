require('./global_functions');

const express = require('express');
const bodyParser = require('body-parser');
const volleyball = require('volleyball');
const routes = require('./route/routers');
const models = require('./models');
const app = express();

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(volleyball);
app.use('/', routes)

const server = app.listen(2000, () => {
    console.log('App listening on port', server.address().port);
});