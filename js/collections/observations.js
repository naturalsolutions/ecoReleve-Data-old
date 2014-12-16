define([
    'backbone',
    'localforage',
    'localforagebackbone',
    'models/observation',
], function(Backbone, localforage, localforagebackbone, Observation){
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
