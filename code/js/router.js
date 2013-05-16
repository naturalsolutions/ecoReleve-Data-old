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
		"updateData" : "updateData",
		"conf": "configuration"
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
		$('.page.secondary .page-region .page-region-content').css({ 'padding-left': '80px'});
	
	},
	entryStation: function(){
		//try {
			debugger;
				// set users list
			app.global.usersTab = new Array();
			app.collections.users.each(function(user){
				var userName = user.get('name');
				app.global.usersTab.push(userName);
			});
			
			
			app.views.main = new Backbone.Layout({
				template: "#main-layout"
			});
			$("#content").empty().append(app.views.main.el);
			app.views.main.setView(".layoutContent", new app.Views.StationPositionView({usersTab : app.global.usersTab}));
			app.views.main.render();
			
			app.models.location = new app.Models.Location();
			app.locationForm = new Backbone.Form({
				model: app.models.location
			}).render();
			$('#locationForm').append(app.locationForm.el);

			/*
			app.views.stationPositionView = new app.Views.StationPositionView();
			app.utils.RegionManager.show(app.views.stationPositionView);
			*/
			//initMap();
			app.utils.initMap();
			$('#map').css('width', '780px');
			$('#map').css('height', '250px');
			app.utils.myPositionOnMap();
			//app.global.lastView = "entryStation";
			$('div#content').css({'background-image':''});
			//$('.page.secondary .page-region .page-region-content').css({ 'padding-left': '5px'});
		
		/*}catch (e) {
			app.router.navigate('', {trigger: true});
		}*/
	
	},
	stationInfos : function(){
	/*	try {

				*/
				app.views.main = new Backbone.Layout({
					template: "#main-layout"
				});
				$("#content").empty().append(app.views.main.el);
				app.views.main.setView(".layoutContent", new app.Views.StationInfosView());
				app.views.main.render();
				
				//app.views.main.render();
			debugger;
				// Station info form 
				app.stationForm = new Backbone.Form({
						model: app.models.station
				}).render();

				$('#stationForm').append(app.stationForm.el);
				//app.global.lastView = "stationInfos";
				//set the default date
				var inputDate = $('input[name*="date_day"]');
				$(inputDate).datepicker();
				$(inputDate).css('clip', 'auto'); 
				var currentDate = new Date();
				$(inputDate).datepicker("setDate",currentDate);
				// set the default time
				app.utils.getTime('time_now');

			/*}
			else {
				alert ("Please wait to have coordiantes or check GPS if is not activated !");
			}
			// si le nombre d'observateurs est parametré > 1, il faut mettre à jour le formulaire
			var nbObservers = app.global.nbObs ; 
			//alert(" nb Obs : " + nbObservers);
			app.utils.updateNbObservers(nbObservers);  */
		/*}catch (e) {
			
			app.router.navigate('', {trigger: true});
		}*/
	},
	protoChoice : function(){
		try {
			var protoSelectionLayout = new Backbone.Layout({
				template: "#msgBox-protocols-choice",
				collection:app.collections.protocolsList
			});
			// Attach Layout to the DOM.
			
			
			if (app.global.lastView == "stationInfos"){

					//var str = $("#sation-infos-form").serialize();
					//alert(str);
					//app.utils.addStationInfos(str);
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
			app.router.navigate('#', {trigger: true});
		}
	},
	dataEntry : function(id){
	//	try {
			debugger;
			app.views.dataEntryLayout= new Backbone.Layout({
			template: "#data-entry-layout"
			});
			$("#content").empty().append(app.views.dataEntryLayout.el);

			var tplStation = _.template($('#data-entry-station').html());
			var tplProtoForm = _.template($('#data-entry-protocol').html());
			app.views.dataEntryLayout.setView(".station", new app.Views.DataEntryStationView({template:tplStation, model: app.models.station}));

			app.views.dataEntryLayout.setView(".protocol", new app.Views.DataEntryProtocolView({template:tplProtoForm , model: app.collections.protocolsList.get(id), pictureSource: app.global.pictureSource, destinationType : app.global.destinationType}));

			
			app.views.dataEntryLayout.render();	
			// formulaire de saisie
			var currentModel = app.collections.protocolsList.get(id);
			app.form = new Backbone.Form({
						model: currentModel
						
			}).render();
			$('#frm').append(app.form.el);
			// set default values in form fields
			debugger;
			var schema = currentModel.schema;
			for(var prop in schema){
				if ( typeof  schema[prop]["value"] !=="undefined"){
					var defaultValue = schema[prop]["value"];
					$( "[name='" + prop + "']" ).val(defaultValue);
				}
			}
	/*	}catch (e) {
			app.router.navigate('#', {trigger: true}); 
		}*/
		
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
			app.router.navigate('#', {trigger: true});
		}
	},
	mydata : function(){
		//try {
			$('div#content').css({'background-image':''});
			/*app.views.myDataLayout= new Backbone.Layout({
			template: "#my-data-layout"
			});*/
			/*
			app.views.myDataLayout = new Backbone.Layout({
				template: "#my-data-layout"
			});*/
			//app.views.myDataLayout = new app.Views.MyDataLayout({collection: app.collections.observations});
			$("#content").empty().append(app.views.myDataLayout.el);
				
			// filter view
			
			/*
			var tplFilterView = _.template($('#my-data-filter-template').html()); 
			app.views.myDataLayout.setView(".filter", new app.Views.MyDataFilterView({template:tplFilterView}));
			app.views.myDataLayout.render();
			*/
			
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

			debugger;
			//var tplFilterView = _.template($('#my-data-filter-template').html()); 

			app.views.myDataLayout.setView(".gridview", new app.Views.MyDataGridView({ collection: app.collections.observations, protoIdList : protoIdList}));
			//app.views.myDataLayout.render();	
			debugger;
			//app.views.myDataLayout.setView(".filterView", new app.Views.MyDataFilterView({}));
			
			app.views.myDataLayout.render();
			
			//set the date
			
			$(".datepicker").datepicker();
			$(".datepicker").css('clip', 'auto'); 
			var currentDate = new Date();
			$(".datepicker").datepicker("setDate",currentDate);
			
		

		
		/*}catch (e) {
			app.router.navigate('#', {trigger: true});
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
			app.router.navigate('#', {trigger: true});
		}
	},
	configuration : function(){
		try {
			debugger;
			$('div#content').css({'background-image':''});
			app.views.configdataLayout= new Backbone.Layout({
				template: "#config-data-layout"
			});
			$("#content").empty().append(app.views.configdataLayout.el);
			
			var tplview = _.template($('#config-list-template').html()); 
			app.views.configdataLayout.setView(".configList", new app.Views.ConfigListView ({template:tplview}));
			
			/*
			var tplview = _.template($('#users-template').html()); 
			this.articlesView = new app.Views.Users({ template : tplview, collection: app.collections.users });
			app.views.dataUpdateLayout.setView(".updateDataGridView", new app.Views.UpdateDataView({template:tplview}));
			//var tplview = _.template($('#update-data-template').html()); 
			//app.views.dataUpdateLayout.setView(".updateDataGridView", new app.Views.UpdateDataView({template:tplview}));*/
			app.views.configdataLayout.render();
		}catch (e) {
			app.router.navigate('#', {trigger: true});
		}
	}
	
	
	
	
	
	
	
 });
 
 return app;
})(ecoReleveData);