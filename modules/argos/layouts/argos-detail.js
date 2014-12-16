define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'views/graph',
    'config',
    'text!modules2/argos/templates/argos_detail.html'
], function($, _, Backbone, Marionette, Radio, GraphView, config, template) {

    'use strict';

    return Marionette.LayoutView.extend( {
        className: 'container-fluid',
        regions: {
            info: '#info',
            map: '#map'
        },
        template: template,
        events : {
            'click tr': 'selectTableElement',
            'click img.deleteRow' : 'deleteRow',
            'click #argosCheckPtt' : 'check',
            'click #argosCheckImportPtt' : 'checkImport',
            'click img.reloadRow' : 'reloadRow',
            'selectedFeatures:change': 'featuresChange',
            'click #argosCheckImportNextIndiv' : 'navigationNextIndiv',
            'click #argosCheckImportPrevIndiv' : 'navigationPrevIndiv',
            'click #back': 'backToList'
        },

        initialize: function(options) {
            if(!options.idToShow){
                Radio.channel('route').trigger('show:argos');
            }
            else {
                this.collection = options.collection;
                var id = options.idToShow;
                this.pttId = this.collection.at(id).get('ptt');
                this.indivId = this.collection.at(id).get('ind_id');
                this.currentId = id;
            }
        },

        backToList: function() {
            Radio.channel('route').trigger('show:argos');
        },

        afterRender: function() {
            $('section#main').addClass('blackBackground');
            this.windowHeigth = $(window).height();
            var url;
            if (this.indivId !='null'){
              url = app.config.sensorUrl + '/argos/unchecked?ptt=' + this.pttId + '&ind_id='+ this.indivId;
            } else {
                url = app.config.sensorUrl + '/argos/unchecked?ptt=' + this.pttId;
            }
              //var _this = this;
              $.ajax({
                url: url,
                dataType: 'json',
                context: this,
                beforeSend: function(){
                    $('#waitCtr').css('display', 'block');
                },
                success: function(data){
                    var pttId = data.ptt.ptt,
                    manufacturer = data.ptt.manufacturer,
                    model = data.ptt.model,
                    indivId = data.indiv.id,
                    indivOrigin = data.indiv.origin,
                    indivAge = data.indiv.age,
                    indivSex = data.indiv.sex,
                    indivSpecie = data.indiv.specie,
                    indivStatus = data.indiv.status;

                    // display ptt data
                    $('#argosDetPttId').text(pttId);
                    $('#argosDetPttType').text(manufacturer);
                    $('#argosDetPttModel').text(model);
                    // display individual data
                    if (indivId){
                        $("#argosDetIndivId").text(indivId);
                    }else {
                        $("#argosDetIndivId").html('<span style="color:red;">unknown</span>');
                        $(".hideForUnknownIndiv").addClass('masqued');
                        $("#argosCheckImportPtt").attr("disabled","disabled");
                        $("#argosCheckPtt").attr("disabled","disabled");
                        // change btn text color
                        $("#argosCheckImportPtt").addClass("disabled");
                        $("#argosCheckPtt").addClass("disabled");
                        // btn navigation
                        $("#argosCheckImportNextIndiv").addClass("disabled");
                        $("#argosCheckImportNextIndiv").attr("disabled","disabled");
                        $("#argosCheckImportPrevIndiv").addClass("disabled");
                        $("#argosCheckImportPrevIndiv").attr("disabled","disabled");
                    }
                    $("#argosDetIndivSpecie").text(indivSpecie);
                    $("#argosDetIndivOrigin").text(indivOrigin);
                    $("#argosDetIndivSex").text(indivSex);
                    $("#argosDetIndivAge").text(indivAge);
                    //$("#argosDetIndivStatus").text(indivStatus);
                    var locations = data.locations;
                    // new collection locations
                    this.locationsCollection = new app.models.ArgosLocationCollection();
                    var locationModel ;
                    var nb = locations.length;
                    for(var i=0; i<nb;i++){
                        // new model app.models.ArgosLocation
                        locationModel = new app.models.ArgosLocation();
                        locationModel.set('positionId', locations[i].id);
                        locationModel.set( 'date', locations[i].date);
                        locationModel.set( 'latitude', locations[i].lat );
                        locationModel.set( 'longitude', locations[i].lon);
                        locationModel.set( 'classLoc', locations[i].lc);
                        locationModel.set( 'distance', locations[i].dist);
                        //locationModel.set( 'del','test');
                        var type = locations[i].type;
                        if (type === 0 ){
                            locationModel.set( 'type','argos');
                        } else {
                            locationModel.set( 'type','gps');
                        }

                        this.locationsCollection.add(locationModel);
                    }
                    var nbRows =this.locationsCollection.length;
                    var grid = app.utils.initGrid(this.locationsCollection, [8],{pageSize : nbRows});
                    this.insertView(grid);
                    // add trush to del column
                    $("td.del").html("<img src='images/corbeille.png' class='deleteRow'>");
                    // display number of positions
                    $("#argosNbPositions").text(nbRows);

                    // init map
                    var point = new NS.UI.Point({
                                latitude: locationModel.get('latitude'),
                                longitude: locationModel.get('longitude'),
                                label: ""
                    });
                    this.mapView = app.utils.initMap(point, 10);
                    this.insertView(this.mapView);
                    // add marker for station position
                    var defaultStyle =  new OpenLayers.Style({
                          externalGraphic: "images/marker_red.png",
                          'pointRadius': 20//,
                    });
                    var selectStyle = new OpenLayers.Style({
                          externalGraphic: "images/marker_grey.png",
                          'pointRadius': 20
                    });
                    var deleteStyle = new OpenLayers.Style({
                          externalGraphic: "images/marker_yellow.png",
                          'pointRadius': 20
                    });
                    var zoomtoselectStyle = new OpenLayers.Style({
                          externalGraphic: "images/marker_green.png",
                          'pointRadius': 20
                    });
                    var styleMap = new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle, 'delete' : deleteStyle, 'zoomSelect' : zoomtoselectStyle});
                    this.mapView.addLayer({layerName: "station", collection : this.locationsCollection, styleMap :styleMap});
                    // get a reference to this layer to be used later
                    var nbLayers  = this.mapView.map.layers.length;
                    this.locationsLayer = this.mapView.map.layers[nbLayers- 1];
                    $("#grid").css({"height":this.windowHeigth *4/5});
                    $("#grid").mCustomScrollbar({
                        theme:"dark"
                    });
                    // init object 'locations to delete'
                    this.objLocationsToDelete = {};
                    this.objLocationsToDelete.ptt = $("#argosDetPttId").text();
                    this.objLocationsToDelete.ind_id = $("#argosDetIndivId").text();
                    this.objLocationsToDelete.locations = [];
                    // div legend with same width as div map
                    var mapWidth = $("#map").css('width');
                    $("#argosMapLegend").css('width', mapWidth );
                },
                complete: function(){
                    $("#waitCtr").css('display', 'none');
                }
            });
            $('.mapDisplay').css('float', 'right');
        /*   to update  map container size*/

        this.setMapSize();
        },
        setMapSize : function(){
            //$('#map').css('float', 'right');
            var dataContainer = $("#main")[0];
            var argosContentWidth = dataContainer.clientWidth;

            if (argosContentWidth < 1480){
                var mapContainerSize = argosContentWidth - 820;
                $('#map').css('width', mapContainerSize + 'px');
                $('#argosMapLegend').css('width', mapContainerSize + 'px');
            }
            $(window).bind('resize', function() {
                dataContainer = $("#main")[0];
                 argosContentWidth = dataContainer.clientWidth;
                 console.log("argosContentWidth: " + argosContentWidth);
                 //var mapContainerSize;
                if (argosContentWidth < 1300){
                //mapContainerSize = argosContentWidth - 700;
                $('#map').css('width',  '450px');
                $('#argosMapLegend').css('width',  '440px');
                }
                else if (argosContentWidth < 1481){
                    //mapContainerSize = argosContentWidth - 820;
                    $('#map').css('width',  '550px');
                    $('#argosMapLegend').css('width',  '540px');
                } else {
                    $('#map').css('width', 600 + 'px');
                    $('#argosMapLegend').css('width',  '590px');
                }
            });
            /*$(window).bind('resize', function() {
                dataContainer = $("#main")[0];
                argosContentWidth = dataContainer.clientWidth;
                console.log ("argosContentWidth : " + argosContentWidth );
                //widthargosContent = widthDataContainer;
                //$('#allDataContent').css('width', widthargosContent + 'px');

                // check if datatable is not hided and resize map if window is resized
                //var displayed = $("#allDataList").is(":visible");
                //if (displayed) {
                    if (argosContentWidth > 1630){
                     //$('#map').css('width', '700px');
                    } else if(argosContentWidth > 1000) {
                        $("#birdDetails").removeClass("span6");
                        $("#birdDetails").addClass("span7");
                        $("#obsMap").removeClass("span6");
                        $("#obsMap").addClass("span5");
                        $('#map').css('width', (argosContentWidth  - 750 ) + 'px');
                    }
            });*/
        },

        selectTableElement: function(e) {
            var ele = e.target.parentNode.nodeName;
            if (ele == "TR") {
                $('tr').removeClass("selectedRow");
                //$(ele).addClass("selectedRow");
                var selectedModel = app.models.selectedModel;
                var latitude = selectedModel.get("latitude");
                var longitude = selectedModel.get("longitude");
                this.changeSelectedFeatureOnMap("zoomSelect", latitude,longitude );
            }
            return false;
        },
        changeSelectedFeatureOnMap : function(type, latitude, longitude){
            // type = "zoomSelect"  or "delete"
            // convert coordinates
                var location =new OpenLayers.LonLat(longitude,latitude);
                location=location.transform(
                    new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
                    new OpenLayers.Projection("EPSG:3857") // to Spherical Mercator Projection
                );
                // find the feature corresponding to the selected line
                var locationsLayer = this.locationsLayer;
                var featuresList = locationsLayer.features;
                var nbFeatures = featuresList.length;
                for(var i = 0; i<nbFeatures;i++ ){
                    var x = featuresList[i].geometry.x;
                    var y = featuresList[i].geometry.y;
                    if (x === location.lon && y === location.lat) {
                        // change feature style
                        featuresList[i].renderIntent = type ;
                        // pan to location
                        if (type ==="zoomSelect"){
                            this.mapView.map.panTo(location);
                        }
                    } else {
                        // display default style
                        if (type ==="zoomSelect"){
                        featuresList[i].renderIntent = "default" ;
                        }
                    }
                }
                locationsLayer.redraw();

        },
        deleteRow : function(e) {
            // set css   text-decoration : line-through   & modify icon trush
            // select "tr" element to set text-decoration : line-through
            var ele = e.target.parentNode.parentNode;
            $(ele).attr('class','desactivatedRow');
            // change picto
            $(e.target).attr('src','images/Reload_grey.png');
            $(e.target).addClass('reloadRow');
            $(e.target).removeClass('deleteRow');

            var selectedModel = app.models.selectedModel;
            var latitude = selectedModel.get("latitude");
            var longitude = selectedModel.get("longitude");
            // add location to delete to the list to push to server
            var location = {};
                location.id = selectedModel.get('positionId');
                location.latitude = latitude;
                location.longitude = longitude;
                var type = selectedModel.get('type');
            if (type === 'argos' ){
                    location.type = 0;
            } else {
                    location.type = 1;
            }
            this.objLocationsToDelete.locations.push(location);
            // change features style on the map
            var len = this.objLocationsToDelete.locations.length;
            for(var i=0;i<len;i++){
                var point = this.objLocationsToDelete.locations[i];
                var lat = point.latitude;
                var ln = point.longitude;
                this.changeSelectedFeatureOnMap("delete", lat,ln);
            }
            // calculate difference between all postions and positions to delete
            var nbRows = (this.locationsCollection.length) - (this.objLocationsToDelete.locations.length);
            $("#argosNbPositions").text(nbRows);

            //this.locationsCollection.remove(selectedModel);
            // update and redraw grid
            /*
            var nbRows =this.locationsCollection.length;
            app.utils.initGrid(this.locationsCollection, app.models.ArgosLocationCollection, null,{pageSize : nbRows});
            // display number of positions
            $("#argosNbPositions").text(nbRows);
            // add trush to del column
            $("td.del").html("<img src='images/corbeille.png' class='deleteRow'>");
            $("#grid").css({"height":this.windowHeigth *4/5});
            $("#grid").mCustomScrollbar({
                        theme:"dark"
            });
            var last_model = this.locationsCollection.at(this.locationsCollection.length - 1);
            this.drawUpdateMap(last_model);
            */
        },
        reloadRow : function(e) {

            var ele = e.target.parentNode.parentNode;
            $(ele).removeClass('desactivatedRow');
            // change picto
            $(e.target).attr('src','images/corbeille.png');
            $(e.target).addClass('deleteRow');
            $(e.target).removeClass('reloadRow');
            var selectedModel = app.models.selectedModel;
            var latitude = selectedModel.get("latitude");
            var longitude = selectedModel.get("longitude");
            this.changeSelectedFeatureOnMap("default", latitude,longitude);
            // delete location from list of locations to delete
            var locationId = selectedModel.get('positionId');
            var ln = this.objLocationsToDelete.locations.length;
            for(var i=0;i<ln;i++){
                var point = this.objLocationsToDelete.locations[i];
                var pointId = point.id || -1;
                if (pointId == locationId){
                    this.objLocationsToDelete.locations.splice(i, 1);
                    // updata array length
                    ln = this.objLocationsToDelete.locations.length;
                }
            }
            // calculate difference between all postions and positions to delete
            var nbRows = (this.locationsCollection.length) - (this.objLocationsToDelete.locations.length);
            $("#argosNbPositions").text(nbRows);
        },
        drawUpdateMap : function(lastModel) {
            // init map
            if (!this.mapView){
                var point = new NS.UI.Point({
                            latitude: lastModel.get('latitude'),
                            longitude: lastModel.get('longitude'),
                            label: ""
                });
                this.mapView = app.utils.initMap(point, 10);
                // add marker for station position
            }

            var style =  new OpenLayers.Style({
                      externalGraphic: "images/marker_red.png",
                      'pointRadius': 20//,
            });
            // remove layer if exists
            for (var i = 0; i < this.mapView.map.layers.length; i++) {
                if ((this.mapView.map.layers[i].name) == "station") {
                    this.mapView.map.removeLayer(this.mapView.map.layers[i]);
                }
            }
            this.mapView.addLayer({layerName: "station", collection : this.locationsCollection, style :style});
            //$("#grid").css({"height":this.windowHeigth *4/5});
            /*$("#grid").mCustomScrollbar({
                theme:"dark"
            });*/
        },
        check : function() {
            if(this.locationsCollection){
            var referencePtt = $("#argosDetPttId").text();
            var indivId = $("#argosDetIndivId").text();
            // get keeped locations list
            var locations = this.getLocationsList(this.locationsCollection);
            // find model in the collection to update status
            //var modelToUpdate = app.utils.transmittersCollection.where({ reference: referencePtt });
            app.utils.transmittersCollection.find(function(model) {
                if(( model.get('reference') == referencePtt) && (model.get('individusId') == indivId)){
                    model.set('status','checked');
                    model.set('locations',locations);
                    // add keeped locations list to this transmitter
                    app.router.navigate("#argos", {trigger: true});
                }
            });

            } else {
                  alert ('no locations to check !');
              }

            //var tm = modelToUpdate;
            //modelToUpdate[0].set('status','checked');
        },
        checkImport : function() {
            var referencePtt = parseInt($("#argosDetPttId").text(),10);
            var individualId = parseInt($("#argosDetIndivId").text(),10);
            var objToImport = {};
            objToImport.ptt = referencePtt;
            objToImport.ind_id = individualId;
            //objToImport.locations = [];
            // get locations list to be imported
            if(this.locationsCollection){
                objToImport.locations = this.getLocationsList(this.locationsCollection);
                var url = app.config.sensorUrl + '/argos/insert';
                var tab = [];
                tab[0] = objToImport;
                var data = JSON.stringify(tab) ;
                  //var _this = this;
                  $.ajax({
                    url: url,
                    type:"POST",
                    //dataType: "json",
                    data : data,
                    success: function(data){
                        alert("data imported for this transmitter !");
                        // change status to imported
                        app.utils.transmittersCollection.find(function(model) {
                            if(( model.get('reference') == referencePtt) && (model.get('individusId') == individualId)){
                                model.set('status','imported');
                                app.router.navigate("#argos", {trigger: true});
                            }
                        });
                    },
                    error : function(data){
                        alert("error importing data !");
                    }
                });
              } else {
                  alert ('no locations to import !');
              }

              // send checked locations (deleted locations considered as checked)
              if (this.objLocationsToDelete && this.objLocationsToDelete.locations.length > 0){
                  var objToCheck = JSON.stringify(this.objLocationsToDelete);
                  var tabDel = [];
                tabDel[0] = urlChecked;
                var dataDel = JSON.stringify(tabDel) ;
                  //var urlChecked = 'http://192.168.1.199:6543/ecoReleve-Sensor/argos/check';
                  var urlChecked = app.config.sensorUrl + '/argos/check';
                  $.ajax({
                    url: urlChecked,
                    type:"POST",
                    data : dataDel,
                    success: function(data){
                        alert("data checked for this transmitter !");
                    },
                    error : function(data){
                        alert("error importing data !");
                    }
                });
            }
        },
        getLocationsList : function(collection){
            var tab = [];
            collection.each(function(model) {
                var position = {};
                position.id = model.get('positionId');
                var type = model.get('type');
                if (type === 'argos' ){
                    position.type = 0;
                } else {
                    position.type = 1;
                }
                tab.push(position);
            });
            return tab;
        },
        featuresChange: function(e) {
            var locationsLayer = this.locationsLayer;
            var selectedFeaturesList = locationsLayer.selectedFeatures;
            var len = selectedFeaturesList.length;
            // for each feature get its it and select line in the grid
            $("tr").removeClass("selectedTr");
            for (var i = 0; i < len; i++) {
                //get feature id
                var featureId = selectedFeaturesList[i].attributes.id;
                // change corresponded line look on the grid
                $("td.positionId").each(function() {
                    var value =  parseInt(this.textContent,10);
                    if (value === featureId) {
                        // get parent 'TR' and change his style to selected
                        var trElement = this.parentNode;
                        $(trElement).addClass("selectedTr");
                        //$("tr").addClass("selectedTr");


                    }
                   // return false;
                });
            }
            return false;
        },
        navigationNextIndiv : function() {
            if (this.indivId !='null'){
                // the
                var indivIndex = this.getIndivIdex();
                var indivNb = app.utils.argosIndivList.length;
                var nextIndivIndex;
                if (indivIndex < (indivNb - 1)){
                    nextIndivIndex =indivIndex + 1;
                } else {
                    nextIndivIndex = 0;
                }
                // get individual id value
                var idNextIndiv = app.utils.argosIndivList[nextIndivIndex];
                // get transmitter ref corresponding to the indiv id :
                var transmitterModel = app.utils.transmittersCollection.where({ individusId: idNextIndiv });
                var transmitterId = transmitterModel[0].attributes.reference;
                // navigate to next indiv details
                var route = '#argos/ptt=' + transmitterId + '&indivId=' + idNextIndiv;
                app.router.navigate(route, {
                        trigger: true, replace: true
                });
            }
        },
        navigationPrevIndiv  : function() {
            if (this.indivId !='null'){
                var indivNb = app.utils.argosIndivList.length;
                var indivIndex = this.getIndivIdex();
                var prevIndivIndex;
                if (indivIndex > 0){
                    prevIndivIndex =indivIndex -1 ;
                } else {
                    prevIndivIndex = indivNb - 1;
                }
                // get individual id value
                var idPrevIndiv = app.utils.argosIndivList[prevIndivIndex];
                // get transmitter ref corresponding to the indiv id :
                var transmitterModel = app.utils.transmittersCollection.where({ individusId: idPrevIndiv });
                var transmitterId = transmitterModel[0].attributes.reference;
                // navigate to next indiv details
                var route = '#argos/ptt=' + transmitterId + '&indivId=' + idPrevIndiv;
                app.router.navigate(route, {
                        trigger: true, replace: true
                });
            }
        },
        getIndivIdex : function() {
            var intIndivId = parseInt(this.indivId,10);
            var indivNb = app.utils.argosIndivList.length;
            var indivIndex = app.utils.argosIndivList.indexOf(intIndivId);
            return indivIndex;
        }
    });
});
