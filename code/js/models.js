var ecoReleveData = (function(app) {
    //"use strict";
	
/*************************************************************
Protocol Model & collection
**************************************************************/
app.models.Protocol = Backbone.Model.extend({
	sync: Backbone.localforage.sync(),
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
 
app.collections.Protocols = Backbone.Collection.extend({
	sync: Backbone.localforage.sync('ProtocolsList'),
    model: app.models.Protocol,
	//localStorage: new Store("protocolsList"),
	initialize : function Stations() {
				//	console.log('Protocols list Constructor');
	},
	save: function() {
	    this.each(function(model) {
	        model.save();
	    });
	}
});

// fields
app.models.ListField = Backbone.Model.extend({
	schema: {
		id: 'Number',
		name : 'Text',
		display_label:'Text',
		items : 'Object'
    }
});
 
app.models.TextField = Backbone.Model.extend({
	schema: {
		id: 'Number',
		name : Text,
		display_label:Text,
		multiline: Text,
		defaultValue:Text,
		required : Text
	}
});
app.models.NumericField = Backbone.Model.extend({
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
app.models.BooleanField = Backbone.Model.extend({
	schema: {
		id: 'Number',
		name : Text,
		display_label:Text,
		defaultValue:Text,
		required : Text
	}
});
app.models.PhotoField= Backbone.Model.extend({
	schema: {
		id: 'Number',
		name : Text,
		display_label:Text
	}
});
/************************************************************
Station Model & collection
************************************************************/	
app.models.Station = Backbone.Model.extend({
    sync: Backbone.localforage.sync()
	},{
		schema: { 
			Name:  { type: 'Text', title:'station name'},  //,validators: ['required']
			LAT :  { type: 'Text', title:'latitude', required : true },
			LON :  { type: 'Text', title:'longitude', required : true },
			FieldActivity_Name: { type: 'Text', title:'field activity'},
			Date_: { type: 'Text', title:'date'}, //,validators: ['required']
			time_:{type: 'Text', title:'time'},
			FieldWorker1: { type: 'Text' , title:'field worker 1',required : true},  //type: 'Select' , title:'field Worker 1', options: this.usersList , required : true 
			FieldWorker2: { type: 'Text' , title:'field worker 2'  },
			FieldWorker3: { type: 'Text' , title:'field worker 3'  },
			FieldWorker4: { type: 'Text' , title:'field worker 4'  },
			FieldWorker5: { type: 'Text' , title:'field worker 5'  }
			
			//time_now: { type: 'Text', title:'Time'},
	},
	verboseName : "station"
});
 
app.collections.Stations = Backbone.Collection.extend({
    model: app.models.Station,
    sync: Backbone.localforage.sync('StationList'),
	save: function() {
	    this.each(function(model) {
	        model.save();
	    });
	}
});	
/***************************************************
	StationProtocol : model & collection used to display
	stored data (relation station/protocol in input data)
***************************************************************/
app.models.StationProtocol = Backbone.Model.extend({
    sync: Backbone.localforage.sync()
	},{
		schema: { 
			idStation : {type: 'Text', title:'id'},
			station:  { type: 'Text', title:'station'}, 
			LAT :  { type: 'Text', title:'latitude', required : true },
			LON :  { type: 'Text', title:'longitude', required : true },
			date: { type: 'Text', title:'date'}, //,validators: ['required']
			protocol: { type: 'Text' , title:'protocol'  }
	},
	verboseName : "stationProtocol"
});
 
app.collections.StationsProtocols = Backbone.Collection.extend({
    model: app.models.StationProtocol,
    sync: Backbone.localforage.sync('StationProtocolList'),
	save: function() {
	    this.each(function(model) {
	        model.save();
	    });
	},
	getFiltredItems: function(stationName, protocolName, beginDate, endDate) {
		// if datemin ="", set his value to 0
		var minDate; 
		if(!beginDate){
			minDate = moment(0);
		} else {
			minDate = moment(beginDate);
		}
		var maxDate; 
		if(!endDate){
			maxDate = moment("01/01/2100");
		} else {
			maxDate = moment(endDate);
		}

	  	var filtredCollection = this.models.filter(function(model) {

		    	var dateVal = moment(model.get('date'));
		    	var station = model.get('station');
		    	var checkStation = -1;
		    	if (station){
		    		 checkStation = station.indexOf(stationName);
		    	}
		    	var protocol = model.get('protocol');
		    	var checkPprotocol = -1;
		    	if (protocol){
		    		checkPprotocol = protocol.indexOf(protocolName);	
		    	}
		    	

		    	return  ( checkStation >= 0) &&  // filter / station name
		    	(checkPprotocol >= 0) && // filter / protocole name
		    	(dateVal >= minDate) && // filter / date min
		    	(dateVal <= maxDate); // filter / date max
		  	});
	  return filtredCollection;
	}
});	
/*
app.models.Location  = Backbone.Model.extend({
	schema: {
		latitude:{ type: 'Text', title:'Latitude'},  //,validators: ['required']
		longitude: { type: 'Text', title:'Longitude'}  //,validators: ['required']
	},
	verboseName: 'Location'
});
*/
/*************************************************************
Observation Model & collection
**************************************************************/	
app.models.Observation = Backbone.Model.extend({
	sync: Backbone.localforage.sync()
});
 
app.collections.Observations = Backbone.Collection.extend({
	sync: Backbone.localforage.sync('ObservationsList'),
  	model: app.models.Observation,
	save: function() {
	    this.each(function(model) {
	        model.save();
	    });
	}
});

app.TableField = Backbone.Model.extend({

});
/*************************************************************
User Model & collection
**************************************************************/	
// MODELS
app.models.User = Backbone.Model.extend({
	sync: Backbone.localforage.sync()
	},{
	schema: {
		name:{ type: 'Text', title:'Name'}  
	},
	verboseName: 'user'
});
// COLLECTIONS
app.collections.Users = Backbone.Collection.extend({
  	sync: Backbone.localforage.sync('UsersList'),
  	model: Backbone.Model.extend({
        sync: Backbone.localforage.sync()
    }),
  //model: app.models.User,
	save: function() {
	    this.each(function(model) {
	        model.save();
	    });
	},
	load: function (options) {
		//this.sync("read", this, options);
		this.sync('read', this, {                                                                                                                                                                                                                                                                                                                                     
		success: function(){                                                                                                                                                                                                                                                                                                                                          
		  console.log('collection loaded!');                                                                                                                                                                                                                                                                                                                              
		}                                                                                                                                                                                                                                                                                                                                                             
	  });  
	}
  //localStorage : new Store('usersList')
});
//fieldActivity
app.collections.FieldActivities = Backbone.Collection.extend({
  	sync: Backbone.localforage.sync('FieldActivities'),
  	model: Backbone.Model.extend({
        sync: Backbone.localforage.sync()
    }),
    save: function() {
	    this.each(function(model) {
	        model.save();
	    });
	}
}); 
/*************************************************************
Waypoints Model & collection
**************************************************************/	
app.models.Waypoint = Backbone.Model.extend({
	sync: Backbone.localforage.sync()
	},{
		schema: {
		id: {title: 'id', type: 'Text',sortable: true},
		name: {title: 'name', type: 'Text',sortable: true},
		waypointTime: {title: 'date', type: 'Date', sortable: true},
		time:{title: 'time', type: 'Text', sortable: true},
		latitude: {title: 'latitude', type: 'Number',sortable: true},
		longitude: {title: 'longitude', type: 'Number',sortable: true},
		fieldActivity: {title: 'fieldActivity', type: 'Text', sortable: false}
		//used: {title: 'used', type: 'Boolean'}
	},
	verboseName: 'Waypoint'
});
app.collections.Waypoints = Backbone.Collection.extend({
 	 model:  app.models.Waypoint,
  	//localStorage : new Store('waypointList')
  	sync: Backbone.localforage.sync('waypointList'),
	save: function() {
	    this.each(function(model) {
	        model.save();
	    });
	},
	destroy : function() {
		do{
		  	this.each(function(model){
			        model.destroy();
			});
		}
		while (this.length > 0);  
	}
});
/*************************************************************
protocols updating form Model
**************************************************************/	
app.models.ProtoModel = Backbone.Model.extend({
	verboseName: 'Protocols'
});

/*************************************************************
Export module
**************************************************************/	
/*
app.models.ExportGridModel = Backbone.Model.extend({

	}, {
		// Declare schema and verbose name at model level
		schema: {
			
		},
		verboseName: 'Observation'
});
app.collections.ExportGridCollection = Backbone.Collection.extend({
  model:  app.models.ExportGridModel
});
app.collections.VisibleListInGrid = Backbone.Collection.extend({
  model:  app.models.ExportGridModel
});  */
/*************************************************************
Individus list columns form Model
**************************************************************/	
app.models.IndivColumnsModel = Backbone.Model.extend({
	verboseName: 'Columns'
});

app.models.BaseModel = Backbone.Model.extend({
        url: function () {
            return this.constructor.baseApiUrl + '/' + this.id;
        },
        parse: function (resp, options) {
            return this.constructor.parse(resp, options);
        },
        sync: function (method, model, options) {
            options = options || {};
            if (method === 'create') {
                options.url = this.constructor.baseApiUrl;
            }
            return Backbone.sync(method, model, options);
        }
    }, {
        parse: function (resp, options) {
            if (!resp) {
                return resp; // /!\ parse() may be called with null data (e.g. on a 204 response after a PUT request)
            }
            if (!this.schema) {
                return resp;
            }

            // 1st pass
            _.each(this.schema, function (field, fieldName) {
                var model, fOptions;
                if (field.type && fieldName in resp) {
                    if (field.type === 'NestedModel' && _.isObject(resp[fieldName]) && ('model' in field)) {
                        // NestedModel defined by a "model" parameter
                        model = new field.model();
                        model.set(model.parse(resp[fieldName]));
                        resp[fieldName] = model;
                    } else if (field.type === 'NestedModel' && _.isObject(resp[fieldName]) && ('schema' in field)) {
                        // NestedModel defined by a "schema" parameter
                        resp[fieldName] = this.parse.call({schema: field.schema, parse: this.parse}, resp[fieldName], options);
                    } else if (field.type === 'Date' && resp[fieldName]) {
                        
                        if ((resp[fieldName]).indexOf("/") > 0) {
                            var formater = new app.utilities.DateFormater(); // create date formater
                            var d = formater.getDate(resp[fieldName], app.config.dateFormat); // get date from value and date format
                            resp[fieldName] = d; // stock value
                        } else {
                            resp[fieldName] = new Date(resp[fieldName]);
                        }

                    } else if (field.type === 'Select') {
                        fOptions = _.result(field, 'options');

                        if ((fOptions instanceof Backbone.Collection) && resp[fieldName]) {
                            resp[fieldName] = fOptions.get(resp[fieldName].id);
                        }
                    } else if (field.type === 'List') {
                        _.each(resp[fieldName], function (obj, idx) {
                            model = new field.model();
                            model.set(model.parse(resp[fieldName][idx]));
                            resp[fieldName][idx] = model;
                        });
                    }
                }
            }, this);

            // 2nd pass: now that nested models are parsed, we can proceed with multischema
            _.each(this.schema, _.bind(function (field, fieldName) {
                if (field.type && (fieldName in resp) && field.type === 'MultiSchema') {
                    var val = resp[field.selector],
                        sKey = val instanceof Backbone.Model ? val.id : val,
                        schemas = _.result(field, 'schemas'),
                        schema = schemas[sKey];
                    if (schema) {
                        resp[fieldName] = this.parse.call({schema: schema, parse: this.parse}, resp[fieldName], options);
                    }
                }
            }, this));

            return resp;
        },
        baseApiUrl: '',
        baseLocalUrl: '',
        verboseName: ''
    });
/*
app.models.User = app.models.BaseModel.extend({
	getRoles: function () {
		if (!this._roles) {
			this._roles = [app.roles.user];
			if (this.get('isAdmin')) {
				this._roles.push(app.roles.admin);
			}
			if (this.get('isSuperUser')) {
				this._roles.push(app.roles.superuser);
			}
		}
		return this._roles;
	},
	fullName: function () {
		return this.get('firstName') + ' ' + this.get('lastName');
	}
}, {
	schema: {
		id: {title: 'ID', type: 'Number', editable: false},
		firstName: {title: 'First name', type: 'Text'},
		lastName: {title: 'Last name', type: 'Text'},
		language: {title: 'Preferred language', type: 'Select', options: [{val: 'en', label: 'English'}]},
		isAdmin: {title: 'Administrator', type: 'Boolean', required: true, defaultValue: false},
		isSuperUser: {title: 'Super user', type: 'Boolean', required: true, defaultValue: false}
	},
	verboseName: 'User'
});
*/
app.models.CurrentUser = app.models.User.extend({
	url: function () {
		return this.constructor.baseApiUrl;
	}
}, {
	baseApiUrl: app.config.root + '/api/currentuser'
});

/***** objects  ***********************/
app.models.HistoryItem = Backbone.Model.extend({
	},{
		schema: {
		characteristic: {title: 'characteristic', type: 'Text',sortable: true},
		value: {title: 'value', type: 'Text',sortable: true},
		begin_date: {title: 'begin date', type: 'Date',sortable: true},
		end_date: {title: 'end date', type: 'Date',sortable: true}
	},
	verboseName: 'HistoryItem'

});
app.collections.HistoryItems = Backbone.Collection.extend({
  	model:  app.models.HistoryItem,
    comparator: function(item) {
        return item.get('begin_date');
    }
});

/************ Argos *******************************/
app.models.ArgosTransmitter = Backbone.Model.extend({
	},{
		schema: {
		reference: {title: 'ptt', type: 'Text',sortable: true},
		individusId: {title: 'individual id', type: 'Text',sortable: true},
		nbPositions: {title: 'nb positions', type: 'Text',sortable: true},
		status : {title: 'status', type: 'Text',sortable: true}

	},
	verboseName: 'ArgosTransmitter'

});
app.collections.ArgosTransmitters = Backbone.Collection.extend({
  	model:  app.models.ArgosTransmitter,
  	getFiltredItems: function(pttId, indivId,status) {
  		// convert pttId to number
  		if (pttId){
  			pttId = parseInt(pttId,10);
  		}
  		else {
  			pttId = 0;
  		}
  		if(indivId){
  			indivId = parseInt(indivId,10);
  		}
  		else {
  			indivId = 0;
  		}
	  	
	  	var filtredCollection = this.models.filter(function(model) {

		    	var pttIdentifiant = model.get('reference');
		    	var checkPttId = -1;
		    	if (pttIdentifiant){
		    		// checkPttId = pttIdentifiant.indexOf(pttId);
		    		if ((pttId === 0) || (pttIdentifiant === pttId)) {checkPttId = 0; }
		    	}
		    	var individualId = model.get('individusId');
		    	var checkIndivId = -1;
		    	if (individualId){
		    		//individualId = individualId.toString();
		    		if ((indivId === 0) || (individualId === indivId)) {checkIndivId = 0; }
		    		//checkIndivId = individualId.indexOf(indivId);	
		    	}
		    	var statusVal = model.get('status');
		    	var checkStatus = -1;
		    	if (statusVal && status){
		    		if(statusVal === status ){
		    		 checkStatus = 1;
		    		}
		    	} else if (statusVal){
		    		checkStatus = 0;
		    	}
		    	// particular case : status = 'error' and individualId = null   
		    	if (status ==="error"){
		    		checkIndivId = 0;
		    	}
		    	
		    	return  ( checkPttId >= 0) &&  // filter / station name
		    	(checkIndivId >= 0) &&
		    	(checkStatus >= 0);
		    	/*&& // filter / protocole name
		    	(dateVal >= minDate) && // filter / date min
		    	(dateVal <= maxDate); // filter / date max */
		  	});
	  return filtredCollection;
	}
});

app.models.ArgosLocation= Backbone.Model.extend({
	},{
		schema: {
		date: {title: 'date', type: 'Text',sortable: true},
		type : {title: 'type', type: 'Text',sortable: true},
		latitude: {title: 'latitude', type: 'Text',sortable: true},
		longitude: {title: 'longitude', type: 'Text',sortable: true},
		classLoc :{title: 'class', type: 'Text',sortable: true},
		distance : {title: 'distance', type: 'Text',sortable: true},
		del : {title: '(-)', type: 'Text',sortable: true},
		positionId : {title: 'position id', type: 'Number',sortable: true}
		
	},
	verboseName: 'ArgosLocation'

});
app.models.ArgosLocationCollection  = Backbone.Collection.extend({
  	model:  app.models.ArgosLocation
});


 return app;
})(ecoReleveData);