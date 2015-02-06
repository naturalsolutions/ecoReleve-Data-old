define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step5.html',
    'sweetAlert',

], function($, _, Backbone, Marionette, moment, Radio, datalist, config, template, Swal) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

        events: {
            'click .exp-file': 'selectFileType',
            'click #export': 'initFile',
            
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

                this.$el.find('.exp-file').removeClass('hidden');
                this.typeFile = 'pdf';
            }else{
                this.typeFile = 'csv';

            }

            this.$el.find('.exp-file:not(.hidden)').first().addClass('active').find('input[type=radio]').prop('checked', true);
        },

        selectFileType: function(e){
            var elem = $(e.currentTarget); 
            var ctx = this;
            console.log(elem);
        	ctx.typeFile = elem.find('input[type=radio]').val();
            console.log(ctx.typeFile);



            this.$el.find('.exp-file').each(function(){
                var radio = $(this).find('input[type=radio]');
                if(radio.val() == ctx.typeFile){
                    $(this).addClass('active');
                    radio.prop('checked', true);
                }else{
                    $(this).removeClass('active');
                    radio.prop('checked', false);
                }
            });
        },



        initFile: function(){
            this.datas= {
                type_export: this.typeFile,
                viewName: this.viewName,
                filters: this.filterCriteria,
                bbox: this.boxCriteria,
                columns: this.columnCriteria
            }
            this.getFile(this.typeFile);
            console.log(this.datas);
        },

        getFile: function(type) {

            var that=this;
            var route = config.coreUrl + "/views/filter/" + this.viewName + "/export";

            console.log(this.datas);

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
                Swal(
                    {
                      title: "Well done!",
                      text: 'A window will shows up',
                      type: 'success',
                      showCancelButton: false,
                      confirmButtonText: "OK",
                      closeOnConfirm: true,
                    }
                );
            }).fail(function(msg){
                Swal(
                    {
                      title: "An error occured",
                      text: '',
                      type: 'error',
                      showCancelButton: false,
                      confirmButtonColor: 'rgb(147, 14, 14)',
                      confirmButtonText: "OK",
                      closeOnConfirm: true,
                    }
                );
            });
        },

        
    });
});
