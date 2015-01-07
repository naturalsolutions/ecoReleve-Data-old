define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'models/rfid',
    'text!modules2/rfidN/templates/rfid-add.html'
], function($, _, Backbone, Marionette, config, Rfid, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

        events: {
            'click #btn-add': 'add',
            'focus #input-identifier' : 'clear'
        },

        ui: {
            group: '#group-identifier',
            help: '#help-identifier'
        },

        add: function(e) {
            e.preventDefault();
            var text = $('#input-identifier').val();
            if(text === '') {
                this.ui.group.addClass('has-error');
                this.ui.help.text('Required');
            }
            else {
                var model = new Rfid({
                    identifier: text,
                });
                model.save(null, {success: this.onSave, error: this.onSave});
            }
        },

        onSave: function(model, response, options) {
            alert(response.responseText);
        },

        clear: function() {
            this.ui.group.removeClass('has-error');
            this.ui.help.text('');
        }
    });
});
