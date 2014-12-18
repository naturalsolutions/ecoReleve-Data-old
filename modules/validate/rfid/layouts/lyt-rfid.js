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
    'jquery_ui',


], function($, _, Backbone, Marionette, Radio,
    config, tpl, NSFilter, NSGrid) {

    'use strict';


    return Marionette.LayoutView.extend({
        template: tpl,

        className: 'full-height',


        events: {
            'click #update' : 'update',
            // 'click tr': 'redirect',
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
            
            this.filters = new NSFilter({
                channel: 'modules',
                url: config.coreUrl + 'rfid/',
                template: 'filter/tpl-filters.html',
            });

            this.grid= new NSGrid({    
                checkedColl: true,
                channel: 'modules',
                url: config.coreUrl + 'rfid/',
                pageSize : 25,
                pagingServerSide : false,
                
            });
            
            this.$el.find('#grid').html(this.grid.displayGrid());
            this.$el.find('#paginator').html(this.grid.displayPaginator());
            console.log(this.$el.find('#slider'));  
            $(function() {
                $( "#slider" ).slider();
              });
            this.$el.find('#slider').slider();
        },

        update: function(){
            this.filters.update();
        },
    
    });
});
