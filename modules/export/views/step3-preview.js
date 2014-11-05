define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step3-preview.html'

], function($, _, Backbone, Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,


        events: {
            'click #btnGetFile': 'initDatas'
        },

        
        initialize: function(options) {
        	this.radio = Radio.channel('exp');
            this.radio.comply('columns-update', this.updateColumns, this);

        	this.viewName = options.viewName;
            this.filterCriteria = options.filterCriteria;
            this.boxCriteria = options.boxCriteria;
        },
        onBeforeDestroy: function() {
            this.radio.reset();
        },
        
        updateColumns: function(args){
            this.columnCriteria = args.columns;
            console.log(this.columnCriteria);
        },

        onShow: function() {
            console.log(this.viewName);
            console.log(this.filterCriteria);
            console.log(this.boxCriteria);
        },

        initDatas: function(){
            this.datas= {
                viewName: this.viewName,
                filters: this.filterCriteria,
                bbox: this.boxCriteria,
                columns: this.columnCriteria
            }
            console.log(this.datas);
            this.getPdfFile();
        },


    });
});
