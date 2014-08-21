define([
    'marionette',
], function(Marionette) {
    'use strict';
    return Marionette.Controller.extend( {
        initialize: function(app) {
            this.app = app;
        },

        home: function() {
            this.app.main.show(this.app.layouts.home);
        }
    });
});
