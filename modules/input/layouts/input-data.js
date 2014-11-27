define([
    'marionette',
    'radio',
    'config',    //'modules2/input/views/ns-forms',
    'bbForms',
    'models/station',
    'models/position',
    'collections/waypoints',
    'modules2/input/views/input-grid',
    'modules2/input/views/input-map',
    'modules2/input/views/input-forms',
    //'modules2/input/views/input-indivFilter',
    'modules2/input/layouts/individual-list',
    'text!modules2/input/templates/input-data.html',
    'text!modules2/input/templates/form-new-station.html',
    'text!modules2/input/templates/activity.html'

], function(Marionette, Radio, config, BbForms, Station,Position, Waypoints,Grid, 
    Map, Forms, IndivFilter, template, stationTemplate, activityTpl) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'input-container container',
        template: template,

        regions: {
           // form: '#station-form',
           gridRegion : '#gridImportedWaypoints',
           mapRegin : '#mapImportedWaypoints',
           formsRegion : '#stationDetails',
           stationMapRegion : '#station-map',
           stationDetailsMapRegion : '#mapStDetails',
           stationDetailsPanelRegion :'#stationPanel',
           indivFilterRegion : '#indivFilter'
        },
        events : {
            'click #inputGetStData' : 'commitForm',
            'change input.stationtype' : 'stationType',
            'click #btnNext' : 'nextStep',
            'click #btnPrev' : 'prevStep',
            'click #addFieldWorkerInput' : 'addInput',
            'change input[name="LAT"]' : 'getCoordinates',
            'change input[name="LON"]' : 'getCoordinates',
            'click #getPosition' : 'getCurrentPosition',
            'click #inputMoveToSation' : 'stationStep',
            'change input[type=radio][name="position"]' :'updateStationType',
            'click .filterIndiv': 'filterIndivShow',
            'click button.filterClose' : 'filterMask'
        },
        initialize:function(options) {
            // init stationtype 
            this.stType ='new';
            this.radio = Radio.channel('input');
            Radio.channel('input').comply('generateStation', this.generateStation, this);
            Radio.channel('input').comply('inputForms', this.inputValidate, this);
            Radio.channel('input').comply('indivId', this.inputDisplayIndivId, this);
            Radio.channel('input').comply('updateCoordinates', this.updateCoordinatesVals, this);
            $('body').addClass('input-demo');
        },
        onBeforeDestroy: function() {
            //this.radio.reset();
            $('body').removeClass('input-demo');
            Radio.channel('input').reset();
        },
        stationType : function(e) {
            var stType = $(e.target).val();
            //var stType = $('input[name=stationtype]:radio:checked').val();
            // update station type value
            this.stType = stType;
        },
        nextStep : function() {
            var step = $('#inputWizard').wizard('selectedItem').step;
            console.log("step to : " + step);
            if (step==2){
                // new station
                var tm = $(stationTemplate).html();
                if(this.stType =='new'){
                    var station = new Station();
                    this.form = new BbForms({
                        model: station,
                        template: _.template(tm)
                    }).render();
                     $('#station-form').empty().append(this.form.el);
                    $('#btnNext').addClass('disabled');
                    // clear other regions if they are filled
                    this.mapRegin.reset();
                    this.gridRegion.reset();
                     // display map
                    var map = new Map();
                    this.stationMapRegion.show(map);
                    // init map
                    var position = new Position();
                    map.addModel(position);
                    $('#inputGetStData').removeClass('masqued');
                    $('#msgNewStation').text('');
                    //$('#inputGetStData').removeClass('disabled');
                    $('input[name="Date_"]').attr('placeholder' ,'jj/mm/aaaa hh:mm:ss').attr('data-date-format','DD/MM/YYYY HH:mm:ss');
					$('#dateTimePicker').datetimepicker({

                    });                    
                    // add field activity dataset if dont exists
                    var fieldActivityList = $(activityTpl).html();  
                    $('#station-form').append(fieldActivityList);
                    // associate datalist to input 'FieldActivity_Name'
                    $('input[name="FieldActivity_Name"]').attr('list','activity');

                    // get users list
                    this.getUsers();
                    this.getRegions();
                    //this.form.model.unset('PK');
                    //this.form.model.set('PK', null);
                }
                else if (this.stType =='imported'){
                    // need to select a point -> desactivate next
                    $('#btnNext').addClass('disabled');
                    var lastImportedStations = new Waypoints();
                    lastImportedStations.fetch();
                    var ln = lastImportedStations.length;
                    if (ln > 0){
                        // delete map used in new station if exisits
                        this.stationMapRegion.reset();
                        $('#station-form').empty();
                        var mygrid = new Grid({collections : lastImportedStations});
                        this.gridRegion.show(mygrid);
                        // display map
                        var mp = new Map();
                        this.mapRegin.show(mp);
                        mp.addCollection(lastImportedStations);
                    } else {
                         $('#station-form').empty().append('<h4> there is not stored imported waypoints, please use import module to do that. </h4>');
                    }
                     $('#inputGetStData').addClass('masqued');   
                     $('#msgNewStation').text('');
                     // get users list
                    this.getUsers();
                } else {
                    $('#station-form').empty().append('<p> old stations </p>');
                    $('#inputGetStData').addClass('masqued');
                }

            }
            if (step==3){
                // disable next step to check data 
                //$('#btnNext').addClass('disabled');
                 // load places list
                this.getPlaces();
                //add field activity dataset if dont exists
                var datalist = $('datalist#activity');
                if (datalist.length == 0) {
                    var fieldActivityList = $(activityTpl).html();  
                    $('#station-form').append(fieldActivityList);
                }

            }
        },
        prevStep :  function() {
            var step = $('#inputWizard').wizard('selectedItem').step;
            console.log("step to : " + step);
            $('#btnNext').removeClass('disabled');
            if (step == 2){
                // clear fields
                $('input[name="LAT"]').val('');
                $('input[name="LON"]').val('');
                $('input[name="Name"]').val('');
                $('input[name="Region"]').val('');
                $('#inputGetStData').removeClass('masqued');
                $('#btnNext').addClass('disabled');
                //this.form.model.unset('PK');
            }
        },
        onShow: function() {
            var self = this;
            $('#inputWizard').on('changed.fu.wizard', function () {
                var step = $('#inputWizard').wizard('selectedItem').step;
                console.log("change step to : " + step);
                if(step == 1){
                    $('#btnNext').removeClass('disabled');
                }
                if (step ==2){
                    // clear fields
                    $('input[name="LAT"]').val('');
                    $('input[name="LON"]').val('');
                    $('input[name="Name"]').val('');
                    $('#inputGetStData').removeClass('masqued');
                    $('#msgNewStation').text('');
                    $('input[name="PK"]').val('');
                }
              // do something 
            });
            // manage hide /show station details panel in step 3
            this.listenTo(this.radio, 'hide-detail', this.hideDetail);
            this.listenTo(this.radio, 'show-detail', this.showDetail);
        },
        commitForm : function() {
            //this.form.commit();
            var errors = this.form.commit({ validate: true });
            console.log(errors);
            var currentStation = this.form.model;
            //console.log(currentStation);
            if(!errors){
                // create a position from current station and add map view in next step
                var position = new Position();
                position.set("latitude",currentStation.get('LAT'));
                position.set("longitude",currentStation.get('LON'));
                position.set("label","current station");
                position.set("id","_");
                var self=this;
                $.ajax({
                    url: config.coreUrl +'station/addStation/insert',
                    data:  currentStation.attributes,
                    type:'POST',
                    success: function(data){
                           console.log(data);
                            var PK = Number(data.PK);
                            if(PK){
                                self.form.model.set('PK',data.PK);
                                self.form.model.set('Region',data.Region);
                                self.form.model.set('UTM20',data.UTM20);
                            }
                           if (data==null) {
                                $('#btnNext').addClass('disabled');
                                alert('this station is already saved, please modify date or coordinates');
                           } 
						   else {
								// add details station region to next step container
                                var formsView = new Forms({ model : currentStation});
                                self.formsRegion.show(formsView);
                                $('#btnNext').removeClass('disabled');
                                $('#inputGetStData').addClass('masqued');
                                $('#msgNewStation').text('The new station is successfully created.');
                                // load places list
                                //self.getPlaces();
						   }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        //alert(xhr.status);
                        //alert(thrownError);
                        alert('error in generating new station. Please check fields data.');

                    }
                });
                //$('#btnNext').removeClass('disabled');
            } else {
                console.log(errors);
                $.each(errors, function( index, value ) {
                console.log( index + ": " + value.message );
                    $('#error-' + index ).text(value.message);
                });
                $('#btnNext').addClass('disabled');
            }
        },
        generateStation : function(model) {
            // generate a station using the selected waypoint for imported stations
            /*var newStation = new Station();
            newStation.set('PK', model.get('PK'));
            newStation.set('Name', model.get('name'));
            newStation.set('LAT',model.get('latitude'));
            newStation.set('LON',model.get('longitude'));
            newStation.set('FieldActivity_Name',model.get('fieldActivity'));
            newStation.set('Date_',model.get('waypointTime'));
            newStation.set('time_',model.get('time'));
            newStation.set('FieldWorker1',model.get('fieldWorker1'));
            newStation.set('FieldWorker2',model.get('fieldWorker2'));
            newStation.set('FieldWorker3',model.get('fieldWorker3'));
            newStation.set('FieldWorker4',model.get('fieldWorker4'));
            newStation.set('FieldWorker5',model.get('fieldWorker5'));
            newStation.set('FieldWorkersNumber',model.get('fieldWorkersNumber'));
            this.currentUsedStation = newStation;   */
            // add details station region to next step container
            var utm = model.get('UTM20');
            if(!utm){
               model.set('UTM20',''); 
            }
            var fieldWorker4 = model.get('FieldWorker4');
            if(!fieldWorker4){
               model.set('FieldWorker4',''); 
            }
            var fieldWorker5 = model.get('FieldWorker5');
            if(!fieldWorker5){
               model.set('FieldWorker5',''); 
            }
            var id = model.get('id');
            if(id){
               model.unset('id'); 
            }
            var utm = model.get('UTM');
            if(id){
               model.unset('UTM'); 
            }
            var fieldWorkersNumber = model.get('FieldWorkersNumber');
            if(!fieldWorkersNumber){
               model.set('FieldWorkersNumber',''); 
            }

            var formsView = new Forms({ model : model});
            this.formsRegion.show(formsView);
        },
        addInput : function(){
            // get actual number of inserted fields stored in "fieldset#station-fieldWorkers" tag
            var nbInsertedWorkersFields = parseInt($('#station-fieldWorkers').attr('insertedWorkersNb'));
            if (nbInsertedWorkersFields < 5){
                var nbFdW = nbInsertedWorkersFields + 1;
                // element to show ( masqued by default)
                var ele = '#FieldWorker' + nbFdW + '-field';
                $(ele).removeClass('masqued');
                // update stored value for nb displayed fields 
                $('#station-fieldWorkers').attr('insertedWorkersNb', nbFdW);
            }
        },
        getCoordinates : function(e){
           // check inputed values
           var value = parseFloat($(e.target).val());
           if(!value) {
                alert('please input a correct value.');
           }
           else{
                var latitude = parseFloat($('input[name="LAT"]').val());
                var longitude = parseFloat($('input[name="LON"]').val());
                $('#inputGetStData').removeClass('masqued');
                // if the 2 values are inputed update map location
                if(latitude && longitude){
                    console.log("longitude: "+ longitude + " , latitude: "+ latitude);
                    var position = new Position();
                    position.set("latitude",latitude);
                    position.set("longitude",longitude);
                    position.set("label","current station");
                    position.set("PK","_");
                    //this.getPosModel(latitude,longitude);
                    Radio.channel('input').command('movePoint', position);
                }
           }
        },
        updateCoordinatesVals : function(position){
            // called if feature is moved manually (select feature and move it)
            var longitude = position.longitude;
            var latitude = position.latitude;
            $('input[name="LAT"]').val(latitude);
            $('input[name="LON"]').val(longitude);
        },
        hideDetail: function() {
            var callback = $.proxy(this, 'updateSize', 'hide');
            this.stationDetailsPanelRegion.$el.toggle(callback);
        },
        showDetail: function() {
            var callback = $.proxy(this, 'updateSize', 'show');
            this.stationDetailsPanelRegion.$el.toggle(callback);
        },
        updateSize: function(type) {
            if(type === 'hide'){
                $("#stationPanel").removeClass('masqued');
            } else {
                $("#stationPanel").addClass('masqued'); 
            }
            $(window).trigger('resize');
        },
        getPosModel: function(lat, lon){
            var position = new Position();
            position.set("latitude",lat);
            position.set("longitude",lon);
            position.set("label","current station");
            position.set("id","_");
            return (position);
        },
        onRender: function(){
            $('ul.steps').css('marginLeft', '0px');
        },
        getCurrentPosition : function(){
            if(navigator.geolocation) {
                var loc = navigator.geolocation.getCurrentPosition(this.myPosition,this.erreurPosition);
            } else {
                alert("Ce navigateur ne supporte pas la géolocalisation");
            }
        },
        myPosition : function(position){
            var latitude = parseFloat((position.coords.latitude).toFixed(5));
            var longitude = parseFloat((position.coords.longitude).toFixed(5));
            $("[name='LAT']").val(latitude);
            $("[name='LON']").val(longitude);
            $('#inputGetStData').removeClass('masqued');
            //var pos = this.getPosModel(latitude,longitude);
            // update map
            var pos = new Position();
            pos.set("latitude",latitude);
            pos.set("longitude",longitude);
            pos.set("label","current station");
            pos.set("id","_");
            Radio.channel('input').command('movePoint', pos);
                //position.coords.altitude +"\n";
        },
        erreurPosition : function(error){
            var info = "Erreur lors de la géolocalisation : ";
            switch(error.code) {
            case error.TIMEOUT:
                info += "Timeout !";
            break;
            case error.PERMISSION_DENIED:
            info += "Vous n’avez pas donné la permission";
            break;
            case error.POSITION_UNAVAILABLE:
                info += "La position n’a pu être déterminée";
            break;
            case error.UNKNOWN_ERROR:
            info += "Erreur inconnue";
            break;
            }
            alert(info);
        },
        stationStep : function(){
            $('#inputWizard').wizard('selectedItem', { step: 2 });
            // clear input fields for the new station
            $('input').val('');
        },
        getUsers : function(){
            var url = config.coreUrl + 'user';
            //this.listenTo(this.collection, 'reset', this.render);
            $.ajax({
                context: this,
                url: url,
                dataType: 'json'
            }).done( function(data) {
                //this.collection.reset(data);
                this.generateUserDatalist(data,'username_list', 'input[name^="FieldWorker"]' );
            });
        },
        getRegions : function(){
            var url = config.coreUrl + 'station/area';
            //this.listenTo(this.collection, 'reset', this.render);
            $.ajax({
                context: this,
                url: url,
                type:'POST',
                dataType: 'json'
            }).done( function(data) {
                //this.collection.reset(data);
                this.generateDatalist(data,'region_list', 'input[name^="Region"]' );
            });
        },
        getPlaces : function(){
            var url = config.coreUrl + 'station/locality';
            //this.listenTo(this.collection, 'reset', this.render);
            $.ajax({
                context: this,
                url: url,
                type:'POST',
                dataType: 'json'
            }).done( function(data) {
                //this.collection.reset(data);
                this.generateDatalist(data,'places_list', 'input[name^="stPlace"]' );
            });
        },
        generateDatalist : function(data, listId, targetId){
            var dataList = $('<datalist id="' + listId +'"></datalist>');
            data.forEach(function(element) {
                $(dataList).append('<option>' + element + '</option>');
            });
            $('#station-form').append(dataList);
            // associate datalist to user input
            $(targetId).attr("list",listId);
        },
        generateUserDatalist : function(data, listId, targetId){
            var dataList = $('<datalist id="' + listId +'"></datalist>');
            data.forEach(function(user) {
                var id = user.PK_id;
                //$(dataList).append('<option>' + user.fullname + '</option>');
                 $(dataList).append('<option value="'+  user.fullname + '">' + id + '</option>');
            });
            $('#station-form').append(dataList);
            // associate datalist to user input
            $(targetId).attr("list",listId);
        },
        updateStationType : function(e){
            var value = $(e.target).val();
            if(value == 1){
                // station with coordinates
                $('#stRegion').addClass('masqued');
                $('#stCoordinates').removeClass('masqued');
                $("input[name='Region']").val('NULL');
                $("input[name='LAT']").val('');
                $("input[name='LON']").val('');
                this.form.model.schema.Region.validators = [];
                this.form.model.schema.LAT.validators = ['required'];
                this.form.model.schema.LON.validators = ['required'];
            } else {
                $('#stRegion').removeClass('masqued');
                $('#stCoordinates').addClass('masqued');
                $("input[name='Region']").val('');
                $("input[name='LAT']").val('NULL');
                $("input[name='LON']").val('NULL');
                // set fields Region to required and LAT , LON to not required
                this.form.model.schema.Region.validators = ['required'];
                this.form.model.schema.LAT.validators = [];
                this.form.model.schema.LON.validators = [];
            }
        },
        filterIndivShow : function(e){
            // add a class to action control source
            $(e.target).addClass('target');
            var modal = new IndivFilter();
            // navigate to the modal by simulating a click
            var element = '<a class="btn" data-toggle="modal" data-target="#myModal" id="indivIdModal">-</a>';
            $('body').append(element);
           
            /*modal.render();
            var tp = modal.el;
            alert(tp);*/
            this.indivFilterRegion.show(modal);
            $('#indivIdModal').click();
            //$('#myModal .modal-dialog').css('width','90%');       
        },
        filterMask : function(){
            var inputIndivId = $('input.filterIndiv.target');
            $(inputIndivId).removeClass('target');
            this.indivFilterRegion.reset();
            $('#indivIdModal').remove();
            $('div.modal-backdrop.fade.in').remove();
        },
        inputDisplayIndivId : function(indivId){
            var id = indivId.id;
            // set target input
            var inputIndivId = $('input.filterIndiv.target');
            $(inputIndivId).val(id);
            $(inputIndivId).removeClass('target');
            this.indivFilterRegion.reset()
            $('#indivIdModal').remove();
            $('div.modal-backdrop.fade.in').remove();
        }
    });
});

