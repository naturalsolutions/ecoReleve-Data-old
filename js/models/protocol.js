define([
    'backbone',
    'localforage',
    'localforage_backbone'
], function(Backbone, localforage, localforage_backbone){
    'use strict';
    return Backbone.Model.extend({
        sync: Backbone.localforage.sync(),
        defaults: {
            id: null,
            name: ''
        },

        schema: {
        },

        getId : function() {
            return this.get('id');
        }
    });
});
