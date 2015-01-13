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
    'swiper'

], function($, _, Backbone, Marionette, Radio, config, View1, Step, StationDetails,NsFormsModule,getProtocolsList,Swiper) {

    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        events : {
            'click #tabProtsUl a' : 'updateForm',
            'change select[name="st_FieldActivity_Name"]' : 'updateFieldActivity',
            'change select[name="add-protocol"]' : 'addForm',
            'click a.pkProtocol' : 'getProtoByPkId'
        },
        regions: {
            stationRegion: '#stContainer',
            formsRegion : '#formsContainer'
        },
        ui:{
            addProto : 'select[name="add-protocol"]'
        },
        feedTpl: function(){
            
        },
        initModel: function(myTpl){
            this.parseOneTpl(this.template);
            this.activeProtcolsObj = [];
        },
        onShow: function(){
            this.radio = Radio.channel('input');
            this.radio.comply('updateStation', this.updateStation, this);
            var stationModel = this.model.get('station_position');
            var stationView = new StationDetails({model:stationModel});
            this.stationRegion.show(stationView);
            // set stored value of field activity and accuray
            var fieldActivity = stationModel.get('FieldActivity_Name');
            $('select[name="st_FieldActivity_Name"]').val(fieldActivity);
            this.idStation = stationModel.get('PK');
            this.getProtocolsList(this.idStation);
            this.getProtocols();
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
            var listElement = $('#tabProtsUl');
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
            $('#tabProtsUl').html('');
            $('#tabProtsUl').append(htmlContent);
            
            var mySwiper = new Swiper('.swiper-container-protocols',{
                pagination: '.pagination-protocols',
                paginationClickable: true,
                slidesPerView: 4
            });
            $('.arrow-left-protocols').on('click', function(e){
                e.preventDefault()
                mySwiper.swipePrev()
            });
            $('.arrow-right-protocols').on('click', function(e){
                e.preventDefault()
                mySwiper.swipeNext()
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
            var mySwiper = new Swiper('.swiper-container',{
                pagination: '.pagination',
                paginationClickable: true,
                slidesPerView: 8
            });
            $('.arrow-left').on('click', function(e){
                e.preventDefault()
                mySwiper.swipePrev()
            });
            $('.arrow-right').on('click', function(e){
                e.preventDefault()
                mySwiper.swipeNext()
            });
            //$('.swiper-slide').css('height','50px');
        },
        getProtoByPkId : function(e){
            var pkId = parseInt($(e.target).text());
            this.getProtocol(this.selectedProtoName, pkId);
            // store pkId to save proto
            this.selectedProtoId = pkId;
        },
        updateStation : function(model){
            this.model.set('station_position', model);
            this.idStation = model.get('PK');
            $('#tabProtsUl').html('');
            this.getProtocolsList(this.idStation);
        }
    });

});
