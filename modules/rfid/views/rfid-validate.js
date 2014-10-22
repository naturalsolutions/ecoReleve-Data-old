define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'text!modules2/rfid/templates/rfid-validate.html',
    'pnotify'
], function($, _, Backbone, Marionette, config, template, pnotify) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        events: {
            'click #btn-validate': 'validate',
            'slide #bt-slider': 'updateSlideVal',
        },
        onShow: function () {
              $('#bt-slider').slider({
                formatter: function(value) {
                    return 'Current value: ' + value;
                },
            });
        },

        updateSlideVal:function (evt) {
            $('#sliderVal').html('Select location per individual per <b>'+evt.value+'</b> minutes');
        },

        validate: function(evt) {
            evt.preventDefault();
            $.ajax({
                url: config.coreUrl + 'rfid/validate'
            }).done( function(data) {
                new PNotify({
                    title: 'Import succeed',
                    text: 'The file was imported with code : \n'+data,
                    type: 'info'
                });
            }).fail( function(data) {
                new PNotify({
                    title: 'Import error',
                    text: 'Please verify your file or contact administrator',
                    type: 'error'
                });

            })
        }
    });
});
