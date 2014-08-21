define([
    'jquery',
    'backbone',
    'config',
    'localforage',
    'localforagebackbone'
], function($, Backbone, config, localforage, localforagebackbone){
    'use strict';
    return Backbone.Collection.extend({
        sync: Backbone.localforage.sync('UsersList'),
        model: Backbone.Model.extend({
            sync: Backbone.localforage.sync()
        }),

        //model: app.models.User,
        save: function() {
            this.each(function(model) {
                model.save();
            });
        },

        load: function (options) {
            //this.sync("read", this, options);
            this.sync('read', this, {
                success: function(){
                    console.log('collection loaded!');
                }
            });
        },

        loadFromDB: function(url) {
            url = config.coreUrl + url;
            $.ajax({
                context: this,
                url: url,
                dataType: "json"
            })
            .done( function(data) {
                var len = data.length;
                for (var i = 0; i < len; i++) {
                    var label = data[i].Nom;
                    var id = data[i].ID;
                    this.add({
                        "idUser": id,
                        "label": label
                    });
                }
                this.save();
            })
            .fail( function() {
                alert("error loading items, please check connexion to webservice");
            });
        }
        //localStorage : new Store('usersList')
    });
});
