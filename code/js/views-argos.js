
	var ecoReleveData = (function(app) {
	"use strict";
	
	app.views.Argos = app.views.BaseView.extend({
		template: "argos",
		afterRender: function(options) {
			// remove background image
			$.supersized({
				slides: [{
					image: ''
				}]
			});
			this.loadStats();
		},
		loadStats: function() {
			var serverUrl = localStorage.getItem("serverUrl");
			var url = serverUrl + "/sensor/stat?format=json";
			$.ajax({
				url: url,
				dataType: "json",
				success: function(data) {
					var labels = data["label"].reverse();
					var nbArgos = data["nbArgos"].reverse();
					var nbGps = data["nbGPS"].reverse();
					//var nbPtt = data["nbPTT"].reverse();
					// Sum of values in each table
					/*var sumArgos = 0;var sumGps = 0;var sumPtt = 0;
	                    $.each(nbArgos,function(){sumArgos+=parseFloat(this) || 0;});
	                    $.each(nbGps,function(){sumGps+=parseFloat(this) || 0;});
	                    $.each(nbPtt,function(){sumPtt+=parseFloat(this) || 0;}); */
					// convert values in Arrays to int
					nbArgos = app.utils.convertToInt(nbArgos);
					nbGps = app.utils.convertToInt(nbGps);
					//nbPtt = app.utils.convertToInt(nbPtt);
					var graphData = {
						labels: labels,
						datasets: [{
							fillColor: "rgba(220,220,220,0.5)",
							strokeColor: "rgba(220,220,220,1)",
							data: nbArgos
						}, {
							fillColor: "rgba(33, 122, 21,0.5)",
							strokeColor: "rgba(33, 122, 21,1)",
							data: nbGps
						}]
					};
					var maxValueArgos = app.utils.MaxArray(nbArgos);
					var maxValueGps = app.utils.MaxArray(nbGps);
					var maxValueInGraph = (maxValueArgos > maxValueGps) ? maxValueArgos : maxValueGps;
					maxValueInGraph = app.utils.GraphJsMaxY(maxValueInGraph);
					var steps = 5;
					/*new Chart(ctx).Bar(plotData, {
	                        scaleOverride: true,
	                        scaleSteps: steps,
	                        scaleStepWidth: Math.ceil(max / steps),
	                        scaleStartValue: 0
	                    });*/
					var argosChart = new Chart(document.getElementById("argosGraph").getContext("2d")).Bar(graphData, {
						scaleOverride: true,
						scaleSteps: steps,
						scaleStepWidth: Math.ceil(maxValueInGraph / steps),
						scaleStartValue: 0
					});
					/*$("#argosValues").text(sumArgos + sumGps );
	                    $("#argosPtt").text(sumPtt);*/
					// get last date
					var lastDate = labels[labels.length - 1];
					var lastArgosValue = nbArgos[nbArgos.length - 1];
					var lastGpsValue = nbGps[nbGps.length - 1];
					//var lastPttValue = nbPtt[nbPtt.length - 1];
					// data for last day
					$("#argosDate").text(lastDate);
					$("#argosValues").text(parseFloat(lastArgosValue) + parseFloat(lastGpsValue));
					//$("#argosPtt").text(lastPttValue);
				},
				error: function(data) {
					// $("#homeGraphLegend").html("error in loading data ");
					alert("error loading data. please check webservice.");
				}
			});
		}
	});

		return app;
})(ecoReleveData);