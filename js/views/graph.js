define([
    'jquery',
    'chart',
    'config',
    'marionette',
    'moment'
], function($, Chart, config, Marionette, moment) {
    'use strict';
    return Marionette.ItemView.extend( {
        template: false,

        onRender: function() {
            this.drawGraph();
        },

        drawGraph: function() {
            var canvas = $("<canvas height=300 width=400 class='center-block hidden-xs'></canvas>");
            this.$el.append(canvas);
            //caching graph data for a day
            var dataGraph = localStorage.getItem("ecoreleveChart");
            // get current day and compare it with stored day
            var d = (new Date() + '').split(' ');
            // ["Mon", "Feb", "1", "2014"....
            var day = d[2];
            var storedDay = localStorage.getItem("ecoreleveChartDay");
            if (dataGraph && (day == storedDay)) {
                var gData = JSON.parse(dataGraph);
                var myChart = new Chart(canvas[0].getContext("2d")).Line(gData, {});
                $("#homeGraphLegend").html("<h3>number of observations</h3>");
            } else {
                var url = config.coreUrl + "stations/graph";
                $.ajax({
                    url: url,
                    dataType: "json"
                }).done( function(data) {
                    var labels = [];
                    var lineData = [];
                    var colors = ["#F38630", "#E0E4CC", "#69D2E7", "#3F9F3F", "#A4A81E", "#F0F70C", "#0CF7C4", "#92D6C7", "#2385b8", "#E0C8DD", "#F38630", "#E0E4CC"];
                    var legend = "<div id='graphLegend' style='text-align: left;'><b>stations number per month</b><br/>";
                    var i = 0;
                    for (var key in data) {
                        var dataObj = {};
                        var month = key;
                        var value = data[key] || 0;
                        labels.push(month);
                        lineData.push(parseInt(value));
                    }
                    labels = labels.reverse();
                    lineData = lineData.reverse();
                    var gData = {
                        labels: labels,
                        datasets: [{
                            fillColor: "rgba(100,100,100,0.7)",
                            strokeColor: "rgba(220,220,220,1)",
                            data: lineData
                        }]
                    };
                    var strData = JSON.stringify(gData);
                    // store data in localstorage
                    localStorage.setItem("ecoreleveChart", strData);
                    // store month in localstrorage to update data every month
                    var d = (new Date() + '').split(' ');
                    // ["Mon", "Feb", "1", "2014"....
                    var day_ = d[2];
                    localStorage.setItem("ecoreleveChartDay", day_);
                    var myChart = new Chart(canvas[0].getContext('2d')).Line(gData, {});
                }).fail( function(data) {
                    console.log("error in loading data");
                });
            }
        }
    });
});
