define([
    "jquery",
    "underscore",
    "backbone",
    "config",
    "event_manager",
    "marionette",
    "collections/users",
    "text!templates/login.html"
], function($, _, Backbone, config, eventManager, Marionette, Users, template) {
    "use strict";
    return Marionette.ItemView.extend( {
        className: "col-xs-6 col-xs-offset-3",
        collection: new Backbone.Collection(),
        template: template,

        events: {
            "submit": "login"
        },

        initialize: function() {
            var url = config.coreUrl + "/user";
            $.ajax({
                context: this,
                url: url,
                dataType: "json"
            })
            .done( function(data) {
                this.collection.reset(data);
            });
            this.listenTo(this.collection, "reset", this.render)
        },

        login: function(elt) {
            elt.preventDefault();
            var user = this.collection.findWhere({fullname: $('#username').val()});
            var url = config.coreUrl + "/security/login";
            $.ajax({
                context: this,
                type: "POST",
                url: url,
                data:{
                    user_id: user.get("PK_id"),
                    password: $('#password').val()
                }
            }).done( function() {
                eventManager.trigger("login");
            });
        }
    });
});
