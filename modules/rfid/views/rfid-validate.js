define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'text!modules2/rfid/templates/rfid-validate.html',
    
], function($, _, Backbone, eventManager, Marionette, config, template) {

    "use strict";

    return Marionette.ItemView.extend({
        template: template,
        events: {
            "click #btn-validate": "validate",
            "slide #bt-slider": "updateSlideVal",
        },
        onShow: function () {
              $("#bt-slider").slider({
                formatter: function(value) {
                    return 'Current value: ' + value;
                },
            });
        },

        updateSlideVal:function (evt) {
            $("#sliderVal").html('Select location per individual per <b>'+evt.value+'</b> minutes');
        },

        validate: function(evt) {
            evt.preventDefault();
            $.ajax({
                url: config.coreUrl + "rfid/validate"
            }).done( function(data) {
                alert('The file was imported with code : \n'+data);
            }).fail( function(data) {
               alert('Please verify your file or contact administrator');

            })
        }
    });
});
