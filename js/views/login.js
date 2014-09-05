define([
    "jquery",
    "underscore",
    "backbone",
    "config",
    "event_manager",
    "marionette",
    "sha1",
    "collections/users",
    "text!templates/login.html"
], function($, _, Backbone, config, eventManager, Marionette, sha1, Users, template) {

    "use strict";

    return Marionette.ItemView.extend( {
        className: "col-sm-4 col-sm-offset-4",
        collection: new Backbone.Collection(),
        template: template,

        events: {
            "submit": "login",
            "focus #password": "clear"
        },

        ui: {
            err: "#help-password",
            pwd: "#pwd-group"
        },

        initialize: function() {
            var url = config.coreUrl + "user";
            this.listenTo(this.collection, "reset", this.render)
            $.ajax({
                context: this,
                url: url,
                dataType: "json"
            })
            .done( function(data) {
                this.collection.reset(data);
            });
        },

        login: function(elt) {
            elt.preventDefault();
            var user = this.collection.findWhere({fullname: $('#username').val()});
            var url = config.coreUrl + "security/login";
            if (user) {
                $.ajax({
                    context: this,
                    type: "POST",
                    url: url,
                    data:{
                        user_id: user.get("PK_id"),
                        password: sha1.hash($('#password').val())
                    }
                }).done( function() {
                    eventManager.trigger("login:success");
                }).fail( this.fail );
            }
        },

        fail: function() {
            this.ui.pwd.addClass("has-error");
            this.ui.err.text('Incorrect password');
        },

        clear: function() {
            this.ui.pwd.removeClass("has-error");
            this.ui.err.text("");
        }
    });
});
