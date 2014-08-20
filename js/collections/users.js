define(['backbone'], function(Backbone){
    'use strict';
    return Backbone.Collection.extend({
        sync: Backbone.localstorage.sync('UsersList'),
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
        }
        //localStorage : new Store('usersList')
    });
});
