define([
    "event_manager",
    "marionette",
    "views/graph",
    "views/info",
    "chart",
    "config",
    "text!templates/home_new.html"
], function(eventManager, Marionette, GraphView, InfoView, Chart, config, homeTemplate) {
    "use strict";
    return Marionette.LayoutView.extend( {
        className:"container-fluid",
        template: homeTemplate,
        regions: {
            graph: "#graph",
            info: "#info",
            tiles: "#tiles"
        },

        events: {
            "click #argosTile": "argos",
            "click #indivTile": "indiv",
            "click #rfidTile": "rfid",
            "click #monitoredSiteTile" : "monitoredSite"
        },

        initialize: function() {
        },

        onRender: function(){
            this.info.show(new InfoView());
            this.graph.show(new GraphView());
        },

        argos: function() {
            eventManager.trigger("show:argos");
        },

        indiv: function() {
            eventManager.trigger("show:indiv");
        },

        monitoredSite: function() {
            eventManager.trigger("show:monitoredSite");
        },

        rfid: function() {
            eventManager.trigger("show:rfid");
        }
    });
});
