define([
    "jquery",
    "backbone",
    "config"
], function($, Backbone, config){
    'use strict';
    return Backbone.Model.extend({
        urlRoot: config.coreUrl + "rfid"
    });
});
