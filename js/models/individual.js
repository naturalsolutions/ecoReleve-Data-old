define([
    'jquery',
    'backbone',
    'config'
], function($, Backbone, config){
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            age: null,
            birth_date: null,
            history: null,
            monitoring_status: null,
            ptt: null,
            sex: null,
            origin: null,
            species: null,
            status: null,
            survey_type: null
        },
        urlRoot: config.coreUrl + 'individual'
    });
});
