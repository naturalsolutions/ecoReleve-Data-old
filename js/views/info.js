define([
    'underscore',
    'backbone',
    'config',
    'marionette',
    'moment',
    'text!templates/info.html'
], function(_, Backbone, config, Marionette, moment, infoTemplate) {
    'use strict';
    return Backbone.Marionette.ItemView.extend({
        model: new Backbone.Model({
            siteName: config.siteName,
            date: moment().format('dddd, MMMM Do YYYY'),
            nbIndiv: 0
        }),
        template: _.template(infoTemplate),

        initialize: function() {
            $.ajax({
                context: this,
                url: config.coreUrl + '/individuals/count',
                dataType: 'json'
            }).done( function(data) {
                this.model.set('nbIndiv', data);
                this.render();
            });
        }
    });
});
