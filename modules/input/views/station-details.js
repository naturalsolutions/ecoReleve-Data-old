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
            'change .fieldworker' : 'checkFWName',
            'change .editField' : 'updateStationData',
            'change .indivNumber' : 'updateTotalIndivNumber',
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
            this.radio = Radio.channel('froms');
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
            var siteName = this.model.get('id_site');
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
            this.model.set('NbFieldWorker',parseInt(nbFW));
        },
        updateTotalIndivNumber : function(){
            var total = 0;
            $('.indivNumber').each(function(){
                var number = parseInt($(this).val());
                if(number){
                    total += number;
                }
            });
            $('input[name="Nb_Total"]').val(total);
            this.model.set('NbFieldWorker',parseInt(total));
        },
        updateStationData : function(e){
            var value = $(e.target).val();
            var fieldName = $(e.target).attr('name');
            if (value){
                switch(fieldName){
                    case 'stPlace':
                        this.model.set('Place',value);
                        break;
                    case 'stAccuracy':
                        this.model.set('Precision',value);
                        break;
                    case 'stDistance':
                        this.model.set('Name_DistanceFromObs',value);
                        break;
                    case 'st_FieldActivity_Name':
                        this.model.set('FieldActivity_Name',value);
                        break;
                    case 'detailsStFW1':
                        this.model.set('FieldWorker1',parseInt(value));
                        break;
                     case 'detailsStFW2':
                        this.model.set('FieldWorker2',parseInt(value));
                        break;
                    case 'detailsStFW3':
                        this.model.set('FieldWorker3',parseInt(value));
                        break;
                    case 'detailsStFW4':
                        this.model.set('FieldWorker4',parseInt(value));
                        break;
                    case 'detailsStFW5':
                        this.model.set('FieldWorker5',parseInt(value));
                        break;
                    case 'detailsStFWTotal':
                        this.model.set('NbFieldWorker',parseInt(value));
                        break;
                    default:
                        break;
                }
                this.radio.command('updateStation', {model: this.model});


                /*$.ajax({
                    url: config.coreUrl +'station/addStation/insert',
                    context: this,
                    data: this.model.attributes,
                    type:'POST',
                    success: function(data){
                    console.log(data);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                    //alert(xhr.status);
                    //alert(thrownError);
                    alert('error in updating current station value(s)');
                }
                });*/
                
            }
        }
    });
});