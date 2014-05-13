
var ecoReleveData = (function(app) {
	"use strict";

	/*********************************************************
            Export
**********************************************************/
	app.views.ExportView = app.views.BaseView.extend({
		template: 'export',
		afterRender: function() {
			$.supersized({
				slides: [{
					image: ''
				}]
			});

			app.utils.getItemsList("#export-themes", "/views/themes_list");
		},
		events: {
			'change #export-themes': 'updateViewsList',
			'click .exportViewsList': 'selectCurrentView',
			'click button.close': 'exitExp'
		},
		updateViewsList: function(e) {
			var viewID = $("#export-themes option:selected").attr('value');
			app.utils.getViewsList(viewID);
		},
		selectCurrentView: function(e) {
			var viewName = $(e.target).get(0).attributes["value"].nodeValue;
			// this.setView(new app.views.ExportFilterView({viewName: viewName}));
			var route = "#export/" + viewName;
			app.router.navigate(route, {
				trigger: true
			});
		},
		exitExp: function(e) {
			app.router.navigate('#', {
				trigger: true
			});
		}
	});
	app.views.ExportFilterView = app.views.BaseView.extend({
		template: 'export-filter',
		initialize: function(options) {
			this.viewName = options.viewName;
			this.selectedFields = [];
			Array.prototype.remove = function(x) {
				for (var i in this) {
					if (this[i].toString() == x.toString()) {
						this.splice(i, 1);
					}
				}
			};
		},
		afterRender: function() {

			$("#filterViewName").text(this.viewName);
			//  $(".modal-content").css({"min-width": "600px","max-width": "1000px", "min-height": "500px","margin": "5%"});
			app.utils.generateFilter(this.viewName);
		},
		events: {
			'click #exportPrevBtn': 'exportview',
			//'click #export-add-filter' : 'addFilter',
			'click #export-field-select-btn': 'selectField',
			'click .btnDelFilterField': 'deleteFilterItem',
			'click #filter-query-btn': 'filterQuery',
			'click #exportMap': 'selectExtend',
			'click button.close': 'exitExp',
			'change #export-view-fields': 'selectField',
			'change .filter-select-operator': 'updateInputInfo',
			'click #msdnLink': 'msdnDetails'

		},
		exportview: function() {
			app.router.navigate("#export", {
				trigger: true
			});
		},
		/*addFilter : function(){
	        $("#export-field-selection").removeClass("masqued");
	        $("#filter-btn").addClass("masqued");
	       // $('#export-view-fields').css({"display": "inline-block","height": "40px","width": "350px"});
	    },*/
		selectField: function() {
			var fieldName = $("#export-view-fields option:selected").text();
			var fieldId = fieldName.replace("@", "-");
			// check if field is already selected
			var ln = this.selectedFields.length;
			var isSelected = false;
			if (fieldName === "") {
				isSelected = true;
			} else {
				if (ln > 0) {
					for (var i = 0; i < ln; i++) {
						if (this.selectedFields[i] == fieldId) {
							isSelected = true;
							break;
						}
					}
				}
			}

			if (isSelected === false) {
				var fieldType = $("#export-view-fields option:selected").attr('type');
				var fieldIdattr = fieldName.replace("@", "-");
				// generate operator
				var operatorDiv = this.generateOperator(fieldType);
				var inputDiv = this.generateInputField(fieldType);
				var fieldFilterElement = "<div class ='row-fluid filterElement' id='div-" + fieldIdattr + "'><div class='span4 name' >" + fieldName + "</div><div class='span1 operator'>" + operatorDiv + "</div><div class='span3'>";
				fieldFilterElement += inputDiv + "</div><div class='span3'><span id='filterInfoInput'></span></div><div class='span1'><a cible='div-" + fieldIdattr + "' class='btnDelFilterField'><img src='img/Cancel.png'/></a></div></div>";
				$("#export-filter-list").append(fieldFilterElement);
				$("#export-filter-list").removeClass("masqued");
				$('#filter-query').removeClass("masqued");
				this.selectedFields.push(fieldIdattr);
			}
		},
		updateInputInfo: function() {
			$(".filterElement").each(function() {
				var operator = $(this).find("select.filter-select-operator option:selected").text();
				if (operator == "LIKE") {
					$("#filterInfoInput").html("sql wildcard is allowed: <a id='msdnLink'>more details</a>");
				} else if (operator == "IN") {
					$("#filterInfoInput").text(" for multi-seletion, separator is ';' ");
				} else {
					$("#filterInfoInput").text("");
				}
			});
		},
		deleteFilterItem: function(e) {
			var elementId = $(e.target).parent().get(0).attributes["cible"].nodeValue;
			var fieldName = elementId.substring(4, elementId.length);
			elementId = "#" + elementId;
			$(elementId).remove();
			this.selectedFields.remove(fieldName);
		},
		filterQuery: function() {
			var query = "";
			var self = this;
			$(".filterElement").each(function() {

				var fieldName = $(this).find("div.name").text();
				/*var operator = $(this).find("div.operator").text();
	            if (operator !="LIKE"){*/
				var operator = $(this).find("select.filter-select-operator option:selected").text();
				/*} else {
	                operator = " LIKE ";
	            }   */

				if (operator == "LIKE") {
					operator = " LIKE ";
				}
				if (operator == "IN") {
					operator = " IN ";
				}

				var condition = $(this).find("input.fieldval").val();
				query += fieldName + operator + condition + ",";
			});
			// delete last character "&"
			query = query.substring(0, query.length - 1);
			var selectedView = this.viewName;
			$("#filterForView").val(query);
			app.utils.getFiltredResult("filter-query-result", query, selectedView);
			this.query = query;
		},
		selectExtend: function() {
			var selectedView = this.viewName;
			var filterValue = $("#filterForView").val();
			if ((this.selectedFields.length > 0) && (!this.query)) {
				var getFilter = this.filterQuery();
				$.when(getFilter).then(function() {
					app.views.filterValue = $("#filterForView").val();
					var route = "#export/" + selectedView + "/filter";
					/* var filterValue = $("#filterForView").val();
	                var route = "#export/" + selectedView + "/" + filterValue;*/
					app.router.navigate(route, {
						trigger: true
					});
				});
			} else if (this.selectedFields.length === 0) {
				app.views.filterValue = "";
				var route = "#export/" + selectedView + "/";
				app.router.navigate(route, {
					trigger: true
				});
			} else {
				app.views.filterValue = filterValue;
				var rt = "#export/" + selectedView + "/filter";
				app.router.navigate(rt, {
					trigger: true
				});
			}
			/*
	             window.print();
	        */
		},
		generateOperator: function(type) {
			var operatorDiv;
			switch (type) {
				case "string":
					operatorDiv = "<select class='filter-select-operator'><option>=</option><option>LIKE</option><option>IN</option></select>"; //"LIKE";
					break;
				case "integer":
					operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option></select>";
					break;
					/*case "datetime":
	        operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option></select>";
	          break;*/
				case "text":
					operatorDiv = "<select class='filter-select-operator'><option>=</option><option>LIKE</option><option>IN</option></select>"; //"LIKE";
					break;
				default:
					operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option></select>";
			}
			return operatorDiv;
		},
		generateInputField: function(type) {
			var inputDiv = "";
			switch (type) {
				case "datetime":
					inputDiv = "<input type='date' placeholder='YYYY-MM-DD' class='fieldval'/>";
					break;
				default:
					inputDiv = "<input type='text' class='fieldval'/>";
			}
			return inputDiv;
		},
		exitExp: function(e) {
			if (app.xhr) {
				app.xhr.abort();
			}
			app.router.navigate('#', {
				trigger: true
			});
		},
		msdnDetails: function() {
			window.open('http://technet.microsoft.com/en-us/library/ms179859.aspx', '_blank');
		}
	});
	app.views.ExportMapView = app.views.BaseView.extend({
		template: "export-map",
		initialize: function(options) {
			this.currentView = options.view;
			//this.filterValue = options.filter;
			this.filterValue = app.views.filterValue;
			//$("input#updateSelection").trigger('change');
		},
		afterRender: function(options) {
			$("#filterViewName").text(this.currentView);
			$('#map').css({
				"width": "800px",
				"height": "400px"
			});
			//   $(".modal-body").css({"max-height":"600px"});
			var point = new NS.UI.Point({
				latitude: 31,
				longitude: 61,
				label: ""
			});
			this.map_view = app.utils.initMap(point, 3);
			/*var style = new OpenLayers.Style({
	              pointRadius:0.2,strokeWidth:0.2,fillColor:'#edb759',strokeColor:'white',cursor:'pointer'
	        });
	        this.map_view.addLayer({point : point , layerName : "", style : style, zoom : 3});*/
			//masquer certains controles
			/*
	         var controls = this.map_view.map.getControlsByClass("OpenLayers.Control.MousePosition");
	        this.map_view.map.removeControl(controls[0]);
	        controls = this.map_view.map.getControlsByClass("OpenLayers.Control.Panel");
	        this.map_view.map.removeControl(controls[0]);
	        // add zoom controls to map
	        this.addControlsToMap(); */
			//add bbox content
			NS.UI.bbox = new NS.UI.BBOXModel();
			// init bbox model
			NS.UI.bbox.set("minLatWGS", "");
			NS.UI.bbox.set("minLonWGS", "");
			NS.UI.bbox.set("maxLatWGS", "");
			NS.UI.bbox.set("maxLonWGS", "");
			var bboxView = new app.views.BboxMapView({
				model: NS.UI.bbox
			});
			bboxView.$el.appendTo("#bbox");
			bboxView.render();

			// add geodata to base layer
			this.displayWaitControl();
			var serverUrl = localStorage.getItem("serverUrl");
			var url = serverUrl + "/views/get/" + this.currentView + "?filter=" + this.filterValue + "&format=geojson&limit=0";

			/*
	        var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON" , strategies:["BBOX"], cluster:true, params:{round:"0"}});
	        this.map_view.addLayer({protocol : protocol , layerName : "Observations", noSelect : false});
	        */

			var ajaxCall = {
				url: url,
				format: "GEOJSON",
				params: {
					round: "0"
				},
				cluster: true,
				serverCluster: true
			};
			this.map_view.addLayer({
				ajaxCall: ajaxCall,
				layerName: "Observations",
				noSelect: false,
				zoom: 4,
				zoomToExtent: true
			});



			/*var controls = this.map_view.map.getControlsByClass("OpenLayers.Control.MousePosition");
	        this.map_view.map.removeControl(controls[0]);
	        controls = this.map_view.map.getControlsByClass("OpenLayers.Control.Panel");
	        this.map_view.map.removeControl(controls[0]);*/
			// add zoom controls to map
			// this.addControlsToMap(); 

			//this.addControlsToMap();



			/*
	       // calculate initial count
	        var filterVal = this.filterValue;
	        //var query = "filter=" + filterVal;
	        app.utils.getFiltredResult("countViewRows", filterVal,this.currentView);
	        */
		},
		events: {
			'click #export-back-filter': 'backToFilter',
			'click #geo-query': 'getqueryresult',
			'click #export-result': 'getResult',
			'click #export-first-step': 'backToFistStep',
			'click button.close': 'exitExp'
		},
		backToFilter: function() {
			window.clearInterval(this.timer);
			var route = "#export/" + this.currentView;
			app.router.navigate(route, {
				trigger: true
			});

			/* var currentView = this.currentView;
	        window.clearInterval(this.timer);
	        app.views.main.setView(".layoutContent", new app.Views.ExportFilterView({viewName: currentView}));
	        app.views.main.render();*/
		},
		addControlsToMap: function() {
			var panel = new OpenLayers.Control.Panel({
				displayClass: 'panel',
				allowDepress: false
			});
			var zoomBox = new OpenLayers.Control.ZoomBox();
			var navigation = new OpenLayers.Control.Navigation();
			var zoomBoxBtn = new OpenLayers.Control.Button({
				displayClass: 'olControlZoomBox',
				type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
					'activate': function() {
						zoomBox.activate();
						navigation.deactivate();
					},
					'deactivate': function() {
						zoomBox.deactivate();
					}
				}
			});
			var navigationBtn = new OpenLayers.Control.Button({
				displayClass: 'olControlNavigation',
				type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
					'activate': function() {
						navigation.activate();
						zoomBox.deactivate();
					},
					'deactivate': function() {
						navigation.deactivate();
					}
				}
			});
			panel.addControls([zoomBoxBtn, navigationBtn]);
			this.map_view.map.addControls([panel, zoomBox, navigation]);
		},
		getqueryresult: function() {
			var selectedview = this.currentView;
			var bboxVal = $("input#updateSelection").val();
			var filterVal = this.filterValue;
			var query = "filter=" + filterVal + "&bbox=" + bboxVal;
			app.utils.getResultForGeoFilter(query, selectedview);
		},
		getResult: function() {
			//window.clearInterval(this.timer);
			app.views.selectedview = this.currentView;
			app.views.bbox = $("input#updateSelection").val() || "";
			app.views.filterVal = this.filterValue;
			var route = "#export/" + this.currentView + "/fields";
			app.router.navigate(route, {
				trigger: true
			});
			/*this.remove();
	        var myview = new app.views.ExportColumnsSelection ({view: selectedview ,filter:filterVal, bbox: bboxVal});
	        myview.render();
	        myview.$el.appendTo("#main");*/
			/* app.views.main.setView(".layoutContent", new app.Views.ExportColumnsSelection({view: selectedview ,filter:filterVal, bbox: bboxVal}));
	        app.views.main.render();*/


		},
		backToFistStep: function() {
			//window.clearInterval(this.timer);
			app.router.navigate("#export", {
				trigger: true
			});
		},
		exitExp: function(e) {
			app.router.navigate('#', {
				trigger: true
			});
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
		}
	});

	app.views.BboxMapView = app.views.BaseView.extend({
		template: "map-bbox",
		initialize: function(options) {
			/*this.listenTo(this.model, 'change', this.update);
	        app.views.BaseView.prototype.initialize.apply(this, arguments);*/
			this.model.on('change', this.render, this);
		}
	});
	app.views.ExportColumnsSelection = app.views.BaseView.extend({
		template: "export-columns",
		initialize: function(options) {
			this.currentView = options.view;
			// this.filterValue = app.views.filterValue;
			//this.bbox = app.views.bbox;
		},
		afterRender: function(options) {
			// $(".modal-content").css({"height":"700px", "max-width": "900px"});
			//  $('#map').css({"width":"700px","height":"400px"});
			// $(".modal-body").css({"max-height":"600px"});
			$("#filterViewName").text(this.currentView);
			var fieldsList = app.utils.exportFieldsList;
			var fieldsListforFom = [];
			// parcourir la liste de champs, afficher celles qui ne correspondent pas aux champs a afficher par défaut (lat, lon, date, station ou site_name)
			var ln = fieldsList.length;
			// columns to display on grid
			//this.displayWaitControl();
			app.utils.exportSelectedFieldsList = [];
			for (var i = 0; i < ln; i++) {
				var field = fieldsList[i];
				var fieldUpper = field.toUpperCase();
				var stationAdded = false;
				if (fieldUpper == "STATION") {
					app.utils.exportSelectedFieldsList.push(field);
					stationAdded = true;
				} else if ((fieldUpper == "LAT") || (fieldUpper == "LON") || (fieldUpper == "DATE")) {
					app.utils.exportSelectedFieldsList.push(field);
				} else if (fieldUpper == "SITE_NAME") {
					// si champ station exite, il ne faut pas rajouter ce champ à la liste de champs a afficher
					if (stationAdded === false) {
						app.utils.exportSelectedFieldsList.push(field);
					} else {
						fieldsListforFom.push(field);
					}
				} else if (fieldUpper == "PTT") {
					app.utils.exportSelectedFieldsList.push(field);
				} else {
					fieldsListforFom.push(field);
				}
			}


			/*var ln = fieldsList.length;
	        //generate datatable structure
	        for (var i=0; i< ln ; i++){
	            var fieldName = fieldsList[i];
	            var fieldHtml = "<th>" + fieldName + "</th>";
	            $("#exportResultList-head").append(fieldHtml);
	            
	        }*/
			var columnsModel = new app.models.ProtoModel();
			var schema = {
				Columns: {
					type: 'CheckBox',
					title: '',
					options: fieldsListforFom /*, inline : 'true'*/
				} //,validators: ['required']
			};
			columnsModel.schema = schema;
			columnsModel.constructor.schema = columnsModel.schema;
			columnsModel.constructor.verboseName = "dataset";
			setTimeout(function() {
				var myView = new app.views.ExportColumnsListFormView({
					initialData: columnsModel
				});
				myView.render();
				$("#formcolumns").append(myView.el);
				$("#exportResult").on("click", $.proxy(myView.onSubmit, myView));
				$(".form-actions").addClass("masqued");
				// $("#waitControl").remove();
			}, 2000);


			// this.$el.append(myView.render().el);


		},
		events: {
			'click #exportPrevMapBtn': 'backToMap',
			'click #exportResult': 'getResult',
			'click #export-first-step': 'backToFistStep',
			'click button.close': 'exitExp'
		},
		backToMap: function() {
			//app.views.main.removeView("#formcolumns");
			var currentView = this.currentView;
			// var filterValue = this.filterValue;
			var route = "#export/" + currentView + "/filter";
			app.router.navigate(route, {
				trigger: true
			});
			/*app.views.main.setView(".layoutContent", new app.Views.ExportMapView({view : currentView, filter: filterValue}));
	        app.views.main.render();*/
		},
		getResult: function() {
			var displayedColumns = app.utils.exportSelectedFieldsList || [];
			if (displayedColumns.length > 0) {
				var selectedview = this.currentView;
				var router = "#export/" + selectedview + "/result";
				app.router.navigate(router, {
					trigger: true
				});
				/*app.views.main.setView(".layoutContent", new app.Views.ExportResult({view: selectedview ,filter:filterVal, bbox: bboxVal}));
	            app.views.main.render();*/
			} else {
				alert("please select columns to display");
			}

		},
		backToFistStep: function() {
			app.router.navigate("#export", {
				trigger: true
			});
		},
		exitExp: function(e) {
			app.router.navigate('#', {
				trigger: true
			});
		},
		displayWaitControl: function() {
			var mapDiv = this.map_view.el;
			var width = ((screen.width) / 2 - 200);
			var height = ((screen.height) / 2 - 200);
			var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>";
			var st = $("#waitControl").html();
			if ($("#waitControl").length === 0) {
				$("div.modal-body").append(ele);
			}
		}
	});
	app.views.ExportColumnsListFormView = NS.UI.Form.extend({
		initialize: function(options) {
			//this.protocolsList = options.protocols ; 
			NS.UI.Form.prototype.initialize.apply(this, arguments);
			this.on('submit:valid', function(instance) {
				var ln;
				var attr = instance.attributes.Columns;
				if (typeof attr !== "undefined") {
					ln = attr.length;
				} else {
					ln = 0;
				}
				if (ln > 5) {
					alert(" please select max 5 columns ");
				} else {
					// add all selected fields to displayed fields list
					for (var i = 0; i < ln; i++) {
						app.utils.exportSelectedFieldsList.push(attr[i]);
					}
				}
			});
		}
	});
	//$exportresult
	app.views.ExportResult = app.views.BaseView.extend({
		template: "export-result",
		initialize: function(options) {
			this.currentView = options.view;
			this.filterValue = app.views.filterValue;
			this.bbox = app.views.bbox;
		},
		afterRender: function(options) {
			var serverUrl = localStorage.getItem("serverUrl");
			var gpxFileUrl = serverUrl + "/gps/data.gpx";
			var pdfFileUrl = serverUrl + "/pdf/data.pdf";
			var csvFileUrl = serverUrl + "/csv/data.csv";
			$('#export-getGpx').attr("href", gpxFileUrl);
			$('#export-getPdf').attr("link", pdfFileUrl);
			$('#export-getCsv').attr("href", csvFileUrl);

			$("#filterViewName").text(this.currentView);
			var fieldsList = app.utils.exportSelectedFieldsList;
			if (app.utils.exportSelectedFieldsList[0] == "Id") {
				app.utils.exportSelectedFieldsList.shift();
			}
			var ln = fieldsList.length;
			//generate datatable structure
			for (var i = 0; i < ln; i++) {
				var fieldName = fieldsList[i];
				var fieldHtml = "<th>" + fieldName + "</th>";
				$("#exportResultList-head").append(fieldHtml);

			}
			app.utils.getExportList(this.currentView, this.filterValue, this.bbox, this);
			$("#exportResultList-head").css({
				"color": "black"
			});
			// map view
			this.displayedCols = app.utils.exportSelectedFieldsList;
			this.url = serverUrl + "/views/get/" + this.currentView + "?filter=" + this.filterValue + "&bbox=" + this.bbox + "&columns=" + this.displayedCols;
			//add id field to field list to display on the map
			this.displayedCols.unshift("Id");
			$('#map').css({
				"width": "900px",
				"height": "550px"
			});
			var point = new NS.UI.Point({
				latitude: 31,
				longitude: 61,
				label: ""
			});
			this.map_view = app.utils.initMap(point, 2);
			var url = this.url + "&format=geojson";
			var style = new OpenLayers.Style({
					pointRadius: 4,
					strokeWidth: 1,
					fillColor: '#edb759',
					strokeColor: 'black',
					cursor: 'pointer',
					label: "${getLabel}",
					labelXOffset: "50",
					labelYOffset: "-15"
				}, {
					context: {
						getLabel: function(feature) {
							if (feature.layer.map.getZoom() > 5) {
								//return feature.attributes.label;
								// return list of arributes (labels to display on the map)
								var labelsList = [];
								for (var k in feature.attributes) {

									if ((k != "Id") && (k != "count")) {
										labelsList.push(feature.attributes[k]);
									}
									labelsList.unshift(feature.attributes["Id"]);
									return labelsList;
								}
							} else {
								return "";
							}
						}
					}
				}


			);
			/*
	        var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["FIXED"], popup : false, style: style});
	        this.map_view.addLayer({protocol : protocol , layerName : "Observations", });
	        */
			var ajaxCall = {
				url: url,
				format: "GEOJSON",
				cluster: false,
				style: style
			};
			this.map_view.addLayer({
				ajaxCall: ajaxCall,
				layerName: "Observations",
				zoom: 3,
				zoomToExtent: true
			});

			//this.addControlsToMap();
			// load map vector fields list
			var len = this.displayedCols.length;
			for (var s = 0; s < len; s++) {
				var label = this.displayedCols[s];
				$("#map-field-selection").append("<option>" + label + "</option>");
			}


		},
		events: {
			'click #exportPrevBtn': 'backToMap',
			//'click #export-getGpx' : 'getGpx',
			'click #export-first-step': 'backToFistStep',
			'click #exportDataMap': 'dataOnMap',
			'click #export-getPdf': "getPdfFile",
			'click #export-getCsv': 'getCsvFile',
			'click button.close': 'exitExp',
			'change #map-field-selection': 'updateMap',
			'click #map-label-hposition-off': "moveHlabelOff",
			'click #map-label-hposition-in': "moveHlabelIn",
			'click #map-label-vposition-off': "moveVlabelOff",
			'click #map-label-vposition-in': "moveVlabelIn",
			'click #export-map-print': 'printMap'
		},
		backToMap: function() {
			if (app.xhr) {
				app.xhr.abort();
			}
			var currentView = this.currentView;
			//  var filterValue = this.filterValue;
			//  var bboxVal = this.bbox;
			var route = "#export/" + currentView + "/filter";
			app.router.navigate(route, {
				trigger: true
			});
			//app.views.main.setView(".layoutContent", new app.Views.ExportColumnsSelection({view: currentView ,filter:filterValue, bbox: bboxVal}));
			// app.views.main.render();
		},
		getPdfFile: function() {
			var url = $('#export-getPdf').attr("link");
			window.open(url, 'list export in pdf');
		},
		getCsvFile: function() {

		},
		backToFistStep: function() {
			if (app.xhr) {
				app.xhr.abort();
			}
			app.router.navigate("#export", {
				trigger: true
			});
		},
		dataOnMap: function() {
			var route = "#export/" + this.currentView + "/ResultOnMapView";
			app.router.navigate(route, {
				trigger: true
			});
		},
		exitExp: function(e) {
			if (app.xhr) {
				app.xhr.abort();
			}
			app.router.navigate('#', {
				trigger: true
			});
		},
		addControlsToMap: function() {
			var panel = new OpenLayers.Control.Panel({
				displayClass: 'panel',
				allowDepress: false
			});
			var zoomBox = new OpenLayers.Control.ZoomBox();
			var navigation = new OpenLayers.Control.Navigation();
			var zoomBoxBtn = new OpenLayers.Control.Button({
				displayClass: 'olControlZoomBox',
				type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
					'activate': function() {
						zoomBox.activate();
						navigation.deactivate();
					},
					'deactivate': function() {
						zoomBox.deactivate();
					}
				}
			});
			var navigationBtn = new OpenLayers.Control.Button({
				displayClass: 'olControlNavigation',
				type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
					'activate': function() {
						navigation.activate();
						zoomBox.deactivate();
					},
					'deactivate': function() {
						navigation.deactivate();
					}
				}
			});
			panel.addControls([zoomBoxBtn, navigationBtn]);
			this.map_view.map.addControls([panel, zoomBox, navigation]);
		},
		printMap: function() {
			window.print();
		},
		updateMap: function() {
			var selectedValue = $('#map-field-selection :selected').text();
			this.map_view.editLabel("Observations", selectedValue);
		},
		moveHlabelOff: function() {
			this.map_view.moveLabel("Observations", "h", "-2");
		},
		moveHlabelIn: function() {
			this.map_view.moveLabel("Observations", "h", "+2");
		},
		moveVlabelOff: function() {
			this.map_view.moveLabel("Observations", "v", "-2");
		},
		moveVlabelIn: function() {
			this.map_view.moveLabel("Observations", "v", "+2");
		}
	});
	app.views.GridView = app.views.BaseView.extend({
		initialize: function(options) {
			app.utilities.BaseView.prototype.initialize.apply(this, arguments);
			this.grid = new NS.UI.Grid(options);
			this.insertView(this.grid);
			// Relay grid events
			this.grid.on('selected', function(model) {
				this.trigger('selected', model);
			}, this);
			this.grid.on('sort', function(field, order) {
				this.trigger('sort', field, order);
			}, this);
			this.grid.on('unsort', function() {
				this.trigger('unsort');
			}, this);
			this.grid.on('filter', function(fieldId, value) {
				this.trigger('filter', fieldId, value);
			}, this);
			this.grid.on('unfilter', function(fieldId) {
				this.trigger('unfilter', fieldId);
			}, this);
			this.grid.on('page', function(target) {
				this.trigger('page', target);
			}, this);
			this.grid.on('pagesize', function(size) {
				this.trigger('pagesize', size);
			}, this);
			// Custom date picker
			this.grid.addDatePicker = function(element) {
				var $el = $(element),
					val = $el.val();
				$el.attr('type', 'text');
				$el.datepicker({
					format: app.config.dateFormat
				}) //  dd/mm/yyyy                
				.on('changeDate', $el, function(e) {
					if (e.viewMode == 'days') {
						e.data.trigger('input');
					}
				});
				$el.on('input', function(e) {
					$(this).datepicker('hide');
				});
				$el.on('keydown', function(e) {
					if (e.keyCode == 27 || e.keyCode == 9) $(this).datepicker('hide');
				});
				if (val) $el.datepicker('setValue', val);
			};
		}
	});
	return app;
})(ecoReleveData);
