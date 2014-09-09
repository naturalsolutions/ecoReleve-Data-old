define([
    'jquery',
    'underscore',
    'backbone',
    'config',
    'marionette',
    'radio',
    'sha1',
    'collections/users',
    'text!templates/login.html'
], function($, _, Backbone, config, Marionette, Radio, sha1, Users, template) {

    'use strict';

    return Marionette.ItemView.extend( {
        className: 'col-sm-4 col-sm-offset-4',
        collection: new Backbone.Collection(),
        template: template,

        events: {
            'submit': 'login',
            'change #username': 'checkUsername',
            'focus input': 'clear'
        },

        // Cache Jquery selector.
        ui: {
            err: '#help-password',
            pwd: '#pwd-group'
        },

        initialize: function() {
            var url = config.coreUrl + 'user';
            this.listenTo(this.collection, 'reset', this.render)
            $.ajax({
                context: this,
                url: url,
                dataType: 'json'
            }).done( function(data) {
                this.collection.reset(data);
            });
        },

        onRender: function() {
            $('#username').trigger('focus');
        },

        checkUsername: function() {
            var user = this.collection.findWhere({fullname: $('#username').val()});
            if (!user) {
                this.fail('#login-group', 'Invalid username');
            }
        },

        login: function(elt) {
            elt.preventDefault();
            elt.stopPropagation();
            var user = this.collection.findWhere({fullname: $('#username').val()});
            var url = config.coreUrl + 'security/login';
            if (user) {
                $.ajax({
                    context: this,
                    type: 'POST',
                    url: url,
                    data:{
                        user_id: user.get('PK_id'),
                        password: sha1.hash($('#password').val())
                    }
                }).done( function() {
                    Radio.channel('route').trigger('login:success');
                }).fail( function () {
                    this.fail('#pwd-group', 'Invalid password');
                });
            }
            else {
                this.fail('#login-group', 'Invalid username');
            }
        },

        fail: function(elt, text) {
            $(elt).addClass('has-error');
            $(elt + ' .help-block').text(text);
        },

        clear: function(evt) {
            var group = $(evt.target).parent();
            group.removeClass('has-error');
            group.find(".help-block").text('');
        }
    });
});
