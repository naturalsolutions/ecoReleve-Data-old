define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'modules2/rfid/layouts/rfid-deploy',
    'modules2/rfid/views/rfid-add',
    'modules2/rfid/views/rfid-import',
    'modules2/rfid/views/rfid-validate',
    'text!modules2/rfid/templates/rfid.html'
], function($, _, Backbone, eventManager, Marionette, config, DeployView, AddView,
    ImportView, ValidateView, template) {

    "use strict";

    return Marionette.LayoutView.extend({
        className: "container-fluid",
        template: template,

        regions: {
            mainRegion: "#main-panel"
        },

        events: {
            'click #deploy'   : 'showDeploy',
            'click #import'   : 'showImport',
            'click #add'      : 'showAdd',
            'click #validate' : 'showValidate'
        },

        showDeploy: function() {
            this.mainRegion.show(new DeployView());
            Backbone.history.navigate("rfid_deploy");
        },

        showImport: function() {
            this.mainRegion.show(new ImportView());
            Backbone.history.navigate("rfid_import");
        },

        showAdd: function() {
            this.mainRegion.show(new AddView());
            Backbone.history.navigate("rfid_add");
        },

        showValidate: function() {
            this.mainRegion.show(new ValidateView());
            Backbone.history.navigate("rfid_validate");
        }
    });
});
