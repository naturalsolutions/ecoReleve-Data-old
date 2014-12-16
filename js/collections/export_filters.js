define([
    'backbone',
    'models/export_filter',
    'localforage',
    'localforagebackbone'
], function(Backbone, ExportFilter, localforage, localforagebackbone){
    'use strict';
    return Backbone.Collection.extend({
        model: ExportFilter,

        //sync: Backbone.localforage.sync('ExportFilter'),
        

        /*
        save: function() {
            this.each(function(model) {
                model.save();
            });
        }*/
    });
});