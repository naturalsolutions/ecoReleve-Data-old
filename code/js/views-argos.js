
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
	  		var url = 'http://192.168.1.199:6543/ecoReleve-Sensor/unchecked_summary';
	  		//http://192.168.1.199:6543/ecoReleve-Sensor/unchecked?id=22933
	  		var _this = this;
	  		if (!app.utils.transmittersCollection){
		  		$.ajax({
					url: url,
					dataType: "json",
					success: function(data){
						// créeer collection d'objets argos
						app.utils.transmittersCollection = new app.collections.ArgosTransmitters();
						var transmitterIdList = [], indivIdList = [], individusId;
						$.each( data, function( key, value ) {
							var transmitter = new app.models.ArgosTransmitter();
							// id transmitter
							transmitter.set('reference', key);
							individusId = value[0].ind_id;
							transmitter.set('individusId', individusId);
							transmitter.set('nbPositions', value[0].count);
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
			"click tr": "selectTableElement"

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
			
		},
		clearFields : function() {
			$("input").val("");
		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode.nodeName;
			if (ele == "TR") {
				var selectedModel = app.models.selectedModel;
				var refPTT = selectedModel.get("reference");
				var route = '#argos/' + refPTT;
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
					case 'checked':
					    $(this).toggleClass("greenColor");
					    break;
					    default:
					    break;
				}
			});
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
			this.pttId = options.id;
		},
		afterRender: function() {
			this.windowHeigth = $(window).height();
			var url = 'http://192.168.1.199:6543/ecoReleve-Sensor/unchecked?id=' + this.pttId;
	  		//var _this = this;
	  		var _this = this;
	  		$.ajax({
				url: url,
				dataType: "json",
				success: function(data){
					console.log(data);
					var pttId = data.ptt.ptt,
					manufacturer = data.ptt.manufacturer,
					model = data.ptt.model,
					indivId = data.indiv.id,
					indivOrigin = data.indiv.origin,
					indivAge = data.indiv.age,
					indivSex = data.indiv.sex,
					indivSpecie = data.indiv.specie,
					indivStatus = data.indiv.status;

					console.log(data);
					
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
					}
					$("#argosDetIndivSpecie").text(indivSpecie);
					$("#argosDetIndivOrigin").text(indivOrigin);
					$("#argosDetIndivSex").text(indivSex);
					$("#argosDetIndivAge").text(indivAge);
					$("#argosDetIndivStatus").text(indivStatus);
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
					app.utils.initGrid(_this.locationsCollection, app.models.ArgosLocationCollection, null,{pageSize : nbRows});
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
					var style =  new OpenLayers.Style({
						  externalGraphic: "images/marker_red.png",
						  'pointRadius': 20//,
					});

					_this.mapView.addLayer({layerName: "station", collection : _this.locationsCollection, style :style});
					$("#grid").css({"height":_this.windowHeigth *4/5});
					$("#grid").mCustomScrollbar({
						theme:"dark"
					});
				}
			});
		},
		events : {
			"click tr": "selectTableElement",
			"click img.deleteRow" : "deleteRow",
			"click #argosCheckPtt" : "check",
			"click #argosCheckImportPtt" : "checkImport"
		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode.nodeName;
			if (ele == "TR") {
				$('tr').removeClass("selectedRow");
				//$(ele).addClass("selectedRow");
				var selectedModel = app.models.selectedModel;
				var latitude = selectedModel.get("latitude");
				var longitude = selectedModel.get("longitude");
				// remove layer if exists
				for (var i = 0; i < this.mapView.map.layers.length; i++) {
					if ((this.mapView.map.layers[i].name) == "Selected argos station") {
						this.mapView.map.removeLayer(this.mapView.map.layers[i]);
					}
				}
				var point = new NS.UI.Point({
					latitude: latitude,
					longitude: longitude,
					label: ""
				});

				var style =  new OpenLayers.Style({
				  externalGraphic: "images/marker_blue.png",
				  'pointRadius': 20//,
				});
				this.mapView.addLayer({layerName: "Selected argos station", point : point, style :style});
			}
			return false;
		},
		deleteRow : function(e) {
			var selectedModel = app.models.selectedModel;
			var latitude = selectedModel.get("latitude");
			var longitude = selectedModel.get("longitude");
			this.locationsCollection.remove(selectedModel);
			// update and redraw grid
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
			var referencePtt = $("#argosDetPttId").text();

			// find model in the collection to update status
			//var modelToUpdate = app.utils.transmittersCollection.where({ reference: referencePtt });
			app.utils.transmittersCollection.find(function(model) { 
				if( model.get('reference') == referencePtt){
					model.set('status','checked');
					app.router.navigate("#argos", {trigger: true});
				}
			});

			//var tm = modelToUpdate;
			//modelToUpdate[0].set('status','checked');
		},
		checkImport : function() {
			var referencePtt = $("#argosDetPttId").text();
			var objToImport = {};
			objToImport.reference = referencePtt;
			objToImport.positions = [];
			this.locationsCollection.each(function(model) {
				var position = {};
				position.id = model.get('positionId');
				var type = model.get('type');
				if (type === 'argos' ){
					position.type = 0;
				} else {
					position.type = 1;
				}
				objToImport.positions.push(position);
			});
			var tm = objToImport.positions;
		}

	});	

		return app;
})(ecoReleveData);