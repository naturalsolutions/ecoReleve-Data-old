define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'modules/individual/layouts/search-panel',
    'modules/individual/views/individual-list',
    'text!templates/individual/individual.html'
], function($, _, Backbone, eventManager, Marionette, config, AddView,
    DeployView, ImportView, ValidateView, template) {

    "use strict";

    return Marionette.LayoutView.extend({
        className: "container-fluid",
        template: template,

        regions: {
            leftRegion: "#left-panel",
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
