
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
			var windowHeigth = $(window).height();
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
	  		$.ajax({
				url: url,
				dataType: "json",
				success: function(data){
					// créeer collection d'objets argos
					_this.transmittersCollection = new app.collections.ArgosTransmitters();
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
						_this.transmittersCollection.add(transmitter);
					 // console.log( key + ": " + value[0].ind_id  +  "  " + value[0].count  );
					});
					var nbRows = _this.transmittersCollection.length;
					$("#argosDataNb").text(nbRows);
					app.utils.initGrid(_this.transmittersCollection, app.collections.ArgosTransmitters, null,{pageSize : nbRows});
					$("#grid").css({"height":windowHeigth *4/5});
					$("#grid").mCustomScrollbar({
						theme:"dark"
					});
					
					transmitterIdList.sort();
					indivIdList.sort();
					// datalist for PTT and Individual input fields 
					app.utils.fillDataListFromArray(transmitterIdList, "#argosTransmittersdList");
					app.utils.fillDataListFromArray(indivIdList, "#argosIndividualList");
				}
			});
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
				
				filtredCollection = this.transmittersCollection.getFiltredItems(pttId, indivId, status );

			} else {

				filtredCollection = this.transmittersCollection; 
			}

			// display number of returned models
			var nb = filtredCollection.length;
			$("#argosDataNb").text(nb);
			app.utils.initGrid(filtredCollection, app.collections.ArgosTransmitters, null,{pageSize : nb});
			
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
			var windowHeigth = $(window).height();
			var url = 'http://192.168.1.199:6543/ecoReleve-Sensor/unchecked?id=' + this.pttId;
	  		//var _this = this;
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
					var locationsCollection = new app.models.ArgosLocationCollection();
					var locationModel ; 
					var nb = locations.length;
					for(var i=0; i<nb;i++){
						// new model app.models.ArgosLocation
						locationModel = new app.models.ArgosLocation();
						locationModel.set( 'date', locations[i].date);
						locationModel.set( 'latitude', locations[i].lat );
						locationModel.set( 'longitude', locations[i].lon);
						var type = locations[i].type;
						if (type === 0 ){
							locationModel.set( 'type','argos');
						} else {
							locationModel.set( 'type','gps');
						}
						
						locationsCollection.add(locationModel);

					}
					var nbRows =locationsCollection.length;
					app.utils.initGrid(locationsCollection, app.models.ArgosLocationCollection, null,{pageSize : nbRows});
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

					_this.mapView.addLayer({layerName: "station", collection : locationsCollection, style :style});
					$("#grid").css({"height":windowHeigth *4/5});
					$("#grid").mCustomScrollbar({
						theme:"dark"
					});
				}
			});
		},
		events : {
			"click tr": "selectTableElement"
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
		}

	});	

		return app;
})(ecoReleveData);