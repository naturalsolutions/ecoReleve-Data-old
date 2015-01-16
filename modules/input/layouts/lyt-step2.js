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
    'modules2/input/views/input-map',
    'collections/waypoints',
    'models/position',
    'models/station',
    'modules2/input/views/input-grid',
    'modules2/input/views/input-stations-filter',
    'modules2/input/views/input-stations-grid',
    'utils/getSitesNames'
], function($, _, Backbone, Marionette, Radio, config, View1, Step, StationView,Map,Waypoints,Position,Station, Grid,FilterView, GridView, getSitesNames) {

    'use strict';
    return Step.extend({
        events : {
            'change input[type=radio][name="position"]' :'updateStationType',
            'click #getPosition' : 'getCurrentPosition',
            'change input[name="LAT"]' : 'getCoordinates',
            'change input[name="LON"]' : 'getCoordinates',
            'click span.picker': 'filterIndivShow',
            'click #addFieldWorkerInput' : 'addInput'
        },
        regions: {
            leftRegion : '#inputStLeft',
            rightRegion : '#inputStRight'
        },
        onShow: function(){
            this.radio = Radio.channel('input');
            this.radio.comply('generateStation', this.generateStation, this);

            var stationType = this.model.get('start_stationtype');
            if(stationType =='new' ||  stationType =='newSc' ||  stationType =='newSt'){
                //console.log(this.stepAttributes);
                var stationForm = new StationView();
                var formModel = stationForm.form.model;
                this.initModel(stationType,stationForm);
                this.leftRegion.show(stationForm);
                // get stored values
                this.feedTpl();
                var map = new Map();
                this.rightRegion.show(map);
                // init map
                var position = new Position();
                map.addModel(position);
                this.updateStationType(stationType);
            } else if(stationType =='imported'){
                var lastImportedStations = new Waypoints();
                lastImportedStations.fetch();
                this.initModel('import',null);
                var ln = lastImportedStations.length;
                if (ln > 0){
                    var mygrid = new Grid({collections : lastImportedStations});
                    this.leftRegion.show(mygrid);
                    // display map
                    var map = new Map();
                    this.rightRegion.show(map);
                    map.addCollection(lastImportedStations);
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
                    
                   //console.log(key + '  ' + schema[key].validators.this.indexOf('required')!=-1);
                   if(schema[key]){
                        var obj={};
                        obj.name = this.name + '_' +  key;
                        var validators = schema[key].validators;
                        var required = false;
                        if (validators) {
                            required = (validators.indexOf('required')!=-1) ;
                        }
                        obj.required = required;
                        console.log(obj);
                        // set value in global model if not done
                        var fieldVal = this.model.get(obj.name); //|| this.model.set(obj.name, null);
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
            // get attributes from this.model to set fields values (form model)
            console.log('global model');
            console.log(this.model.attributes);
            console.log('attributes');
             console.log(this.stepAttributes);

        },
        updateStationType : function(value){
            if(value == "new"){
                // station with coordinates
                $('#stRegion').addClass('masqued');
                $('#stMonitoredSite').addClass('masqued');
                $('#stCoordinates').removeClass('masqued');
                /*$("input[name='Region']").val('NULL').change();
                $("input[name='LAT']").val('').change();
                $("input[name='LON']").val('').change();
                $('#stMonitoredSiteType').val('').change();
                $('#stMonitoredSiteName').val('').change();*/
                // set required values
                //this.stepAttributes.
                for(var key in this.stepAttributes) {
                    var field = this.stepAttributes[key];
                    if(field.name =='station_Region'  || field.name =='id_site'){
                        field.required = false;
                        console.log(field);
                    }
                    if(field.name =='station_LAT' || field.name =='station_LON'){
                        field.required = true;
                    }

                }
                console.log(this.model);
               /* this.form.model.schema.Region.validators = [];
                this.form.model.schema.LAT.validators = ['required'];
                this.form.model.schema.LON.validators = ['required'];*/
            } else if(value == "newSc"){
                $('#stRegion').removeClass('masqued');
                $('#stCoordinates').addClass('masqued');
                $('#stMonitoredSite').addClass('masqued');
                /*$("input[name='Region']").val('').change();
                $("input[name='LAT']").val('NULL').change();
                $("input[name='LON']").val('NULL').change();
                $('#stMonitoredSiteType').val('').change();
                $('#stMonitoredSiteName').val('').change();*/
                // set fields Region to required and LAT , LON to not required
                /*this.form.model.schema.Region.validators = ['required'];
                this.form.model.schema.LAT.validators = [];
                this.form.model.schema.LON.validators = [];*/
                for(var key in this.stepAttributes) {
                    var field = this.stepAttributes[key];
                    if(field.name =='station_Region'){
                        field.required = true;
                        console.log(field);
                    }
                    if(field.name =='station_LAT' || field.name =='station_LON' || field.name =='id_site' || field.name =='station_Precision' ){
                        field.required = false;
                    }
                }
                 console.log(this.model);
            }
            else {
                $('#stMonitoredSite').removeClass('masqued');
                $('#stRegion').addClass('masqued');
                $('#stCoordinates').addClass('masqued');
                /*$("input[name='Region']").val('').change();
                $("input[name='LAT']").val('NULL').change();
                $("input[name='LON']").val('NULL').change();
                // set fields Region to required and LAT , LON to not required
                /*this.form.model.schema.Region.validators = [];
                this.form.model.schema.LAT.validators = [];
                this.form.model.schema.LON.validators = [];*/
                for(var key in this.stepAttributes) {
                    var field = this.stepAttributes[key];
                    if(field.name =='station_id_site' || field.name =='station_name_site'){
                        field.required = true;
                        console.log(field);
                    }
                    if(field.name =='station_LAT' || field.name =='station_LON' || field.name =='station_Region' || field.name =='station_Precision' ){
                        field.required = false;
                    }
                }
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
                    //$(this).click();
                    //$(this).change();
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
            $('select[name="name_site"]').html('');
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
            /*$("[name='LAT']").val(latitude);
            $("[name='LON']").val(longitude);*/
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
        getCoordinates : function(e){
           // check inputed values
           var inputVal = $(e.target).val();
           var value = parseFloat(inputVal);
           if(!value && inputVal!='NULL' && inputVal!='') {
                alert('please input a correct value.');
                $(e.target).val('');
           }
           else if(inputVal!= 'NULL'){
                var latitude = parseFloat($('input[name="LAT"]').val());
                var longitude = parseFloat($('input[name="LON"]').val());
                // if the 2 values are inputed update map location
                if(latitude && longitude){
                    console.log("longitude: "+ longitude + " , latitude: "+ latitude);
                    var position = new Position();
                    position.set("latitude",latitude);
                    position.set("longitude",longitude);
                    position.set("label","current station");
                    position.set("PK","_");
                    this.model.set('station_LAT',latitude);
                    this.model.set('station_LON',longitude);
                    //this.getPosModel(latitude,longitude);
                    Radio.channel('input').command('movePoint', position);
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
                    /*if(attrName =='FieldWorker1' || attrName =='FieldWorker2' || attrName =='FieldWorker3' || attrName =='FieldWorker4' || attrName =='FieldWorker5'){
                        // convert value to int
                        station.set(attrName, parseInt(this.model.get(attribute)));
                    }*/
                }
            }
            console.log(station);
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

           // send new station  to the server
           /*var url=config.coreUrl + 'station/addMultStation/insert';
           var result = false; 
            $.ajax({
                url:url,
                context:this,
                type:'POST',
                data: JSON.stringify(filteredCollection.models),
                dataType:'json',
                async: false,
                success: function(resp){
                    result = true; 
                },
                error: function(data){
                    alert('error sending gpx collection');
                }
            });
            return result;*/
        },
        generateStation : function(model) {
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
                var fieldWorkersNumber = model.get('FieldWorkersNumber');
                if(!fieldWorkersNumber){
                   model.set('FieldWorkersNumber',''); 
                }
            }
            /*var formsView = new Forms({ model : model});
            this.formsRegion.show(formsView);*/
            this.model.set('station_position',model ); 
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
        }
    });
});
