'use strict';

const Settings = require('../models').settings;
// const DefaultSettings = require('./../config/settings'); // default settings - for global

module.exports = async () => {
    let err, settings, _settings = {};
            
    [err, settings] = await to(Settings.findAll());

    try {
        settings = JSON.parse(JSON.stringify(settings));
    } catch (e) {
        console.error('Invalid settings');
    }
    
    for (const key in settings) {
        if (settings.hasOwnProperty(key)) {
            if (!isNaN(settings[key].settings_value)) {
                _settings[settings[key].settings_key] = +settings[key].settings_value;
            } else {
                _settings[settings[key].settings_key] = settings[key].settings_value;
            }
        }
    }

    // for (const key in DefaultSettings) {
    //     if (DefaultSettings.hasOwnProperty(key)) {
    //         if (!_settings.hasOwnProperty(key)) {
    //             if (!isNaN(DefaultSettings[key])) {
    //                 _settings[key] = +DefaultSettings[key];
    //             } else {
    //                 _settings[key] = DefaultSettings[key];
    //             }
    //         }
    //     }
    // }

    return _settings;
};