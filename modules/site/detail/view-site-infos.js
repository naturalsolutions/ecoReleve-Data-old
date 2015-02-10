define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'text!./tpl-site-infos.html',
    'grid/model-grid',

], function($, _, Backbone , Marionette, config, Radio, tpl, NSGrid) {
    'use strict';

    return Marionette.ItemView.extend({
        template: tpl,
        className: 'full-height',
        events: {

        },
        initialize: function(options) {
            this.model = options.model;
            this.model.fetch({reset: true});
            this.model.bind('sync', this.render, this);
        },

        onRender: function(){
            this.cols = [
            {
                editable: false,
                label: 'Begin-Date',
                name: 'begin_date',
                cell: 'string',
            },
            {
                editable: false,
                label: 'End-Date',
                name: 'end_date',
                cell: 'string',
            },
            {
                editable: false,
                label: 'LAT',
                name: 'lat',
                cell: 'string',
            },
            {
                editable: false,
                label: 'LON',
                name: 'lon',
                cell: 'string',
            },

            ];

            var history = new Backbone.Collection(this.model.get('positions'));
            
            this.grid= new NSGrid({
                columns: this.cols,
                channel: 'modules',
                collection: history,
            });

            $('#grid').html(this.grid.displayGrid());

        },
    });
});
