define([
    "event_manager",
    "marionette",
    "views/user",
    "text!templates/header.html"
], function(eventManager, Marionette, UserView, template) {

    "use strict";

    return Marionette.LayoutView.extend( {
        template: template,
        regions: {
            breadcrumbsRegion: "#breadcrumbs",
            userRegion: "#user",
        },

        events: {
            "click #logout": "logout"
        },

        onShow: function() {
            this.userRegion.show(new UserView());
        },

        logout: function(evt) {
            evt.preventDefault();
            eventManager.trigger("logout");
        }
    });
});
