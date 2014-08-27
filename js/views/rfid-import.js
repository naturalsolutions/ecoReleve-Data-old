define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'text!templates/rfid-import.html'
], function($, _, Backbone, eventManager, Marionette, config, template) {
    "use strict";

    return Marionette.ItemView.extend({
        className: "container only-one",
        template: template,
        events: {},
    });
});
