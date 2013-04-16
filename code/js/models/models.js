/*
app.Models.Protocol = Backbone.Model.extend({
    fields:
	defaults: {
        id:null,
        display_label:"",
        description:"",
        multispecies:false

		}
	
});
 
app.Collections.Protocols = Backbone.Collection.extend({
    model: app.Models.Protocol,
	localStorage: new Store("protocolList"),
		 initialize : function Stations() {
					console.log('Protocol list Constructor');
		}
});

app.Models.Field = Backbone.Model.extend({
	defaults: {
        id:null,
        display_label:"",
        description:""
		}
});

app.Models.FieldText = Field.extend({
	type:"text",
	id:null,
	stringLength : "",
	multiline: true,
	defaultValue:""
});
app.Models.FieldNumeric = Field.extend({
	type:"numeric",
	id:null,
	unit : "",
	max_bound: null,
	min_bound: 0,
	precision:1,
	defaultValue:""
});
app.Models.FieldList = Field.extend({
	type:"list",
	id:null,
	defaultValue:""
});*/
//***********************************************************
/*
app.Models.Protocol = Backbone.RelationalModel.extend({
    	relations: [{
		type: Backbone.HasMany,
		key: 'fields',
		relatedModel: 'app.Models.Field',
		collectionType: 'app.Collections.FieldCollection',
		reverseRelation: {
			key: 'belongsProto'//,
			//includeInJSON: 'id'
			// 'relatedModel' is automatically set to 'Zoo'; the 'relationType' to 'HasOne'.
		}
	}],
	defaults: {
        id:null,
        display_label:"",
        description:"",
        multispecies:false

		}
	
});
*/
/*app.Models.Protocol = Backbone.Model.extend({
    
	defaults: {
        id:null,
        display_label:"",
        description:"",
        multispecies:false

		},
});*/
app.Models.Field = Backbone.Model.extend({
		defaults: {
        id:null,
        display_label:"",
        description:""
	}
	/*constructor: function (id,display_label,description) {
        this.id = id;
		this.display_label= display_label;
		this.description = description;
    }*/
});

app.Models.TextField = app.Models.Field.extend({
		defaults: {
        stringLength:50,
        multiline:true,
        defaultValue:"val"
	}
	//display_label :""
	//constructor: function (stringLength,multiline,defaultValue) {
       // app.Models.Field.__super__.constructor.call(this, id);
		//app.Models.Field.__super__.constructor.call(this, display_label);
		//app.Models.Field.__super__.constructor.call(this, description);
       /* this.stringLength = stringLength;
		this.multiline = multiline;
		this.defaultValue = defaultValue;*/
  //  }
});

app.Models.FieldNumeric = app.Models.Field.extend({
	defaults: {
	type:"numeric",
	id:null,
	unit : "",
	max_bound: null,
	min_bound: 0,
	precision:1,
	defaultValue:""
	}
});

app.Collections.FieldsCollection = Backbone.Collection.extend({
    model: app.Models.Field
});

app.txt = new app.Models.TextField();
app.num = new app.Models.FieldNumeric();
app.col = new app.Collections.FieldsCollection();
app.col.add(app.txt);
app.col.add(app.num);

/*
app.Models.Field = Backbone.RelationalModel.extend({
	/*subModelTypes: {
		'textField': 'TextField',
		'numericField': 'NumericField'
	},
	defaults: {
        id:null,
        display_label:"",
        description:""
	}
});

*/




/*
app.Models.TextField = app.Models.Field.extend()({
	//type:"text",
	id:null,
	stringLength : "",
	multiline: true,
	defaultValue:""

});


app.Models.NumericField = app.Models.Field.extend()({
	//type:"numeric",
	id:null,
	unit : "",
	max_bound: null,
	min_bound: 0,
	precision:1,
	defaultValue:""
});

app.Collections.FieldCollection = Backbone.Collection.extend({
	model: app.Models.Field
});
/*
// Create a collection that contains a 'Primate' and a 'Carnivore'.
var protofileds = new app.Collections.FieldCollection([
	{ id: 3, display_name: 'chimp', type: 'textField' },
	{ id: 5, display_name: 'panther', type: 'numericField' }
]);

var chimp = protofileds.get( 3 );

alert( 'chimp is an textField? ' + ( chimp instanceof TextField ) + '\n' +
	'chimp is a numericField? ' + ( chimp instanceof NumericField ) + '\n'  );
*/