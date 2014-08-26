define([
    "config",
    "event_manager",
    "marionette",
    "views/login",
    "layouts/argos",
    "layouts/home"
], function(config, eventManager, Marionette, LoginView, ArgosLayout, HomeLayout) {
    "use strict";
    return Marionette.Controller.extend( {
        initialize: function(options) {
            this.mainRegion = options.mainRegion;
            this.listenTo(eventManager, "login:success", this.home);
            this.listenTo(eventManager, "home:show:argos", this.argos)
        },

        argos: function() {
            var argosLayout = new ArgosLayout();
            this.mainRegion.show(argosLayout);
            Backbone.history.navigate("argos");
        },

        home: function() {
            var homeLayout = new HomeLayout();
            this.mainRegion.show(homeLayout);
        },

        login: function(route) {
            $.ajax({
                context: this,
                url: config.coreUrl + '/security/has_access'
            }).done( function() {
                if(typeof this[route] === "function") {
                    this[route]();
                }
                else {
                    this.home();
                }
            }).fail( function() {
                var loginView = new LoginView();
                this.mainRegion.show(loginView);
            });
        }
    });
});
