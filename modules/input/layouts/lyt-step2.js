define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'config',
    'stepper/level1-demo',
    'stepper/lyt-step',
    'modules2/input/views/new-station',
    //'modules2/input/views/input-map',   //Map,
    'collections/waypoints',
    'models/position',
    'models/station',
    'modules2/input/views/input-grid',
    'modules2/input/views/input-stations-filter',
    'modules2/input/views/input-stations-grid',
    'utils/getSitesNames',
    'ns_modules_map/ns_map',
    'dateTimePicker',
     'ns_modules_com',
], function($, _, Backbone, Marionette, Radio, config, View1, Step, StationView,Waypoints,
    Position,Station, Grid,FilterView, GridView, getSitesNames,NsMap,dateTimePicker,Com) {

    'use strict';
    return Step.extend({
        className: 'map-view',
        events : {
            'change input[type=radio][name="position"]' :'updateStationType',
            'click #getPosition' : 'getCurrentPosition',
            'change input[name="LAT"]' : 'getCoordinates',
            'change input[name="LON"]' : 'getCoordinates',
            'click span.picker': 'filterIndivShow',
            'click #addFieldWorkerInput' : 'addInput',
            'click #removeFieldWorkerInput' : 'removeInput',
            'change select.fiedworker' : 'checkFWName',
            'change input[name="Precision"]' : 'checkAccuracyValue',

            'change #dateTimePicker input' : 'alerte',



            'click .bootstrap-datetimepicker-widget' : 'updateDateField'
        },
        regions: {
            leftRegion : '#inputStLeft',
            rightRegion : '#inputStRight'
        },

        alerte: function(){
            alert();
        },  

        /*
        updateDateField : function(){
            $('input[name="Date_"]').click();
        },

        */

        onShow: function(){
       
            this.radio = Radio.channel('input');
            this.radio.comply('generateStation', this.generateStation, this);
            this.radio.comply('movePoint', this.movePoint, this);
            this.radio.comply('changeDate', this.updateDate, this);

            var stationType = this.model.get('start_stationtype');
            if(stationType =='new' ||  stationType =='newSc' ||  stationType =='newSt'){
                var stationForm = new StationView();
                var formModel = stationForm.form.model;
                this.initModel(stationType,stationForm);
                this.leftRegion.show(stationForm);
                // get stored values
                this.feedTpl();
                
                this.map = new NsMap({
                    cluster: true,
                    popup: true,
                    zoom : 8,
                    ///url: config.coreUrl+'/individuals/stations?id=3',
                    geoJson : {"features": [{"properties": {"date": 1193220000.0}, 'id': 1, "geometry": {"coordinates": [-3.96,33.06 ], "type": "Point"}, "type": "Feature"}], "type": "FeatureCollection"}
                });
                this.rightRegion.show(this.map);
                this.map.init();
                //var marker = L.marker([20, 20]).addTo(this.map);

                // init map
               /* var position = new Position();
                map.addModel(position);*/
                this.updateStationType(stationType);
            } else if(stationType =='imported'){
                $('#btnNext').addClass('disabled');
                var lastImportedStations = new Waypoints();
                lastImportedStations.fetch();
                this.initModel('import',null);
                var ln = lastImportedStations.length;
                if (ln > 0){
                    /*
                    var mygrid = new Grid({collections : lastImportedStations});
                    this.leftRegion.show(mygrid);
                    */

                    this.com = new Com();
                    var mygrid = new Grid({
                        collections : lastImportedStations,
                        com: this.com,
                    });
                    this.leftRegion.show(mygrid);

                    // display map
                    var features = {
                        'features': [], 
                        'type': 'FeatureCollection'
                    };
                    var feature, attr;
                    lastImportedStations.each(function(m){

                        attr = m.attributes;
                        feature = {
                            'type': 'Feature',
                            'id': attr.PK,
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [attr.LON,attr.LAT],
                            }, 
                            'properties': {
                                'date': '2014-10-23 12:39:29'
                            }, 
                            
                        };
                        features.features.push(feature);
                    });

                    this.features = features;
                    this.map = new NsMap({
                        com: this.com,
                        cluster: true,
                        popup: true,
                        selection :false,
                        geoJson: this.features
                    });

                    this.rightRegion.show(this.map);
                    this.map.init();
                    //map.addCollection(lastImportedStations);
                } else {
                    // no stored waypoints
                    $('#inputStLeft').html('<h4> there is not stored imported waypoints, please use import module to do that. </h4>');
                }

            } else {
                this.initModel('old',null);
                this.leftRegion.show(new FilterView());
                this.rightRegion.show(new GridView());
            }
        },
        initModel: function(type,formView){
            
            this.stepAttributes = [];
            if ((type==='new' || type==='newSc' || type==='newSt')   && formView  ){
                var model =  formView.form.model;
                var schema = model.schema || {};
                for(var key in schema) {
                    
                   if(schema[key]){
                        var obj={};
                        obj.name = this.name + '_' +  key;
                        var validators = schema[key].validators;
                        var required = false;
                        if (validators) {
                            required = (validators.indexOf('required')!=-1) ;
                        }
                        obj.required = required;
                        // set value in global model if not done
                        var fieldVal = this.model.get(obj.name); 
                        if(!fieldVal){
                            this.model.set(obj.name, null);
                        }
                        //this.model.set(obj.name, null);
                        this.stepAttributes.push(obj);
                   }
                }
                var test = this.stepAttributes;
            }
            if(type ==='imported' || type ==='old') {
                var obj={};
                obj.name = this.name + '_position';
                obj.required = true;
                this.stepAttributes.push(obj);
                // add station position 
                var fieldSt = this.model.get('station_position'); 
                if (!fieldSt){
                    this.model.set('station_position', null);
                }
            }
        },
        updateStationType : function(value){
            if(value == "new"){
                // station with coordinates
                $('#stRegion').addClass('masqued');
                $('#stMonitoredSite').addClass('masqued');
                $('#stCoordinates').removeClass('masqued');
 
                for(var key in this.stepAttributes) {
                    var field = this.stepAttributes[key];
                    if(field.name =='station_Region'  || field.name =='id_site'){
                        field.required = false;
                    }
                    if(field.name =='station_LAT' || field.name =='station_LON'){
                        field.required = true;
                    }
                }
                $('#input-station-title').text('New station with coordinates');

            } else if(value == "newSc"){
                $('#stRegion').removeClass('masqued');
                $('#stCoordinates').addClass('masqued');
                $('#stMonitoredSite').addClass('masqued');

                for(var key in this.stepAttributes) {
                    var field = this.stepAttributes[key];
                    if(field.name =='station_Region'){
                        field.required = true;
                    }
                    if(field.name =='station_LAT' || field.name =='station_LON' || field.name =='id_site' || field.name =='station_Precision' ){
                        field.required = false;
                    }
                }
                $('#input-station-title').text('New station without coordinates');
            }
            else {
                $('#stMonitoredSite').removeClass('masqued');
                $('#stRegion').addClass('masqued');
                $('#stCoordinates').addClass('masqued');
                for(var key in this.stepAttributes) {
                    var field = this.stepAttributes[key];
                    if(field.name =='station_id_site' || field.name =='station_name_site'){
                        field.required = true;
                    }
                    if(field.name =='station_LAT' || field.name =='station_LON' || field.name =='station_Region' || field.name =='station_Precision' ){
                        field.required = false;
                    }
                }
                $('#input-station-title').text('New station from monitored site');
            }
        },
        feedTpl: function(){
            var ctx=this;
            this.$el.find('input:not(:checkbox,:radio,:submit)').each(function(){
                var id = ctx.name + '_' + $(this).attr('name'); 
                $(this).val( ctx.model.get(id)) ;                   
            });

            this.$el.find('input:checkbox').each(function(){
                var id = ctx.name + '_' + $(this).attr('name');
                var tmp=ctx.model.get(id);
                if(tmp){ $(this).attr('checked', 'checked') }
            });
            this.$el.find('input:radio').each(function(){
                var id = ctx.name + '_' + $(this).attr('name');
                var tmp=ctx.model.get(id);
                if($(this).val() == tmp){ 
                    $(this).attr('checked', 'checked');
                }
            });
            this.$el.find('select').each(function(){
                var id = ctx.name + '_' + $(this).attr('name');
                var val=ctx.model.get(id);
                if(val)
                $(this).val(val);
            });
        },
        datachanged_select: function(e){
            
            var target= $(e.target);
            var val=target.val();
            this.model.set(this.name + '_' + target.attr('name') , val);
            if(target.attr('name') =='id_site'){
                this.updateSiteName(val);
            }
        },
        datachanged_text: function(e){
            var target= $(e.target);
            var fieldName = target.attr('name');
            var val=target.val();
            if (fieldName !='LAT' && fieldName !='LON'){
                this.model.set(this.name + '_' + target.attr('name')  , val);
            }
        },
        updateSiteName : function(siteType){
            var sitesNames  = getSitesNames.getElements('monitoredSite/name', siteType);
            $('select[name="name_site"]').html('<option></option>');
            $('select[name="name_site"]').append(sitesNames);
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
            // update map
            var pos = new Position();
            pos.set("latitude",latitude);
            pos.set("longitude",longitude);
            pos.set("label","current station");
            pos.set("id","_");
            //this.map.updateMarkerPos(1, latitude, longitude );
            Radio.channel('input').command('movePoint', pos);

                //position.coords.altitude +"\n";
        },
        movePoint : function(position){
            var latitude  =position.get("latitude");
            var longitude = position.get("longitude");
            this.map.updateMarkerPos(1, latitude, longitude );
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
        getCoordinates : function(e){

           var value = parseFloat($(e.target).val());
            if((isNaN(value)) || ((value > 180.0) || (value < -180.0))){
                alert('please input a valid value.');
                $(e.target).val('');
            }
           else if(value!= 'NULL'){
                var latitude = parseFloat($('input[name="LAT"]').val());
                var longitude = parseFloat($('input[name="LON"]').val());
                // if the 2 values are inputed update map location
                if(latitude && longitude){
                    var position = new Position();
                    position.set("latitude",latitude);
                    position.set("longitude",longitude);
                    position.set("label","current station");
                    position.set("PK","_");
                    this.model.set('station_LAT',latitude);
                    this.model.set('station_LON',longitude);
                    //this.getPosModel(latitude,longitude);
                    Radio.channel('input').command('movePoint', position);
                    this.map.updateMarkerPos(1, latitude, longitude );
                }
           } else {
                this.model.set('station_LAT',null);
                this.model.set('station_LON',null);
           }
        },
        nextOK: function(){
            var result = false; 
            var stationType = this.model.get('start_stationtype');
            if (stationType =='imported' || stationType =='old') {
                return true;
            }
            // create a station model from stored data in global model
            var station = new Station();
            for (var attribute in this.model.attributes) {
                // check attribute name
                var attr = attribute.substring(0, 7);
                if ( (attr =='station') && (attribute != 'station_position')){
                    // attribute name
                    var attrName = attribute.substring(8, attribute.length);
                    station.set(attrName, this.model.get(attribute));
                }
            }
            var url= config.coreUrl +'station/addStation/insert';
           
            $.ajax({
                url:url,
                context:this,
                type:'POST',
                data:  station.attributes,
                dataType:'json',
                async: false,
                success: function(data){
                    var PK = Number(data.PK);
                    if(PK){
                        station.set('PK',PK);
                        station.set('Region',data.Region);
                        station.set('UTM20',data.UTM20);
                        this.model.set('station_position', station);
                        result = true;
                    } else if (data==null) {
                        alert('this station is already saved, please modify date or coordinates');
                    } 

                    else {
                        alert('error in creating new station');
                    }
                },
                error: function(data){
                    alert('error in creating new station');
                }
            });
            return result;
        },
        generateStation : function(model){
            var stationType = this.model.get('start_stationtype');
            if (stationType =='imported') {
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
                model.set('name_site','');
                var fieldWorkersNumber = model.get('NbFieldWorker');
                if(!fieldWorkersNumber){
                   model.set('NbFieldWorker',''); 
                }
            }
            this.model.set('station_position',model); 
        },
        addInput : function(){
            // get actual number of inserted fields stored in "fieldset#station-fieldWorkers" tag
            var stFieldWorkers = $('#station-fieldWorkers');
            var nbInsertedWorkersFields = parseInt($(stFieldWorkers).attr('insertedWorkersNb'));
            if (nbInsertedWorkersFields < 5){
                var nbFdW = nbInsertedWorkersFields + 1;
                // element to show ( masqued by default)
                var ele = '#FieldWorker' + nbFdW + '-field';
                $(ele).removeClass('masqued');
                $('#removeFieldWorkerInput').removeClass('masqued');
                // update stored value for nb displayed fields 
                $(stFieldWorkers).attr('insertedWorkersNb', nbFdW);
            }
        },
        removeInput : function(){
            var stFieldWorkers = $('#station-fieldWorkers');
            var actualFDNumber = parseInt($(stFieldWorkers).attr('insertedworkersnb'));
            //var nbFdW = actualFDNumber + 1;
                // element to show ( masqued by default)
            var ele = '#FieldWorker' + actualFDNumber + '-field';
            var fieldFW = 'FieldWorker' + actualFDNumber;
            $('select[name="' + fieldFW + '"]').val('');
            $(ele).addClass('masqued');
            $(stFieldWorkers).attr('insertedworkersnb',(actualFDNumber -1));
            if (actualFDNumber == 2){
                $('#removeFieldWorkerInput').addClass('masqued');
            }
            $('input[name="NbFieldWorker"').val(actualFDNumber -1);
        },
        checkFWName : function(e){
            var fieldWorkersNb = $('input[name="NbFieldWorker"');
            var selectedField = $(e.target);
            var fieldName = $(e.target).attr('name');
            var selectedOp = $(e.target).find(":selected")[0];
            var selectedName = $(selectedOp).val();
            var nbFW = 0;
            $(".fiedworker").each(function() {
                var selectedValue = $(this).val();
                if ($(this).attr('name') != fieldName){
                    if (selectedName && (selectedValue == selectedName)){
                        alert('this name is already selected, please select another name');
                        $(selectedField).val('');
                    }
                }
                if(selectedValue){
                    nbFW+=1;
                }
                // ...
            });
            // update totalNbFieldworkers
            $(fieldWorkersNb).val(nbFW);
            $(fieldWorkersNb).change();
        },
        checkAccuracyValue : function(){
            var element = $('input[name="Precision"]');
            var value = parseInt($(element).val());
           if(value < 0 ){
                alert('please input a valid value (>0) ');
                $(element).val('');
            }
        },
        updateDate : function(){
            var dateVal =$("input[name='Date_']").val();
            if (dateVal){
                this.model.set('station_Date_' , dateVal);
            }
        }
    });
});
