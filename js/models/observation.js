define([
    'backbone',
    'localforage',
    'localforagebackbone',
], function(Backbone, localforage, localforagebackbone){
    'use strict';
    return Backbone.Model.extend({
        sync: Backbone.localforage.sync()
    });
});
