define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'bbForms',

    'grid/model-grid',
    'backgrid',

], function($, _, Backbone , Marionette, config, Radio,
    BbForms, NSGrid, Backgrid ){

    'use strict';

    return Marionette.ItemView.extend({
        events: {

        },
        initialize: function() {
            this.display();
        },

        display: function(){
            var myCell = Backgrid.NumberCell.extend({
                decimals: 3,
                orderSeparator: ' '
            });

            this.cols = [{
                editable: false,
                name: 'id',
                label: 'id',
                cell: 'string',
                renderable: false,
            },{
                editable: false,
                name: 'type',
                label: 'type',
                cell: 'string',
            },{
                editable: false,
                name: 'name',
                label: 'name',
                cell: 'string',
            },{
                editable: false,
                name: 'lat',
                label: 'lat',
                cell: 'string',
            },{
                editable: false,
                name: 'lon',
                label: 'lon',
                cell: 'string',
            },{
                editable: false,
                name: 'Active',
                label: 'Status',
                cell: 'string',
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function (rawValue, model) {
                            if (rawValue == true) {
                                rawValue = 'Active';
                            } else rawValue = 'Inactive'
                         return rawValue;
                      }
                }),
                renderable: true
            }
            ];

            this.grid= new NSGrid({
                columns: this.cols,
                channel: 'modules',
                url: config.coreUrl + 'monitoredSite/',
                pageSize : 24,
                pagingServerSide : true,
            });
            
            $('#grid').html(this.grid.displayGrid());
            $('#paginator').append(this.grid.displayPaginator());

        },

        getGrid: function(){
            return this.grid;
        },



    });
});
