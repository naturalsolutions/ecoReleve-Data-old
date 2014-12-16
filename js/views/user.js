define([
    "jquery",
    "config",
    "marionette"
], function($, config, Marionette) {

    "use strict";

    return Marionette.ItemView.extend({
        tagName: "span",
        className: "userName",
        template: _.template("<%= fullname %>"),
        modelEvents: {
            "change" : "render"
        },

        initialize: function() {
            this.model = new Backbone.Model();
            $.ajax({
                context: this,
                url: config.coreUrl + "currentUser",
                dataType: "json"
            }).done( function(data) {
                this.model.set(data);
            });
        },

        serializeData: function() {
            return {fullname: this.model.get("fullname")};
        }
    });
});
