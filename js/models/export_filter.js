define([
    'jquery',
    'backbone',
    'config'
], function($, Backbone, config){
    'use strict';
    return Backbone.Model.extend({
	    schema: {
	        Operator: { type: 'Select', title:'Operator', options: ['>', '<', '='] },
	        Value: { type: 'Text', title:null},
	        IsNull: { type: 'Checkboxes', title: 'Is null', options: ['']},
	        IsNotNull: { type: 'Checkboxes', title: 'Is not null', options: ['']}

	    },
	    defaults:{
	    	label: null
	    },
	    verboseName : "Filter"
    });
});

