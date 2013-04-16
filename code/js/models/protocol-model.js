
var ecoReleveData = (function(app) {
    "use strict";
	
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
        }
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
 return app;
})(ecoReleveData);
