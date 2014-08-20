define([
    'backbone',
], function(Backbone){
    'use strict';
    return Backbone.Model.extend({
        schema: {
            id: 'Date',
            name: 'Text',
            display_label: 'Text'
        }
    });
});
