define([
    'jquery',
    'marionette',
    'radio',
    'config',
    'text!modules2/input/templates/tpl-station-details.html',
    'utils/getFieldActivity',
    'utils/getItems',
    'models/station'
], function($,Marionette, Radio, config,template,getFieldActivity,getItems,Station) {
    'use strict';
    return Marionette.ItemView.extend({
        template: template,
        ui : {
            fieldActivity : 'select[name="st_FieldActivity_Name"]',
            places : 'select[name="stPlace"]'
        },
        onShow : function(){
            this.generateSelectLists();
            this.checkSiteNameDisplay();
        },
        onBeforeDestroy: function() {
         
        },
        generateSelectLists : function(){
            var fieldList = getFieldActivity.getElements('theme/list');
            $(this.ui.fieldActivity).append(fieldList);
            var placesList = getItems.getElements('station/locality');
            $(this.ui.places).append(placesList);
        },
        checkSiteNameDisplay: function(){
            // mask name site row if value is null
            var siteName = this.model.get('name_site');
            if(!siteName){
                $('#stNameSite').addClass('masqued');
            }
        }
    });
});