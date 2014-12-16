define([
    'jquery',
    'backbone',
    'config'
], function($, Backbone, config){
    'use strict';
    return Backbone.Model.extend({
        defaults: {
            name: null,
            value: null,
            from: null,
            to: null
        },
    });
});
