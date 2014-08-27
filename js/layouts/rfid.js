define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'text!templates/rfid.html'
], function($, _, Backbone, eventManager, Marionette, config, template) {
    "use strict";

    return Marionette.LayoutView.extend({
        className: "container-fluid only-one",
        template: template,

        events: {
            'click #deploy': 'showDeploy',
            'click #import': 'showImport',
        },

        showDeploy: function() {
            eventManager.trigger("show:rfid:deploy");
        },

        showImport: function() {
            eventManager.trigger("show:rfid:import");
        }
    });
});
