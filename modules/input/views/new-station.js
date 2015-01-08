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
        events: {
            
        },
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
            $('input[name="Date_"]').attr('placeholder' ,'jj/mm/aaaa hh:mm:ss').attr('data-date-format','DD/MM/YYYY HH:mm:ss');
            $('#dateTimePicker').datetimepicker({
                defaultDate:""
            }); 
            $('#dateTimePicker').on('dp.show', function(e) {
                $('input[name="Date_"]').val('');    
            });
            $('#dateTimePicker').on('dp.dp.change', function(e) {
                $('input[name="Date_"]').change();
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
        }
        
    });
});