
	// $alldata

	var ecoReleveData = (function(app) {
	"use strict";

	app.views.AllDataView = app.views.BaseView.extend({
		template: "allData",
		afterRender: function(options) {
			try{
			// remove background image
				$.supersized({
					slides: [{
						image: ''
					}]
				});
				// masqued fields
				$('#id_proto').hide();
				$('#idate').hide();
				$('#allDataCluster').hide();
				//var serverUrl = localStorage.getItem("serverUrl");
				var serverUrl = app.config.serverUrl;
				//procole list for input select
				$.ajax({
					url: serverUrl + "/proto/proto_list",
					dataType: "text",
					success: function(xmlresp) {
						var xmlDoc = $.parseXML(xmlresp),
							$xml = $(xmlDoc),
							$protocoles = $xml.find("protocole");
						// init select control with empty val
						// $('<option id= 0 ></option>').appendTo('#select_id_proto');
						$protocoles.each(function() {
							$('<option id=\"' + $(this).attr('id') + '\" value=\"' + $(this).text() + '\">' + $(this).text() + '</option>').appendTo('#select_id_proto');
						});
						$("#select_id_proto option[id='12']").attr('selected', 'selected');
					}
				});
				var dataContainer = $("#main")[0]; //var myDataTable = $("#myDataTable")[0];
				var widthDataContainer = dataContainer.clientWidth;
				var widthallDataContent = widthDataContainer - 260;

				$('#allDataMap').css('width', (widthallDataContent * 0.98) + 'px'); //$('#map').css('width', '700px');
				$('#map').css('width', (widthallDataContent * 0.97) + 'px'); //$('#map').css('width', '700px');

				$(window).bind('resize', function() {
					dataContainer = $("#main")[0];
					widthDataContainer = dataContainer.clientWidth;
					widthallDataContent = widthDataContainer - 260;
					$('#allDataContent').css('width', widthallDataContent + 'px');

					// check if datatable is not hided and resize map if window is resized
					var displayed = $("#allDataList").is(":visible");
					if (displayed) {
						$('#map').css('width', (widthallDataContent * 0.63) + 'px'); //$('#map').css('width', '700px');
						//console.log ("widthallDataContent : " + widthallDataContent );
						$('#allDataMap').css('width', (widthallDataContent * 0.65) + 'px'); //$('#map').css('width', '700px');
						$('#allDataList').css('width', (widthallDataContent * 0.3) + 'px'); //$('#map').css('width', '700px');
					}

				});
				$("#allDataList").hide();
				var point = new NS.UI.Point({
					latitude: 34,
					longitude: 44,
					label: ""
				});
				this.map_view = app.utils.initMap(point, 3);
				this.insertView(this.map_view);
				this.map_view.addLayer({
					layerName: "tracks"
				});
				$("label, input,button, select ").css("font-size", "15px");
				//datalist of taxons
				app.utils.fillTaxaList();
				// get area list 
				this.getAreaList();
			} catch (e) {
		            app.router.navigate('#', {trigger: true});
		    }
			
		},
		remove: function(options) {
			/*_.each(this._views, function(viewList, selector) {
				_.each(viewList, function(view) {
					view.remove();
				});
			});*/
			app.views.BaseView.prototype.remove.apply(this, arguments);
			console.log("remove all data");
		},
		events: {
			'change #select_id_proto': 'updateTable',
			//'change input.cluster' : 'updateMap',
			'click #btnReset': 'resetdate',
			'click #btnW': 'updateDateWeek',
			'click #btnM': 'updateDateMonth',
			'click #btnY': 'updateDateYear',
			'keyup #datedep': 'updateDateDep',
			'keyup #datearr': 'updateDateArr',
			'click #searchBtn ': 'search',
			'click tr': 'selectTableElement',
			'click #allDataInfosPanelClose': 'closeInfosPanel',
			//'change input#updateSelection' : 'updateTableForSelecedFeatures'
			// 'selectedFeatures:change' : 'updateTableForSelecedFeatures',
			'click #refreshTable': 'updateTableForSelecedFeatures',
			'click #featureOnTheMap': 'zoomMapToSelectedFeature',
			'click div.olControlSelectFeatureItemActive.olButton': "deletePositionLayer",
			'click #alldataAlertYes': 'continueGeoQuery',
			'click #alldataAlertNo': 'resetGeoQuery',
			'click #allDataLoadTrack': 'loadTrack'
		},
		getAreaList: function() {
			var idProtocol = $("#id_proto").attr("value");
			app.utils.getAreaList("#alldata-regionList", "/station/area?id_proto=" + idProtocol, true);
			app.utils.getLocalityList("#alldata-localityList", "/station/locality?id_proto=" + idProtocol, true);
		},
		updateTable: function() {
			//this.updateControls();
			$("#iTaxon").val("");
			$("#place").val("");
			$("#region").val("");
			$("#id_proto").attr("value", ($("#select_id_proto option:selected").attr('id')));
			app.utils.fillTaxaList();
			this.getAreaList();
		},
		updateDateWeek: function() {
			// $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
			$(".allData-criteriaBtn").removeClass("btnSelected");
			$(".allData-criteriaBtn").addClass("btnUnselected");
			// $("#btnW").css({"background-color" : "rgb(119, 117, 117)"});
			$("#btnW").removeClass("btnUnselected");
			$("#btnW").addClass("btnSelected");
			$('#idate').text("week");
			$("#datedep").attr('value', "");
			$("#datearr").attr('value', "");
		},
		updateDateMonth: function() {
			$(".allData-criteriaBtn").removeClass("btnSelected");
			$(".allData-criteriaBtn").addClass("btnUnselected");
			//$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
			//$("#btnM").css({"background-color" : "rgb(119, 117, 117)"});
			$("#btnM").removeClass("btnUnselected");
			$("#btnM").addClass("btnSelected");

			$('#idate').text("month");
			$("#datedep").attr('value', "");
			$("#datearr").attr('value', "");
		},
		updateDateYear: function() {
			$(".allData-criteriaBtn").removeClass("btnSelected");
			$(".allData-criteriaBtn").addClass("btnUnselected");
			//$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
			//$("#btnY").css({"background-color" : "rgb(119, 117, 117)"});
			$("#btnY").removeClass("btnUnselected");
			$("#btnY").addClass("btnSelected");

			$('#idate').text("year");
			$("#datedep").attr('value', "");
			$("#datearr").attr('value', "");
		},
		/* updateDate1an : function(){
	        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
	        $("#btnY-1").css({"background-color" : "rgb(150,150,150)"});
	        $('#idate').text("1ans");   
	        $("#datedep").attr('value',"");
	        $("#datearr").attr('value',"");
	    },
	    updateDate2ans : function(){
	        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
	        $("#btnY-2").css({"background-color" : "rgb(150,150,150)"});
	        $('#idate').text("2ans");
	        $("#datedep").attr('value',"");
	        $("#datearr").attr('value',"");   
	    },*/
		resetdate: function() {
			$(".allData-criteriaBtn").removeClass("btnSelected");
			$(".allData-criteriaBtn").addClass("btnUnselected");
			$("#btnReset").removeClass("btnUnselected");
			$("#btnReset").addClass("btnSelected");
			//$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
			//$("#btnReset").css({"background-color" : "rgb(150,150,150)"});

			$('#idate').text("");
			$("#datedep").attr('value', "");
			$("#datearr").attr('value', "");
		},
		/* updateDateHier : function(){
	        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
	        $("#btnD-1").css({"background-color" : "rgb(150,150,150)"});
	        $('#idate').text("hier");
	        $("#datedep").attr('value',"");
	        $("#datearr").attr('value',"");
	    },*/
		updateDateDep: function() {
			var regex = new RegExp("^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$");
			var regex2 = new RegExp("^[0-9]{4}$");
			var regex3 = new RegExp("^[0-9]{4}-(0[1-9]|1[012])$");
			var datedep = $("#datedep").attr('value');
			var datearr = $("#datearr").attr('value');
			if (((regex.test(datedep) && regex.test(datearr)) || (regex2.test(datedep) && regex2.test(datearr)) || (regex3.test(datedep) && regex3.test(datearr))) && datedep <= datearr)
				$("#dateinter").removeAttr("disabled");
			else
				$("#dateinter").attr("disabled", "disabled");
		},
		updateDateArr: function() {
			var regex = new RegExp("^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$");
			var regex2 = new RegExp("^[0-9]{4}$");
			var regex3 = new RegExp("^[0-9]{4}-(0[1-9]|1[012])$");
			var datedep = $("#datedep").attr('value');
			var datearr = $("#datearr").attr('value');
			if (((regex.test(datedep) && regex.test(datearr)) || (regex2.test(datedep) && regex2.test(datearr)) || (regex3.test(datedep) && regex3.test(datearr))) && datedep <= datearr)
				$("#dateinter").removeAttr("disabled");
			else
				$("#dateinter").attr("disabled", "disabled");
		},
		search: function() {
			this.displayWaitControl();
			// $("#map").css("height","795px");
			this.updateControls();
			var datedep = $("#datedep").attr('value');
			var datearr = $("#datearr").attr('value');
			if (datedep !== "" || datearr !== "") {
				$('#idate').text(datedep + ";" + datearr);
			}
			/*$('#idate').text(datedep+";"+ datearr);*/
			var params = 'id_proto=' + $("#id_proto").attr("value") + "&place=" + $("#place").attr("value") + "&region=" + $("#region").attr("value") + "&idate=" + $('#idate').text() + "&taxonsearch=" + $("#iTaxon").attr("value");
			app.utils.filldatable(params);
			app.utils.updateLayer(this.map_view);
			/*     $("img#mapunselectfeatures").css("position" , "absolute");
	                $("img#mapunselectfeatures").css("z-index","1008");
	                $("img#mapunselectfeatures").css("right", "85px");
	                $("img#mapunselectfeatures").css("top", "4px");*/
			// display button loading tracks
			$("#allDataLoadTrack").removeClass("masqued");
		},
		updateMap: function() {
			app.utils.updateLayer(this.map_view);
		},
		updateZoom: function() {
			app.utils.updateLayer(this.map_view);
		},
		updateData: function(e) {
			var name = e.target.value;
			if (e.keyCode == 13) {
				app.utils.updateLayer(this.map_view);
				app.utils.filldatable();
			}
		},
		updateControls: function() {
			$("#allDataList").removeAttr('style');
			$('#allDataCluster').removeAttr('style');

			var dataContainer = $("#main")[0]; //var myDataTable = $("#myDataTable")[0];
			var widthDataContainer = dataContainer.clientWidth;
			var widthallDataContent = widthDataContainer - 260;
			if (widthallDataContent < 850) {
				widthallDataContent = widthallDataContent - 20;
			}
			$('#map').css('width', (widthallDataContent * 0.60) + 'px'); //$('#map').css('width', '700px');
			//console.log ("widthallDataContent : " + widthallDataContent );
			$('#allDataMap').css('width', (widthallDataContent * 0.62) + 'px'); //$('#map').css('width', '700px');
			$('#allDataList').css('width', (widthallDataContent * 0.3) + 'px'); //$('#map').css('width', '700px');
			// redraw map
			this.map_view.map.baseLayer.redraw();
		},
		updateTableForSelecedFeatures: function(evt) {
			// check if you need to use selected features id ( else : use BBOX)
			var params = 'id_proto=' + $("#id_proto").attr("value") + "&place=" + $("#place").attr("value") + "&region=" + $("#region").attr("value") + "&idate=" + $('#idate').text() + "&taxonsearch=" + $("#iTaxon").attr("value");
			var paramsMap = "";
			var idSelected = $("#featuresId").val();
			if (idSelected === "") {
				paramsMap = "bbox=" + $("#updateSelection").val();
			} else if ((idSelected.split(",")[0]) === "") {
				// paramsMap = "id_stations=''";
				paramsMap = "bbox=" + $("#updateSelection").val();
			} else {
				// get all id station from string  (id1,id2 ...)
				paramsMap = "id_stations=" + idSelected;
			}
			app.utils.filldatable(params, paramsMap);
		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode.nodeName;
			// if (ele =="TD"){
			if (ele == "TR") {
				var selectedModel = app.models.selectedModel;
				$("#allDataInfosPanel").css({
					"display": "block"
				});
				var content = "<h3>details</h3>";
				var latitude, longitude;
				for (var k in selectedModel.attributes) {
					var v = selectedModel.attributes[k];
					if (k.toUpperCase() == "DATE") {
						var d = (new Date(v) + '').split(' ');
						v = [d[1], d[2], d[3]].join(' ');
					}
					if (k.toUpperCase() == "LAT") {
						latitude = v;
					}
					if (k.toUpperCase() == "LON") {
						longitude = v;
					}
					content += "<p class='allDataInfosTitles'> " + k + " <br/><span>" + v + "</span></p>";
				}
				content += "<p id='featureOnTheMap' longitude='" + longitude + "' latitude='" + latitude + "'><a><img src='images/Map-Location.png'/></a> <i>show it on the map</i></p>";
				$("#allDataInfosPanelContent").html(content);
			}
		},
		zoomMapToSelectedFeature: function() {
			var latitude = $("#featureOnTheMap").attr("latitude");
			var longitude = $("#featureOnTheMap").attr("longitude");
			var point = {};
			point.longitude = longitude;
			point.latitude = latitude;
			//this.map_view.setCenter(point);
			app.utils.updateLocation(this.map_view, point);
		},
		deletePositionLayer: function() {
			// delete selected feature layer if exists
			var mapView = this.map_view;
			for (var i = 0; i < mapView.map.layers.length; i++) {
				if ((mapView.map.layers[i].name) == "Selected feature") {
					mapView.map.removeLayer(mapView.map.layers[i]);
				}
			}
		},
		closeInfosPanel: function() {
			var mapView = this.map_view;
			$('#allDataInfosPanel').hide();
			for (var i = 0; i < mapView.map.layers.length; i++) {
				if ((mapView.map.layers[i].name) == "Selected feature") {
					mapView.map.removeLayer(mapView.map.layers[i]);
				}
			}
		},
		displayWaitControl: function() {
			var mapDiv = this.map_view.el;
			var width = ((screen.width) / 2 - 200);
			var height = ((screen.height) / 2 - 200);
			var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>";
			var st = $("#waitControl").html();
			if ($("#waitControl").length === 0) {
				$(mapDiv).append(ele);
			}
		},
		continueGeoQuery: function() {
			$("#allDataMapAlert").empty();
			$("#allDataMapAlert").removeClass("dialogBoxAlert");
			$("div.modal-backdrop").removeClass("modal-backdrop");
			//$("#alldataAlert").addClass("masqued");
			this.displayWaitControl();
			app.utils.continueUpdateLayer(this.map_view);
		},
		resetGeoQuery: function() {
			$("#allDataMapAlert").empty();
			$("#allDataMapAlert").removeClass("dialogBoxAlert");
			$("div.modal-backdrop").removeClass("modal-backdrop");

			// $("#alldataAlert").addClass("masqued");
			$("#waitControl").remove();
		},
		loadTrack: function() {
			var action = $('#allDataLoadTrack').text();
			if (action == "load tracks") {
				var url = "ressources/shp800.geojson";
				this.map_view.updateLayer("tracks", url);
				$('#allDataLoadTrack').text('remove tracks');
			} else {
				this.map_view.removeLayer("tracks");
				$('#allDataLoadTrack').text('load tracks');
			}
		}
	});
	app.views.AlertMapBox = app.views.BaseView.extend({
		template: "alertMapBox",
		initialize: function(options) {
			this.featuresNumber = options.featuresNumber;
			this.cancelLoading = options.cancel;
		},
		afterRender: function() {
			// display features number 
			var self = this;
			if (this.cancelLoading) {
				setTimeout(function() {
					$("#alerMapBoxLoad").addClass("masqued");
					$("#alerMapBoxCancelLoad").removeClass("masqued");
					$("#alerMapBoxNbFeaturesCancel").text(self.featuresNumber);
				}, 200);
			} else {
				setTimeout(function() {
					$("#alerMapBoxNbFeatures").text(self.featuresNumber);
				}, 200);
			}

		}
	});
	return app;
	
})(ecoReleveData);