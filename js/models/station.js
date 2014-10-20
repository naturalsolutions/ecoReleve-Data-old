define([
    'backbone',
    'localforage',
    'localforagebackbone'
], function(Backbone, localforage, localforagebackbone){
    'use strict';
    return Backbone.Model.extend(
        // Instance properties
       // { sync: Backbone.localforage.sync() },
        // Class properties
        {
            schema: {
                Name: { type: 'Text', title:'station name', validators: ['required'] }, 
                LAT : { type: 'Text', title:'latitude' },  //, validators: ['required']
                LON : { type: 'Text', title:'longitude' },
                FieldActivity_Name: { type: 'Text', title:'field activity'},
                Date_: { type: 'Text', title:'date' }, //,validators: ['required']
                time_:{ type: 'Text', title:'time'},
                FieldWorker1: { type: 'Text' , title:'field worker 1' },  //type: 'Select' , title:'field Worker 1', options: this.usersList , required : true
                FieldWorker2: { type: 'Text' , title:'field worker 2'  },
                FieldWorker3: { type: 'Text' , title:'field worker 3'  },
                FieldWorker4: { type: 'Text' , title:'field worker 4'  },
                FieldWorker5: { type: 'Text' , title:'field worker 5'  },
                FieldWorkersNumber : {type: 'Number' , title:'field workers number'}
            },
            verboseName : "station"
        }
    );
});
