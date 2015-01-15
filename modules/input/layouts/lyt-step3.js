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
    'utils/getProtocolsList',
    'swiper',
    'models/station',
    'utils/getUsers'
], function($, _, Backbone, Marionette, Radio, config, View1, Step, StationDetails,NsFormsModule,getProtocolsList,Swiper,Station,getUsers) {

    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        events : {
            'click #tabProtsUl a' : 'updateForm',
            'change select[name="st_FieldActivity_Name"]' : 'updateFieldActivity',
            'change select[name="add-protocol"]' : 'addForm',
            'click a.pkProtocol' : 'getProtoByPkId',
            'click .arrow-right-station' :'nextStation',
            'click .arrow-left-station' :'prevStation'
        },
        regions: {
            stationRegion: '#stContainer',
            formsRegion : '#formsContainer'
        },
        ui:{
            addProto : 'select[name="add-protocol"]',
             protosList : '#tabProtsUl'
        },
        feedTpl: function(){
            
        },
        initModel: function(myTpl){
            this.parseOneTpl(this.template);
            this.activeProtcolsObj = [];
        },
        onShow: function(){
            this.addViews();
            var content = getUsers.getElements('user');
            $('#usersList').append(content);
            this.radio = Radio.channel('froms');
            this.radio.comply('updateForm', this.updateFormUI, this);
        },
        updateForm : function(e,element){
            var selectedProtoName;
            if(!element){
                selectedProtoName = $(e.target).attr('name');
            }
            else {
                selectedProtoName = $(element).attr('name');
            }
            // check if we have only one instance or not of selected proto
            this.selectedProtoName = selectedProtoName;
            for(var key in this.activeProtcolsObj) {
               if(key == selectedProtoName){
                    var pk_list = this.activeProtcolsObj[key].PK_data;
                    var nbProtoInstances = pk_list.length;
                    if(nbProtoInstances==1){
                        var idProto = pk_list[0];
                        $('#formsIdList ul').html('');
                        this.getProtocol(selectedProtoName,idProto);
                        this.selectedProtoId = idProto;   
                        $('#idProtosContainer').addClass('masqued');
                    } else {
                        this.genInterfaceForCurrentProto(pk_list);
                        $('#idProtosContainer').removeClass('masqued');
                    }
               }
            }
        },
        getProtocolsList : function(idStation){
            var url= config.coreUrl + 'station/'+ idStation + '/protocol';
            var listElement = $(this.ui.protosList);
            $.ajax({
                url:url,
                context:this,
                type:'GET',
                success: function(data){
                    this.activeProtcolsObj = data;
                    this.generateNavBarProtos();
                },
                error: function(data){
                    alert('error in loading protocols');
                }
            }).done(function(){
                var element = $(listElement).find('div.swiper-slide:first a');
                this.updateForm(null, element );
                $(listElement).find('div.swiper-slide').removeClass('swiper-slide-active');
                $(listElement).find('div.swiper-slide:first').addClass('swiper-slide-active');
            });
        },
        getProtocol: function(protoName, id){
            this.formsRegion.empty();
            $('#formsContainer').text('');
            var url= config.coreUrl +'station/'+ this.idStation + '/protocol/' + protoName + '/' + id ;
            var formView = new NsFormsModule({
                modelurl : url,
                formRegion :'formsContainer',
                buttonRegion : 'formButtons',
                stationId : this.idStation
            });
        },
        getProtocols : function(){
            var protocols  = getProtocolsList.getElements('protocols/list');
            $('select[name="add-protocol"]').append(protocols);
        },
        updateFieldActivity : function(e){
            var value = $( 'select[name="st_FieldActivity_Name"] option:selected').text();
            this.getProtocolsList(value);
        },
        generateNavBarProtos : function(){
            // generate interface with list content
            $('.pagination.protocol').text('');
            var htmlContent ='';
            for(var key in this.activeProtcolsObj) {
                var tm = key;
                var nbProtoInstances = this.activeProtcolsObj[key].PK_data.length;

                htmlContent +=  '<div class="swiper-slide"><a name="'+ key ;
                htmlContent += '"><span><i></i></span>' + key ;
                if(nbProtoInstances > 1){
                    htmlContent += '<span class="badge">' + nbProtoInstances + '</span>';
                }
                 htmlContent += '</a></div>';
            }
            $(this.ui.protosList).html('');
            $(this.ui.protosList).append(htmlContent);
            
            var mySwiper1 = new Swiper('#proto_name',{
                //pagination: '.pagination-protocols',
                //paginationClickable: true,
                slidesPerView: 4
            });
            $('#proto_name-left').on('click', function(e){
                e.preventDefault()
                mySwiper1.swipePrev()
            });
            $('#proto_name-right').on('click', function(e){
                e.preventDefault()
                mySwiper1.swipeNext()
            });
            //$('.swiper-slide').css('height','50px');
        },
        addForm : function(){
            var selectedProtocolName = $(this.ui.addProto).val();
            if(selectedProtocolName){
                var exists = false;
                for(var key in this.activeProtcolsObj) {
                    if(key == selectedProtocolName){
                        exists = true;
                        // a new instance of protocol have id = 0
                        this.activeProtcolsObj[key].PK_data.push(0);
                    } 
                }
                if (!exists){
                    var protoObj = {};
                    protoObj.PK_data = [0];
                    this.activeProtcolsObj[selectedProtocolName] = protoObj;
                }
                // refrech view
                this.generateNavBarProtos();
            }
        },
        genInterfaceForCurrentProto: function(pkList){
            this.formsRegion.empty();
            $('#formsContainer').text('');
            $('#idProtosContainer .pagination').text('');

            var content ='';
            for(var i=0;i<pkList.length;i++){
                var idProto = pkList[i];
                content +=  '<div class="swiper-slide"><a class="pkProtocol">' + idProto + '</a></div>';
            }
            $('#formsIdList').html('');
            $('#formsIdList').append(content);
            // swiper
            var mySwiper2 = new Swiper('#proto_id',{
                //pagination: '.pagination',
                //paginationClickable: true,
                slidesPerView: 8
            });
            $('#proto_id-left').on('click', function(e){
                e.preventDefault()
                mySwiper2.swipePrev()
            });
            $('#proto_id-right').on('click', function(e){
                e.preventDefault()
                mySwiper2.swipeNext()
            });
            //$('.swiper-slide').css('height','50px');
        },
        getProtoByPkId : function(e){
            var pkId = parseInt($(e.target).text());
            this.getProtocol(this.selectedProtoName, pkId);
            // store pkId to save proto
            this.selectedProtoId = pkId;
        },
        nextStation : function(){

            var currentStation = this.model.get('station_position');
            var currentStationId = currentStation.get('PK');
            var url= config.coreUrl + 'station/'+ currentStationId + '/next';
             this.getStationDetails(url);

        },
        prevStation:function(){
            var currentStation = this.model.get('station_position');
            var currentStationId = currentStation.get('PK');
            var url= config.coreUrl + 'station/'+ currentStationId  + '/prev';
            this.getStationDetails(url);
        },
        getStationDetails : function(url){
            $.ajax({
                url:url,
                context:this,
                type:'GET',
                success: function(data){
                    var station = new Station(data);
                   console.log(this.model);
                   for(var key in data){
                        if(key =='TSta_PK_ID'){
                            station.set('PK', data[key]);
                        } else if (key =='date'){
                            station.set('Date_', data[key]);
                        }
                        else{
                            //this.model.set(key, data[key]);
                        }
                    }

                        this.model.set('station_position',station);
                        this.addViews();
                },
                error: function(data){
                    alert('error in loading station data');
                }
            }).done(function(){
               

            });
        },
        addViews : function(){
            var stationModel = this.model.get('station_position');
            var stationView = new StationDetails({model:stationModel});
            this.stationRegion.show(stationView);
            // set stored values of 'select' fields 
            var fieldActivity = stationModel.get('FieldActivity_Name');
            $('select[name="st_FieldActivity_Name"]').val(fieldActivity);
            var place = stationModel.get('Place');
            $('select[name="stPlace"]').val(place);
            var accuracy = stationModel.get('Precision');
            $('select[name="stAccuracy"]').val(accuracy);
            var distFromObs = stationModel.get('Name_DistanceFromObs');
            $('#stDistFromObs').val(distFromObs);
            //replace user id by user name
            var user = stationModel.get('FieldWorker1');
            if(this.isInt(user)){
                // get user name from masqued select control
                var userName = $('#usersList').find
            }
            this.idStation = stationModel.get('PK');
            this.getProtocolsList(this.idStation);
            this.getProtocols();
        },
        isInt : function (value){
          if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
              return true;
          } else {
              return false;
          }
        },
        updateFormUI : function(){
            $('.timePicker').datetimepicker({
                pickDate: false,                
                useMinutes: true,              
                useSeconds: false,               
                minuteStepping:1,
                use24hours: true,
                format: 'HH:mm'    
            });
            // append options to select control 'user list'
            var selectFields = $('select[user_list="username_list"]');
            var nbFields =  selectFields.length;
            if (nbFields > 0){
                var options = $('#usersList').html();
                for(var i=0; i<nbFields;i++){
                    var field = $(selectFields)[i];
                    $(field).append(options);
                }
            }
        }
    });
});
