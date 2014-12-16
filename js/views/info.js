define([
    'underscore',
    'backbone',
    'config',
    'marionette',
    'moment',
    'text!templates/info.html'
], function(_, Backbone, config, Marionette, moment, template) {
    'use strict';
    return Marionette.ItemView.extend({
        template: template,

        model: new Backbone.Model({
            siteName: config.siteName,
            date: moment().format('dddd, MMMM Do YYYY'),
            nbIndiv: 0
        }),

        modelEvents: {
            'change': 'render'
        },

        initialize: function() {
            $.ajax({
                context: this,
                url: config.coreUrl + 'individuals/count',
            }).done( function(data) {
                this.model.set('nbIndiv', data.count);
            });
        },

        onDestroy: function() {
            delete this.model;
        }
    });
});
