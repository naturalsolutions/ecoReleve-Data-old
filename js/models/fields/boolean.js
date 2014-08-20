define([
    'backbone',
], function(Backbone){
    'use strict';
    return Backbone.Model.extend({
        schema: {
            id: 'Boolean',
            name : 'Text',
            display_label:'Text',
            defaultValue:'Text',
            required : 'Text'
        }
    });
});
