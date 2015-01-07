define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'stepper/level1-demo',
    'stepper/lyt-step',
    'modules2/input/views/station-details',
    'modules2/NaturalJS-Form/NsFormsModule',

], function($, _, Backbone, Marionette, Radio, View1, Step, StationDetails,NsFormsModule) {

    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        events : {
            'click #tabProtsUl a' : 'updateForm'
        },
        regions: {
            stationRegion: '#stContainer',
            formsRegion : '#formsContainer'
        },
        feedTpl: function(){
            
        },
        initModel: function(myTpl){
            this.parseOneTpl(this.template);
        },
        onShow: function(){
            var stationModel = this.model.get('station_position');
            var stationView = new StationDetails({model:stationModel});
            this.stationRegion.show(stationView);
            // set stored value of field activity
            var fieldActivity = stationModel.get('FieldActivity_Name');
            $('select[name="st_FieldActivity_Name"]').val(fieldActivity);
            // add form
            var formView = new NsFormsModule({
                file : 'bird-biometry.json',
                name :'bird-biometry',
                formRegion :'formsContainer',
                buttonRegion : 'formButtons'
            });
        },
        updateForm : function(e){
            var selectedForm = $(e.target).attr('name');
            var file;
            if(selectedForm ==='Bird Biometry'){
                file='bird-biometry.json';
            }
            else{
                file='chiroptera-capture.json';
            } 
            var formView = new NsFormsModule({
                file : file,
                formRegion :'formsContainer',
                buttonRegion : 'formButtons'
            });
        }
    });

});
