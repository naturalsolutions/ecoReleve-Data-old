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
                PK: { type: 'Text', title:'id', editorClass : 'form-control', validators: []}, 
                Name: { type: 'Text', title:'station name', editorClass : 'form-control', validators: ['required']}, 
                LAT : { type: 'Text', title:'latitude', editorClass : 'form-control',validators: ['required'] },  //, validators: ['required']
                LON : { type: 'Text', title:'longitude', editorClass : 'form-control',validators: ['required'] },
                Region : { type: 'Text', title:'region', editorClass : 'form-control',validators: [], "editorAttrs": { "list": "region_list" }, },
                FieldActivity_Name: { type: 'Text', title:'field activity', editorClass : 'form-control', validators: ['required']},
                Date_: { type: 'Text', title:'date' , editorClass : 'form-control',validators: ['required']}, //,validators: ['required']
                //time_:{ type: 'Text', title:'time', editorClass : 'form-control'},
                FieldWorker1: { type: 'Text' , title:'field worker 1', editorClass : 'form-control' ,validators: ['required']},  //type: 'Select' , title:'field Worker 1', options: this.usersList , required : true
                FieldWorker2: { type: 'Text' , title:'field worker 2' , editorClass : 'form-control'},
                FieldWorker3: { type: 'Text' , title:'field worker 3' , editorClass : 'form-control' },
                FieldWorker4: { type: 'Text' , title:'field worker 4' , editorClass : 'form-control' },
                FieldWorker5: { type: 'Text' , title:'field worker 5' , editorClass : 'form-control' },
                FieldWorkersNumber : {type: 'Number' , title:'field workers number', editorClass : 'form-control'}
            },
            verboseName : "station"
        }
    );
});
