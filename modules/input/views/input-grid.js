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
    'text!modules2/input/templates/input-grid.html'
], function($, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, moment, Radio,template) {
    'use strict';
    return Marionette.ItemView.extend({
        template : template,
        //className:'detailsInputPanel',
        events: {
            'click .backgrid-container tbody tr': 'updateMap'
        },
        initialize: function(options) {
            this.radio = Radio.channel('input');
            this.collection = options.collections;  
            var Locations = PageableCollection.extend({
                //url: config.coreUrl + 'dataGsm/' + this.gsmID + '/unchecked?format=json',
                mode: 'client',
                state:{
                    pageSize: 20
                }
            });
            this.locations = new Locations();
            // add each model of the view collection to the pageableCollection
            var self = this;
            this.collection.each(function(model) {
                self.locations.add(model);
            });  
        },
        updateGrid: function(id) {
            //console.log('detail' + id);
        },

        updateMap: function(evt) {
            if($(evt.target).is("td")) {

                var tr = $(evt.target).parent();
                var id = tr.find('td').first().text();
                var currentModel = this.locations.findWhere({id: Number(id)});
                console.log(currentModel);
                // unselect rows and select clicked row
                $('table.backgrid tr').removeClass('backgrid-selected-row');
                $(tr).addClass('backgrid-selected-row');
                Radio.channel('input').command('updateMap', currentModel);
                Radio.channel('input').command('generateStation', currentModel);
                $('#btnNext').removeClass('disabled');
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
                renderable: true,
                cell: "integer"
            }, {
                name: "name",
                label: "Name",
                editable: false,
                cell: "string"
            }, {
                name: "waypointTime",
                label: "Date",
                editable: false,
                cell: Backgrid.DatetimeCell  //"Date"
            }, {
                editable: false,
                name: "latitude",
                label: "LAT",
                cell: myCell
            }, {
                editable: false,
                name: "longitude",
                label: "LON",
                cell: myCell
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
        },
    });
});