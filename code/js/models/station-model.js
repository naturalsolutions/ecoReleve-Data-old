var ecoReleveData = (function(app) {
    "use strict";

app.Models.Station = Backbone.Model.extend({
    defaults: {
        id:null,
        station_name:"",
        field_activity:"",
        date_day:"",
		time_now:"",
		observer1:"",
		observer2:"",
		observer3:"",
		observer4:"",
		observer5:"",
		latitude:"",
		longitude:""
		}
});
 
app.Collections.Stations = Backbone.Collection.extend({
    model: app.Models.Station,
	localStorage: new Store("stationsList"),
		 initialize : function Stations() {
					console.log('Stations list Constructor');
		}
});
 return app;
})(ecoReleveData);