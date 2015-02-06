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
], function($, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, moment, Radio, template,
    BbForms, Station, config,getUsers, getFieldActivity,getRegions,getSitesTypes) {
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
            //this.form.model.on('change', this.form.render, this);
        },
        onShow : function(){
            var datefield = $("input[name='Date_']");
            var self = this;
            $(datefield).attr('placeholder' ,'jj/mm/aaaa HH:mm:ss');
            $('#dateTimePicker').datetimepicker({
                defaultDate:""
            }); 
            $('#dateTimePicker').data('DateTimePicker').format('DD/MM/YYYY HH:mm:ss');
            $('#dateTimePicker').on('dp.show', function(e) {
                $(datefield).val('');    
            });
            $('#dateTimePicker').on('dp.dp.change', function(e) {
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
            var sites  = getSitesTypes.getElements('monitoredSite/type');
            $('select[name="id_site"]').append(sites);
        },
        checkDate: function(){
            var datefield = $("input[name='Date_']");
            //var date = $(datefield).val();
            var date = moment($(datefield).val() , "DD/MM/YYYY HH:mm:ss");    //28/01/2015 15:02:28
            var now = moment();
            if (now < date) {
               alert('Please input a valid date');
               $(datefield).val('');
            } else {
               $(datefield).change();
            }
        }
        
    });
});