define([
    'marionette',
    'radio',
    'views/user',
    'nicescroll',
    'text!templates/header.html'
], function(Marionette, Radio, UserView, nicescroll, template) {

    'use strict';

    return Marionette.LayoutView.extend( {
        template: template,
        regions: {
            breadcrumbsRegion: '#breadcrumbs',
            userRegion: '#user',
        },

        events: {
            'click #logout': 'logout',
            'click .navbar-brand'  :'home'
        },

        onShow: function() {

            this.userRegion.show(new UserView());
            /*$(document).ready(
                function() {                      
                    $('html').niceScroll();
                    $('#gridContainer').niceScroll();
                }
              );*/
        },

        logout: function(evt) {
            evt.preventDefault();
            Radio.channel('route').trigger('logout');
        },

        home: function(evt) {
            evt.preventDefault();
            Radio.channel('route').trigger('home');
        }
    });
});
