 var ecoReleveData = (function(app) {
    "use strict";
 
 app.Router = Backbone.Router.extend({
	routes: {
		"": "home" ,
		"entryStation": "entryStation",
		"stationInfos": "stationInfos",
		"proto-choice": "protoChoice",
		"data-entry/:id": "dataEntry",
		"map-stations": "mapStations",
		"mydata":"mydata",
		"msgBox" : "alert",
		"updateData" : "updateData"
	},
	initialize: function(options){
	//	this.appView = options.appView;
	},
	home: function(){
		// initialiser point openlayers
		app.point = new OpenLayers.LonLat(5.37,43.29);
		
		
		/*
		app.views.dataEntryLayout= new Backbone.Layout({
		template: "#data-entry-layout"
		});
		$("#content").empty().append(app.views.dataEntryLayout.el);
		//app.views.dataEntryLayout.render();
		//app.utils.RegionManager.show(app.views.dataEntryLayout);

		app.views.dataEntryLayout.setView(".station", new app.Views.HomeView());
		app.views.dataEntryLayout.render();	
		
		*/
		
		// Create the Layout.
		app.views.main = new Backbone.Layout({
			template: "#main-layout"
		});
		// Attach Layout to the DOM.
		$("#content").empty().append(app.views.main.el);
		//var homeTemplate = _.template($('#home-template').html());
		app.views.main.setView(".layoutContent", new app.Views.HomeView());
		app.views.main.render();
			
		
		
		/*
		app.views.homeView = new app.Views.HomeView();
		app.utils.RegionManager.show(app.views.homeView); 
		*/
		
		// calculate number of stored stations
		var ln = app.collections.observations.length;
		$('#badgeMyData').text(ln);
		// image de fond
			var height = screen.height;
			var width = screen.width;
			$('body').css({'height':height, 'width': width });
			$('div#content').css({'height':height, 'width': width });
		$('div#content').css({'background-image':'url(images/home_imgFond.jpg)','background-repeat':'no-repeat','background-position':'center center', 'background-size':'100% 100%'});
	},
	entryStation: function(){
		try {
		
			app.views.main.setView(".layoutContent", new app.Views.StationPositionView());
			app.views.main.render();
			
			/*
			app.views.stationPositionView = new app.Views.StationPositionView();
			app.utils.RegionManager.show(app.views.stationPositionView);
			*/
			//initMap();
			app.utils.initMap();
			$('#map').css('width', '780px');
			$('#map').css('height', '250px');
			app.utils.myPositionOnMap();
			app.global.lastView = "entryStation";
			$('div#content').css({'background-image':''});
		
		}catch (e) {
			app.router.navigate("");
			location.reload(); 
		}
	
	},
	stationInfos : function(){
		try {
		// check fields content
			var val = app.utils.validateFields();
			if (val == 1 ){
					// default date
				//var currentDate = new Date();  
				 var str = $("#sation-position-form").serialize();
				app.utils.generateStation(str);
				/*
				app.views.stationInfosView = new app.Views.StationInfosView();
				app.utils.RegionManager.show(app.views.stationInfosView);
				*/
				
				app.views.main.setView(".layoutContent", new app.Views.StationInfosView());
				app.views.main.render();
				
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
		}catch (e) {
			
			app.router.navigate("");
			location.reload(); 
		}
	},
	protoChoice : function(){
		try {
			var protoSelectionLayout = new Backbone.Layout({
				template: "#msgBox-protocols-choice",
				collection:app.collections.protocolsList
			});
			// Attach Layout to the DOM.
			
			
			if (app.global.lastView == "stationInfos"){
				var val = app.utils.validateFields();
				if (val == 1 ){
					var str = $("#sation-infos-form").serialize();
					//alert(str);
					app.utils.addStationInfos(str);
					//app.utils.myObservationsOnMap(app.collections.stations);
					/*
					app.views.main.setView(".layoutContent", new app.Views.ProtocolChoiceView({collection:app.collections.protocolsList}));
					app.views.main.render();
					*/
					
					$("#content").empty().append(protoSelectionLayout.el);
					//var homeTemplate = _.template($('#home-template').html());
					//protoSelectionLayout.setView(".listview", app.Views.ListView({collection:app.collections.protocolsList}));
					protoSelectionLayout.render();
					var listview = new app.Views.ListView({collection:app.collections.protocolsList});
					protoSelectionLayout.setView(".listview", listview);
					protoSelectionLayout.render();
					
					
					
					
					
					/*
					app.views.protocolChoiceView = new app.Views.ProtocolChoiceView({collection:app.collections.protocolsList});
					app.utils.RegionManager.show(app.views.protocolChoiceView);
					*/
					app.global.lastView = "proto-choice";
				}
				else {
					alert ("Please enter data in the empty fields ");
				}
			} 
			else {
				
				$("#content").empty().append(protoSelectionLayout.el);
				protoSelectionLayout.render();
				var listview = new app.Views.ListView({collection:app.collections.protocolsList});
				protoSelectionLayout.setView(".listview", listview);
				protoSelectionLayout.render();
				
				/*
				app.views.main.setView(".layoutContent", new app.Views.ProtocolChoiceView({collection:app.collections.protocolsList}));
				app.views.main.render();
					
				app.views.protocolChoiceView = new app.Views.ProtocolChoiceView({collection:app.collections.protocolsList});
				app.utils.RegionManager.show(app.views.protocolChoiceView);
				*/
				app.global.lastView = "proto-choice";
			}
		}catch (e) {
			app.router.navigate("#");
			location.reload(); 
		}
	},
	dataEntry : function(id){
		try {
			app.views.dataEntryLayout= new Backbone.Layout({
			template: "#data-entry-layout"
			});
			$("#content").empty().append(app.views.dataEntryLayout.el);

			var tplStation = _.template($('#data-entry-station').html());
			var tplProtoForm = _.template($('#data-entry-protocol').html());
			app.views.dataEntryLayout.setView(".station", new app.Views.DataEntryStationView({template:tplStation, model: app.models.station}));

			app.views.dataEntryLayout.setView(".protocol", new app.Views.DataEntryProtocolView({template:tplProtoForm , model: app.collections.protocolsList.get(id)}));

			
			app.views.dataEntryLayout.render();	
			// formulaire de saisie
			app.form = new Backbone.Form({
						model: app.collections.protocolsList.get(id)

			}).render();

			$('#frm').append(app.form.el);
		}catch (e) {
			app.router.navigate("#");
			location.reload(); 
		}
		
	},
	mapStations : function(){
		try {
			/*
			app.views.mapStationsView = new app.Views.MapStationsView();
			app.utils.RegionManager.show(app.views.mapStationsView);
			*/
			app.views.main.setView(".layoutContent", new app.Views.MapStationsView());
			app.views.main.render();
			
			$('div#content').css({'background-image':''});
			
			$('#map').css('width', '800px');
			$('#map').css('height', '600px');

			app.utils.initMap();

			app.utils.myObservationsOnMap(app.collections.stations);
		}catch (e) {
			app.router.navigate("#");
			location.reload(); 
		}
	},
	mydata : function(){
		//try {
			$('div#content').css({'background-image':''});
			app.views.myDataLayout= new Backbone.Layout({
			template: "#my-data-layout"
			});
			$("#content").empty().append(app.views.myDataLayout.el);
			// gridview
			
			// sort observations collection by protocol id & create an array of protocols id
		
			
			//var protocolsIdList = new Array();
			var sortedCollection = app.collections.observations.sortBy(function(obs){
				//var protoId = obs.get("protoId");
				//protocolsIdList.push(protoId);
				return obs.get("protoId"); ;
			});
			// get uniq values of protocols id
			//_.uniq(protocolsIdList);
			// filter obs collection with proto id ="1"
			// get list of protocols Id
			var protoIdList  = app.collections.observations.map(function(model){
			  return model.get('protoId');
			});
			// uniq values
			protoIdList = _.uniq(protoIdList);

			/*
			var newColl = _.filter(sortedCollection, function (obs) {
				return obs.attributes.protoId === "1";
			});
			*/

			

			app.views.myDataLayout.setView(".gridview", new app.Views.MyDataGridView({ collection: app.collections.observations, protoIdList : protoIdList}));
			app.views.myDataLayout.render();	
		
		/*}catch (e) {
			app.router.navigate("#");
			location.reload(); 
		}*/
	},
	alert: function(){
		app.views.main.setView(".layoutContent",new app.Views.AlertView());
		app.views.main.render();
		/*
		app.views.alertView = new app.Views.AlertView();
		app.utils.RegionManager.show(app.views.alertView);*/
	},
	updateData : function(){
		try {
			$('div#content').css({'background-image':''});
			app.views.dataUpdateLayout= new Backbone.Layout({
				template: "#update-data-layout"
			});
			$("#content").empty().append(app.views.dataUpdateLayout.el);
			var tplview = _.template($('#update-data-template').html()); 
			app.views.dataUpdateLayout.setView(".updateDataGridView", new app.Views.UpdateDataView({template:tplview}));
			app.views.dataUpdateLayout.render();
		}catch (e) {
			app.router.navigate("#");
			location.reload(); 
		}
	}
 });
 
 return app;
})(ecoReleveData);