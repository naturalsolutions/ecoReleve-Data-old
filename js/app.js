define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'layouts/home',
    'config',
    'router',
    'localforage',
    'views/breadcrumbs',
    'views/info',
    'views/navigation',
    'views/current_user',
    'marionette',
    'controller',
    'text!templates/current_user.html'
], function(
    $, _, Backbone, bootstrap, HomeLayout, config, Router, localforage, Breadcrumbs,
    InfoView, Navigation, CurrentUser, Marionette, Controller, currentUser){
    'use strict';


    var newApp = new Marionette.Application();

    newApp.addRegions({
        headerRegion: "#header-region",
        mainRegion: "#main-region",
        className:"full-height"
    });

    newApp.addInitializer( function() {
        var router = new Router( {
            controller: new Controller( {
                mainRegion: newApp.mainRegion,
                headerRegion: newApp.headerRegion,
                 className:"full-height"
            }),
        });
    });

    newApp.on('start', function(options) {
        Backbone.history.start();
    })

    return newApp;
});
