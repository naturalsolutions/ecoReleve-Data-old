define([
    'jquery',
    'backbone',
    'config',
    'models/monitoredsite'
], function($, Backbone, config, MonitoredSite){
    'use strict';
    return Backbone.Collection.extend({
        model: MonitoredSite,
        url: config.coreUrl + 'monitoredSite'
    });
});
