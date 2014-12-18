define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'config',
    'text!grid/tpl-demo.html',
    'grid/model-grid',

], function($, _, Backbone, Marionette, 
    Radio, config, tpl, NSGrid) {

    'use strict';

    return Marionette.LayoutView.extend({
        template: tpl,



        initialize: function(){
            // this.cols=["DATE", "StaID", "StaName"];

            //this.colGene = new colGene({url : 'rfid/getFields', paginable: true});
        },

        onRender: function(){

            this.grid= new NSGrid({cols: this.cols,
                url: config.coreUrl + 'rfid/',
                pageSize: 25,
                pagingServerSide: true,
            });
            this.$el.find('#grid').html(this.grid.displayGrid());
            this.$el.find('#paginator').html(this.grid.displayPaginator());
        },




        onShow: function(){

        },
        onDestroy: function(){},


    });
});
