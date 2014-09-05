define([
    "backbone",
    "config",
    "event_manager",
    "marionette",
    "views/login",
    "layouts/argos",
    "layouts/argos-detail",
    "layouts/home",
    "modules/individual/individual-layout",
    "modules/rfid/rfid-layout",
    "layouts/header",
], function(Backbone, config, eventManager, Marionette, LoginView, ArgosLayout,
    ArgosDetailLayout, HomeLayout, IndivLayout, RfidLayout, HeaderLayout) {

    "use strict";

    return Marionette.Controller.extend( {
        initialize: function(options) {
            this.mainRegion = options.mainRegion;
            this.headerRegion = options.headerRegion;
            this.listenTo(eventManager, "logout", this.logout);
            this.listenTo(eventManager, "show:login", this.login);
            this.listenTo(eventManager, "login:success", this.login);
            this.listenTo(eventManager, "show:argos", this.argos);
            this.listenTo(eventManager, "show:indiv", this.indiv);
            this.listenTo(eventManager, "show:monitoredSite",
                this.monitoredSite);
            this.listenTo(eventManager, "show:rfid", this.rfid);
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

        indiv: function() {
            var layout = new IndivLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate("individual");
        },

        monitoredSite: function() {
            var layout = new MonitoredSiteLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate("monitored_site");
        },

        insertHeader: function() {
            if(!this.headerRegion.hasView()) {
                this.headerRegion.show(new HeaderLayout());
            }
        },

        login: function(route) {
            $.ajax({
                context: this,
                url: config.coreUrl + 'security/has_access'
            }).done( function() {
                this.insertHeader();
                if(typeof this[route] === "function") {
                    this[route]();
                }
                else {
                    this.home();
                }
            }).fail( function() {
                Backbone.history.navigate("login");
                this.headerRegion.empty();
                this.mainRegion.show(new LoginView());
            });
        },

        logout: function() {
            $.ajax({
                context: this,
                url: config.coreUrl + 'security/logout'
            }).done( function() {
                this.login();
            });
        },

        rfid: function() {
            var layout = new RfidLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate("rfid");
        }
    });
});
