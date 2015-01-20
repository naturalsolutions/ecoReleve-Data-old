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

        className: 'container no-padding',


        events: {
            'click #update' : 'update',
            // 'click tr': 'redirect',
        },

        onDestroy: function(){
            $('#main-region').removeClass('grey-back').removeClass('no-scroll');
            $('body').removeClass('no-scroll');
        },

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
            $('body').addClass('full-height').addClass('no-scroll');
            $('#main-region').addClass('full-height').addClass('grey-back').addClass('no-scroll');
        },

        onRender: function(){
            
            /*this.filters = new NSFilter({
                channel: 'modules',
                url: config.coreUrl + 'rfid/validate/',
                template: 'filter/tpl-filters.html',
            });*/

            this.grid= new NSGrid({    
                channel: 'modules',
                url: config.coreUrl + 'rfid/validate/',
                pageSize : 25,
                pagingServerSide : false,
                });
            
            this.$el.find('#grid').html(this.grid.displayGrid());
            this.$el.find('#paginator').html(this.grid.displayPaginator());

            var ctx=this;
            this.$el.find('#slider').slider({
                value:1,
                min: 0.1,
                max: 6,
                slide: function( event, ui ) {
                    ctx.changeFreq();
                    $( "#Freq" ).html( ui.value );
                }
            });
        },

        update: function(){
            /*this.filters.update();*/
        },

        changeFreq: function(){
            console.log('carefull : frequency has been changed');
        },
    
    });
});
