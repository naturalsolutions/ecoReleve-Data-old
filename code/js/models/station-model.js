app.Models.Station = Backbone.Model.extend({
    defaults: {
        id:null,
        station_name:"",
        field_activity:"",
        date_day:"",
		time_now:"",
		observer:"",
		latitude:"",
		longitude:""
		}
});
 
app.Collections.Stations = Backbone.Collection.extend({
    model: app.Models.Station,
		 initialize : function Stations() {
					console.log('Stations list Constructor');
		}
});