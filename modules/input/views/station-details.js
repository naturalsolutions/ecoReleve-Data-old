define([
    'jquery',
    'marionette',
    'radio',
    'config',
    'text!modules2/input/templates/tpl-station-details.html',
    'utils/getFieldActivity',
    'utils/getItems',
    'models/station',
    'utils/getUsers'
], function($,Marionette, Radio, config,template,getFieldActivity,getItems,Station,getUsers) {
    'use strict';
    return Marionette.ItemView.extend({
        template: template,
        events : {
            'change input[name="stAccuracy"]' : 'checkAccuracyValue',
            'change .fieldworker' : 'checkFWName'
        },
        ui : {
            fieldActivity : 'select[name="st_FieldActivity_Name"]',
            places : 'select[name="stPlace"]',
            accuracy : 'input[name="stAccuracy"]'
        },
        onShow : function(){
            this.generateSelectLists();
            this.checkSiteNameDisplay();
            this.getUsersList();
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
        },
        checkAccuracyValue : function(){
            var value = parseInt($(this.ui.accuracy).val());
           if(value < 0 ){
                alert('please input a valid value (>0) ');
                $(this.ui.accuracy).val('');
           }

        },
        getUsersList : function(){
            var content = getUsers.getElements('user');
            $(".fieldworker").each(function() {
                $(this).append(content);
            });
            // set stored values 
                for(var i=1;i<6;i++){
                    var fieldworker = this.model.get('FieldWorker' + i);
                   $('select[name="detailsStFW' + i + '"]').val(fieldworker);
                }
            // set users number
            $("#stDtailsNbFW").val(this.model.get('NbFieldWorker'));
        },
        checkFWName : function(e){
            var selectedField = $(e.target);
            var fieldName = $(e.target).attr('name');
            var selectedOp = $(e.target).find(":selected")[0];
            var selectedName = $(selectedOp).val();
            var nbFW = 0;
            $(".fieldworker").each(function() {
                var selectedValue = $(this).val();
                if ($(this).attr('name') != fieldName){
                    if (selectedName && (selectedValue == selectedName)){
                        alert('this name is already selected, please select another name');
                        $(selectedField).val('');
                    } else {
                        //this.updateUser();
                    }
                }
                if(selectedValue){
                    nbFW+=1;
                }
            });
            $("#stDtailsNbFW").val(nbFW);
        }
    });
});