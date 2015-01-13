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
        events: {
            'click .arrow-right-station' :'nextStation',
            'click .arrow-left-station' :'prevStation'
        },
        onShow : function(){
            this.generateSelectLists();
            this.checkSiteNameDisplay();
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
        },
        initialize: function(){
            this.radio = Radio.channel('input');
            //this.listenTo(this.model, 'change', this.render);
                    /*,

        render: function(){
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }*/
        },
        modelEvents: {
        'change': 'fieldsChanged'
        },

        fieldsChanged: function() {
            this.render();
            // update lists
            this.generateSelectLists();
            var fieldActivity = this.model.get('FieldActivity_Name');
            $('select[name="st_FieldActivity_Name"]').val(fieldActivity);
            $('input[name="stAccuracy"]').val(this.model.get('Precision'));
            var distFromObs = this.model.get('Name_DistanceFromObs');
            if(distFromObs){
                $('#stDistFromObs').val(distFromObs);
            }
            this.checkSiteNameDisplay();
        },
        nextStation : function(){
            var currentStationId = parseInt($('#stId').text());
            var url= config.coreUrl + 'station/'+ currentStationId + '/next';
            this.getStationDetails(url);
            //alert(currentStationId);
        }, 
        prevStation:function(){
            var currentStationId = parseInt($('#stId').text());
            var url= config.coreUrl + 'station/'+ currentStationId  + '/prev';
            this.getStationDetails(url);
        },
        getStationDetails : function(url){
            $.ajax({
                url:url,
                context:this,
                type:'GET',
                success: function(data){
                    console.log(data);
                   console.log('----------- avant');
                   console.log(this.model);
                   for(var key in data){
                        if(key =='TSta_PK_ID'){
                            this.model.set('PK', data[key]);
                        } else if (key =='date'){
                            this.model.set('Date_', data[key]);
                        }
                        else{
                            this.model.set(key, data[key]);
                        }

                   
                    //Traitement
                    }
                    console.log('----------- apres');
                   console.log(this.model);
                   this.radio.command('updateStation', this.model);
                },
                error: function(data){
                    alert('error in loading station data');
                }
            }).done(function(){
               

            });
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