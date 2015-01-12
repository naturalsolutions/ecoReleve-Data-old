define([
    'jquery',
    'marionette',
    'radio',
    'config',
    'text!modules2/input/templates/tpl-station-details.html',
    'utils/getFieldActivity',
    'utils/getItems'
], function($,Marionette, Radio, config,template,getFieldActivity,getItems) {
    'use strict';
    return Marionette.ItemView.extend({
        template: template,
        events: {
            'click .arrow-right-station' :'nextStation',
            'click .arrow-left-station' :'prevStation'
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
        },
        initialize: function(){
            this.listenTo(this.model, 'change', this.render);
                    /*,

        render: function(){
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }*/
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
                },
                error: function(data){
                    alert('error in loading station data');
                }
            }).done(function(){
               

            });
        }
    });
});