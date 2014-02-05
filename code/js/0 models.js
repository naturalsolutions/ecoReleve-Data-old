var ecoReleveData = (function(app) {
    //"use strict";
	
/*************************************************************
Protocol Model & collection
**************************************************************/
app.Models.Protocol = Backbone.Model.extend({
	defaults: {
		id: null,
		name:""
	},
	schema: {
    },
	getId : function() {
            return this.get('id');
    }

});
 
app.Collections.Protocols = Backbone.Collection.extend({
    model: app.Models.Protocol,
	localStorage: new Store("protocolsList"),
		 initialize : function Stations() {
				//	console.log('Protocols list Constructor');
		}
});

// fields
app.Models.ListField = Backbone.Model.extend({
	schema: {
		id: 'Number',
		name : 'Text',
		display_label:'Text',
		items : 'Object'
    }
});
 
app.Models.TextField = Backbone.Model.extend({
	schema: {
		id: 'Number',
		name : Text,
		display_label:Text,
		multiline: Text,
		defaultValue:Text,
		required : Text
	}
});
app.Models.NumericField = Backbone.Model.extend({
	schema: {
		id: 'Number',
		name : Text,
		display_label:Text,
		unit:Text,
		max_bound :'Number',
		min_bound: 'Number',
		precision:Text,
		defaultValue:'Number',
	}
});
app.Models.BooleanField = Backbone.Model.extend({
	schema: {
		id: 'Number',
		name : Text,
		display_label:Text,
		defaultValue:Text,
		required : Text
	}
});
app.Models.PhotoField= Backbone.Model.extend({
	schema: {
		id: 'Number',
		name : Text,
		display_label:Text
	}
});
/************************************************************
Station Model & collection
************************************************************/	
app.Models.Station = Backbone.Model.extend({
    defaults: {
        station_name:""
		}
}, {
	verboseName : "station"
});
 
app.Collections.Stations = Backbone.Collection.extend({
    model: app.Models.Station,
	localStorage: new Store("stationsList"),
		 initialize : function Stations() {
					//console.log('Stations list Constructor');
		}
});	
app.Models.Location  = Backbone.Model.extend({
	schema: {
		latitude:{ type: 'Text', title:'Latitude'/*, inline : 'true'*/},  //,validators: ['required']
		longitude: { type: 'Text', title:'Longitude'/* , inline : 'true'*/}  //,validators: ['required']
	},
	verboseName: 'Location'
});

/*************************************************************
Observation Model & collection
**************************************************************/	
app.Models.Observation = Backbone.Model.extend({

});
 
app.Collections.Observations = Backbone.Collection.extend({
    model: app.Models.Observation,
	localStorage: new Store("observationsList")
});

app.TableField = Backbone.Model.extend({

});
/*************************************************************
User Model & collection
**************************************************************/	
// MODELS
app.Models.User = Backbone.Model.extend({
	/*schema: {
		name:{ type: 'Text', title:'Name',validators: ['required']}  
	}*/
});

// COLLECTIONS
app.Collections.Users = Backbone.Collection.extend({
  model:  app.Models.User,
  localStorage : new Store('usersList')
});
/*************************************************************
Waypoints Model & collection
**************************************************************/	
app.Models.Waypoint = Backbone.Model.extend({

});
app.Collections.Waypoints = Backbone.Collection.extend({
  model:  app.Models.Waypoint,
  localStorage : new Store('waypointList')
});
/*************************************************************
protocols updating form Model
**************************************************************/	
app.Models.ProtoModel = Backbone.Model.extend({
	verboseName: 'Protocols'
});
/*************************************************************
Individus list columns form Model
**************************************************************/	
app.Models.IndivColumnsModel = Backbone.Model.extend({
	verboseName: 'Columns'
});
 return app;
})(ecoReleveData);