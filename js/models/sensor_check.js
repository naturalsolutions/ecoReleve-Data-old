define([
    "event_manager",
    'marionette',
    'views/graph',
    'views/info',
    'chart',
    'config',
    'text!templates/home_new.html'
], function(eventManager, Marionette, GraphView, InfoView, Chart, config, homeTemplate) {

    'use strict';

    return Backbone.Model.extend( {
        className:"home",
        views: {},
        template: _.template(homeTemplate),
        regions: {
            graph: "#graph",
            info: "#info",
            tiles: "#tiles"
        },

        ui: {
            argosTile: "#argosTile"
        },

        events: {
            "click #argosTile": "checkArgos"
        },

        initialize: function() {
            this.views.info = new InfoView();
        },

        onRender: function(){
            if(typeof this.views.graph === "undefined"){
                this.views.graph = new GraphView();
            }
            this.info.show(this.views.info);
        },

        checkArgos: function() {
            eventManager.trigger("home:show:argos", this.ui.argosTile);
        }
    });
});
