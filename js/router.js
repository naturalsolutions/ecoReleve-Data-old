define([
    'backbone',
    'marionette'
], function(Backbone, Marionette) {

    'use strict';

    return Backbone.Marionette.AppRouter.extend( {
        appRoutes: {
            '*route': 'login'
        }
    });
});
