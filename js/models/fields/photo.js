define([
    'backbone',
], function(Backbone){
    'use strict';
    return Backbone.Model.extend({
        schema: {
            id: 'Number',
            name: 'Text',
            display_label: 'Text'
        }
    });
});
