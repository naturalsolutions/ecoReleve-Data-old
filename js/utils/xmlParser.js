define([
    'backbone',
    'moment'
], function(backbone, moment) {
    'use strict';
    return {
        gpxParser: function(xml) {
	        try {
				//var Waypoint =  backbone.Model.extend();
				//var WaypointList =  backbone.Collection.extend({model: Waypoint});
				//var waypointList = new WaypointList();
				
				var Waypoint = Backbone.Model.extend({
	                //sync: LocalforageBackbone.sync()
	            });
	            
	            var WaypointList = Backbone.Collection.extend({
	                //model:  Waypoint,
	                localStorage : new Store('waypointList'),
	                //sync: LocalforageBackbone.sync('waypointList'),
	                save: function() {
	                    this.each(function(model) {
	                        model.save();
	                    });
	                },
	                destroy : function(){
	                    do{
	                        this.each(function(model){
	                                model.destroy();
	                        });
	                    }
	                    while (this.length > 0);  
	                }
	            });
	            var waypointList = new WaypointList();



				// id waypoint
				var id = 0;
				$(xml).find('wpt').each(function() {
					var waypoint = new Waypoint();
					var lat = $(this).attr('lat');
					var lon = $(this).attr('lon');
					// convert lat & long to number and round to 5 decimals
					var latitude = parseFloat(lat);   // parseFloat(lat).toFixed(5);
					var longitude = parseFloat(lon);
					var waypointName = $(this).find('name').text();
					var waypointTime, time;
					// if tag "cmt" exisits, take date from it, else use tag "time"
					var waypointTimeTag = moment($(this).find('cmt').text());
					// check if date is valid, else use time tag to get date
					if(waypointTimeTag.isValid()){
						waypointTime = moment(waypointTimeTag);

						time = moment(waypointTimeTag).format("HH:mm:ss") ; 
					} else {
						var dateValue = $(this).find('time').text();
						waypointTime = moment(dateValue);
						time = moment(dateValue).format("HH:mm:ss"); 
					}

					var tm = moment(waypointTime, moment.ISO_8601);
					var dateStr = (moment(waypointTime).format("YYYY-MM-DD"));  
					var dateTimeStr = dateStr + ' ' + time;
					//console.log(dateTimeStr);
					//console.log(waypointTime.toString());
					id += 1;
					//var idwpt = id;
					waypoint.set("id", id);
					waypoint.set("name", waypointName);
					waypoint.set("latitude", latitude);
					waypoint.set("longitude", longitude);
					waypoint.set("waypointTime", dateTimeStr);
					waypoint.set("time", time);
					waypoint.set("fieldActivity", '');
					waypoint.set("import", true);
					waypointList.add(waypoint);
					});
					return waypointList;
				} catch (e) {
					alert("error loading gpx file");
					//waypointList.reset();
					return waypointList;
				}
        },
        protocolParser: function(xml) {

        }
    };
});

	




