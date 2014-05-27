
	/*****************************************************************************
	//$import
	******************************************************************************/
	var ecoReleveData = (function(app) {
	"use strict";
	
	app.views.Import = app.views.BaseView.extend({
		template: "import",
		initialize: function(options) {
			// remove background image
			$.supersized({
				slides: [{
					image: ''
				}]
			});
		}
	});
	app.views.ImportLoad = app.views.BaseView.extend({
		template: "import-load",
		initialize: function(options) {},
		events: {
			'click #btnFileSelection': 'gpxFileSelection',
			'click #importLoadNext': 'importMap'
		},
		gpxFileSelection: function() {
			var selected_file = document.querySelector('#file');
			//var selected_file = $('#file').get(0).files[0];
			selected_file.onchange = function() {
				try {
					var reader = new FileReader();
					var xml;
					var fileName = this.files[0].name;
					var tab = fileName.split(".");
					var fileType = tab[1];
					fileType = fileType.toUpperCase();
					if (fileType != "GPX") {
						alert("File type is not supported. Please select a 'gpx' file");
					} else {
						var lastUpdate = this.files[0].lastModifiedDate;
						var gpxFileName = localStorage.getItem("gpxFileName");
						var gpxLastModif = localStorage.getItem("gpxLastModif");

						/* if ((gpxFileName != "null") && (gpxFileName == fileName) && (gpxLastModif == lastUpdate )){
	                     alert ("this file correspond to last loaded version !");
	                    }    */
						// else if (gpxLastModif != lastUpdate ){                          
						reader.onload = function(e, fileName) {
							xml = e.target.result;
							app.utils.loadWaypointsFromFile(xml);
						};
						localStorage.setItem("gpxFileName", fileName);
						localStorage.setItem("gpxLastModif", lastUpdate);
					}
					//}
					reader.readAsText(selected_file.files[0]);

				} catch (e) {
					alert("File API is not supported by this version of browser. Please update your browser and check again, or use another browser");
				}
			};
		},
		importMap: function() {
			var attrDisabled = $("#importLoadNext").attr("disabled");
			if (typeof attrDisabled === "undefined") {
				app.router.navigate('#import-map', {
					trigger: true
				});
			}
		}
	});
	app.views.ImportMap = app.views.BaseView.extend({
		template: "import-filter",
		afterRender: function(options) {
			//try{
			var col_a_masquer = [1];
			var objOptions = {};
			objOptions.editable = true;
			objOptions.pagerPosition = 'bottom';
			app.utils.initGrid(app.collections.selectedWaypoints, app.collections.Waypoints, col_a_masquer, objOptions);
			app.utils.getItemsList("#import-activity", "/view/theme/list?import=yes", true);
			var map_view = app.utils.initMap();
			map_view.addLayer({
				layerName: "tracks"
			});
			map_view.addLayer({
				collection: app.collections.waypointsList,
				layerName: "waypoints",
				zoomToExtent: true
			});

			this.mapView = map_view;
			$("div.modal-body").css({
				"min-height": "650px;"
			});
			/*
			$('table').addClass('tablesaw');
			$('table').attr('data-mode','swipe');*/
		},
		events: {
			"selectedFeatures:change": "featuresChange",
			'click td': 'selectTableElement',
			'click #importLoadTrack a': 'loadTrack',
			'click #importInitSelection': 'cancelSelection',
			'change input#importActivity': 'setModelWayPoint'
		},
		featuresChange: function(e) {
			var selectedFeatures = this.mapView.map.selectedFeatures;
			var ln = selectedFeatures.length;
			var objOptions = {};
			objOptions.editable = true;
			objOptions.pagerPosition = 'bottom';
			var col_a_masquer = [1];
			if (ln === 0) {
				app.collections.selectedWaypoints = app.collections.waypointsList;
			} else {
				app.collections.selectedWaypoints = new app.collections.Waypoints();
				app.collections.tableSelectedWaypoints.reset();
				for (var i = 0; i < ln; i++) {
					var modelId = selectedFeatures[i];
					var selectedModel = app.collections.waypointsList.get(modelId);
					app.collections.selectedWaypoints.add(selectedModel);
				}
			}
			app.utils.initGrid(app.collections.selectedWaypoints, app.collections.Waypoints, col_a_masquer, objOptions);
			e.preventDefault();
		},
		cancelSelection: function(e) {
			var col_a_masquer = [1];
			var objOptions = {};
			objOptions.editable = true;
			objOptions.pagerPosition = 'bottom';
			var self = this;
			app.collections.tableSelectedWaypoints.each(function(model) {
				self.zoomMapToSelectedFeature(model.latitude, model.longitude, model.id);
			});
			
			app.utils.initGrid(app.collections.waypointsList, app.collections.Waypoints, col_a_masquer, objOptions);
			app.collections.tableSelectedWaypoints.reset();
		},
		selectTableElement: function(e) {
			var ele = e.target;
			var eleName = e.target.parentNode.nodeName;
			var eleTr = e.target.parentNode;
			var latitude, longitude, idwpt;
			if(ele.className == "fieldActivity"){
				$(ele).html('<input list="import-activity" type="text" id="importActivity">');
				$(e.target).find('#importActivity').trigger('focus');
			}else if(ele.parentNode.className != "fieldActivity"){
				var selectedModel = app.models.selectedModel;
				if(eleTr.className == "selected"){
					$(eleTr).removeAttr("style");
					$(eleTr).removeAttr("class");
					app.collections.tableSelectedWaypoints.remove(selectedModel);
				}else{
					
					for (var k in selectedModel.attributes) {
						var v = selectedModel.attributes[k];
						if (k.toUpperCase() == "LATITUDE") {
							latitude = v;
						}
						if (k.toUpperCase() == "LONGITUDE") {
							longitude = v;
						}
						if (k.toUpperCase() == "ID"){
								idwpt = v;
						}
					}
					$(eleTr).css("background-color","rgb(180, 180, 180)");
					$(eleTr).attr('class','selected');
					app.collections.tableSelectedWaypoints.add(selectedModel);
					app.collections.selectedWaypoints = app.collections.tableSelectedWaypoints;
				}
				this.zoomMapToSelectedFeature(latitude, longitude, idwpt);
			}
			this.delegateEvents();
		},
		setModelWayPoint: function(e) {
			var ele = e.target;
			var eleTd = ele.parentNode;
			var eleVal = ele.value;
			var selectedModel = app.models.selectedModel;
			selectedModel.attributes.fieldActivity = eleVal;
			$(eleTd).html(eleVal);

		},
		zoomMapToSelectedFeature: function(latitude, longitude, idwpt) {
			var point = {};
			point.longitude = longitude;
			point.latitude = latitude;
			//this.map_view.setCenter(point);
			app.utils.updateLocation(this.mapView, point, idwpt);
		},
		loadTrack: function() {
			var action = $('#importLoadTrack a').text();
			if (action == "load tracks") {
				//var ajaxCall = { url : "ressources/shp800.geojson", format: "GEOJSON"};
				//this.mapView.addLayer({ajaxCall : ajaxCall , layerName : "tracks"}); 
				var url = "ressources/shp800.geojson";
				this.mapView.updateLayer("tracks", url);
				$('#importLoadTrack a').text('remove tracks');
			} else {
				this.mapView.removeLayer("tracks");
				$('#importLoadTrack a').text('load tracks');
			}
		}
	});
	app.views.importMetaData = app.views.BaseView.extend({
		template: "import-metadata",
		afterRender: function(options) {

			app.utils.getUsersList("#import-worker1", "/user/fieldworkers", true);
			var nbWaypointsToImport = app.collections.selectedWaypoints.length;
			$('#importNbWaypoints').text(nbWaypointsToImport);
			this.selectedUser1 = "";
			this.selectedUser2 = "";
			this.selectedUser3 = "";
			this.selectedUser4 = "";
			this.selectedUser5 = "";

		},
		events: {
			"change #importWorker1": "getSelectedUser1",
			"change #importWorker2": "getSelectedUser2",
			"change #importWorker3": "getSelectedUser3",
			"change #importWorker4": "getSelectedUser4",
			"change #importWorker5": "getSelectedUser5",
			'click #importLastStep': "storeWaypoints"
		},
		getSelectedUser1: function() {
			var val = $('#importWorker1').val();
			var selectedValue = $('#import-worker1 option').filter(function() {
				return this.value == val;
			});
			if (selectedValue[0]) {
				this.selectedUser1 = selectedValue[0].value;
			} else {
				this.selectedUser1 = "";
				alert("please select a valid worker name");
				$('#importWorker1').val("");
			}
		},
		getSelectedUser2: function() {
			var val = $('#importWorker2').val();
			var selectedValue = $('#import-worker1 option').filter(function() {
				return this.value == val;
			});
			if (selectedValue[0]) {
				this.selectedUser2 = selectedValue[0].value;
			} else {
				this.selectedUser2 = "";
				alert("please select a valid worker name");
				$('#importWorker2').val("");
			}
		},
		getSelectedUser3: function() {
			var val = $('#importWorker3').val();
			var selectedValue = $('#import-worker1 option').filter(function() {
				return this.value == val;
			});
			if (selectedValue[0]) {
				this.selectedUser3 = selectedValue[0].value;
			} else {
				this.selectedUser3 = "";
				alert("please select a valid worker name");
				$('#importWorker3').val("");
			}
		},
		getSelectedUser4: function() {
			var val = $('#importWorker4').val();
			var selectedValue = $('#import-worker1 option').filter(function() {
				return this.value == val;
			});
			if (selectedValue[0]) {
				this.selectedUser4 = selectedValue[0].value;
			} else {
				this.selectedUser4 = "";
				alert("please select a valid worker name");
				$('#importWorker4').val("");
			}
		},
		getSelectedUser5: function() {
			var val = $('#importWorker5').val();
			var selectedValue = $('#import-worker1 option').filter(function() {
				return this.value == val;
			});
			if (selectedValue[0]) {
				this.selectedUser5 = selectedValue[0].value;
			} else {
				this.selectedUser5 = "";
				alert("please select a valid worker name");
				$('#importWorker3').val("");
			}
		},/*
		getSelectedActivity: function() {
			var val = $('#importActivity').val();
			var selectedValue = $('#import-activity option').filter(function() {
				return this.value == val;
			});
			if (selectedValue[0]) {
				this.selectedActivity = selectedValue[0].value;
			} else {
				this.selectedActivity = "";
				alert("please select a valid activity");
				$('#importActivity').val("");
			}
		},*/
		storeWaypoints: function() {
			// add fieldActivity and fielduser to each model
			/*for(var i=0; i<app.collections.selectedWaypoints.length; i++) {
	             wptModel = app.collections.selectedWaypoints.models[i];
	            wptModel.set("fieldActivity",this.selectedActivity);
	            wptModel.set("fieldWorker1",this.selectedUser1);
	            wptModel.set("fieldWorker2",this.selectedUser2);
	        }*/
			var self = this;
			app.collections.selectedWaypoints.each(function(model) {
				//model.set("fieldActivity", self.selectedActivity);
				model.set("fieldWorker1", self.selectedUser1);
				model.set("fieldWorker2", self.selectedUser2);
				model.set("fieldWorker3", self.selectedUser3);
				model.set("fieldWorker4", self.selectedUser4);
				model.set("fieldWorker5", self.selectedUser5);
			});
			//clear stored models in waypoint list to update store
			//var tmp = new app.collections.Waypoints();
			//tmp.fetch().then(function() {
			//	tmp.destroy();
			app.collections.selectedWaypoints.save();
			//});
			app.collections.waypointsList = null;
			app.router.navigate('#import-end', {
				trigger: true
			});

		}
	});
	app.views.importEndStep = app.views.BaseView.extend({
		template: "import-endStep",
		afterRender: function(options) {
			app.collections.selectedWaypoints = null;
			//app.collections.waypointsList = null;
			//app.collections.waypointsList.save();
		}
	});

	return app;
})(ecoReleveData);