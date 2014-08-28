define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'views/rfid-import',
    'text!templates/rfid.html'
], function($, _, Backbone, eventManager, Marionette, config, ImportView, template) {
    "use strict";

    return Marionette.LayoutView.extend({
        className: "container-fluid",
        template: template,

        regions: {
            action: "#action"
        },

        events: {
            'click #deploy': 'showDeploy',
            'click #import': 'showImport',
        },

        showDeploy: function() {
            eventManager.trigger("show:rfid:deploy");
        },

        showImport: function() {
            this.action.show(new ImportView);
            //eventManager.trigger("show:rfid:import");
        }
    });
});
