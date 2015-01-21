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
                name: 'TGeo_pk_id',
                label: 'TGeo_pk_id',
                cell: 'string',
            },{
                editable: false,
                name: 'Monitored_site',
                label: 'Monitored_site',
                cell: 'string',
            },{
                editable: false,
                name: 'Type',
                label: 'Type',
                cell: 'string',
            },{
                editable: false,
                name: 'LAT',
                label: 'Type',
                cell: 'string',
            },{
                editable: false,
                name: 'LON',
                label: 'Type',
                cell: 'string',
            },{
                editable: false,
                name: 'Active',
                label: 'Active',
                cell: 'string',
                renderable: false
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
