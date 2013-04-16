 var ecoReleveData = (function(app) {
    "use strict";
 
 app.Router = Backbone.Router.extend({
	routes: {
		"": "home" ,
		"entryStation": "entryStation",
		"msgBox" : "alert",
		"proto-choice": "protoChoice",
		"stationInfos": "stationInfos",
		"data-entry": "dataEntry",
		"map-stations": "mapStations"
	}, 

	initialize: function(options){
	//	this.appView = options.appView;
	},
	home: function(){
		// initialiser point openlayers
		app.point = new OpenLayers.LonLat(5.37,43.29);
		app.views.homeView = new app.Views.HomeView();
		//var homeView = new HomeView();
		//this.appView.showView(homeView);
		app.utils.RegionManager.show(app.views.homeView);
		// calculate number of stored stations
		var ln = app.collections.observations.length;
		$('#badgeMyData').text(ln);
		// image de fond
		$('div#content').css({'background-image':'url(images/home_imgFond.jpg)','background-repeat':'no-repeat','background-position':'center center', 'background-size':'100% 100%'});
	},

	entryStation: function(){
		app.views.stationPositionView = new app.Views.StationPositionView();
		app.utils.RegionManager.show(app.views.stationPositionView);
		//initMap();
		app.utils.initMap();
		$('#map').css('width', '780px');
		$('#map').css('height', '250px');
		app.utils.myPositionOnMap();
		app.global.lastView = "entryStation";
		$('div#content').css({'background-image':''});
	},
	alert: function(){
		app.views.alertView = new app.Views.AlertView();
		app.utils.RegionManager.show(app.views.alertView);
	},
	protoChoice : function(){
		if (app.global.lastView == "stationInfos"){
			var val = app.utils.validateFields();
			if (val == 1 ){
				var str = $("#sation-infos-form").serialize();
				//alert(str);
				app.utils.addStationInfos(str);
				app.utils.myObservationsOnMap(app.collections.stations);
				app.views.protocolChoiceView = new app.Views.ProtocolChoiceView({collection:app.collections.protocolsList});
				app.utils.RegionManager.show(app.views.protocolChoiceView);
				app.global.lastView = "proto-choice";
			}
			else {
				alert ("Please enter data in the empty fields ");
			}
		} 
		else {
			app.views.protocolChoiceView = new app.Views.ProtocolChoiceView({collection:app.collections.protocolsList});
			app.utils.RegionManager.show(app.views.protocolChoiceView);
			app.global.lastView = "proto-choice";
		}
	},
	stationInfos : function(){
		// check fields content
		var val = app.utils.validateFields();
		if (val == 1 ){
				// default date
			//var currentDate = new Date();  
			 var str = $("#sation-position-form").serialize();
			app.utils.generateStation(str);
			app.views.stationInfosView = new app.Views.StationInfosView();
			app.utils.RegionManager.show(app.views.stationInfosView);
			app.global.lastView = "stationInfos";
			//set the date
			$(".datepicker").datepicker();
			$(".datepicker").css('clip', 'auto'); 
			var currentDate = new Date();
			$(".datepicker").datepicker("setDate",currentDate);
			// set the time
			app.utils.getTime();
		}
		else {
			alert ("Please wait to have coordiantes or check GPS if is not activated !");
		}
		// si le nombre d'observateurs est parametré > 1, il faut mettre à jour le formulaire
		var nbObservers = app.global.nbObs ; 
		//alert(" nb Obs : " + nbObservers);
		app.utils.updateNbObservers(nbObservers);
	},
	dataEntry : function(){
		app.views.dataEntryView = new app.Views.DataEntryView({model: app.models.station});
		app.utils.RegionManager.show(app.views.dataEntryView);
	},
	mapStations : function(){
		app.views.mapStationsView = new app.Views.MapStationsView();
		app.utils.RegionManager.show(app.views.mapStationsView);
		$('div#content').css({'background-image':''});
		//$('#spnmap').css('height', '600px');
		
		$('#map').css('width', '800px');
		$('#map').css('height', '600px');
		//initMap();
		app.utils.initMap();
		//app.map.zoomTo(15);
		//app.map.updateSize();
		
		
		//app.map.zoomOut();
		app.utils.myObservationsOnMap(app.collections.stations);
	}
 });
 
 return app;
})(ecoReleveData);