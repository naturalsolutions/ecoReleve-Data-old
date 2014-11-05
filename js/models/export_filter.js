define([
    'jquery',
    'backbone',
    'config'
], function($, Backbone, config){
    'use strict';
    return Backbone.Model.extend({
	    schema: {
	    	Column: {type: 'Hidden', title:'Column'},
	        Operator: { type: 'Select', title: null, options: ['>', '<', '='], editorClass: 'form-control' },
	        Value: { type: 'Number', validators: ['required'],  title:null, editorClass: 'form-control' },
	        /*
	        Radios: {
	        	type: 'Radio',
	        	options: [
	        	    { label: 'Is Null'},
	        	    { labelHTML: 'Is Not Null'}
	        	]
	        }*/
	        /*
	        IsNull: { type: 'Checkboxes', title: null, options: ['']},
	        IsNotNull: { type: 'Checkboxes', title: null, options: ['']},
	        */

	    },
	    defaults:{
	    	label: null
	    },
	    verboseName : "Filter"
    });
});

