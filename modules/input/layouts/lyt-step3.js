define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'config',
    'stepper/level1-demo',
    'stepper/lyt-step',
    'modules2/input/views/station-details',
    'modules2/NaturalJS-Form/NsFormsModule',
    'utils/getProtocolsList'

], function($, _, Backbone, Marionette, Radio, config, View1, Step, StationDetails,NsFormsModule,getProtocolsList) {

    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        events : {
            'click #tabProtsUl a' : 'updateForm',
            'change select[name="st_FieldActivity_Name"]' : 'updateFieldActivity'
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
                file : 'simplified-habitat.json',
                name :'bird-biometry',
                formRegion :'formsContainer',
                buttonRegion : 'formButtons'
            });
            this.getProtocolsList(fieldActivity);
            //this.getProtocol('Biometry', 140);
            this.getProtocols();
        },
        updateForm : function(e){
            var selectedForm = $(e.target).attr('name');
            var file;
            this.getProtocol(selectedForm,'');
            /*if(selectedForm ==='Bird Biometry'){
                file='bird-biometry.json';
            }
            else{
                file='chiroptera-capture.json';
            } 
            var formView = new NsFormsModule({
                file : file,
                formRegion :'formsContainer',
                buttonRegion : 'formButtons'
            });*/
        },
        getProtocolsList : function(fieldActivity){
            var url= config.coreUrl +'protocols/list';
            var data = {};
            if(fieldActivity) {
                data = {'fieldActivity':fieldActivity};
            }
            $.ajax({
                url:url,
                context:this,
                data : data,
                type:'GET',
                success: function(data){
                    var len = data.length;
                    var elements ='';
                   for (var i = 0; i < len; i++) {
                        var protoName = data[i].proto_name;
                        var liElement = '<li>';
                        liElement += '<a data-toggle="tab" name="'+ protoName + 
                            '"><span><i></i></span>' + protoName + 
                            '</a><i class="icon reneco close braindead"></i></li>';
                        elements += liElement;
                    }
                    $('ul[name="tabProtsUl"]').html('');
                    $('ul[name="tabProtsUl"]').append(elements);
                },
                error: function(data){
                    alert('error in loading protocols');
                }
            });
        },
        getProtocol: function(protoName, id){
            var url= config.coreUrl +'station/getProtocol?proto_name=' + protoName + '&id_proto=' + id ;
            var formView = new NsFormsModule({
                modelurl : url,
                formRegion :'formsContainer',
                buttonRegion : 'formButtons'
            });
            /*$.ajax({
                url:url,
                context:this,
                type:'GET',
                success: function(data){
                    console.log(data);
                },
                error: function(data){
                    alert('error in loading protocols');
                }
            });*/
        },
        getProtocols : function(){
            var protocols  = getProtocolsList.getElements('protocols/list');
            $('select[name="add-protocol"]').append(protocols);
        },
        updateFieldActivity : function(e){
            var value = $( 'select[name="st_FieldActivity_Name"] option:selected').text();
            this.getProtocolsList(value);
        }
    });

});
