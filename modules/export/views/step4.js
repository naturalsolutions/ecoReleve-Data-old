define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step4.html'

], function($, _, Backbone, Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,


        events: {
            'click #btnGetFile': 'initDatas'
        },

        
        initialize: function(options) {
        	this.radio = Radio.channel('exp');
        	this.viewName = options.viewName;
            this.filterCriteria = options.filterCriteria;
            this.boxCriteria = options.boxCriteria;
            this.columnCriteria = options.columnCriteria;

        },
        onBeforeDestroy: function() {
            this.radio.reset();
        },
        
        onShow: function() {
            console.log(this.viewName);
            console.log(this.filterCriteria);
            console.log(this.boxCriteria);
            console.log(this.columnCriteria);
        },

        initDatas: function(){
            this.datas= {
                type_export:'pdf',
                viewName: this.viewName,
                filters: this.filterCriteria,
                bbox: this.boxCriteria,
                columns: this.columnCriteria
            }
            console.log(this.datas);
            this.getPdfFile();
        },


        getPdfFile: function() {
            //var displayedCols=app.utils.exportSelectedFieldsList;
            //displayedCols.remove("Id");
            //console.log(displayedCols);
            var that=this;
            //var urlFile = app.config.coreUrl + "/views/filter/" + this.currentView + "/export" + "?" + this.filterValue + "&bbox=" + this.bbox + "&columns=" + displayedCols;
            var route = config.coreUrl + "/views/filter/" + this.viewName + "/export";

            $.ajax({
                url: route,
                data: JSON.stringify({criteria: this.datas}),
                contentType:'application/json',
                type:'POST',
                context: this,
            }).done(function(data){
                console.log('success');
                
                var url = URL.createObjectURL(new Blob([data], {'type':'application/pdf'}));
                var link = document.createElement('a');
                link.href = url;
                link.download = that.currentView+'_exports.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('passed');
                //$('#filter-query-result').html(count);
                

            }).fail(function(msg){
                console.log(msg);
            });


        },




        /*

        getPdfFile: function() {
            var displayedCols=app.utils.exportSelectedFieldsList;
            displayedCols.remove("Id");
            console.log(displayedCols);
            var that=this;
            var urlFile = app.config.coreUrl + "/views/filter/" + this.currentView + "/export" + "?" + this.filterValue + "&bbox=" + this.bbox + "&columns=" + displayedCols;
            $.ajax({
                url: urlFile,
                contentType:'application/json',
                data: JSON.stringify({type_export:'pdf'}),
                type:'POST',
                success: function(data) {
                    //var fileName = data[0].filename;
                    console.log('succes');
                    var url = URL.createObjectURL(new Blob([data], {'type':'application/pdf'}));
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = that.currentView+'_exports.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                error: function() {
                    console.log('error on pdf creation');
                }
            });
        },
        getCsvFile: function() {
            var displayedCols=app.utils.exportSelectedFieldsList;
            displayedCols.remove("Id");
            console.log(this.displayedCols);
            var that=this;
            var urlFile = app.config.coreUrl + "/views/filter/" + this.currentView + "/export" + "?" + this.filterValue + "&bbox=" + this.bbox + "&columns=" + displayedCols;
            $.ajax({
                url: urlFile,
                contentType:'application/json',
                data: JSON.stringify({type_export:'csv'}),
                type:'POST',
                success: function(data) {
                    //var fileName = data[0].filename;
                    console.log('succes');
                    var url = URL.createObjectURL(new Blob([data], {'type':'text/csv'}));
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = that.currentView+'_exports.csv';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                error: function() {
                    console.log('error on csv creation');
                }
            });

        },

        getGPXFile: function() {
            var displayedCols=app.utils.exportSelectedFieldsList;
            displayedCols.remove("Id");
            console.log(this.displayedCols);
            var that=this;
            var urlFile = app.config.coreUrl + "/views/filter/" + this.currentView + "/export" + "?" + this.filterValue + "&bbox=" + this.bbox + "&columns=" + displayedCols;
            $.ajax({
                url: urlFile,
                contentType:'application/json',
                data: JSON.stringify({type_export:'gpx'}),
                type:'POST',
                success: function(data) {
                    //var fileName = data[0].filename;
                    console.log('succes');
                    var url = URL.createObjectURL(new Blob([data], {'type':'application/gpx+xml'}));
                    var link = document.createElement('a');
                    link.href = url;
                    link.download = that.currentView+'_exports.gpx';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                error: function() {
                    console.log('error on pdf creation');
                }
            });

        },
    */

    });
});
