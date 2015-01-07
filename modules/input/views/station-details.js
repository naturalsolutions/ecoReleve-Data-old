define([
    'jquery',
    'marionette',
    'radio',
    'text!modules2/input/templates/tpl-station-details.html',
    'utils/getFieldActivity',
    'utils/getItems'
], function($,Marionette, Radio, template,getFieldActivity,getItems) {
    'use strict';
    return Marionette.ItemView.extend({
        template: template,
        events: {
            
        },
        initialize: function(options) {
        },
        onShow : function(){
            this.generateSelectLists();
        },
        onBeforeDestroy: function() {
         
        },
        generateSelectLists : function(){
            var fieldList = getFieldActivity.getElements('theme/list');
            $('select[name="st_FieldActivity_Name"]').append(fieldList);
            var placesList = getItems.getElements('station/locality');
            $('select[name="stPlace"]').append(placesList);
            /*var regionList = getRegions.getElements('station/area');
            $('select[name="Region"]').append(regionList);*/
        }
    });
});