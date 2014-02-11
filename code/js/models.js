var ecoReleveData = (function(app) {
    //"use strict";
	
/*************************************************************
Protocol Model & collection
**************************************************************/
app.models.Protocol = Backbone.Model.extend({
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
    model: app.models.Protocol,
	localStorage: new Store("protocolsList"),
		 initialize : function Stations() {
				//	console.log('Protocols list Constructor');
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
    defaults: {
        station_name:""
		}
}, {
	verboseName : "station"
});
 
app.collections.Stations = Backbone.Collection.extend({
    model: app.models.Station,
	localStorage: new Store("stationsList"),
		 initialize : function Stations() {
					//console.log('Stations list Constructor');
		}
});	
app.models.Location  = Backbone.Model.extend({
	schema: {
		latitude:{ type: 'Text', title:'Latitude'/*, inline : 'true'*/},  //,validators: ['required']
		longitude: { type: 'Text', title:'Longitude'/* , inline : 'true'*/}  //,validators: ['required']
	},
	verboseName: 'Location'
});

/*************************************************************
Observation Model & collection
**************************************************************/	
app.models.Observation = Backbone.Model.extend({

});
 
app.collections.Observations = Backbone.Collection.extend({
    model: app.models.Observation,
	localStorage: new Store("observationsList")
});

app.TableField = Backbone.Model.extend({

});
/*************************************************************
User Model & collection
**************************************************************/	
// MODELS
app.models.User = Backbone.Model.extend({
	/*schema: {
		name:{ type: 'Text', title:'Name',validators: ['required']}  
	}*/
});

// COLLECTIONS
app.collections.Users = Backbone.Collection.extend({
  model:  app.models.User,
  localStorage : new Store('usersList')
});
/*************************************************************
Waypoints Model & collection
**************************************************************/	
app.models.Waypoint = Backbone.Model.extend({

	},{
		schema: {
		id: {title: 'id', type: 'Text',sortable: true},
		name: {title: 'name', type: 'Text',sortable: true},
		latitude: {title: 'latitude', type: 'Number',sortable: true},
		longitude: {title: 'longitude', type: 'Number',sortable: true},
		waypointTime: {title: 'waypointTime', type: 'Date', sortable: true}//,
		//used: {title: 'used', type: 'Boolean'}
	},
	verboseName: 'Waypoint'

});
app.collections.Waypoints = Backbone.Collection.extend({
  model:  app.models.Waypoint,
  localStorage : new Store('waypointList')
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

app.models.CurrentUser = app.models.User.extend({
	url: function () {
		return this.constructor.baseApiUrl;
	}
}, {
	baseApiUrl: app.config.root + '/api/currentuser'
});








 return app;
})(ecoReleveData);