
/****************************************************
	My stored data
****************************************************/

var ecoReleveData = (function(app) {
	"use strict";

app.views.MyData = app.views.BaseView.extend({
	template: 'myData',
	initialize: function() {
		// remove background image
		$.supersized({
			slides: [{
				image: ''
			}]
		});
	},
	afterRender : function(){
		// hide filter for small screens
		var body_width = $(window).width(); 
		// stats displayed only for screens with width > 640
	    /*if (body_width < 640 ){
			$('#birdsFilterContainer').addClass("masqued");
		}*/
		$('#myDataFilter').masonry({
		    // options
		    itemSelector : '.filterItem',
		    // set columnWidth a fraction of the container width
			  columnWidth: function( containerWidth ) {
			    return containerWidth / 5;
			  },
		     isFitWidth: true
  		});
  		$("input[name='beginDate']").datepicker();
  		$("input[name='endDate']").datepicker(); 
  		// display obs number
  		$("#mydataNbObs").text(app.collections.obsListForMyData.length);
  	
  		app.utils.initGrid(app.collections.obsListForMyData, app.collections.StationsProtocols);
  		// get protocols list and add it to datalist (input protocol selection)
  		var protocols = app.collections.protocolsList;
			protocols.each(function(mymodel) {
				var li = "<option value='" + mymodel.get('name') +"'></option>";
				$("#mydataProtocolsList").append(li);
				
			});
		// get stations id and name for datalist controls
		//1- get list of items
		var stationIdList = [], stationNameList = [];
		app.collections.obsListForMyData.each(function(obsModel) {
				var tm = obsModel;
				var idStation, stationName ; 

				if (obsModel.attributes.idStation){
					idStation = obsModel.attributes.idStation;
					if (idStation){
						stationIdList.push(idStation);
					}
				}
				if (obsModel.attributes.station){
					stationName = obsModel.attributes.station;
					if (stationName){
						stationNameList.push(stationName);
					}
				}
			});
		// keep distinct values for each array
		stationIdList = app.utils.array_unique(stationIdList);   
		stationNameList = app.utils.array_unique(stationNameList); 
		stationIdList.sort();
		stationNameList.sort();
		// datalist station id
		app.utils.fillDataListFromArray(stationIdList, "#mydataStationIdList");
		app.utils.fillDataListFromArray(stationNameList, "#mydataStationNameList");
	},
	events : {
			"click #mydataFilterClear" : "clearFields",
			"click #myDataFilterSubmit" : "getMyDataList",
			"click tr": "selectTableElement",
			"click #hideShowFilter" : "moveFilter"
	},
	clearFields : function() {
		$("input").val("");
	},
	getMyDataList : function(){
		var stationName = $('input[name="name"]').val().trim();
		//var stationId = $('input[name="id"]').val().trim();
		var protocolName = $('input[name="protocol"]').val().trim();
		var beginDate = $('input[name="beginDate"]').val().trim();
		var endDate = $('input[name="endDate"]').val().trim();

		var filtredCollection;

		if (stationName || protocolName || beginDate || endDate ) {
			
			filtredCollection = app.collections.obsListForMyData.getFiltredItems(stationName, protocolName, beginDate, endDate);

		} else {

			filtredCollection = app.collections.obsListForMyData; 
		}

		app.utils.initGrid(filtredCollection, app.collections.StationsProtocols);
	},
	selectTableElement: function(e) {
		var ele = e.target.parentNode.nodeName;
		if (ele == "TR") {
			var selectedModel = app.models.selectedModel;
			var selectedObservationId = selectedModel.attributes.obsId;
			var route = '#mydata/' + selectedObservationId;
			app.router.navigate(route, {trigger: true});
		}
	},
	moveFilter : function() {
		$("#objectsIndivFilter").toggle( "slide" );
	}
});

app.views.MyObs = app.views.BaseView.extend({
	template: 'myobs',
	initialize: function(options) {
		this.obsId = parseInt(options.id);
	},
	afterRender: function() {
		var windowHeigth = $(window).height();
		var windowWidth = $(window).width();
		$("#map").css("width",windowWidth/2);
		$("#obsDetails").css({"height": windowHeigth -50 });
		// change map width if window is resized
		$(window).bind('resize', function() {
			windowWidth = $(this).width();
			$("#map").css("width",windowWidth/2);
		});
		// get selected obs model by underscore method (find)
		//var selectedObModel = app.collections.obsListForMyData.find(function(model) { return model.attributes["obsId"] == this.obsId; });
		var selectedObModel = app.collections.observations.where({ obsId: this.obsId })[0];
		var idStation = selectedObModel.get("idStation");
		// get station 
		var selectedStation = app.collections.stations.where({stationId : idStation})[0];
		var latitude = parseFloat(selectedStation.get("LAT"));
		var longitude = parseFloat(selectedStation.get("LON"));
		var stationName = selectedStation.get("Name");
		var date = selectedStation.get("Date_");
		var protocolName = selectedObModel.get("protocolName");
		// display station name & coordinates
		$("#myObsStationName").text(stationName);
		$("#myObsStatLat").text(latitude);
		$("#myObsStatLon").text(longitude);
		$("#myObsStationDate").text(date);
		$("#myObsProtocol").text(protocolName);
		// display protocol fields
		for(var property in selectedObModel.attributes) {
            if ( (property !=="id") && (property !=="idStation") && (property !=="protocolName") && (property !=="protocolId") && (property !=="obsId")) {
              //alert(property);
              var propertyValue = selectedObModel.get(property);
              var element = "<div class='row-fluid'><div class='span6'>" + property + " </div><div class='span6'>" + propertyValue +"</div></div>";
              $("#myObsProtoValues").append(element);
            }
        }

		// init map
		var point = new NS.UI.Point({
					latitude: latitude,
					longitude: longitude,
					label: ""
		});
		var mapView = app.utils.initMap(point, 10);
		// add marker for station position
		var style =  new OpenLayers.Style({
			  externalGraphic: "images/marker_red.png",
			  'pointRadius': 20//,
			});

		mapView.addLayer({layerName: "station", point : point, style :style});

	}

});


	return app;
})(ecoReleveData);