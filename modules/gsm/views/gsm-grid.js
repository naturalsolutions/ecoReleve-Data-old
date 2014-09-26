define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.paginator',
    'backgrid',
    'backgrid.paginator',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/gsm/templates/gsm-grid.html'
], function($, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        className:'detailsGsmPanel',

        events: {
            'click .backgrid-container tbody tr': 'updateMap'
        },

        initialize: function(options) {
            this.radio = Radio.channel('gsm-detail');
            this.radio.comply('updateGrid', this.updateGrid, this);
            this.gsmID = options.gsmID;

            var Locations = PageableCollection.extend({
                url: config.coreUrl + 'dataGsm/' + this.gsmID + '/unchecked?format=json',
                mode: 'client',
                state:{
                    pageSize: 25
                }
            });

            this.locations = new Locations();
        },

        updateGrid: function(id) {
            //console.log('detail' + id);
        },

        updateMap: function(evt) {
            if($(evt.target).is("td")) {
                var tr = $(evt.target).parent();
                var id = tr.find('td').first().text();
                var currentModel = this.locations.findWhere({id: Number(id)});
                Radio.channel('gsm-detail').command('updateMap', currentModel);
            }
        },

        onShow: function() {
            var myCell = Backgrid.NumberCell.extend({
                decimals: 3
            });

            var columns = [{
                name: "id",
                label: "ID",
                editable: false,
                renderable: false,
                cell: "integer"
            }, {
                name: "date_",
                label: "Date",
                editable: false,
                cell: Backgrid.DatetimeCell
            }, {
                editable: false,
                name: "lat",
                label: "LAT",
                cell: myCell
            }, {
                editable: false,
                name: "lon",
                label: "LON",
                cell: myCell
            }, {
                editable: false,
                name: "ele",
                label: "ELE (m)",
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                })
            }, {
                editable: false,
                name: "dist",
                label: "DIST (km)",
                cell: myCell
            }, {
                editable: true,
                name: "import",
                label: "IMPORT",
                cell: "boolean"
            }];

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: this.locations
            });

            this.$el.find("#locations").append(this.grid.render().el);

            // Initialize a new Paginator instance
            this.paginator = new Backgrid.Extension.Paginator({
                collection: this.locations
            });

            this.$el.append(this.paginator.render().el);
            var height = $(window).height() -
                $('#header-region').height() - this.paginator.$el.height() -
                $('#info-container').outerHeight();
            this.$el.height(height);
            this.locations.fetch({reset: true});
        },

        /*
        onDestroy: function() {
            $('body').css('background-color', 'white');
            this.radio.stopComplying('loaded');
            this.grid.remove();
            this.grid.stopListening();
            this.grid.collection.reset();
            this.grid.columns.reset();
            delete this.grid.collection;
            delete this.grid.columns;
            delete this.grid;
        },
        */
    });
});
