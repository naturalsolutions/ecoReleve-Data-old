define([
    'marionette',
    'radio',
    'views/user',
    'text!templates/header.html'
], function(Marionette, Radio, UserView, template) {

    'use strict';

    return Marionette.LayoutView.extend( {
        template: template,
        regions: {
            breadcrumbsRegion: '#breadcrumbs',
            userRegion: '#user',
        },

        events: {
            'click #logout': 'logout'
        },

        onShow: function() {
            this.userRegion.show(new UserView());
        },

        logout: function(evt) {
            evt.preventDefault();
            Radio.channel('route').trigger('logout');
        }
    });
});
