define([
    'backbone',
], function(Backbone){
    'use strict';
    return Backbone.Model.extend({
        schema: {
            id: 'Text',
            name: 'Text',
            display_label:'Text',
            multiline: 'Text',
            defaultValue:'Text',
            required : 'Text'
        }
    });
});
