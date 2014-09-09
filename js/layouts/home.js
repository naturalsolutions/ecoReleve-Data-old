define([
    "marionette",
    'radio',
    'vegas',
    "views/graph",
    "views/info",
    "text!templates/home_new.html"
], function(Marionette, Radio, vegas, GraphView, InfoView, template) {
    "use strict";
    return Marionette.LayoutView.extend( {
        className:"container-fluid",
        template: template,
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

        onRender: function(){
            $.vegas ({
                src: 'images/home_fond.jpg'
            });
            this.info.show(new InfoView());
            this.graph.show(new GraphView());
        },

        onDestroy: function() {
            $('.vegas-background').hide();
        },

        argos: function() {
            Radio.channel('route').trigger('argos');
        },

        indiv: function() {
            Radio.channel('route').trigger('indiv');
        },

        monitoredSite: function() {
            Radio.channel('route').trigger('monitoredSite');
        },

        rfid: function() {
            Radio.channel('route').trigger('rfid');
        }
    });
});
