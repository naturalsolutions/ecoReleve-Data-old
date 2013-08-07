 var ecoReleveData = (function(app) {
    //"use strict";
 
 app.Router = Backbone.Router.extend({
	routes: {
		"": "home" ,
		"stationType" : "stationType",
		"entryStation": "entryStation",
		"stationFromGpx" : "stationFromGpx",
		"stationInfos": "stationInfos",
		"stationInfos/:id" : "monitoredStation",
		"proto-choice": "protoChoice",
		"data-entry/:id": "dataEntry",
		"map": "mapMyPosition",
		"mydata":"mydata",
		"msgBox" : "alert",
		"updateData" : "updateData",
		"uploadData" :"uploadData",
		"config": "configuration",
		"configurl" : "configurl",
		"configProtos" : "configProtos",
		"dataEdit/:id" : "dataEdit",
		"indiv" : "indiv",
		"allData" : "allData"
		
	},
	initialize: function(options){
	//	this.appView = options.appView;
	},
	home: function(){
		// initialiser point openlayers
		//app.point = new OpenLayers.LonLat(5.37,43.29);
		
		// Create the Layout.
		app.views.main = new Backbone.Layout({
			template: "#main-layout"
		});
		// Attach Layout to the DOM.
		$("#content").empty().append(app.views.main.el);
		//var homeTemplate = _.template($('#home-template').html());
		app.views.main.setView(".layoutContent", new app.Views.HomeView());
		app.views.main.render();

		// calculate number of stored stations
		var ln = app.collections.observations.length;
		$('#badgeMyData').text(ln);
		// set users list
		app.global.usersTab = new Array();
		app.collections.users.each(function(user){
			var userName = user.get('name');
			app.global.usersTab.push(userName);
		});
		// image de fond
			var height = screen.height;
			var width = screen.width;
			$('body').css({'height':height, 'width': width });
			$('body').css({'height':height, 'width': width });
		$('body').css({'background-image':'url(images/home_imgFond.jpg)','background-repeat':'no-repeat','background-position':'center center', 'background-size':'100% 100%'});
		$('.page.secondary .page-region .page-region-content').css({ 'padding-left': '80px'});
	
	},
	stationType : function(){
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
		app.views.main.setView(".layoutContent", new app.Views.StationTypeView());
		app.views.main.render();
		$('body').css({'background-image':''});
	},
	entryStation: function(){
		//try {
		// initialiser point openlayers
		app.point = new OpenLayers.LonLat(5.37,43.29);			
				
			app.views.main = new Backbone.Layout({
				template: "#main-layout"
			});
			$("#content").empty().append(app.views.main.el);
			app.views.main.setView(".layoutContent", new app.Views.StationPositionView());
			
			
			app.models.location = new app.Models.Location();
			app.models.location.id ="1";
			app.models.location.constructor.schema = app.models.location.schema;	
			var myView = new app.Views.LocationFormView({initialData:app.models.location, usersTab : app.global.usersTab});
			app.views.main.setView("#locationForm",myView );
			app.views.main.render();
			$("#locationSubmit").on("click", $.proxy(myView.onSubmit, myView));
			$("div .form-actions").css("display","none");
			/*
				app.views.main = new Backbone.Layout({
					template: "#main-layout"
				});
				// Attach Layout to the DOM.
				$("#content").empty().append(app.views.main.el);
				//var homeTemplate = _.template($('#home-template').html());
				//app.views.main.setView(".layoutContent", new app.Views.HomeView());
				app.views.main.setView("#obs-form", new app.views.FormView({initialData:app.models.station}));
				app.views.main.render();
			

			app.locationForm = new Backbone.Form({
				model: app.models.location
			}).render();
			$('#locationForm').append(app.locationForm.el);

			*/
			

			app.utils.initMap();
			//$('#map').css('width', '780px');
			$('#map').css('height', '350px');
			app.utils.myPositionOnMap();
			//app.global.lastView = "entryStation";
			$('body').css({'background-image':''});
			//$('.page.secondary .page-region .page-region-content').css({ 'padding-left': '5px'});
		
		/*}catch (e) {
			app.router.navigate('', {trigger: true});
		}*/
	
	},
	stationFromGpx : function(){
		// initialiser point openlayers
		app.point = new OpenLayers.LonLat(5.37,43.29);
		app.views.main = new Backbone.Layout({
				template: "#main-layout"
		});
		$("#content").empty().append(app.views.main.el);
		debugger;
		app.views.main.setView(".layoutContent", new app.Views.StationFromFile({collection : app.collections.waypointsList , usersTab : app.global.usersTab}));
		app.views.main.render();
		// init map
		$('#map').css('height', '600px');
		$('.container, .navbar-static-top .container, .navbar-fixed-top .container, .navbar-fixed-bottom .container').css('width','100%');

		var initalizers = [];
		initalizers.push(app.utils.initMap());
		// load waypoints in map
		$.when.apply($, initalizers).done(function() {
			app.utils.addWaypoints(app.collections.waypointsList);
		});
	},
	stationInfos : function(){
	/*	try {

				*/
				app.views.main = new Backbone.Layout({
					template: "#main-layout"
				});
				$("#content").empty().append(app.views.main.el);
				app.views.main.setView(".layoutContent", new app.Views.StationInfosView());
				
				
				//app.views.main.render();
			debugger;
				// Station info form 
				var myView = new app.Views.StationFormView({initialData:app.models.station});
				app.views.main.setView("#stationForm",myView );
				app.views.main.render();
				
				$("#stationInfoSubmit").on("click", $.proxy(myView.onSubmit, myView));
				$("div .form-actions").css("display","none");
				
				/*
				app.stationForm = new Backbone.Form({
						model: app.models.station
				}).render();

				$('#stationForm').append(app.stationForm.el);
				//app.global.lastView = "stationInfos";
				//set the default date
				*/
				
				
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
	monitoredStation : function(id){
		//alert("id station : "+ id);
		//collection : app.collections.waypointsList , usersTab : app.global.usersTab
		debugger;
		var usersList = app.global.usersTab ; 
		var selectedStation = app.collections.waypointsList.get(id);
		var wptName = selectedStation.get("name");
		var wptLatitude = selectedStation.get("latitude");
		var wptLongitude = selectedStation.get("longitude");
		var wptTime = selectedStation.get("waypointTime");
			
			app.models.station = new app.Models.Station();
			var schema = {
				station_name:  { type: 'Text', title:'Station name'},  
				field_activity: { type: 'Text', title:'Field activity'}, 
				date_day: { type: 'Text', title:'Date'},
				time_now: { type: 'Text', title:'Time'},
				Observer_1: { type: 'Select' , title:'Observer 1', options: usersList, required : true },
				Observer_2: { type: 'Select' , title:'Observer 2', options: usersList, validators: [] },
				Observer_3: { type: 'Select' , title:'Observer 3', options: usersList },
				Observer_4: { type: 'Select' , title:'Observer 4', options: usersList },
				Observer_5: { type: 'Select' , title:'Observer 5', options: usersList }
			} ;
			app.models.station.constructor.schema = schema ;
			app.models.station.schema = schema ;
			debugger;
			app.models.station.set("station_name",wptName);
			app.models.station.set("id",id);
			var nbStoredStations = app.collections.stations.length;
			// store coordinates in location model
			app.models.location = new app.Models.Location();
			app.models.location.id ="2";
			app.models.location.constructor.schema = app.models.location.schema;
			app.models.location.set("latitude",wptLatitude);
			app.models.location.set("longitude",wptLongitude);
			// identifiant de la station 
			//var idStation = nbStoredStations + 1 ; 
			//app.models.station.set("latitude",wptLatitude );
			//app.models.station.set("longitude",wptLongitude );
			// update station : used = true
			var waypointModel = app.collections.waypointsList.get(id);
			waypointModel.set("used", true);
			waypointModel.save();
			
			
			app.global.selectedStationId = id;
			app.router.navigate('stationInfos', {trigger: true});
		
		
	}, 
	protoChoice : function(){
		try {
			var protoSelectionLayout = new Backbone.Layout({
				template: "#msgBox-protocols-choice",
				collection:app.collections.protocolsList
			});
			// Attach Layout to the DOM.
			
			
			if (app.global.lastView == "stationInfos"){

					$("#content").empty().append(protoSelectionLayout.el);
					//var homeTemplate = _.template($('#home-template').html());
					//protoSelectionLayout.setView(".listview", app.Views.ListView({collection:app.collections.protocolsList}));
					protoSelectionLayout.render();
					var listview = new app.Views.ListView({collection:app.collections.protocolsList});
					protoSelectionLayout.setView(".listview", listview);
					protoSelectionLayout.render();
					app.global.lastView = "proto-choice";
			} 
			else {
				
				$("#content").empty().append(protoSelectionLayout.el);
				protoSelectionLayout.render();
				var listview = new app.Views.ListView({collection:app.collections.protocolsList});
				protoSelectionLayout.setView(".listview", listview);
				protoSelectionLayout.render();
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
			//var tplProtoForm = _.template($('#data-entry-protocol').html());
			app.views.dataEntryLayout.setView(".station", new app.Views.DataEntryStationView({template:tplStation, model: app.models.station}));

			//app.views.dataEntryLayout.setView(".protocol", new app.Views.DataEntryProtocolView({template:tplProtoForm , model: app.collections.protocolsList.get(id), pictureSource: app.global.pictureSource, destinationType : app.global.destinationType}));

			debugger;
			// formulaire de saisie
			var currentModel = app.collections.protocolsList.get(id);
			currentModel.constructor.schema = currentModel.schema;
			currentModel.constructor.verboseName  = currentModel.attributes.name;
			var myView = new app.Views.ProtocolFormView({initialData:currentModel});
			app.views.dataEntryLayout.setView(".protocol",myView );
			app.views.dataEntryLayout.render();
				
			$("#protocolSubmit").on("click", $.proxy(myView.onSubmit, myView));
			$("div .form-actions").css("display","none"); 
			
			var currentModelName = currentModel.attributes.name ;
			$('#data-entry-protocol').html('<a>Station > data entry > ' + currentModelName + '</a>');
			// set default values in form fields & generate fielset list for the current protocol to enhance UI
			var fieldsetList = new Array();
			var schema = currentModel.schema;
			/*
			for(var prop in schema){
				if ( typeof  schema[prop]["value"] !=="undefined"){
					var defaultValue = schema[prop]["value"];
					$( "[name='" + prop + "']" ).val(defaultValue);
				}
				// add fieldset to fieldsetList
				var myfieldSet = schema[prop]["fieldset"];
				fieldsetList.push(myfieldSet);
			}
			
			var distinctFieldsetList = new Array();
			distinctFieldsetList = fieldsetList.distinct();
			// array to be used to generate fielsets list
			var fieldsets = new Array();
			var ln = distinctFieldsetList.length;
			var  ul = $('<ul/>');
			for (var i = 0; i< ln; i++){
				var fieldSetObject = {};
				var fields = new Array();
				var fieldSetName = distinctFieldsetList[i];
				fieldSetObject.legend = fieldSetName;
				for(var prop in schema){
					if ( schema[prop]["fieldset"] ==fieldSetName){
						//var fieldName  = schema[prop]["name"];
						var fieldName  = prop ;
						fields.push(fieldName);
					}
					fieldSetObject.fields = fields;
				}
				fieldsets.push(fieldSetObject);
			//
			ul.append('<li><a >' + fieldSetName +'</a></li>');
			
			}
			$("#navigation").append(ul);
			currentModel.fieldsets = fieldsets;
			app.form = new Backbone.Form({
						model: currentModel
						
			}).render();
			$('#steps').append(app.form.el);
			// execute plugin slideform
			// create controls to slide the form
			
			slideForm ();
			
			// step width
			$(".step").attr("width","1000px");
			
			*/

	/*	}catch (e) {
			app.router.navigate('#', {trigger: true}); 
		}*/
		
	},
	mapMyPosition : function(){
		// initialiser point openlayers
		app.point = new OpenLayers.LonLat(5.37,43.29);
		$('body').css({'background-image':''});
		app.views.main.setView(".layoutContent", new app.Views.MapStationsView());
		app.views.main.render();
		
		$('div#content').css({'background-image':''});
		
		//$('#map').css('width', '800px');
		$('#map').css('height', '600px');

		app.utils.initMap();
		app.utils.myPositionOnMap();
	},
	mydata : function(){
		//try {
			// initialiser point openlayers
			app.point = new OpenLayers.LonLat(5.37,43.29);
			$('body').css({'background-image':''});
			$("#content").empty().append(app.views.myDataLayout.el);
			
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
			var tplFilterView = _.template($('#my-data-filter-template').html()); 
			app.views.myDataLayout.setView(".gridview", new app.Views.MyDataGridView({template :tplFilterView,  collection: app.collections.observations, protoIdList : protoIdList}));
			//app.views.myDataLayout.render();	
			debugger;
			//app.views.myDataLayout.setView(".filterView", new app.Views.MyDataFilterView({}));
			
			app.views.myDataLayout.render();
			
			//set the date
			
			$(".datepicker").datepicker();
			$(".datepicker").css('clip', 'auto'); 
			var currentDate = new Date();
			$(".datepicker").datepicker("setDate",currentDate);
			
			$('.navbar-inner').css({ 'background-image': '#ffc40d'});
			$('.navbar-inner').css({ 'background': '#ffc40d'});
		
			
		
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
			$('body').css({'background-image':''});
			//$('div#content').css({'background-image':''});
			app.views.dataUpdateLayout= new Backbone.Layout({
				template: "#update-data-layout"
			});
			$("#content").empty().append(app.views.dataUpdateLayout.el);
			var tplview = _.template($('#update-data-template').html()); 
			app.views.dataUpdateLayout.setView(".container", new app.Views.UpdateDataView({template:tplview}));
			app.views.dataUpdateLayout.render();
			//
			$(".thumbnails > li.tile").css({"text-align": "left"});
			$(".tile-double.icon > a > img ").css({"top": "40%"});
			
			$('.navbar-inner').css({ 'background-image': '#f09609'});
			$('.navbar-inner').css({ 'background': '#f09609'});
			// update gps file import date

			var newDate = localStorage.getItem("gpxLastImportDate");
			if (newDate !='null'){
				$("#gpxImportDate").text("last update: " + newDate);
			} else {
				$("#gpxImportDate").text("");
			}
		}catch (e) {
			app.router.navigate('#', {trigger: true});
		}
	},
	uploadData : function(){
		try {
			$('body').css({'background-image':''});
			//$('div#content').css({'background-image':''});
			app.views.dataUploadLayout= new Backbone.Layout({
				template: "#upload-data-layout"
			});
			// sort observations collection by protocol id & create an array of protocols id
			var sortedCollection = app.collections.observations.sortBy(function(obs){
				return obs.get("protoId"); ;
			});
			// get uniq values of protocols id
			var protoIdList  = app.collections.observations.map(function(model){
			  return model.get('protoId');
			});
			// uniq values
			protoIdList = _.uniq(protoIdList);
			
			$("#content").empty().append(app.views.dataUploadLayout.el);
			var tplview = _.template($('#upload-data-template').html()); 
			app.views.dataUploadLayout.setView(".uploadDataGridView", new app.Views.UploadDataView({template:tplview, fileSystem : app.global.fileSystem, collection: app.collections.observations, protoIdList : protoIdList, stations : app.collections.stations}));
			app.views.dataUploadLayout.render();
			$('.navbar-inner').css({ 'background-image': 'red'});
			$('.navbar-inner').css({ 'background': 'red'});
		}catch (e) {
			app.router.navigate('#', {trigger: true});
		}
	},
	configuration : function(){
		try {
			debugger;
			$('body').css({'background-image':''});
			

			//$('div#content').css({'background-image':''});
			app.views.configdataLayout= new Backbone.Layout({
				template: "#config-data-layout"
			});
			$("#content").empty().append(app.views.configdataLayout.el);
			
			var tplview = _.template($('#config-list-template').html()); 
			app.views.configdataLayout.setView(".container", new app.Views.ConfigListView ({template:tplview}));
			
			/*
			var tplview = _.template($('#users-template').html()); 
			this.articlesView = new app.Views.Users({ template : tplview, collection: app.collections.users });
			app.views.dataUpdateLayout.setView(".updateDataGridView", new app.Views.UpdateDataView({template:tplview}));
			//var tplview = _.template($('#update-data-template').html()); 
			//app.views.dataUpdateLayout.setView(".updateDataGridView", new app.Views.UpdateDataView({template:tplview}));*/
			app.views.configdataLayout.render();
			$('.navbar-inner').css({ 'background-image': '#2E8BCC'});
			$('.navbar-inner').css({ 'background': '#2E8BCC'});
		//	$('.navbar-inner').css({ 'background-image': "-webkit-gradient(linear, left top, left bottom, from(#2E8BCC), to(#2E8BCC)"});
			$(".thumbnails > li.tile").css({"text-align": "left"});
			$(".tile.icon > a > img ").css({"top": "40%"});
					// check if server url is stored
			var serverUrl = localStorage.getItem( "serverUrl");
			if ((serverUrl === undefined) || (serverUrl ==null)){
				alert ("Please configurate the server url");
			}
		}catch (e) {
			app.router.navigate('#', {trigger: true});
		}
	},
	configurl : function(id){
		app.views.configdataLayout= new Backbone.Layout({
				template: "#config-data-layout"
		});
		$("#content").empty().append(app.views.configdataLayout.el);
		var tplview = _.template($('#config-url-template').html()); 
		app.views.configdataLayout.setView(".container", new app.Views.ConfigUrlView  ({template:tplview}));
		var MyModel = Backbone.Model.extend({},{
			schema: {
				url:{ type: 'Text', title:'Input server url'}
			},
			verboseName: 'Server Url'
		});	
		var myModel = new MyModel();
		//myModel.constructor.schema = myModel.schema;	
		var myView = new app.Views.ServerFormView({initialData:myModel});
		app.views.configdataLayout.setView("#fromUrlServer",myView );
		app.views.configdataLayout.render();
		$('.navbar-inner').css({ 'background-image': '#2E8BCC'});
		$('.navbar-inner').css({ 'background': '#2E8BCC'});
		$("#saveServerUrl").on("click", $.proxy(myView.onSubmit, myView));
		$("div .form-actions").css("display","none");
	},
	configProtos : function(id){
		try {
			$('body').css({'background-image':''});
			app.views.configdataLayout= new Backbone.Layout({
				template: "#config-data-layout"
			});
			$("#content").empty().append(app.views.configdataLayout.el);
			
			var tplview = _.template($('#config-protos-template').html()); 
			app.views.configdataLayout.setView(".container", new app.Views.ConfigProtocols ({template:tplview}));
			app.views.configdataLayout.render();
			$('.navbar-inner').css({ 'background-image': '#2E8BCC'});
			$('.navbar-inner').css({ 'background': '#2E8BCC'});
		
			var serverUrl = localStorage.getItem( "serverUrl");
			if ((serverUrl === undefined) || (serverUrl ==null)){
				alert ("Please configurate the server url");
			}
		}catch (e) {
			app.router.navigate('#', {trigger: true});
		}
	
	
	},
	dataEdit : function(id){
		// id correspond to obs id: find proto id and station id
		var protoId, stationId;
		var obsToEdit = new app.Models.Observation();
		obsToEdit = app.collections.observations.get(id);
		//obsToEdit.destroy();
		protoId = obsToEdit.get("protoId");
		stationId = obsToEdit.get("stationId");
		//alert (" obs id : " + id + " proto id : " + protoId + " station id : " + stationId );
		var station = new app.Models.Station();
		station = app.collections.stations.get(stationId);
		var protocol = new app.Models.Protocol();
		protocol = app.collections.protocolsList.get(protoId);
		
		app.global.selectedProtocolId = protocol.get("id");
		app.global.selectedProtocolName = protocol.get("name");

		app.views.dataEntryLayout= new Backbone.Layout({
		template: "#data-entry-layout"
		});
		$("#content").empty().append(app.views.dataEntryLayout.el);

		var tplStation = _.template($('#data-entry-station').html());
		var tplProtoForm = _.template($('#data-entry-protocol').html());
		app.views.dataEntryLayout.setView(".station", new app.Views.DataEntryStationView({template:tplStation, model: station }));
		app.views.dataEntryLayout.setView(".protocol", new app.Views.DataEntryProtocolView({template:tplProtoForm , model: protocol, obsId : id, pictureSource: app.global.pictureSource, destinationType : app.global.destinationType}));
		app.views.dataEntryLayout.render(); 
		
		
		// formulaire de saisie
			//var currentModel = app.collections.protocolsList.get(id);
			protocol.constructor.schema = protocol.schema;
			protocol.constructor.verboseName  = protocol.attributes.name;
			var myView = new app.Views.ProtocolFormView({initialData:protocol, obsId : id});
			app.views.dataEntryLayout.setView(".protocol",myView );
			app.views.dataEntryLayout.render();
				
			$("#protocolSubmit").on("click", $.proxy(myView.onSubmit, myView));
			$("div .form-actions").css("display","none"); 
			
			var currentModelName = protocol.attributes.name ;
			$('#data-entry-protocol').html('<a>Station > data entry > ' + currentModelName + '</a>');
			// set default values in form fields & generate fielset list for the current protocol to enhance UI
			var fieldsetList = new Array();
			var schema = protocol.schema;
		
		// formulaire de saisie
/*
		app.form = new Backbone.Form({
					model: protocol
		}).render();
		$('#frm').append(app.form.el);
		
		*/
		
		// set default values in form fields
		var schema = protocol.schema;
		// in protocol schema, for each prop, set default value to value of corresponded prop stored in observation model
		var attr = obsToEdit.attributes;
		debugger;
		for(var prop in schema){
			for (var propObs in attr) {
				if (prop == propObs){ schema[prop]["value"] = attr[prop] }
			}
		} 
		for(var prop in schema){
			if ( typeof  schema[prop]["value"] !=="undefined"){
				var defaultValue = schema[prop]["value"];
				$( "[name='" + prop + "']" ).val(defaultValue);
			}
		}     
    },
	indiv : function(){
		$('body').css({'background-image':''});
		var myLayout= new Backbone.Layout({
		template: "#indiv-layout"
		});
		$("#content").empty().append(myLayout.el);
		app.utils.findAll(function (data){
			var tplIndividus = _.template($('#indiv-template').html());
			myLayout.setView("#dataTableRow", new app.Views.Individus({template:tplIndividus, data: data }));
			myLayout.render(); 
			$('.navbar-inner').css({ 'background-image': '#f09609'});
			$('.navbar-inner').css({ 'background': '#f09609'});
			$('table.dataTable tr.odd').css({'background-color': '#FFEB9C'});
			$('table.dataTable tr.odd td.sorting_1').css({'background-color': '#FFEB9C'});
			$('table.dataTable tr.odd td.sorting_2').css({'background-color': '#FFEB9C'});
			$('table.dataTable tr.odd td.sorting_3').css({'background-color': '#FFEB9C'});
			$('table.dataTable tr.even td.sorting_1').css({'background-color': '#FFEB9C'});
		});
	},
	allData : function(){
		
		$('body').css({'background-image':''});
		var myLayout= new Backbone.Layout({
		template: "#allData-layout"
		});
		$("#content").empty().append(myLayout.el);
		var tplAllData = _.template($('#allData-template').html());
		myLayout.setView("#dataTableRow", new app.Views.AllData({template:tplAllData}));
		myLayout.render(); 
		/*
		app.utils.findAll(function (data){
			var tplIndividus = _.template($('#allData-template').html());
			myLayout.setView("#dataTableRow", new app.Views.Individus({template:tplIndividus, data: data }));
			
			$('.navbar-inner').css({ 'background-image': '#f09609'});
			$('.navbar-inner').css({ 'background': '#f09609'});
			$('table.dataTable tr.odd').css({'background-color': '#FFEB9C'});
			$('table.dataTable tr.odd td.sorting_1').css({'background-color': '#FFEB9C'});
			$('table.dataTable tr.odd td.sorting_2').css({'background-color': '#FFEB9C'});
			$('table.dataTable tr.odd td.sorting_3').css({'background-color': '#FFEB9C'});
			$('table.dataTable tr.even td.sorting_1').css({'background-color': '#FFEB9C'});
		});*/
	}
	
 });


 return app;
})(ecoReleveData);