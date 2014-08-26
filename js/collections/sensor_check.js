define([
    'marionette',
    'models/sensor_check',
    'config',
    'text!templates/sensor_check_grid.html'
], function(Marionette, model, config, template) {

    'use strict';

    return Backbone.Collection.extend( {
        template: template,
        url: config.sensorUrl + 'sensor/unchecked'

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
