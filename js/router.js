define([
    'jquery',
    'underscore',
    'backbone',
    'views/home'
], function($, _, Backbone, HomeView){
    'use strict';﻿
    var router = Backbone.Router.extend({
        routes: {
            "": "home",
            "stationType": "stationType",
            "newStation": "newStation",
            //"entryStation": "entryStation",
            "importedStation": "importedStation",
            "stationFromGpx": "stationFromGpx",
            "stationInfos": "stationInfos",
            "stationInfos/:id": "monitoredStation",
            "proto-choice": "protoChoice",
            "data-entry/:id": "dataEntry",
            "data-entryEnd": "dataEntryEnd",
            "map": "mapMyPosition",
            "mydata/:id": "myObs",
            "mydata": "myData",
            "msgBox": "alert",
            "updateData": "updateData",
            "uploadData": "uploadData",
            "config": "configuration",
            "configurl": "configurl",
            "configProtos": "configProtos",
            "dataEdit/:id": "dataEdit",
            "indiv": "indiv",
            "allData": "allData",
            "export": "export",
            "export/:view": "exportFilter",
            "export/:view/filter": "exportMap",
            //"export/:view/:filter":"exportMap",
            "export/:view/": "exportMap",
            "export/:view/fields": "exportFields",
            "export/:view/result": "exportResult",
            "export/:view/ResultOnMapView": "ResultOnMapView",
            "import": "import",
            "import-load": "importLoad",
            "import-map": "importMap",
            "import-meta": "importMetadata",
            "import-end": "importEndStep",
            "objects": "objects",
            "argos": "argos",
            //"argos/:id": "argosDetails",
            //'argos/id:transmitter/indiv/id:indivId' : 'argosDetails',
            'argos/*parameters' : 'argosDetails',
            "birds": "birds",
            "bird/:id" :"bird",
            "rfid":"rfid"
            //"exportFilter" : "exportFilter"
        },

        _currentView: null,

        setView: function(view) {
            if (this._currentView) {
                this._currentView.remove();
                this._currentView.off();
            }
            this._currentView = view;
            $('section#main').html(view.el);
            view.render();
        },

        home: function() {
            this.setView(new HomeView());
        },

        stationType: function() {
            this.setView(new app.views.StationTypeView());
        },

        newStation: function() {
            this.setView(new app.views.NewStation());
        },

        importedStation: function() {
            this.setView(new app.views.ImportedStation());
        },

        entryStation: function() {
			this.setView(new app.views.StationPositionView());

			//try {
			/*$('body').css({'background-image':''});
			app.views.main = new Backbone.Layout({
				template: "#main-layout"
			});
			$("#content").empty().append(app.views.main.el);
			app.views.main.setView(".layoutContent", new app.Views.StationPositionView());*/

			/*
			app.models.location = new app.Models.Location();
			app.models.location.id ="1";
			app.models.location.constructor.schema = app.models.location.schema;
			var myView = new app.Views.LocationFormView({initialData:app.models.location, usersTab : app.global.usersTab});
			app.views.main.setView("#locationForm",myView );
			app.views.main.render();
			$("#locationSubmit").on("click", $.proxy(myView.onSubmit, myView));
			$("div .form-actions").css("display","none");
			app.utils.myPositionOnMap(function(){
				var map_view = app.utils.initMap();
				var myposition = new NS.UI.Point({ latitude : app.point.latitude, longitude: app.point.longitude, label:"my position"});
				map_view.addLayer({point : myposition , layerName : "my position"});
				$("#waitControl").remove();
			});*/
		},
		stationFromGpx: function() {
			// check if the is stored waypoints
			var len = app.collections.waypointsList.length;
			if (len === 0) {
				alert("There is not stored stations! Please load them from a gpx file (update data / gpx) ");
				this.navigate('#entryStation', {
					trigger: true
				});
			} else {
				// initialiser point openlayers
				//app.point = new OpenLayers.LonLat(5.37,43.29);
				app.views.main = new Backbone.Layout({
					template: "#main-layout"
				});
				$("#content").empty().append(app.views.main.el);

				app.views.main.setView(".layoutContent", new app.Views.StationFromFile({
					collection: app.collections.waypointsList,
					usersTab: app.global.usersTab
				}));
				app.views.main.render();
				// init map
				$('#map').css('height', '600px');
				$('.container, .navbar-static-top .container, .navbar-fixed-top .container, .navbar-fixed-bottom .container').css('width', '100%');
				app.mapView = app.utils.initMap();
				// add waypoints layer based on the waypoints collection
				app.mapView.addLayer({
					collection: app.collections.waypointsList,
					layerName: "Waypoints"
				});
				$("#waitControl").remove();
			}
		},
		stationInfos: function() {
			/*	try {
			 */
			app.views.main = new Backbone.Layout({
				template: "#main-layout"
			});
			$("#content").empty().append(app.views.main.el);
			app.views.main.setView(".layoutContent", new app.Views.StationInfosView());
			// Station info form
			var myView = new app.Views.StationFormView({
				initialData: app.models.station
			});
			app.views.main.setView("#stationForm", myView);
			app.views.main.render();
			$("#stationInfoSubmit").on("click", $.proxy(myView.onSubmit, myView));
			$("div .form-actions").css("display", "none");
			var inputDate = $('input[name*="date_day"]');
			$(inputDate).datepicker();
			$(inputDate).css('clip', 'auto');
			var currentDate = new Date();
			$(inputDate).datepicker("setDate", currentDate);
			// set the default time
			app.utils.getTime('time_now');
			/*}catch (e) {

				this.navigate('', {trigger: true});
			}*/
		},
		monitoredStation: function(id) {
			var usersList = app.global.usersTab;
			var selectedStation = app.collections.waypointsList.get(id);
			var wptName = selectedStation.get("name");
			var wptLatitude = selectedStation.get("latitude");
			var wptLongitude = selectedStation.get("longitude");
			var wptTime = selectedStation.get("waypointTime");
			app.models.station = new app.Models.Station();
			var schema = {
				station_name: {
					type: 'Text',
					title: 'Station name'
				},
				field_activity: {
					type: 'Text',
					title: 'Field activity'
				},
				date_day: {
					type: 'Text',
					title: 'Date'
				},
				time_now: {
					type: 'Text',
					title: 'Time'
				},
				Observer_1: {
					type: 'Select',
					title: 'Observer 1',
					options: usersList,
					required: true
				},
				Observer_2: {
					type: 'Select',
					title: 'Observer 2',
					options: usersList,
					validators: []
				},
				Observer_3: {
					type: 'Select',
					title: 'Observer 3',
					options: usersList
				},
				Observer_4: {
					type: 'Select',
					title: 'Observer 4',
					options: usersList
				},
				Observer_5: {
					type: 'Select',
					title: 'Observer 5',
					options: usersList
				}
			};
			app.models.station.constructor.schema = schema;
			app.models.station.schema = schema;
			app.models.station.set("station_name", wptName);
			app.models.station.set("id", id);
			var nbStoredStations = app.collections.stations.length;
			// store coordinates in location model
			app.models.location = new app.Models.Location();
			app.models.location.id = "2";
			app.models.location.constructor.schema = app.models.location.schema;
			app.models.location.set("latitude", wptLatitude);
			app.models.location.set("longitude", wptLongitude);
			// update station : used = true
			var waypointModel = app.collections.waypointsList.get(id);
			waypointModel.set("used", true);
			waypointModel.save();
			app.global.selectedStationId = id;
			this.navigate('stationInfos', {
				trigger: true
			});

		},
		protoChoice: function() {
			this.setView(new app.views.InputProtocolChoice());
		},
		dataEntry: function(id) {
			this.setView(new app.views.ProtocolEntry({
				id: id
			}));
			/*
				app.views.dataEntryLayout= new Backbone.Layout({
				template: "#data-entry-layout"
				});
				$("#content").empty().append(app.views.dataEntryLayout.el);

				var tplStation = _.template($('#data-entry-station').html());
				//var tplProtoForm = _.template($('#data-entry-protocol').html());
				app.views.dataEntryLayout.setView(".station", new app.Views.DataEntryStationView({template:tplStation, model: app.models.station}));
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
				*/


		},
		dataEntryEnd: function() {
			this.setView(new app.views.InputEnd());
		},
		mapMyPosition: function() {
			/*	$('body').css({'background-image':''});
			app.views.main.setView(".layoutContent", new app.Views.MapStationsView());
			app.views.main.render();
			$('div#content').css({'background-image':''});
			$('#map').css('height', '600px');
			var myposition = new NS.UI.Point({ latitude : 43.29, longitude: 5.37, label:"bureau"});
			var mapCenter = new NS.UI.Point({ latitude : 43.29, longitude: 5.37});
			var mapZoom = 12;
			var map_view = new NS.UI.MapView({ el: $("#map"), center: mapCenter, zoom: mapZoom});
			map_view.addLayer({point : myposition , layerName : "bureau"});    */
		},
		mydata: function() {
			//try {
			$('body').css({
				'background-image': ''
			});
			$('#content').empty().append(app.views.myDataLayout.el);

			// sort observations collection by protocol id & create an array of protocols id
			var sortedCollection = app.collections.observations.sortBy(function(obs) {
				//var protoId = obs.get("protoId");
				//protocolsIdList.push(protoId);
				return obs.get("protoId");
			});
			// get uniq values of protocols id
			var protoIdList = app.collections.observations.map(function(model) {
				return model.get('protoId');
			});
			// uniq values
			protoIdList = _.uniq(protoIdList);
			//var tplFilterView = _.template($('#my-data-filter-template').html());
			var tplFilterView = _.template($('#my-data-filter-template').html());
			app.views.myDataLayout.setView(".gridview", new app.Views.MyDataGridView({
				template: tplFilterView,
				collection: app.collections.observations,
				protoIdList: protoIdList
			}));
			app.views.myDataLayout.render();
			//set the date
			$(".datepicker").datepicker();
			$(".datepicker").css('clip', 'auto');
			var currentDate = new Date();
			$(".datepicker").datepicker("setDate", currentDate);

			$('.navbar-inner').css({
				'background-image': '#ffc40d'
			});
			$('.navbar-inner').css({
				'background': '#ffc40d'
			});
			/*}catch (e) {
				this.navigate('#', {trigger: true});
			}*/
		},
		alert: function() {
			app.views.main.setView(".layoutContent", new app.Views.AlertView());
			app.views.main.render();
		},
		updateData: function() {
			try {
				$('body').css({
					'background-image': ''
				});
				//$('div#content').css({'background-image':''});
				app.views.dataUpdateLayout = new Backbone.Layout({
					template: "#update-data-layout"
				});
				$("#content").empty().append(app.views.dataUpdateLayout.el);
				var tplview = _.template($('#update-data-template').html());
				app.views.dataUpdateLayout.setView(".container", new app.Views.UpdateDataView({
					template: tplview
				}));
				app.views.dataUpdateLayout.render();
				//
				$(".thumbnails > li.tile").css({
					"text-align": "left"
				});
				$(".tile-double.icon > a > img ").css({
					"top": "40%"
				});

				$('.navbar-inner').css({
					'background-image': '#f09609'
				});
				$('.navbar-inner').css({
					'background': '#f09609'
				});
				// update gps file import date

				var newDate = localStorage.getItem("gpxLastImportDate");
				if (newDate != 'null') {
					$("#gpxImportDate").text("last update: " + newDate);
				} else {
					$("#gpxImportDate").text("");
				}
			} catch (e) {
				this.navigate('#', {
					trigger: true
				});
			}
		},
		uploadData: function() {
			try {
				$('body').css({
					'background-image': ''
				});
				//$('div#content').css({'background-image':''});
				app.views.dataUploadLayout = new Backbone.Layout({
					template: "#upload-data-layout"
				});
				// sort observations collection by protocol id & create an array of protocols id
				var sortedCollection = app.collections.observations.sortBy(function(obs) {
					return obs.get("protoId");
				});
				// get uniq values of protocols id
				var protoIdList = app.collections.observations.map(function(model) {
					return model.get('protoId');
				});
				// uniq values
				protoIdList = _.uniq(protoIdList);

				$("#content").empty().append(app.views.dataUploadLayout.el);
				var tplview = _.template($('#upload-data-template').html());
				app.views.dataUploadLayout.setView(".uploadDataGridView", new app.Views.UploadDataView({
					template: tplview,
					fileSystem: app.global.fileSystem,
					collection: app.collections.observations,
					protoIdList: protoIdList,
					stations: app.collections.stations
				}));
				app.views.dataUploadLayout.render();
				$('.navbar-inner').css({
					'background-image': 'red'
				});
				$('.navbar-inner').css({
					'background': 'red'
				});
			} catch (e) {
				this.navigate('#', {
					trigger: true
				});
			}
		},
		configuration: function() {
			try {
				$('body').css({
					'background-image': ''
				});
				app.views.configdataLayout = new Backbone.Layout({
					template: "#config-data-layout"
				});
				$("#content").empty().append(app.views.configdataLayout.el);

				var tplview = _.template($('#config-list-template').html());
				app.views.configdataLayout.setView(".container", new app.Views.ConfigListView({
					template: tplview
				}));
				app.views.configdataLayout.render();
				$('.navbar-inner').css({
					'background-image': '#2E8BCC'
				});
				$('.navbar-inner').css({
					'background': '#2E8BCC'
				});
				//	$('.navbar-inner').css({ 'background-image': "-webkit-gradient(linear, left top, left bottom, from(#2E8BCC), to(#2E8BCC)"});
				$(".thumbnails > li.tile").css({
					"text-align": "left"
				});
				$(".tile.icon > a > img ").css({
					"top": "40%"
				});
				// check if server url is stored
				var serverUrl = localStorage.getItem("serverUrl");
				if ((serverUrl === undefined) || (serverUrl === null)) {
					alert("Please configurate the server url");
				}
			} catch (e) {
				this.navigate('#', {
					trigger: true
				});
			}
		},
		configurl: function(id) {
			app.views.configdataLayout = new Backbone.Layout({
				template: "#config-data-layout"
			});
			$("#content").empty().append(app.views.configdataLayout.el);
			var tplview = _.template($('#config-url-template').html());
			app.views.configdataLayout.setView(".container", new app.Views.ConfigUrlView({
				template: tplview
			}));
			var MyModel = Backbone.Model.extend({}, {
				schema: {
					url: {
						type: 'Text',
						title: 'Input server url'
					}
				},
				verboseName: 'Server Url'
			});
			var myModel = new MyModel();
			//myModel.constructor.schema = myModel.schema;
			var myView = new app.Views.ServerFormView({
				initialData: myModel
			});
			app.views.configdataLayout.setView("#fromUrlServer", myView);
			app.views.configdataLayout.render();
			$('.navbar-inner').css({
				'background-image': '#2E8BCC'
			});
			$('.navbar-inner').css({
				'background': '#2E8BCC'
			});
			$("#saveServerUrl").on("click", $.proxy(myView.onSubmit, myView));
			$("div .form-actions").css("display", "none");
		},
		configProtos: function(id) {
			$("#configInfos").text("Checking server access ...");
			if (navigator.onLine === true) {
				// check if server url is configurated
				var serverUrl = localStorage.getItem("serverUrl");
				if ((serverUrl === undefined) || (serverUrl === null)) {
					alert("Please configurate the server url");
					this.navigate('#config', {
						trigger: true
					});
					$("#configInfos").text("");
				} else {
					// call WS protocols
					var serverUrl = localStorage.getItem("serverUrl");
					var link = serverUrl + "/proto/proto_list";
					app.utils.getProtocolsFromServer(link);
				}
			} else {
				alert("you are not connected ! Please check your connexion ");
				$("#configInfos").text("");
				this.navigate('#config', {
					trigger: true
				});
			}
		},
		dataEdit: function(id) {
			// id correspond to obs id: find proto id and station id
			var protoId, stationId;
			var obsToEdit = new app.Models.Observation();
			obsToEdit = app.collections.observations.get(id);
			//obsToEdit.destroy();
			protoId = obsToEdit.get("protoId");
			stationId = obsToEdit.get("stationId");
			var station = new app.Models.Station();
			station = app.collections.stations.get(stationId);
			var protocol = new app.Models.Protocol();
			protocol = app.collections.protocolsList.get(protoId);

			app.global.selectedProtocolId = protocol.get("id");
			app.global.selectedProtocolName = protocol.get("name");

			app.views.dataEntryLayout = new Backbone.Layout({
				template: "#data-entry-layout"
			});
			$("#content").empty().append(app.views.dataEntryLayout.el);

			var tplStation = _.template($('#data-entry-station').html());
			var tplProtoForm = _.template($('#data-entry-protocol').html());
			app.views.dataEntryLayout.setView(".station", new app.Views.DataEntryStationView({
				template: tplStation,
				model: station
			}));
			app.views.dataEntryLayout.setView(".protocol", new app.Views.DataEntryProtocolView({
				template: tplProtoForm,
				model: protocol,
				obsId: id,
				pictureSource: app.global.pictureSource,
				destinationType: app.global.destinationType
			}));
			app.views.dataEntryLayout.render();
			protocol.constructor.schema = protocol.schema;
			protocol.constructor.verboseName = protocol.attributes.name;
			var myView = new app.Views.ProtocolFormView({
				initialData: protocol,
				obsId: id
			});
			app.views.dataEntryLayout.setView(".protocol", myView);
			app.views.dataEntryLayout.render();

			$("#protocolSubmit").on("click", $.proxy(myView.onSubmit, myView));
			$("div .form-actions").css("display", "none");

			var currentModelName = protocol.attributes.name;
			$('#data-entry-protocol').html('<a>Station > data entry > ' + currentModelName + '</a>');
			// set default values in form fields & generate fielset list for the current protocol to enhance UI
			var fieldsetList = [];
			var schema = protocol.schema;
			var schema = protocol.schema;
			// in protocol schema, for each prop, set default value to value of corresponded prop stored in observation model
			var attr = obsToEdit.attributes;
			for (var prop in schema) {
				for (var propObs in attr) {
					if (prop == propObs) {
						schema[prop]["value"] = attr[prop]
					}
				}
			}
			for (var prop in schema) {
				if (typeof schema[prop]["value"] !== "undefined") {
					var defaultValue = schema[prop]["value"];
					$("[name='" + prop + "']").val(defaultValue);
				}
			}
		},
		indiv: function() {
			$('body').css({
				'background-image': ''
			});
			app.views.indivLayout = new Backbone.Layout({
				template: "#indiv-layout"
			});
			$("#content").empty().append(app.views.indivLayout.el);
			app.utils.findAll(function(data) {
				var tplIndividus = _.template($('#indiv-template').html());
				app.views.indivLayout.setView("#dataTableRow", new app.Views.Individus({
					template: tplIndividus,
					data: data
				}));
				app.views.indivLayout.render();
				$('.navbar-inner').css({
					'background-image': '#f09609'
				});
				$('.navbar-inner').css({
					'background': '#f09609'
				});
				$('table.dataTable tr.odd').css({
					'background-color': '#FFEB9C'
				});
				$('table.dataTable tr.odd td.sorting_1').css({
					'background-color': '#FFEB9C'
				});
				$('table.dataTable tr.odd td.sorting_2').css({
					'background-color': '#FFEB9C'
				});
				$('table.dataTable tr.odd td.sorting_3').css({
					'background-color': '#FFEB9C'
				});
				$('table.dataTable tr.even td.sorting_1').css({
					'background-color': '#FFEB9C'
				});
			});
		},
		allData: function() {
			if (navigator.onLine === true) {
				this.setView(new app.views.AllDataView());
				/*
				// check if server url is configurated
				var serverUrl = localStorage.getItem("serverUrl");

				if ((serverUrl === undefined) || (serverUrl === null)) {
					alert("Please configurate the server url");
					this.navigate('#config', {
						trigger: true
					});
					$("#configInfos").text("");
				} else {
					this.setView(new app.views.AllDataView());
				}
				*/
			} else {
				alert("you are not connected ! Please check your connexion ");
				/*$("#configInfos").text("");
				this.navigate('#config', {
					trigger: true
				});*/
			}
		},
		export: function() {
			if (navigator.onLine === true) {
				/*
				app.views.main = new Backbone.Layout({
					template: "#main-layout"
				});
				$("#content").empty().append(app.views.main.el);
				app.views.main.setView(".layoutContent", new app.Views.ExportView());
				app.views.main.render();
				$('body').css({'background-image':''});
				*/
				this.setView(new app.views.ExportView());
			} else {
				alert("you are not connected ! Please check your connexion ");
				this.navigate('#', {
					trigger: true
				});
			}

		},
		exportFilter: function(name) {
			this.setView(new app.views.ExportFilterView({
				viewName: name
			}));
			/*
			$("#content").empty().append(app.views.main.el);
			app.views.main.setView(".layoutContent", new app.Views.ExportFilterView({viewName: name}));
			app.views.main.render();
			$('body').css({'background-image':''});
			*/
		},
		exportMap: function(view, filter) {
			this.setView(new app.views.ExportMapView({
				view: view,
				filter: filter
			}));
		},
		exportFields: function(view) {
			this.setView(new app.views.ExportColumnsSelection({
				view: view
			}));
		},
		exportResult: function(view) {
			this.setView(new app.views.ExportResult({
				view: view
			}));
		},
		ResultOnMapView: function(view) {
			this.setView(new app.views.ExportResultOnMapView({
				view: view
			}));
		},
		import: function() {
			this.setView(new app.views.Import());
		},
		importLoad: function() {
			this.setView(new app.views.ImportLoad());
		},
		importMap: function() {
			this.setView(new app.views.ImportMap());
		},
		importMetadata: function() {
			this.setView(new app.views.importMetaData());
		},
		importEndStep: function() {
			this.setView(new app.views.importEndStep());
		},
		objects: function() {
			this.setView(new app.views.objects());
		},
		argos: function() {
			this.setView(new app.views.Argos());
		},
		argosDetails: function(params) {
			var paramTab = params.split("&");
			var idTransmitter = paramTab[0].split("=")[1];
			var idIndiv = paramTab[1].split("=")[1];
			this.setView(new app.views.ArgosDetails({idTransmitter:idTransmitter,idIndiv:idIndiv }));
		},
		birds: function() {
			this.setView(new app.views.Birds());
		},
		bird : function(id) {
			this.setView(new app.views.Bird({id: id}));
		},
		myData : function() {
			this.setView(new app.views.MyData());
		},
		myObs : function(id){
			this.setView(new app.views.MyObs({id: id}));
		},
		rfid : function() {
			this.setView(new app.views.Rfid());
		}
    });
    return router;
});
