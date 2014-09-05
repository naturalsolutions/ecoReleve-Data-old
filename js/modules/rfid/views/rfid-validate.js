define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'text!templates/rfid/rfid-validate.html'
], function($, _, Backbone, eventManager, Marionette, config, template) {

    "use strict";

    return Marionette.ItemView.extend({
        template: template,
        events: {
            "click #btn-validate": "validate"
        },
        
        validate: function(evt) {
            evt.preventDefault();
            $.ajax({
                url: config.coreUrl + "rfid/validate"
            }).done( function(data) {
                alert(data);
            }).fail( function(data) {
                alert(data.responseText);
            })
        }
    });
});
