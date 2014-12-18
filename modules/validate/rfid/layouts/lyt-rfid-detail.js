define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'config',
    'text!modules2/validate/rfid/templates/tpl-rfid.html',
    'filter/model-filter',
    'grid/model-grid',

], function($, _, Backbone, Marionette, Radio,
    config, tpl, NSFilter, NSGrid) {

    'use strict';


    return Marionette.LayoutView.extend({
        template: tpl,

        className: 'full-height',


        events: {
            'click #update' : 'update',
            'click tr': 'redirect',
        },

        onDestroy: function(){},

        initialize: function(){
            this.type='rfid';
            this.cols= [{
                editable: false,
                name: 'PK_id',
                label: 'PK_id',
                cell: 'integer',
                renderable: true,   
            }, {
                editable: false,
                name: 'identifier',
                label: 'identifier',
                cell: 'string'
            }, {
                editable: false,
                name: 'creation_date',
                label: 'creation_date',
                cell: 'date'
            },
            ];
        },
        onShow: function(){

        },

        onRender: function(){
                        

            //Passer un objet / collection
            this.filters = new NSFilter({
                channel: 'modules',
                url: config.coreUrl + 'rfid/',
                template: 'filter/tpl-filters.html',
            });

            //Passer un objet / collection remplie (cols + content)
            this.grid= new NSGrid({
                
                checkedColl: false,
                channel: 'modules',
                columns: this.cols,
                /*collection:this.collection,*/
                url: config.coreUrl + 'rfid/',
                pageSize : 35,
                pagingServerSide : false,
                
            });
            

            this.$el.find('#grid').html(this.grid.displayGrid());
            this.$el.find('#paginator').html(this.grid.displayPaginator());
        },


    });
});
