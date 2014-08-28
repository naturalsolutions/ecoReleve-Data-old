define([
    "config",
    "event_manager",
    "marionette",
    "views/login",
    "layouts/argos",
    "layouts/argos-detail",
    "layouts/home",
    "layouts/rfid",
    "views/navigation",
    "views/rfid-import"
], function(config, eventManager, Marionette, LoginView, ArgosLayout,
    ArgosDetailLayout, HomeLayout, RfidLayout, NavigationView, RfidImportView) {
    "use strict";
    return Marionette.Controller.extend( {
        initialize: function(options) {
            this.mainRegion = options.mainRegion;
            this.navRegion = options.navRegion;
            this.listenTo(eventManager, "show:login", this.login);
            this.listenTo(eventManager, "login:success", this.home);
            this.listenTo(eventManager, "show:argos", this.argos);
            this.listenTo(eventManager, "show:rfid", this.rfid);
            this.listenTo(eventManager, "show:rfid:deploy", this.rfidDeploy);
            this.listenTo(eventManager, "show:rfid:import", this.rfid_import);
            this.listenTo(eventManager, "show:argos:detail", this.argos_detail);
        },

        argos: function() {
            var argosLayout = new ArgosLayout();
            this.mainRegion.show(argosLayout);
            Backbone.history.navigate("argos");
        },

        argos_detail: function(obj) {
            if (obj) {
                var argosDetailLayout = new ArgosDetailLayout(obj);
                this.mainRegion.show(argosDetailLayout);
                Backbone.history.navigate("argos_detail");
            }
            else {
                this.login('argos');
            }
        },

        home: function() {
            var homeLayout = new HomeLayout();
            this.mainRegion.show(homeLayout);
            Backbone.history.navigate("");
        },

        insertNav: function() {
            if(!this.navRegion.hasView()) {
                this.navRegion.show(new NavigationView());
            }
        },

        login: function(route) {
            $.ajax({
                context: this,
                url: config.coreUrl + '/security/has_access'
            }).done( function() {
                if(typeof this[route] === "function") {
                    this.insertNav();
                    this[route]();
                }
                else {
                    this.insertNav();
                    this.home();
                }
            }).fail( function() {
                var loginView = new LoginView();
                this.mainRegion.show(loginView);
                this.navRegion.empty();
            });
        },

        rfid: function() {
            var layout = new RfidLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate("rfid");
        },

        rfidDeploy: function() {
            var layout = new RfidLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate("rfid_deploy");
        },

        rfid_import: function() {
            var view = new RfidImportView();
            this.mainRegion.show(view);
            Backbone.history.navigate("rfid_import");
        }
    });
});
