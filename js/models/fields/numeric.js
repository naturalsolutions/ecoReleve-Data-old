define([
    'backbone',
], function(Backbone){
    'use strict';
    return Backbone.Model.extend({
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
    });
});
