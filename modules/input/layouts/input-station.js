define([
    'marionette',
    'radio',
    'config',
    //'modules2/input/views/ns-forms',
    'bbForms',
    'models/station',
    'models/position',
    'collections/waypoints',
    'modules2/input/views/input-grid',
    'modules2/input/views/input-map',
    'modules2/input/views/input-forms',
    'text!modules2/input/templates/input-station.html',
    'text!modules2/input/templates/form-new-station.html',
    'text!modules2/input/templates/activity.html'

], function(Marionette, Radio, config, BbForms, Station,Position, Waypoints,Grid, 
    Map, Forms, template, stationTemplate, activityTpl) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container',
        template: template,

        regions: {
           // form: '#station-form',
           gridRegion : '#gridImportedWaypoints',
           mapRegin : '#mapImportedWaypoints',
           formsRegion : '#stationDetails',
           stationMapRegion : '#station-map',
           stationDetailsMapRegion : '#mapStDetails',
           stationDetailsPanelRegion :'#stationPanel'
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
            'click #inputMoveToSation' : 'stationStep'
        },

        initialize:function(options) {
            // init stationtype 
            this.stType ='new';
            this.radio = Radio.channel('input');
            Radio.channel('input').comply('generateStation', this.generateStation, this);
            Radio.channel('input').comply('inputForms', this.inputValidate, this);
        },

        onBeforeDestroy: function() {
            //this.radio.reset();
        },
        stationType : function() {
            var stType = $('input[name=stationtype]:radio:checked').val();
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
                        $('#dateTimePicker').datetimepicker({
                        });
                        $('input[name="Date_"]').attr('placeholder' ,'jj/mm/aaaa hh:mm:ss');
                        // add field activity dataset
                        var fieldActivityList = $(activityTpl).html();  
                        $('#station-form').append(fieldActivityList);
                        // associate datalist to input 'FieldActivity_Name'
                        $('input[name="FieldActivity_Name"]').attr('list','activity');

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
                            $('#station-form').empty().append('<h4>Please, select a station on the grid </h4>');
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
                       
                    } else {

                        $('#station-form').empty().append('<p> old stations </p>');
                        $('#inputGetStData').addClass('masqued');
                    }
               }
        },
        prevStep :  function() {
            var step = $('#inputWizard').wizard('selectedItem').step;
            console.log("step to : " + step);

            $('#btnNext').removeClass('disabled');
        },
        onShow: function() {

            $('#inputWizard').on('changed.fu.wizard', function () {
                var step = $('#inputWizard').wizard('selectedItem').step;
                console.log("change step to : " + step);
                if(step == 1){
                    $('#btnNext').removeClass('disabled');
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
                // add details station region to next step container
                var formsView = new Forms({ model : currentStation});
                this.formsRegion.show(formsView);
                // create a position from current station and add map view in next step
                var position = new Position();
                position.set("latitude",currentStation.get('LAT'));
                position.set("longitude",currentStation.get('LON'));
                position.set("label","current station");
                position.set("id","_");

                $('#inputWizard').wizard('next');
                $('#btnNext').removeClass('disabled');
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
            // generate a station using the selected waypoint
            var newStation = new Station();
            newStation.set('id_', model.get('id'));
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
            this.currentUsedStation = newStation;   
            // add details station region to next step container
            var formsView = new Forms({ model : newStation});
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
                // if the 2 values are inputed update map location
                if(latitude && longitude){
                    console.log("longitude: "+ longitude + " , latitude: "+ latitude);
                    var position = new Position();
                    position.set("latitude",latitude);
                    position.set("longitude",longitude);
                    position.set("label","current station");
                    position.set("id","_");
                    //this.getPosModel(latitude,longitude);
                    Radio.channel('input').command('movePoint', position);
                }
           }

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
                //this.main.$el.removeClass('col-lg-7'); // TODO
                //this.main.$el.addClass('col-lg-12'); // TODO
            } else {
                $("#stationPanel").addClass('masqued'); 
                //this.main.$el.removeClass('col-lg-12'); // TODO
                //this.main.$el.addClass('col-lg-7'); // TODO
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
        inputValidate : function(){
            //alert('ok');

        },
        stationStep : function(){
            $('#inputWizard').wizard('selectedItem', { step: 2 });
            // clear input fields for the new station
            $('input').val('');
        }
    });
});

