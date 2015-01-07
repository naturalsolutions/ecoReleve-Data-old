define([
    'jquery',
    'underscore',
    'marionette',
    'radio',
    'config',
    'text!modules2/validate/templates/tpl-validate.html'
], function($, _, Marionette, Radio, config, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container no-padding',
        template: template,

        events: {
            'click #gsm' : 'gsm',
            'click #rfid' : 'rfid',
            'click #gps' : 'gps',
        },

        initialize: function() {

        },

        onRender: function(){
            $('body').addClass('validate');
        },

        onDestroy: function() {
            $('body').removeClass('validate');
        },

        gsm: function(){
            Radio.channel('route').command('validate:type', 'gsm');
        },
        rfid: function(){
            Radio.channel('route').command('validate:type', 'rfid');
        },
        gps: function(){
            Radio.channel('route').command('validate:type', 'argos');
        },
    });
});
