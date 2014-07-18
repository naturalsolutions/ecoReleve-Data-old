
	
	/***************************************************************************
$bird 				birds
****************************************************************************/
	var ecoReleveData = (function(app) {
	"use strict";
	app.views.Birds = app.views.BaseView.extend({
		template: "birdFilter",
		afterRender: function() {
			$("section#main").addClass("blackBackground");
			//$('.objectsIndivGrid').lionbars();
			var windowWidth = $(window).width();
			var windowHeigth = $(window).height();
			$("#objectsIndivFilter").css("height",windowHeigth-50);
			$.supersized({
				slides: [{
					image: ''
				}]
			});
			// load data
			var serverUrl = app.config.serverUrl;
			var coreUrl = app.config.coreUrl;
			var indivUrl =  coreUrl + '/individuals/search';
			this.indivUrl = indivUrl;
			// load data for indiv grid
			this.getBirdsList();
			// autocomplete for field species
			var autocompleteUrl = coreUrl + '/individuals/search/values?limit=100&field_name='; 
			var fieldSpecies = autocompleteUrl +'specie';
			app.utils.getSimpledataListForBirdFilter ("#speciesList", fieldSpecies);
			// autocomplete for release area
			var fieldArea = autocompleteUrl + 'releaseArea';
			app.utils.getSimpledataListForBirdFilter ("#releaseAreaList", fieldArea);
			// autocomplete for release year
			var fieldYear = autocompleteUrl + 'releaseYear';
			app.utils.getSimpledataListForBirdFilter ("#releaseYearList", fieldYear);
			var fieldSexUrl = autocompleteUrl + 'sex'; 
			app.utils.getSimpledataListForBirdFilter ("#birdSexList", fieldSexUrl);
			var fieldSurveyUrl = autocompleteUrl + 'surveyType';
			app.utils.getSimpledataListForBirdFilter ("#birdSurveyList", fieldSurveyUrl);
			var fieldPttUrl = autocompleteUrl + 'ptt';
			app.utils.getSimpledataListForBirdFilter ("#birdPttList", fieldPttUrl);
			var fieldFrequencyUrl = autocompleteUrl + 'frequency';
			app.utils.getSimpledataListForBirdFilter ("#birdFrequencyList", fieldFrequencyUrl);
			var fieldMonitoryUrl = autocompleteUrl + 'monitoringStatus';
			app.utils.getSimpledataListForBirdFilter("#birdMonitoryList", fieldMonitoryUrl);
			var fieldChipCodeUrl = autocompleteUrl + 'chipCode';
			app.utils.getSimpledataListForBirdFilter ("#birdChipCodeList", fieldChipCodeUrl);
			var fieldReleaseRingColorUrl = autocompleteUrl + 'releaseRingColor';
			app.utils.getSimpledataListForBirdFilter("#birdReleaseRingColorList", fieldReleaseRingColorUrl);
			var fieldColorUrl = autocompleteUrl + 'markColor1' ;
			app.utils.getSimpledataListForBirdFilter ("#birdMarkColorList", fieldColorUrl);
			var fieldAgeUrl = autocompleteUrl  + 'age' ;
			app.utils.getSimpledataListForBirdFilter ("#birdAgeList", fieldAgeUrl);
			var fieldOriginUrl = autocompleteUrl  + 'origin';
			app.utils.getSimpledataListForBirdFilter ("#birdOriginList", fieldOriginUrl);
			var fieldReleaseRingUrl = autocompleteUrl + 'releaseRingCode' ;
			app.utils.getSimpledataListForBirdFilter ("#birdReleaseRingList", fieldReleaseRingUrl);
			var fieldBreedingRingUrl = autocompleteUrl + 'breedingRingCode' ;
			app.utils.getSimpledataListForBirdFilter("#birdBreedingRingList", fieldBreedingRingUrl);
			// get array to store serach criterias
			var storedCriterias = localStorage.getItem('indivFilterStoredCriterias') || "";
			if (!storedCriterias){
				this.criterias =  [];
			} else {
				this.criterias = JSON.parse(storedCriterias);
			}
		},
		events :{
			'click #indivFilterSubmit' :'getBirdsList', // 'getBirdsList',
			'click tr': 'selectTableElement',
			'click #indivFilterClear' : 'clearFields',
			'click #hideShowFilter' : 'moveFilter',
			'click #indivFilterSave' : 'saveCriterias',
			'click li#serachHeaderElem1' : 'selectSearchMode',
			'click li#serachHeaderElem2' : 'selectSearchMode',
			'click #indivSavedFiltersList li span.spnSavedFilterVal' : 'selectSavedFilter',
			'click #indivSavedFiltersList li img' : 'deleteSavedFilter'
		},
		getBirdsList : function(){
			var url = this.indivUrl;
			var criteria  = this.getParams();
			var params = {
                criteria:criteria,
                limit:50
			};
			var type = 'POST';
			params =JSON.stringify(params);
			app.utils.getDataForGridAdvanced(url,type, params, function(collection, rowsNumber) {
				app.utils.initGridServer(collection, rowsNumber, url, {
					pageSize: 50,
					//columns: [2, 6, 7, 8],
					container: "#gridContainer"
				});
				if (!$('#grid').hasClass('mCustomScrollbar')) {
        			$("#grid").mCustomScrollbar({
						theme:"dark",
						horizontalScroll:true
					});
				}
			});
		},
		getParams : function(){
			var inputs = $("#indivCurrentSearch input");
	    	var criteria  = {};
		    inputs.each(function(){
		        var name  = $(this).attr('name');
		        var value = $(this).val();
		        if (value){
			        if ((name ==="id") || (name==="frequency")||(name==="ptt") ||(name==="releaseYear")){
			        	value = parseInt(value,10);
			        }
			        criteria[name] = value;
		        }
	    	});
			return criteria;
		},
		saveCriterias : function() {
			var params = this.getParams();
			if (!jQuery.isEmptyObject(params)){
				this.addModalWindow(params);
			} else {
				alert("please input criterias to save.");
			}
		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode.nodeName;
			if (ele == "TR") {
				var selectedModel = app.models.selectedModel;
				var id = selectedModel.get("id");
				var route = '#bird/' + id;
				app.router.navigate(route, {trigger: true});
			}
		},
		clearFields : function() {
			$("input").val("");
		},
		moveFilter : function() {	
		    //$("#objectsIndivFilter").toggle( "slide" );
		    //var windowWidth = $(window).width();
		    $("#objectsIndivFilter").toggle("slide", function() {
		    	var displayed = $( "#objectsIndivFilter" ).css('display');
			    if (displayed ==="none"){
			    	$("#hideShowFilter").addClass("selected");
			    	$("#objectsIndivFilter").removeAttr("class");
			    	$("#objectsIndivFilter").addClass("span0");
			    	$("#objectsIndGrid").removeAttr("class");
			    	$("#objectsIndGrid").addClass("span12");
			    	$("#hideShowFilter").css("left", "0px");

			    } else {
			    	$("#objectsIndGrid").removeAttr("class");
			    	$("#hideShowFilter").removeClass("selected");
			    	$("#objectsIndivFilter").removeAttr("class");
			    	$("#objectsIndivFilter").addClass("span3");
			    	$("#objectsIndGrid").addClass("span9");
			    	
			    	$("#hideShowFilter").css("left", "405px");
			    }
		    });
		   
		},
		addModalWindow : function(params){
		 	var serachName = prompt("please input serach name", "");
  			alert("search criterias saved.");
  			var ln = this.criterias.length;
  			var searchItem = {};
  			searchItem.name = serachName;
  			// id searchItem = ln + 1 
  			searchItem.id = ln + 1 ;
  			searchItem.query = JSON.stringify(params);
  			this.criterias.push(searchItem);
  			localStorage.setItem('indivFilterStoredCriterias',JSON.stringify(this.criterias));
		},
		selectSearchMode : function(e) {
			var selectedElement = e.target; 
			var nodeName = selectedElement.nodeName;
			var liElement;
			if (nodeName == "LI") {
				liElement = selectedElement;
			} else {
				liElement = selectedElement.parentNode;
			}
			var idElement = $(liElement).attr("id");
			$(".serachHeaderElem").removeClass("selected");
			$(liElement).addClass("selected");
			if (idElement ==="serachHeaderElem2"){
				$("#indivCurrentSearch").addClass("masqued");
				$("#indivSavedSearch").removeClass("masqued");
				this.displaySavedCriterias();
			} else {
				$("#indivCurrentSearch").removeClass("masqued");
				$("#indivSavedSearch").addClass("masqued");
			}
		},
		selectSavedFilter : function(e) {
			var selectedElement = e.target; 
			var liElement = selectedElement.parentNode;
			var filterId = $(liElement).attr('id');
			// get params for selected filter
			var params;
			var ln = this.criterias.length;
			for (var i = 0; i < ln; i++) {
				// get item
				var savedItemId= this.criterias[i].id;
				if(savedItemId ==filterId){
					params = this.criterias[i].query;
					break;
				}
			}
			var param = {
                criteria:JSON.parse(params),
                limit:50
			};
			// send query with saved criterias
			var url = this.indivUrl ;
			param =JSON.stringify(param);
			app.utils.getDataForGridAdvanced(url,'POST', param, function(collection, rowsNumber) {
				app.utils.initGridServer(collection, rowsNumber, url, {
					pageSize: 50,
					//columns: [2, 6, 7, 8],
					container: "#gridContainer"
				});
				if (!$('#grid').hasClass('mCustomScrollbar')) {
        			$("#grid").mCustomScrollbar({
						theme:"dark",
						horizontalScroll:true
					});
				}
			});
		},
		deleteSavedFilter : function(e) {
			var selectedElement = e.target; 
			var liElement = selectedElement.parentNode.parentNode;
			// get li id  => id of filter object
			var filterId = $(liElement).attr('id');
			// delete object from criterias list and update displayed list
			var ln = this.criterias.length;
			for (var i = 0; i < ln; i++) {
				// get item
				var savedItemId= this.criterias[i].id;
				if(savedItemId ==filterId){
					//alert ("savedItemId :" + savedItemId);
					var elem = this.criterias.splice(i,1);
					//update displayed list
					this.displaySavedCriterias();
					break;
				}
			}
		},
		displaySavedCriterias: function() {
			$("#indivSavedFiltersList").empty();
			var ln = this.criterias.length;
			if (ln ===0 ){
				$("#indivSavedFiltersList").append("<p> no saved criterias</p>");
			} else {
				for (var i = 0; i < ln; i++) {
					// get item
					var savedItem= this.criterias[i];
					var element = "<li id='" + savedItem.id + "'><span class='spnSavedFilterVal'>" + savedItem.name + "</span><span><img src='images/delete_grey.png' class='birdCritDel'></span></li>";
					$("#indivSavedFiltersList").append(element);
				}
			}
		},
		remove: function(options) {
			app.views.BaseView.prototype.remove.apply(this, arguments);
			$("section#main").removeClass("blackBackground");
		}
	});
	app.views.Bird = app.views.BaseView.extend({
		template: "birdDetails",
		initialize : function(options) {
			app.views.BaseView.prototype.initialize.apply(this, arguments);
			this.birdId = options.id;
			this.intervalAnimation = 0.3; 
			$("section#main").addClass("blackBackground");
			$("section#main").addClass("fixVerticalScroll");
		},
		afterRender: function() {
			var windowHeigth = $(window).height();
			var windowWidth = $(window).width();
			var _this = this;
			$("#birdDetails").css({"height": windowHeigth -50 });
			$("#map").css("height",windowHeigth-170);
			$("#map").css("width",windowWidth/2);
			// change map width if window is resized
			$(window).bind('resize', $.proxy(function(e) {
				// detect if map is displayed to full screen or not
				windowHeigth = $(e.currentTarget).height();
				windowWidth = $(e.currentTarget).width();
				var classMasqued =  $("#showIndivDetails").attr("class");
				if(classMasqued){
					$("#map").css("width",windowWidth/2);
				} else{
					$("#birdMap").css("width","100%");
					$("#map").css("width",windowWidth);

				}
				// check if "animationDiv" is masqued to update map height
				if ($('#animationDiv').hasClass('masqued')) {
					$("#map").css("height",windowHeigth-50);
				} else {
					$("#map").css("height",windowHeigth-170);
				}
					
				if (this.map_view.map){
					this.map_view.map.updateSize();
					// refrech vector layer
					var nblayers = _this.map_view.map.layers.length;
					// get the layer
					var vectorLayer = _this.map_view.map.layers[nblayers - 1];
					vectorLayer.refresh({force:true});
				}
				// update grid height
				this.updateGridHeight();
				// update the size of animation div (map legend) by modifying span values
				this.updateAnimationDivWidth(windowWidth);
			}, this));

			$("#birdId").text(this.birdId);
			//var serverUrl = localStorage.getItem("serverUrl");
			var serverUrl = app.config.coreUrl;
			var objectUrl = serverUrl + "/individuals/history?id=" + this.birdId;
			//var mapView = app.utils.displayObjectPositions(this, objectUrl, this.birdId);
			//this.insertView(mapView);
			var url = objectUrl;
			$.ajax({
				url: url,
				dataType: "json",
				context : this,
				beforeSend: function(){
			    	  $("#waitCtr").css('display', 'block');
			    },
				success: function(data) {
					//$("#map").css("width",windowWidth/2);
					var characteristic = data;
					var sex = characteristic.Sex;
					var origin = characteristic.Origin || "";
					var species = characteristic.Species || "";
					var birthDate = characteristic.Birth_date || "";
					var deathDate = characteristic.Death_date || "";
					var comments = characteristic.Comments || "";
					$("#birdSpecies").text(species);
					$("#birdBirthDate").text(birthDate);
					$("#birdSexLabel").text(sex);
					$("#birdOriginLabel").text(origin);
					// get image for this specie
					this.setSpecieImage(species);
					if(sex ==="male"){
						$("#birdSexPic").attr("src","images/sexe_m.png");
					} else {
						$("#birdSexPic").attr("src","images/sexe_f.png");
					}
					if (origin ==="wild"){
						$("#birdOriginPic").attr("src","images/origin_wild.png");
					} else {
						$("#birdOriginPic").attr("src","images/origin_release.png");
					}
				

					var age = characteristic.Age || "";
					var ptt = characteristic.PTT || "";
					$('#transmittersVal').html("<b>ptt: </b>" + ptt);
					$("#birdAgeLabel").text(age);

					var historyItems = new app.collections.HistoryItems();
					for (var i in data.history) {
						var item = data.history[i];
						var label = item["characteristic"];
						var value = item["value"];
						var begin_date = item["from"];
						var end_date = item["to"];
						var historyItem = new app.models.HistoryItem();
						historyItem.set('characteristic', label);
						historyItem.set('value', value);
						historyItem.set('begin_date', begin_date);
						historyItem.set('end_date', end_date);
						historyItems.add(historyItem);
						$("#birdAgePic").attr("src","images/age_adult.png");
						var selectedModel = app.models.selectedModel;
						if (selectedModel){
							var atr = selectedModel.attributes;
							var lastObs = atr["last observation"];
							var surveyType = atr["survey type"];
							var transmitter = atr["transmitter"];
							var monitoringStatus = atr["monitoring status"];
							$("#birdLastObs").text(lastObs);
							$("#birdSurveyType").text(surveyType);
							if (monitoringStatus==="Lost"){
								$("#birdMonitStatus").html("<img src='images/status_lost.png'/><span>" + monitoringStatus +"</span>");

							}
						}
					}
					// sort collection by begin date 
					//historyItems.sort();

					historyItems.sortByField('begin_date');
					historyItems.models = historyItems.models.reverse();
					
					// init grid
					var gridView = app.utils.initGrid(historyItems, null, {pageSize: 50, sortColumn : 'begin_date' , sortOrder : 'desc'});
					this.insertView(gridView);
					// update grid heigt to fit all space 
					this.updateGridHeight();

					$("#grid").mCustomScrollbar({
						theme:"dark"
					});
					//
					if (!$('section#main').hasClass('blackBackground')) {
						$("section#main").addClass("blackBackground");
					}

				},
				complete: function(){
			    	 $("#waitCtr").css('display', 'none');
			    },
			    error : function(){
			    	alert("error in loading data.");
			    }
			});
			// map view
			// apply slider look
			$("#dateSlider").slider({});
			//var mapUrl = objectUrl + "?format=geojson";
			var mapUrl = app.config.coreUrl + "/individuals/stations?id=" + this.birdId ;
			var point = new NS.UI.Point({
					latitude: 34,
					longitude: 44,
					label: ""
			});
			var mapView = app.utils.initMap(point, 3);
			//this.map_view = mapView;
			this.insertView(mapView);
			this.map_view = mapView;
			app.utils.timlineLayer(mapUrl, mapView, function(nbFeatures) {
				if (nbFeatures > 10){
				app.utils.animatedLayer(nbFeatures, mapUrl, mapView);
				} else {
					$("#animationDiv").addClass("masqued");
					$("#map").css("height",windowHeigth-50);
				}
			});
			$("#dateSlider").slider().on('slideStop', function() {
					// get range of date and update layer
					var interval = $("#dateSlider").data('slider').getValue();
					_this.updateTimeLineLayer(interval);
			});
			// update the size of animation div (map legend) by modifying span values
			this.updateAnimationDivWidth(windowWidth);
		},
		remove: function(options) {
			$(window).unbind("resize");
			_.each(this._views, function(viewList, selector) {
				_.each(viewList, function(view) {
					view.remove();
				});
			});
			app.views.BaseView.prototype.remove.apply(this, arguments);
			$("section#main").removeClass("blackBackground");
			$("section#main").removeClass("fixVerticalScroll");
		},
		events : {
			'click #animationStart': 'startAnimation',
			'click #animationStop': 'stopAnimation',
			'click #animationInit': 'initAnimation',
			'click img#indivDetailsExitImg' : "maskDetailsPanel",
			'click #showIndivDetails' : "showDetailsPanel"
		},
		maskDetailsPanel : function(){
			var windowWidth = $(window).width();
			var _this = this;
			$("#birdDetails").toggle("slide", function() {
				
			});
			$("#birdMap").css("width","100%");
			$("#map").css("width",windowWidth);
			// map.updateSize();
			_this.map_view.map.updateSize();
			$("#showIndivDetails").removeClass("masqued");
		},
		showDetailsPanel : function(){
			var windowWidth = $(window).width();
			var _this = this;
			$("#birdDetails").toggle("slide", function() {
				
			});
			$("#birdMap").attr("style","");
			$("#showIndivDetails").addClass("masqued");
			$("#map").css("width",windowWidth/2);
			_this.map_view.map.updateSize();

		},
		setSpecieImage : function(specieName){
			var specie;
			switch   (specieName) {
			    case "Saker Falcon" :
				case "Peregrine Falcon" :
				case "Falcon" :
				case "Gyr Falcon":
				case "Barbary Falcon":
				case "Hybrid Gyr_Peregrine Falcon":
				case "Eurasian Griffon Vulture":
				case "Desert Eagle Owl":
					// set image
					$("#birdSpecieImg").attr("src","images/faucon.png");
					break;
				case "Asian Houbara Bustard" :
				case "North African Houbara Bustard" :
					$("#birdSpecieImg").attr("src","images/houtarde.png");
					break;
				case "Black-bellied Sandgrouse":
					$("#birdSpecieImg").attr("src","images/Black-bellied Sandgrouse.png");
					break;
				case "Crocodile":
					$("#birdSpecieImg").attr("src","images/crocodile.png");
					break;
				case "Horseshoe Snake":
				case "Mograbin Diadem Snake":
					$("#birdSpecieImg").attr("src","images/Snake.png");
					break;
				case "Pelican":
					$("#birdSpecieImg").attr("src","images/Pelican.png");
					break;
				case "Rat (Atlantoxerus)":
					$("#birdSpecieImg").attr("src","images/rat.png");
					break;
				case "Spur Thighed Tortoise (graeca)":
					$("#birdSpecieImg").attr("src","images/tortoise.png");
					break;
			   default:
			   	   $("#birdSpecieImg").attr("src","images/specie.png");
    		}	
		},
		startAnimation: function() {
			var span = 5 * 86400;
			$("#dateIntervalDisplay").removeClass("masqued");
			var startDate = app.utils.AnimStartDate;
			var endDate = app.utils.AnimEndDate;
			/*var spanEl = $("#intervalOfTime");
			var interval = parseInt(spanEl.val(), 10) * 86400;*/
			var interval = 15 * 86400;
			if (this.animationTimer) {
				this.stopAnimation(true);
			}
			if (!this.currentDate) {
				this.currentDate = startDate;
			}
			var filter = app.utils.AnimFilter;
			var rule1 = app.utils.Rule1 ;
			var rule2 =	app.utils.Rule2;
			var rule3 =	app.utils.Rule3;
			var filterStrategy = app.utils.AnimfilterStrategy;
			var self = this;
			var next = function() {
				if (self.currentDate < endDate) {
					/*rule1.filter.lowerBoundary = self.currentDate;
					rule1.filter.upperBoundary = self.currentDate + (5* 86400 ); 
					*/
					rule1.filter = new OpenLayers.Filter.Comparison({
								type: OpenLayers.Filter.Comparison.BETWEEN,
								property: "date",
								lowerBoundary: self.currentDate,
								upperBoundary: (self.currentDate + (12 * 86400 )) //new Date(startDate.getTime() + (0))  // convert days number in milliseconds
							});
						/*
					rule2.filter.lowerBoundary = self.currentDate  + (5* 86400 )+1;
					rule2.filter.upperBoundary = self.currentDate + interval; 
					*/
					rule2.filter =  new OpenLayers.Filter.Comparison({
								type: OpenLayers.Filter.Comparison.BETWEEN,
								property: "date",
								lowerBoundary: self.currentDate + (12* 86400 ) + 1,
								upperBoundary: (self.currentDate + (14* 86400 ) ) //new Date(startDate.getTime() + (0))  // convert days number in milliseconds
							});

					rule3.filter =  new OpenLayers.Filter.Comparison({
								type: OpenLayers.Filter.Comparison.BETWEEN,
								property: "date",
								lowerBoundary: self.currentDate + (14* 86400 ) + 1,
								upperBoundary: (self.currentDate + interval ) //new Date(startDate.getTime() + (0))  // convert days number in milliseconds
							});

					filter.lowerBoundary = self.currentDate;
					filter.upperBoundary = self.currentDate + interval; // + interval
					filterStrategy.setFilter(filter);
					self.currentDate = self.currentDate + span;
					var stDate = new Date(self.currentDate * 1000);
					/*$("#animationStartDate").text(stDate.defaultView('YYYY/MM/DD')); // convert date format from timestamp to YYYY/MM/DD
					var eDate = new Date((self.currentDate + interval) * 1000);
					$("#animationEndDate").text(eDate.defaultView('YYYY/MM/DD'));*/
					// get the layer
					/*var nblayers = self.map_view.map.layers.length;
					var vectorLayer = self.map_view.map.layers[nblayers - 1];
					vectorLayer.refresh({force:true});*/
					// pourcentage avancement lecture
					var readerLevel = parseInt(((self.currentDate - startDate) * 100) / (endDate - startDate), 10);
					if (readerLevel > 100){readerLevel = 100;} // % cant be > 100
					$("#indivAnimLevel").text(readerLevel + " %");

				} else {
					self.stopAnimation(true);
				}
			};
			this.animationTimer = window.setInterval(next, this.intervalAnimation * 1000);
		},
		stopAnimation: function(reset) {
			window.clearInterval(this.animationTimer);
			this.animationTimer = null;
			if (reset === true) {
				this.currentDate = null;
			}
		},
		initAnimation: function() {
			this.currentDate = app.utils.AnimStartDate;
			window.clearInterval(this.animationTimer);
			this.animationTimer = null;
		},
		updateTimeLineLayer: function(interval) {
			var dateMin = interval[0];
			var datMax = interval[1];
			var filter = app.utils.timelineFilter;
			var filterStrategy = app.utils.timelinefilterStrategy;
			filter.lowerBoundary = dateMin;
			filter.upperBoundary = datMax;
			filterStrategy.setFilter(filter);
		},
	    updateGridHeight : function(){
	    	// update grid heigt to fit all space 
			var mapHeight = $("#birdMap").height();
			var usedSpaceHeight = $("#separatorDetails").height() + $("#birdInfosDiv").height() +
			$("#birdInfosDetails").height() ;
			var gridHeight = mapHeight - usedSpaceHeight - 180; 
			$("#grid").css({"height":gridHeight});
	    },
	    updateAnimationDivWidth : function(windowWidth){
	    	if(windowWidth < 1250){
	    		$('#indivSliderContent').removeAttr('class');
	    		$('#indivSliderContent').addClass('span7');
	    		$('#indivAnimContent').removeAttr('class');
	    		$('#indivAnimContent').addClass('span5');
	    		
	    	} else{
	    		$('#indivSliderContent').removeAttr('class');
	    		$('#indivSliderContent').addClass('span8');
	    		$('#indivAnimContent').removeAttr('class');
	    		$('#indivAnimContent').addClass('span4');
	    	}
	    }
	});

		return app;
})(ecoReleveData);
