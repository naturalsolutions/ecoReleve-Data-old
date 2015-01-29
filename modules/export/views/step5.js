define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step5.html'

], function($, _, Backbone, Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

        events: {
            'click #btnGetFile': 'initDatas',
            
        },
        
        initialize: function(options) {
        	this.radio = Radio.channel('exp');

            
        	this.viewName = options.viewName;
            this.filterCriteria = options.filterCriteria;
            this.boxCriteria = options.boxCriteria;
            this.columnCriteria = options.columnCriteria;

            
        },

        onDestroy: function() {
           
        },
        onShow: function() {
            if ( this.viewName == 'V_Qry_ArgosGSM_lastData_withFirstCaptRelData_GeoCountry' ||
                this.viewName ==  'V_Qry_VIndiv_MonitoredLostPostReleaseIndividuals_LastStations' ) {

                    $('#btnGetFile').removeClass('hidden');

            }
        },

        initDatas: function(e){
        	var type=e.currentTarget.getAttribute("value");
            this.datas= {
                type_export: type,
                viewName: this.viewName,
                filters: this.filterCriteria,
                bbox: this.boxCriteria,
                columns: this.columnCriteria
            }
            this.getPdfFile(type);
        },

        getPdfFile: function(type) {

            var that=this;
            var route = config.coreUrl + "/views/filter/" + this.viewName + "/export";

            $.ajax({
                url: route,
                data: JSON.stringify({criteria: this.datas}),
                contentType:'application/json',
                type:'POST',
                context: this,
            }).done(function(data){
                var url = URL.createObjectURL(new Blob([data], {'type':'application/'+type}));
                var link = document.createElement('a');
                link.href = url;
                link.download = that.viewName+'_exports.'+type;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
            }).fail(function(msg){
                console.log(msg);
            });


        },

        
    });
});
