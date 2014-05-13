
	
	/***************************************************************************
$bird 				birds
****************************************************************************/

	var ecoReleveData = (function(app) {
	"use strict";

	app.views.Birds = app.views.BaseView.extend({
		template: "birdFilter",
		afterRender: function() {
			var windowWidth = $(window).width();
			var windowHeigth = $(window).height();
			$.supersized({
				slides: [{
					image: ''
				}]
			});
			// load data
			var serverUrl = localStorage.getItem("serverUrl");
			var indivUrl = serverUrl + '/TViewIndividual/list?sortColumn=ID&sortOrder=desc';
			this.indivUrl = indivUrl;
			// load data for indiv grid
			app.utils.getDataForGrid(indivUrl, function(collection, rowsNumber) {
				app.utils.initGridServer(collection, rowsNumber, indivUrl, {
					pageSize: 50,
					//columns: [0,1,2, 3, 4, 9],
					container: "#objectsIndivGrid"
				});
				$("#objectsIndivGrid").css({"height":(windowHeigth - 200), "max-width" : windowWidth / 2 });
				$("#objectsIndivGrid").mCustomScrollbar({
					theme:"dark",
					 horizontalScroll:true
				});
			});

			// autocomplete for fields list
			var fieldUrl = serverUrl + '/list/autocomplete?table_name=TViewIndividual'+ '&column_name=' ;
			// field sex
			var fieldSexUrl = fieldUrl + 'id30%40TCaracThes_Sex_Precision'; 
			app.utils.getdataListForBirdFilter ("#birdSexList", fieldSexUrl);
			// field survey type
			var fieldSurveyUrl = fieldUrl + 'id61@TCaracThes_Survey_type_Precision';
			app.utils.getdataListForBirdFilter ("#birdSurveyList", fieldSurveyUrl);
			// field ptt
			var fieldPttUrl = fieldUrl + 'id19@TCarac_PTT';
			app.utils.getdataListForBirdFilter ("#birdPttList", fieldPttUrl);
			// frequency
			var fieldFrequencyUrl = fieldUrl + 'id5@TCarac_Transmitter_Frequency';
			app.utils.getdataListForBirdFilter ("#birdFrequencyList", fieldFrequencyUrl);
			// monitoring
			var fieldMonitoryUrl = fieldUrl + 'id60@TCaracThes_Monitoring_Status_Precision';
			app.utils.getdataListForBirdFilter ("#birdMonitoryList", fieldMonitoryUrl);
			// chip code
			var fieldChipCodeUrl = fieldUrl + 'id13@TCarac_Chip_Code';
			app.utils.getdataListForBirdFilter ("#birdChipCodeList", fieldChipCodeUrl);
			// release ring color
			var fieldReleaseRingColorUrl = fieldUrl + 'id8@TCaracThes_Release_Ring_Color_Precision';
			app.utils.getdataListForBirdFilter ("#birdReleaseRingColorList", fieldReleaseRingColorUrl);
			//color
			var fieldColorUrl = fieldUrl + 'id14@TCaracThes_Mark_Color_1_Precision' ;
			app.utils.getdataListForBirdFilter ("#birdMarkColorList", fieldColorUrl);
			// age
			var fieldAgeUrl = fieldUrl + 'id2@Thes_Age_Precision' ;
			app.utils.getdataListForBirdFilter ("#birdAgeList", fieldAgeUrl);
			// origin
			var fieldOriginUrl = fieldUrl + 'id33@Thes_Origin_Precision' ;
			app.utils.getdataListForBirdFilter ("#birdOriginList", fieldOriginUrl);
			// release ring
			var fieldReleaseRingUrl = fieldUrl + 'id9@TCarac_Release_Ring_Code' ;
			app.utils.getdataListForBirdFilter ("#birdReleaseRingList", fieldReleaseRingUrl);
			// breeding ring
			var fieldBreedingRingUrl = fieldUrl + 'id12@TCarac_Breeding_Ring_Code' ;
			app.utils.getdataListForBirdFilter ("#birdBreedingRingList", fieldBreedingRingUrl);
			


		},
		events :{
			'click #indivFilterSubmit' : 'getBirdsList',
			'click tr': 'selectTableElement',
			'click #indivFilterClear' : 'clearFields',




		},
		getBirdsList : function() {
			var windowWidth = $(window).width();
			var windowHeigth = $(window).height();
			var params = [] ;
			var id = $('input[name="ID"]').val().trim();
			var frequency = $('input[name="frequency"]').val().trim();
			var ptt = $('input[name="PTT"]').val().trim();
			var sex = $('input[name="sex"]').val().trim();
			var release = $('input[name="release"]').val().trim();
			var breeding = $('input[name="breeding"]').val().trim();
			var age = $('input[name="age"]').val().trim();
			var origin = $('input[name="origin"]').val().trim();
			var color = $('input[name="color"]').val().trim();
			

			if(id){
				params.push("filters[]=ID:exact:" + id);  
			}
			if (frequency){
				params.push("filters[]=frequency:" + frequency);
			}
			if(ptt){
				params.push("filters[]=PTT:" + ptt);
			}
			if(sex){
				params.push("filters[]=sex:" + sex);
			}
			if(release){
				params.push("filters[]=release ring:" + release);
			}
			if(breeding){
				params.push("filters[]=breeding ring:" + breeding);
			}
			if(age){
				params.push("filters[]=age:" + age);
			}
			if(origin){
				params.push("filters[]=origin:" + origin);
			}
			if(color){
				params.push("filters[]=mark_color:" + color);
			}
			var filterParams = params.join("&"); 
			// update data indiv grid
			var url = this.indivUrl + "&" + filterParams;
			app.utils.getDataForGrid(url, function(collection, rowsNumber) {
				app.utils.initGridServer(collection, rowsNumber, url, {
					pageSize: 50,
					//columns: [2, 6, 7, 8],
					container: "#objectsIndivGrid"
				});
				$("#objectsIndivGrid").css({"height":(windowHeigth - 200), "max-width" : windowWidth / 2 });
				$("#objectsIndivGrid").mCustomScrollbar({
					theme:"dark",
					 horizontalScroll:true
			});
			});
			
		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode.nodeName;
			if (ele == "TR") {
				var selectedModel = app.models.selectedModel;
				
				var id = selectedModel.attributes["ID"];
				var route = '#bird/' + id;
				app.router.navigate(route, {trigger: true});
				
				/*
				this.objectUrl = serverUrl + "/TViewIndividual/" + id;
				this.objectType = "individual";
						
				app.utils.getObjectDetails(this, this.objectType, this.objectUrl, id);
			
				var url = currentview.objectUrl + "/carac";
				app.utils.displayObjectHistory(currentview, currentview.objectType, url, currentview.idSelectedIndiv);
				*/
			}
		},
		clearFields : function() {
			$("input").val("");
		}

	});
	app.views.Bird = app.views.BaseView.extend({
		template: "birdDetails",
		initialize : function(options) {
			this.birdId = options.id;
			this.intervalAnimation = 0.3; 
		},
		afterRender: function() {
			var windowHeigth = $(window).height();
			$("#birdDetails").css({"height": windowHeigth -50 });
			$("#birdId").text(this.birdId);
			var serverUrl = localStorage.getItem("serverUrl");
			var objectUrl = serverUrl + "/TViewIndividual/" + this.birdId;
			app.utils.displayObjectPositions(this, objectUrl, this.birdId);
			var url = objectUrl + "/carac";
			$.ajax({
				url: url,
				dataType: "json",
				success: function(data) {
					var characteristic = data[0][0].TViewIndividual;
					var sex = characteristic.Sex || "";
					var origin = characteristic.Origin || "";
					var species = characteristic.Species || "";
					var birthDate = characteristic.Birth_date || "";
					var deathDate = characteristic.Death_date || "";
					var comments = characteristic.Comments || "";
					$("#birdSpecies").text(species);
					$("#birdBirthDate").text(birthDate);
					$("#birdSexLabel").text(sex);
					$("#birdOriginLabel").text(origin);
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
					var age;

					var historyItems = new app.collections.HistoryItems();
					for (var k in data[0]) {
						var item = data[0][k];
						for (var j in item) {
							if (j != 'TViewIndividual') {
								var elem = item[j];
								var element = elem[0];
								var value = element["value_precision"] || element["value"];
								var begin_date = element["begin_date"] || "";
								var end_date = element["end_date"] || "";
								var historyItem = new app.models.HistoryItem();
								historyItem.set('characteristic', j);
								historyItem.set('value', value);
								historyItem.set('begin_date', begin_date);
								historyItem.set('end_date', end_date);
								historyItems.add(historyItem);
								if (j ==="Age"){ 
									 age = element["value_precision"];
								}
								if (j==="PTT"){
									var ptt= element["value"];
									$('#transmittersVal').html("<b>ptt: </b>" + ptt)	;
								}
							}
							$("#birdAgeLabel").text(age);
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
					}
					// sort collection by begin date 
					historyItems.sort();
					// init grid
					app.utils.initGrid(historyItems, app.collections.HistoryItems, null, {pageSize: 50});
					$("#grid").css({"height":windowHeigth /2});

					$("#grid").mCustomScrollbar({
						theme:"dark"
					});
				}
			});
			
		},
		events : {
			'click #animationStart': 'startAnimation',
			'click #animationStop': 'stopAnimation',
			'click #animationInit': 'initAnimation'
		},
		startAnimation: function() {
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
			var filterStrategy = app.utils.AnimfilterStrategy;
			var self = this;
			var next = function() {
				if (self.currentDate < endDate) {
					filter.lowerBoundary = self.currentDate;
					filter.upperBoundary = self.currentDate + interval; // + interval
					filterStrategy.setFilter(filter);
					self.currentDate = self.currentDate + interval;
					var stDate = new Date(self.currentDate * 1000);
					/*$("#animationStartDate").text(stDate.defaultView('YYYY/MM/DD')); // convert date format from timestamp to YYYY/MM/DD
					var eDate = new Date((self.currentDate + interval) * 1000);
					$("#animationEndDate").text(eDate.defaultView('YYYY/MM/DD'));*/

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
			/*$("#animationStartDate").text("");
			$("#animationEndDate").text("");
			$("#dateIntervalDisplay").addClass("masqued");  */
		}
	});
		return app;
})(ecoReleveData);
