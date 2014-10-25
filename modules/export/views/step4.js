define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step4.html'

], function($, _, Backbone, Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        events: {

        },
        
        initialize: function(options) {
        	this.radio = Radio.channel('exp');
        	this.viewName = options.ViewName;

        },
        onBeforeDestroy: function() {
            this.radio.reset();
        },
        
        onShow: function() {

        }



    });
});
