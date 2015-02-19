define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.paginator',
    'backgrid',
    'backgrid.paginator',
    'marionette',
    'moment',
    'radio',
    'text!modules2/input/templates/tpl-new-station.html',
    'bbForms',
    'models/station',
    'config',
    'utils/getUsers',
    'utils/getFieldActivity',
    'utils/getRegions',
    'utils/getSitesTypes',
    'dateTimePicker',
], function($, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, moment, Radio, template,
    BbForms, Station, config,getUsers, getFieldActivity,getRegions,getSitesTypes,datetime) {
    'use strict';
    return Marionette.ItemView.extend({
        template: template,
        initialize: function(options) {
            var station = new Station();
            this.form = new BbForms({
                model: station,
                template: _.template(template)
            }).render();
            this.el =  this.form.el;
            this.radio = Radio.channel('input');
        },
        onShow : function(){
            var self = this;
            var datefield = $("input[name='Date_']");
            $(datefield).attr('placeholder', config.dateLabel);
            $('#stMonitoredSiteType').attr('disabled','disabled');
            $('#stMonitoredSiteName').attr('disabled','disabled');
            $(datefield).datetimepicker({
                defaultDate:""
            });

            $(datefield).data('DateTimePicker').format('DD/MM/YYYY HH:mm:ss');


            
            $(datefield).on('dp.show', function(e) {
                 $(this).val('');
            });
            $(datefield).on('dp.change', function(e) {
                 self.checkDate();
            });           
            this.generateSelectLists();
        },
        onBeforeDestroy: function() {
          $('div.bootstrap-datetimepicker-widget').remove();
        },
        generateSelectLists : function(){
            var content = getUsers.getElements('user');
            $('select[name^="FieldWorker"]').append(content);
            var fieldList = getFieldActivity.getElements('theme/list');
            $('select[name="FieldActivity_Name"]').append(fieldList);
            var regionList = getRegions.getElements('station/area');
            $('select[name="Region"]').append(regionList);
            /*var sites  = getSitesTypes.getElements('monitoredSite/type');
            $('select[name="id_site"]').append(sites);*/
        },
        checkDate: function(){
            var siteType = $('#stMonitoredSiteType');
            var siteName = $('#stMonitoredSiteName');
            var datefield = $("input[name='Date_']");
            //var date = $(datefield).val();
            var date = moment($(datefield).val(),"DD/MM/YYYY HH:mm:ss");    //28/01/2015 15:02:28
            var now = moment();
            if (now < date) {
               alert('Please input a valid date');
               $(datefield).val('');
               $(siteType).attr('disabled','disabled');
               $(siteName).attr('disabled','disabled');
            } else {
                if(date){
                    $(siteType).removeAttr('disabled');
                    $(siteName).removeAttr('disabled');
                }
                
                this.radio.command('changeDate');
            }
        }
    });
});