define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step4-preview.html',
    'backgrid'

], function($, _, Backbone, Marionette, moment, Radio, datalist, config, template, Backgrid) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,


        
        initialize: function(options) {
        	this.radio = Radio.channel('exp');
            this.radio.comply('columns-update', this.updateColumns, this);
            
        	this.viewName = options.viewName;
            this.filterCriteria = options.filterCriteria;
            this.boxCriteria = options.boxCriteria;
            
        },
        
        updateColumns: function(args){
            this.columnCriteria = args.columns;
            this.initDatas();

        },

        initDatas: function(){
            this.datas= {
                viewName: this.viewName,
                filters: this.filterCriteria,
                bbox: this.boxCriteria,
                columns: this.columnCriteria
            }
            console.log(this.datas);
            this.ajaxCall();
        },


        ajaxCall: function(){
        	var url = config.coreUrl + '/views/filter/' + this.viewName + '/result';

        	console.log(this.datas);
        	var jqxhr = $.ajax({
        	    url: url,
        	    data: JSON.stringify({criteria: this.datas}),
        	    contentType:'application/json',
        	    type:'POST',
        	    context: this,
        	}).done(function(data){
        		console.log(data);
        		this.displayGrid(data);


        	}).fail(function(msg){
        		console.log(msg);
        	});
        },


        onShow: function() {

        },


        displayGrid: function(data){
        	console.log(data.rows);
        	console.log(data.columns)
        	var collection = new Backbone.Collection(data.rows);

        	var col=[]
        	for (var i = 0; i < data.columns.length; i++) {
        		col.push({
        			name: data.columns[i],
        			label: data.columns[i],
        			editable: false,
        			cell: 'string'
        		});
        	};


        	this.grid = new Backgrid.Grid({
        	    columns: col,
        	    collection: collection
        	});

        	this.$el.find("#grid").html(this.grid.render().el);
        },

    });
});
