define([
    'backbone',
    'localforage',
    'localforage_backbone',
    'models/observation',
], function(Backbone, localforage, localforage_backbone, Observation){
    'use strict';
    return Backbone.Collection.extend({
        sync: Backbone.localforage.sync('ObservationsList'),
        model: Observation,
        save: function() {
            this.each(function(model) {
                model.save();
            });
        }
    });
});
