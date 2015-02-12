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
            'click i.add'  : 'addForm',
            'click a.pkProtocol' : 'getProtoByPkId',
            'click .arrow-right-station' :'nextStation',
            'click .arrow-left-station' :'prevStation',
            'click .onglet a': 'activeOnglet',
            'click .deleteProt' : 'deleteProtocol',
            'click .deleteProInstance' : 'deleteProtInstance',
            //'change .editField' : 'updateStationData'
            //'click #NsFormModuleSave', 'showEditBtn'
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
            var content = getUsers.getElements('user');
            $('#usersList').append(content);
            this.addViews();
            this.getProtocols();
            
            this.radio = Radio.channel('froms');
            this.radio.comply('updateForm', this.updateFormUI, this);
            this.radio.comply('successCommitForm', this.successState, this);
            this.radio.comply('editState', this.editState, this);
            this.radio.comply('updateStation', this.updateSation, this);
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
            this.updateInstanceDetails(selectedProtoName);
        },
        updateInstanceDetails : function(protoName){
            for(var key in this.activeProtcolsObj) {
               if(key == protoName){
                    var pk_list = this.activeProtcolsObj[key].PK_data;
                    var nbProtoInstances = pk_list.length;
                    if(nbProtoInstances==1){
                        var idProto = pk_list[0];
                        $('#formsIdList ul').html('');
                        this.getProtocol(protoName,idProto);
                        this.selectedProtoId = idProto;   
                        $('#idProtosContainer').addClass('masqued');
                    } else {
                        this.genInterfaceForCurrentProto(pk_list,protoName );
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
                $('.swiper-slide-active').find('.onglet').addClass('active');
            });
        },
        getProtocol: function(protoName, id){
            var idProto = protoName.replace(/ /g,"_");
            this.formsRegion.empty();
            $('#formsContainer').text('');
            var url= config.coreUrl +'station/'+ this.idStation + '/protocol/' + protoName + '/' + id ;
            // extend NsForms Module to replace thesaurus fields values by 'fullpath' values stored in hidden fields
            var NsForm = NsFormsModule.extend({
                butClickSave: function (e) {
                    var errors = this.BBForm.commit();         
                    var changedAttr = this.BBForm.model.changed;
                    if(!errors){  
                        var self = this;   
                        //replace thesaurus fields values by 'fullpath' values stored in hidden fields
                        $('input.autocompTree').each(function() {
                            // get fullpath value 
                            var fieldName = $(this).attr('name');
                            var hiddenFieldName = fieldName + '_value';
                            var fullpathValue = $('input[name="' + hiddenFieldName + '"]').val();
                            self.model.set(fieldName,fullpathValue);
                        });
                        
                        var staId = this.model.get('FK_TSta_ID');
                        if(staId){
                            this.model.set('FK_TSta_ID', parseInt(staId));
                        }
                        for (var attr in this.model.attributes) {
                           var val = this.model.get(attr);
                           if (Array.isArray(val) ){
                                if (val[0] == 'true' && val.length == 0)
                                    this.model.set(attr,1)
                           }                
                       }
                        var self = this;
                        this.model.save([],{
                         dataType:"text",
                         success:function(model, response) {
                            console.log('success' + response);
                            self.displayMode = 'display';
                            self.displaybuttons();
                            self.radio.command('successCommitForm', {id: response});
                            // update this.modelurl  if we create a new instance of protocol
                            var tab = self.modelurl.split('/');
                            var ln = tab.length;
                            var newId = parseInt(response);
                            var currentProtoId = parseInt(tab[ln - 1]);
                            if (currentProtoId ===0){
                                var url ='';
                                for (var i=0; i<(ln -1);i++){
                                    url += tab[i] +'/';
                                }
                                self.modelurl = url + newId;
                            }
                         },
                         error:function(request, status, error) {
                            alert('error in saving data');
                         }
                        });
                    }
                }
            });
            this.formView = new NsForm({
                modelurl : url,
                formRegion :'formsContainer',
                buttonRegion : 'formButtons',
                stationId : this.idStation,
                id : idProto
            });
        },
        getProtocols : function(){
            var protocols  = getProtocolsList.getElements('protocols/list');
            $('select[name="add-protocol"]').append(protocols);
        },
        updateFieldActivity : function(e){
            /*var value = $( 'select[name="st_FieldActivity_Name"] option:selected').text();
            this.getProtocolsList(value);*/
        },
        generateNavBarProtos : function(){
            // generate interface with list content
            $('.pagination.protocol').html('');
            var htmlContent ='';
            for(var key in this.activeProtcolsObj) {
                var tm = key;
                var nbProtoInstances = this.activeProtcolsObj[key].PK_data.length;
                htmlContent +=  '<div class="swiper-slide"><div class="onglet"><a name="'+ key ;
                htmlContent += '"><span><i></i></span>' + key ;
                if(nbProtoInstances > 1){
                    htmlContent += '<span class="badge">' + nbProtoInstances + '</span>';
                }
                else {
                    // one instance, check if it is new instance to add del btn
                    var protoId = this.activeProtcolsObj[key].PK_data[0];
                    if(protoId == 0){
                        htmlContent += '<i class="reneco icon small close deleteProt"></i>'
                    }
                }

                 htmlContent += '</a></div></div>';
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
                // if form to add == active protocol => update current proto instances UI
                if(selectedProtocolName == this.selectedProtoName){
                    this.updateInstanceDetails(selectedProtocolName);
                }
            }
        },
        genInterfaceForCurrentProto: function(pkList, protocolName){
            this.formsRegion.empty();
            $('#formsContainer').text('');
            $('#idProtosContainer .pagination').text('');
            var content ='';
            for(var i=0;i<pkList.length;i++){
                var idProto = pkList[i];
                content +=  '<div class="swiper-slide"><div class="onglet"><a class="pkProtocol" idProto="'+
                             idProto +'" name ="'+ protocolName+ '">' + (i+1) ;
                if(idProto == 0)  {
                    content += '<i class="reneco icon small close deleteProInstance"></i>';
                }            
                content +=  '</a></div></div>';
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
            //activate fist element
            var firstTab = $('#formsIdList').find('div.onglet a')[0];
            $('a[pkProtocol="'+  +'"]').click();
            $(firstTab).click();
        },
        getProtoByPkId : function(e){

            var pkId = parseInt($(e.target).attr('idProto'));
            if(pkId || pkId===0){
                this.getProtocol(this.selectedProtoName, pkId);
                // store pkId to save proto
                this.selectedProtoId = pkId;
            }
        },
        nextStation : function(){
            var currentStation = this.model.get('station_position');
            var currentStationId = currentStation.get('PK');
            var url= config.coreUrl + 'station/'+ currentStationId + '/next';
            this.getStationDetails(url);
            $(this.ui.addProto).val('');
        },
        prevStation:function(){
            var currentStation = this.model.get('station_position');
            var currentStationId = currentStation.get('PK');
            var url= config.coreUrl + 'station/'+ currentStationId  + '/prev';
            this.getStationDetails(url);
            $(this.ui.addProto).val('');
        },
        getStationDetails : function(url){
            $.ajax({
                url:url,
                context:this,
                type:'GET',
                success: function(data){
                    var station = new Station(data);

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
            $('input[name="stAccuracy"]').val(accuracy);
            var distFromObs = stationModel.get('Name_DistanceFromObs');
            $('#stDistFromObs').val(distFromObs);
            //replace user id by user name
            var user = stationModel.get('FieldWorker1');
            if(this.isInt(user)){
                // get user name from masqued select control
                var userName = this.getUserName(user);
                $('#stObsVal').text(userName);
            }
            this.idStation = stationModel.get('PK');
            this.getProtocolsList(this.idStation);
            //this.getProtocols();
        },
        isInt : function (value){
          if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
              return true;
          } else {
              return false;
          }
        },
        updateFormUI : function(){
            // time picker
            /*$('.timePicker').datetimepicker({ 
            });
            $('.timePicker').data('DateTimePicker').format('HH:mm');*/
            // append options to select control 'user list' to display full name other then id
            var selectFields = $('select[user_list="username_list"]');
            var nbFields =  selectFields.length;
            if (nbFields > 0){
                var options = $('#usersList').html();
                for(var i=0; i<nbFields;i++){
                    var field = $(selectFields)[i];
                    var fieldName = $(field).attr('name');
                    $(field).append(options);
                    // set user name in the input by using stored user id in the form model
                    var userId = this.formView.model.get(fieldName);
                    $(field).find('option[value="' + userId +  '"]').attr('selected', true);
                }
            }
            // min value in number fields is 0
            $('input[type="number"]').attr('min', 0);

            // if form id is vertebrate group, reorganize fields with
            /*var isVGForm = $('form#Vertebrate_group').length > 0;
            if(isVGForm){
                this.updateFormforVG();
            }*/

        },
        activeOnglet: function(e) {
            $(e.target).parents('.swiper-wrapper').find('.onglet.active').removeClass('active');
            $(e.target).parent().addClass('active');
        }, 
        nextOK: function() {
            return true;
        },
        getUserName : function(id){
            var option = $('#usersList').find('option[value="'+ id +'"]')[0];
            var userName = $(option).text();
            return userName;
        },
        successState : function(obj){
            var test =this.formView;
            var protoId = obj.id;
            var activOnglet  = $('#tabProtsUl div.onglet.active');
            //<i class="icon small reneco validated"></i>
            // display picto for selected ongle
            var element = $(activOnglet).find('i')[0];
            $(element).removeClass('edit');
            $(element).addClass('icon small reneco validate');
            // disable delete icon if protocol is stored to ovoid deleting it
            var delelem = $(activOnglet).find('i.deleteProt')[0];
            $(delelem).removeClass('close');

            // update id protocol 
            var protoOnglet = $('#idProtosContainer div.onglet.active').find('a')[0];
            $(protoOnglet).attr('idproto', protoId);
            $('form input').attr('disabled', 'disabled');
            $('form textarea').attr('disabled', 'disabled');
            $('form select').attr('disabled', 'disabled');
            // disable delete icon if protocol is stored to ovoid deleting it
            delelem = $(protoOnglet).find('i.deleteProInstance')[0];
            $(delelem).removeClass('close');
            //update instance id in  this.activeProtcolsObj[key].PK_data
            var tabProtocol = this.activeProtcolsObj[this.selectedProtoName].PK_data;
            for (var i = tabProtocol.length - 1; i >= 0; i--) {
                if(tabProtocol[i] === 0 ){
                    tabProtocol[i] = parseInt(protoId);
                    return;
                }
            };
        },
        editState : function(resp){
            var self = this;
            var element = $('#tabProtsUl div.onglet.active').find('i')[0];
            $(element).removeClass('validated');
            $(element).addClass('edit');
            $('form input').removeAttr('disabled');
            $('form textarea').removeAttr('disabled');
            $('form select').removeAttr('disabled');
            // for thesaurus fields, replace fullpath value by terminal value and set hidden field with fullpath val
            $('input.autocompTree').each(function() {
                // get fullpath value 
                var fieldName = $(this).attr('name');
                var fullpathValue = resp.model.get(fieldName);
                var hiddenFieldName = fieldName + '_value';
                $('input[name="' + hiddenFieldName + '"]').attr('value', fullpathValue);
                /*alert(fullpathValue);
                $('input[name="' + hiddenFieldName + '"]').val(fullpathValue);*/
                // get terminal value and display it 
                var tab = fullpathValue.split('>');
                var terminalVl = tab[tab.length - 1];
                $(this).val(terminalVl);
            });
        },
        updateFormforVG : function(){
            $('form#Vertebrate_group').find('div.col-sm-4').each(function(){
                $(this).removeClass('col-sm-4');
                $(this).addClass('col-sm-3');
            });
        },
        deleteProtocol : function(e){
            // TO MOVE
            Array.prototype.unset = function(val){
                var index = this.indexOf(val)
                if(index > -1){
                    this.splice(index,1)
                }
            };

            var protocolName = $(e.target).parent().attr('name');
            // find protocol instance and remove it
             if(protocolName){
                var exists = false;
                for(var key in this.activeProtcolsObj) {
                    if(key == protocolName){
                        var tabProtos = this.activeProtcolsObj[key].PK_data;
                        tabProtos.unset(0);
                        if(tabProtos.length ==0){
                            // delete key entry
                            delete this.activeProtcolsObj[key];
                        }
                    } 
                }
            }
            // refrech view
            this.generateNavBarProtos();
        },
        deleteProtInstance : function(e){
            var protocolName = $(e.target).parent().attr('name');
            this.deleteProtocol(e);
            this.updateInstanceDetails(protocolName);
        },
        updateSation : function(model){
            $.ajax({
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
            });

        }
        /*,
        updateStationData : function(e){
            var value = $(e.target).val();
            var fieldName = $(e.target).attr('name');
            var stationModel = this.model.get('station_position');
            if (value){
                switch(fieldName){
                    case 'stPlace':
                        stationModel.set('Place',value);
                        break;
                    case 'stAccuracy':
                        stationModel.set('Precision',value);
                        break;
                    case 'stDistance':
                        stationModel.set('Name_DistanceFromObs',value);
                        break;
                    case 'st_FieldActivity_Name':
                        stationModel.set('FieldActivity_Name',value);
                        break;
                    case 'detailsStFW1':
                        stationModel.set('FieldWorker1',parseInt(value));
                        break;
                     case 'detailsStFW2':
                        stationModel.set('FieldWorker2',parseInt(value));
                        break;
                    case 'detailsStFW3':
                        stationModel.set('FieldWorker3',parseInt(value));
                        break;
                    case 'detailsStFW4':
                        stationModel.set('FieldWorker4',parseInt(value));
                        break;
                    case 'detailsStFW5':
                        stationModel.set('FieldWorker5',parseInt(value));
                        break;
                    case 'detailsStFWTotal':
                        stationModel.set('NbFieldWorker',parseInt(value));
                        break;
                    default:
                        break;
                }

                alert(fieldName + ' ' + value);
                console.log(stationModel);
                $.ajax({
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
                });
            
            }
        }
        }*/
    });
});
