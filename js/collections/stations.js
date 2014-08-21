define([
    'backbone',
    'models/station',
    'localforage',
    'localforagebackbone'
], function(Backbone, Station, localforage, localforagebackbone){
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
