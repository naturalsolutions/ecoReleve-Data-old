define([
    'marionette',
    'views/login'
], function(Marionette, LoginView) {
    'use strict';
    return Marionette.Controller.extend( {
        initialize: function(options) {
            this.mainRegion = options.mainRegion;
        },

        home: function() {
            this.mainRegion.show(this.app.layouts.home);
        },

        login: function() {
            var loginView = new LoginView();
            this.mainRegion.show(loginView);
        }
    });
});
