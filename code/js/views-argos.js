
	var ecoReleveData = (function(app) {
	"use strict";
	
	app.views.Argos = app.views.BaseView.extend({
		template: "argos",
		afterRender: function(options) {

			// remove background image
			$.supersized({
				slides: [{
					image: ''
				}]
			});
			//this.loadStats();
			var body_width = $(window).width(); 
			this.windowHeigth = $(window).height();
			$('#argosDataFilter').masonry({
			    // options
			    itemSelector : '.filterItem',
			    // set columnWidth a fraction of the container width
				  columnWidth: function( containerWidth ) {
				    return containerWidth / 5;
				  },
			     isFitWidth: true
	  		});
	  		/*$("input[name='beginDate']").datepicker();
	  		$("input[name='endDate']").datepicker(); */
	  		// get data
	  		//var url = 'http://192.168.1.199:6543/ecoReleve-Sensor/argos/unchecked/list';
	  		
	  		if (!app.utils.transmittersCollection){
	  			this.getTransmittersCollection();
			} else {
				var nbRows = app.utils.transmittersCollection.length;
				$("#argosDataNb").text(nbRows);
				app.utils.initGrid(app.utils.transmittersCollection, app.collections.ArgosTransmitters, null,{pageSize : nbRows});
				$("#grid").css({"height":this.windowHeigth *4/5});
				$("#grid").mCustomScrollbar({
							theme:"dark"
				});
				this.setStatusColor();
			}
			// color data items by 'status' value
			
		}, 
		events : {
			"click #hideShowFilter" : "moveFilter",
			"click #argosFilterSubmit" : "getMyDataList",
			"click #argosFilterClear" : "clearFields",
			"click tr": "selectTableElement",
			"click #argosImportPttList" : "importChecked"
		},
		getTransmittersCollection : function(){
			var url = app.config.sensorUrl + '/argos/unchecked/list';
	  		var _this = this;
			$.ajax({
				url: url,
				dataType: "json",
				success: function(data){
					// créeer collection d'objets argos
					app.utils.transmittersCollection = new app.collections.ArgosTransmitters();
					var transmitterIdList = [], indivIdList = [], individusId;
					$.each( data, function( key, value ) {
						var transmitter = new app.models.ArgosTransmitter();
						transmitter.set('reference', value.ptt);
						individusId = value.ind_id;
						transmitter.set('individusId', individusId);
						transmitter.set('nbPositions', value.count);
						var status = 'unchecked';
						if(!individusId){
							status = 'error';
						} else{
							// add individual id to id list for input data filter (autocomplete) 'individual'
							indivIdList.push(individusId);
						}
						transmitter.set('status', status);
						// transmitterIdList to provide autocomplete to field 'PTT'
						transmitterIdList.push(key);
						app.utils.transmittersCollection.add(transmitter);
					 // console.log( key + ": " + value[0].ind_id  +  "  " + value[0].count  );
					});
					var nbRows = app.utils.transmittersCollection.length;
					$("#argosDataNb").text(nbRows);
					app.utils.initGrid(app.utils.transmittersCollection, app.collections.ArgosTransmitters, null,{pageSize : nbRows});
					$("#grid").css({"height":_this.windowHeigth *4/5});
					$("#grid").mCustomScrollbar({
						theme:"dark"
					});
					transmitterIdList.sort();
					indivIdList.sort();
					// datalist for PTT and Individual input fields 
					app.utils.fillDataListFromArray(transmitterIdList, "#argosTransmittersdList");
					app.utils.fillDataListFromArray(indivIdList, "#argosIndividualList");
					_this.setStatusColor();
				}
			});

		},
		moveFilter : function() {
			
			//alert(displayed);
		    $("#argosFilter").toggle( "slide" );
		    var displayed = $( "#argosFilter" ).attr("style");
		    if (displayed ==="display: none;"){
		    	$("#argosHideShowFilter").text("filter >");
		    } else {
		    	$("#argosHideShowFilter").text("< filter");
		    }
		   // argosHideShowFilter
		},
		getMyDataList : function(){
			var pttId = $('input[name="pttId"]').val().trim();
			var indivId = $('input[name="indivId"]').val().trim();
			var status = $('input[name="status"]').val().trim();
			/*var beginDate = $('input[name="beginDate"]').val().trim();
			var endDate = $('input[name="endDate"]').val().trim();*/

			var filtredCollection;

			if (pttId || indivId || status ) {
				
				filtredCollection = app.utils.transmittersCollection.getFiltredItems(pttId, indivId, status );

			} else {

				filtredCollection = app.utils.transmittersCollection; 
			}

			// display number of returned models
			var nb = filtredCollection.length;
			$("#argosDataNb").text(nb);
			app.utils.initGrid(filtredCollection, app.collections.ArgosTransmitters, null,{pageSize : nb});
			$("#grid").css({"height":this.windowHeigth *4/5});
			$("#grid").mCustomScrollbar({
							theme:"dark"
			});
			this.setStatusColor();
			
		},
		clearFields : function() {
			$("input").val("");
		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode.nodeName;
			if (ele == "TR") {
				var selectedModel = app.models.selectedModel;
				var refPTT = selectedModel.get("reference");
				var indivId = selectedModel.get("individusId");
				//var route = '#argos/' + refPTT + '/indiv/'+ indivId;
				var route = '#argos/ptt='  + refPTT + '&indivId='+ indivId;
				app.router.navigate(route, {trigger: true});
			}
		},
		setStatusColor : function(){
			$("td.status").each(function(){
				var status = $(this).text();
				switch(status) {
					case 'error':
					    $(this).toggleClass("redColor");
					    break;
					case 'imported':
					    $(this).toggleClass("yellowColor");
					    break;
					case 'checked':
					    $(this).toggleClass("greenColor");
					    break;
					    default:
					    break;
				}
			});
		},
		importChecked : function(){
			var _this = this;
			var importList = [];
			app.utils.transmittersCollection.each(function(model) {
				var status = model.get('status');
				if (status ==="checked"){
					var importObj = {};
					importObj.ptt =  model.get('reference');
					importObj.ind_id  = model.get('individusId');
					importObj.locations  = model.get('locations');
					importList.push(importObj);
				}
			});

			if(importList.length>0){
				var url = app.config.sensorUrl + '/argos/insert';
				var data = JSON.stringify(importList) ; 
		  		$.ajax({
					url: url,
					type:"POST",
					//dataType: "json",
					data : data,
					success: function(data){
						alert("data imported for checked locations !");
						// clear array
						importList.splice(0, importList.length);
						// clear transmitter collection
						app.utils.transmittersCollection.reset();
						_this.getTransmittersCollection();


					},
					error : function(data){
						alert("error importing data !");
					}
				});
	  		} else {
	  			alert ('no locations to import !');
	  		}
		}
		/*loadStats: function() {
			var serverUrl = localStorage.getItem("serverUrl");
			var url = serverUrl + "/sensor/stat?format=json";
			//var url = "http://192.168.1.199:6543/ecoReleve-Sensor/weekData";
			
			$.ajax({
				url: url,
				dataType: "json",
				success: function(data) {
					var labels = data.label.reverse();
					var nbArgos = data["nbArgos"].reverse();
					var nbGps = data["nbGPS"].reverse();
					nbArgos = app.utils.convertToInt(nbArgos);
					nbGps = app.utils.convertToInt(nbGps);
					var graphData = {
						labels: labels,
						datasets: [{
							fillColor: "rgba(220,220,220,0.5)",
							strokeColor: "rgba(220,220,220,1)",
							data: nbArgos
						}, {
							fillColor: "rgba(33, 122, 21,0.5)",
							strokeColor: "rgba(33, 122, 21,1)",
							data: nbGps
						}]
					};
					var maxValueArgos = app.utils.MaxArray(nbArgos);
					var maxValueGps = app.utils.MaxArray(nbGps);
					var maxValueInGraph = (maxValueArgos > maxValueGps) ? maxValueArgos : maxValueGps;
					maxValueInGraph = app.utils.GraphJsMaxY(maxValueInGraph);
					var steps = 5;
					var argosChart = new Chart(document.getElementById("argosGraph").getContext("2d")).Bar(graphData, {
						scaleOverride: true,
						scaleSteps: steps,
						scaleStepWidth: Math.ceil(maxValueInGraph / steps),
						scaleStartValue: 0
					});

					var lastDate = labels[labels.length - 1];
					var lastArgosValue = nbArgos[nbArgos.length - 1];
					var lastGpsValue = nbGps[nbGps.length - 1];
					$("#argosDate").text(lastDate);
					$("#argosValues").text(parseFloat(lastArgosValue) + parseFloat(lastGpsValue));
				},
				error: function(data) {
					alert("error loading data. please check webservice.");
				}
			});
		}*/
	});
	app.views.ArgosDetails= app.views.BaseView.extend({
		template: "argosDetails",
		initialize: function(options) {
			this.pttId = options.idTransmitter;
			this.indivId = options.idIndiv;
			this.locationsTodelete = [];
		},
		afterRender: function() {
			this.windowHeigth = $(window).height();
			var url;
			if (this.indivId !='null'){
			  url = app.config.sensorUrl + '/argos/unchecked?ptt=' + this.pttId + '&ind_id='+ this.indivId;
			} else {
				url = app.config.sensorUrl + '/argos/unchecked?ptt=' + this.pttId;
			}
	  		var _this = this;
	  		$.ajax({
				url: url,
				dataType: "json",
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
					$("#argosDetPttId").text(pttId);
					$("#argosDetPttType").text(manufacturer);
					$("#argosDetPttModel").text(model);
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
					}
					$("#argosDetIndivSpecie").text(indivSpecie);
					$("#argosDetIndivOrigin").text(indivOrigin);
					$("#argosDetIndivSex").text(indivSex);
					$("#argosDetIndivAge").text(indivAge);
					//$("#argosDetIndivStatus").text(indivStatus);
					var locations = data.locations;
					// new collection locations
					_this.locationsCollection = new app.models.ArgosLocationCollection();
					var locationModel ; 
					var nb = locations.length;
					for(var i=0; i<nb;i++){
						// new model app.models.ArgosLocation
						locationModel = new app.models.ArgosLocation();
						locationModel.set('positionId', locations[i].id);
						locationModel.set( 'date', locations[i].date);
						locationModel.set( 'latitude', locations[i].lat );
						locationModel.set( 'longitude', locations[i].lon);
						//locationModel.set( 'del','test');
						var type = locations[i].type;
						if (type === 0 ){
							locationModel.set( 'type','argos');
						} else {
							locationModel.set( 'type','gps');
						}
						
						_this.locationsCollection.add(locationModel);

					}
					var nbRows =_this.locationsCollection.length;
					app.utils.initGrid(_this.locationsCollection, app.models.ArgosLocationCollection, [6],{pageSize : nbRows});
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
					_this.mapView = app.utils.initMap(point, 10);
					// add marker for station position
					var defaultStyle =  new OpenLayers.Style({
						  externalGraphic: "images/marker_red.png",
						  'pointRadius': 20//,
					});
					var selectStyle = new OpenLayers.Style({
						  externalGraphic: "images/marker_marron.png",
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
					_this.mapView.addLayer({layerName: "station", collection : _this.locationsCollection, styleMap :styleMap});
					// get a reference to this layer to be used later
					var nbLayers  = _this.mapView.map.layers.length; 
					_this.locationsLayer = _this.mapView.map.layers[nbLayers- 1];
					$("#grid").css({"height":_this.windowHeigth *4/5});
					$("#grid").mCustomScrollbar({
						theme:"dark"
					});
					// init object 'locations to delete'
					_this.objLocationsToDelete = {};
					_this.objLocationsToDelete.ptt = $("#argosDetPttId").text();
					_this.objLocationsToDelete.ind_id = $("#argosDetIndivId").text();
					_this.objLocationsToDelete.locations = [];
				}
			});
		},
		events : {
			"click tr": "selectTableElement",
			"click img.deleteRow" : "deleteRow",
			"click #argosCheckPtt" : "check",
			"click #argosCheckImportPtt" : "checkImport",
			"click img.reloadRow" : "reloadRow",
			"selectedFeatures:change": "featuresChange"
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
		  		var _this = this;
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
		}
	});	

		return app;
})(ecoReleveData);