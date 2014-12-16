define([
    'backbone',
], function(Backbone){
    'use strict';

    return {
        BooleanField: Backbone.Model.extend({
            schema: {
                id: 'Boolean',
                name : 'Text',
                display_label:'Text',
                defaultValue:'Text',
                required : 'Text'
            }
        }),

        NumericField: Backbone.Model.extend({
            schema: {
                id: 'Number',
                name: 'Text',
                display_label: 'Text',
                unit: 'Text',
                max_bound :'Number',
                min_bound: 'Number',
                precision: 'Text',
                defaultValue:'Number'
            }
        }),

        TextField: Backbone.Model.extend({
            schema: {
                id: 'Text',
                name: 'Text',
                display_label:'Text',
                multiline: 'Text',
                defaultValue:'Text',
                required : 'Text'
            }
        }),

        DateField: Backbone.Model.extend({
            schema: {
                id: 'Date',
                name: 'Text',
                display_label: 'Text'
            }
        }),

        ListField: Backbone.Model.extend({
            schema: {
                id: 'List',
                name: 'Text',
                display_label:'Text',
                items : 'Object'
            }
        }),

        PhotoField: Backbone.Model.extend({
            schema: {
                id: 'Number',
                name: 'Text',
                display_label: 'Text'
            }
        })
    };
});
