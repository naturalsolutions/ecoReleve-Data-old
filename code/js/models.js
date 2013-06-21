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
     /*   
        champ1:    { type: 'NestedModel', model: NumericField },
        notes:      { type: 'List', listType: 'Text' }
	*/
    },
	getId : function() {
            return this.get('id');
    }/*,
	nameStore : function() {
            return "protocol" + this.get('id');
    },
	localStorage: new Store("proto")*/
});
 
app.Collections.Protocols = Backbone.Collection.extend({
    model: app.Models.Protocol,
	localStorage: new Store("protocolsList"),
		 initialize : function Stations() {
					console.log('Protocols list Constructor');
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
	/*initialize: function(attributes, options) {
		debugger;
        this.usersList = options.usersTab;
    },*/
    /*defaults: {
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
		},*/
	/*schema: {
		station_name:  { type: 'Text', title:'Station name'},  //,validators: ['required']
		field_activity: { type: 'Text', title:'Field activity'}, //,validators: ['required']
		date_day: { type: 'Text', title:'Date'},
		time_now: { type: 'Text', title:'Time'},
		//Observer: { type: 'Select' , title:'Observer', options: ['Observer 1', 'Observer 2', 'Observer 3','Observer 4', 'Observer 5'] },
		Observer: { type: 'Select' , title:'Observer', options: this.usersList }			
	}*/
});
 
app.Collections.Stations = Backbone.Collection.extend({
    model: app.Models.Station,
	localStorage: new Store("stationsList"),
		 initialize : function Stations() {
					console.log('Stations list Constructor');
		}
});	
app.Models.Location  = Backbone.Model.extend({
	schema: {
		latitude:{ type: 'Text', title:'Latitude'},  //,validators: ['required']
		longitude: { type: 'Text', title:'Longitude'}  //,validators: ['required']
	}
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



 return app;
})(ecoReleveData);