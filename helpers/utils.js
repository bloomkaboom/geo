'use strict';

/**
 * Data validator
 * @param1 pass a sample object
    put _ as first character of the key to indicate as optional
    @example:
        get_data({
            name: '',  // any string
            age: 1, //
            admin: true,
            _skype: ''
        });
 * @param2 source (req.body, req.query, req.params)
 **/
function get_data (sample, source, ref) {
    let has_error = false;
    let final = {};
    let temp;

    ref = ref || '';

    if (typeof sample !== typeof source || (Array.isArray(sample) !== Array.isArray(source))) {
        return new Error('Sample-Source type mismatch');
    }

    if (Array.isArray(sample)) {
        temp = source.map((a, index) => {
            const ret = validate_primitive_value(sample, 0, source, index, ref + `[${index}]`);
            has_error = ret instanceof Error ? ret : false;
            return ret;
        });

        return has_error
            ? has_error
            : temp;
    }

    for (let prop in sample) {
        let source_prop;
        let data;

        source_prop = prop[0] === '_'
            ? prop.slice(1)
            : prop;

        data = validate_primitive_value(sample, prop, source, source_prop, (ref ? ref + '.' : '') + prop);

        if (data instanceof Error) {
            return data;
        }

        if (typeof data !== 'undefined') {
            final[source_prop] = data;
        }
    }

    return final;
}


function validate_primitive_value (_sample, prop, _source, source_prop, _ref) {
    const source_type = typeof _source[source_prop];
    const type = typeof _sample[prop];

    if ((source_type === 'undefined' || (source_type === 'string' && !_source[source_prop])) && prop[0] !== '_') {
        return new Error(_ref + ' is missing');
    }

    if (source_type !== 'undefined' && source_type !== type) {
        return new Error(_ref + ' invalid type');
    }

    if (source_type === type && source_type === 'number'){
        if(_sample[prop].toString().indexOf('.')===-1 && _source[source_prop].toString().indexOf('.')>-1){
            return new Error(_ref + ' invalid type');
        }
    }

    if (type === 'object' && (prop[0] !== '_' || source_type !== 'undefined')) {
        return get_data(_sample[prop], _source[source_prop], _ref);
    }

    return _source[source_prop];
}

function clone (obj) {
    return JSON.parse(JSON.stringify(obj));
};


function pad(num, size) {
    if (!isNaN(num) && String(num).length >= (size || 2)) {
        return num;
    }

    return ('000000000' + num).substr(-(size || 2));
}


function isValidDate(dateString) {
    let regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    let d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return false;
    return d.toISOString().slice(0, 10) === dateString;
}

function routeCode_date_series ({ route_code, date, series }) {
    const moment = require('moment');
    const _date = moment().format('YYYYMMDD');

    return `${route_code}-${date || _date}-${pad(series, 6)}`;
}


function convertHeaders (row, param = {}) {
    if (!param.headers || typeof param.headers !== 'object') {
        return row;
    }

    return convertRowToJson(row, param);
}

function convertRowToJson(row, param) {
    let resultRow = {};
    let headers = param.headers;
    
    for (const key in headers) {
        if (headers.hasOwnProperty(key)) {
            if (!hasProperty(resultRow, headers[key])) { // check if value exist for the path/header. this is bias on object prop declaration. 1st come first serve
                setPath(resultRow, headers[key], row[key]);
            }
        }
    }

    return resultRow;
}

function hasProperty (json, path) {
    let _toPath = require('lodash/toPath');
    let pathArr = path.split('.');

    if (pathArr.length === 1) {
        return !!json[path];
    } else {
        let jsonPathVal = json;

        _toPath(path).forEach(jsonKey => {
            if (jsonPathVal) {
                jsonPathVal = jsonPathVal[jsonKey];
            }
        });

        return !!jsonPathVal;
    }
}

function setPath(json, path, value) {
    let _set = require('lodash/set');
    let pathArr = path.split('.');

    let new_val = value;
    // strip special black diamond character e.g. �
    if (value && /[^\x20-\x7E]+/.test(value)) {
        new_val = value.replace(/[^\x20-\x7E]+/g, '');
    }

    if (pathArr.length === 1) {
        json[path] = new_val;
    } else {
        _set(json, path, new_val);
    }
}


module.exports = {
    get_data,
    clone,
    pad,
    isValidDate,
    pickup_sheet_code: routeCode_date_series,
    convertHeaders
};