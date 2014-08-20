define([
    'backbone',
    'models/station',
    'localforage',
    'localforage_backbone'
], function(Backbone, Station, localforage, localforage_backbone){
    'use strict';
    return Backbone.Collection.extend({
        model: Station,

        sync: Backbone.localforage.sync('StationList'),

        save: function() {
            this.each(function(model) {
                model.save();
            });
        }
    });
});
