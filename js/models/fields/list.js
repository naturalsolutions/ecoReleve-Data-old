define([
    'backbone',
], function(Backbone){
    'use strict';
    return Backbone.Model.extend({
        schema: {
            id: 'List',
            name: 'Text',
            display_label:'Text',
            items : 'Object'
        }
    });
});
