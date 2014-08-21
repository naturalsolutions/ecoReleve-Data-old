define([
    'jquery',
    'backbone',
    'config',
    'localforage',
    'localforagebackbone'
], function($, Backbone, config, localforage, localforagebackbone){
    'use strict';
    return Backbone.Collection.extend({
        sync: Backbone.localforage.sync('FieldActivities'),
        model: Backbone.Model.extend({
            sync: Backbone.localforage.sync()
        }),

        save: function() {
            this.each(function(model) {
                model.save();
            });
        },

        loadFromDB: function(url) {
            url = config.coreUrl + url;
            var me = this;
            $.ajax({
                context: this,
                url: url,
                dataType: "json"
            })
            .done( function(data) {
                var len = data.length;
                for (var i = 0; i < len; i++) {
                    var label = data[i].caption;
                    var value = data[i].id;
                    this.add({
                        "idActivity": value,
                        "label": label
                    });
                }
                this.save();
            })
            .fail( function() {
                alert("error loading items, please check connexion to webservice");
            });
        }
    });
});
