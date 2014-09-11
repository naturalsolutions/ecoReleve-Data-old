define([
    "jquery",
    "underscore",
    "backbone",
    'marionette',
    'config',
    'modules/rfid/views/rfid-add',
    'modules/rfid/views/rfid-deploy',
    'modules/rfid/views/rfid-import',
    'modules/rfid/views/rfid-validate',
    'text!templates/rfid/rfid.html'
], function($, _, Backbone, Marionette, config, AddView,
    DeployView, ImportView, ValidateView, template) {

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
