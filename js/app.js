define([
    'jquery',
    'jquery_ui',
    'underscore',
    'backbone',
    'bootstrap',
    'chart',
    'collections/observations',
    'collections/protocols',
    'collections/users',
    'collections/field_activities',
    'collections/stations',
    'collections/stations_protocols',
    'layouts/home',
    'config',
    'router',
    'metro',
    'localforage',
    'views/breadcrumbs',
    'views/info',
    'views/navigation',
    'views/current_user',
    'marionette',
    'controller',
    'text!templates/current_user.html'
], function(
    $, jquery_ui, _, Backbone, bootstrap, Chart, Observations, Protocols, Users, FieldActivities,
    Stations, StationsProtocols, HomeLayout, config, Router, metro, localforage, Breadcrumbs,
    InfoView, Navigation, CurrentUser, marionette, Controller, currentUser){
    'use strict';

    Chart.defaults.global.responsive = true;

    var newApp = new Backbone.Marionette.Application();

    newApp.addRegions({
        mainRegion: '#mainRegion'
    });

    newApp.vent.on("login", function() {console.log('Login success')});

    newApp.addInitializer( function() {
        var router = new Router( {
            controller: new Controller( {
                mainRegion: newApp.mainRegion
            }),
        });
    });

    newApp.on('start', function(options) {
        Backbone.history.start();
    })
    /*
    var app = {
        dao: {},
        models: {},
        views: {},
        utils: {},
        collections :{},
        roles: {
            admin: 'admin',
            superuser: 'superuser',
            user: 'user'
        },
        router: new Router,
        instances: {},

        init: function(){
            // Customize Underscore templates behaviour: 'with' statement is prohibited in JS strict mode
            //_.templateSettings.variable = 'data';

            // Configure Chart.js globals
            Chart.defaults.global.responsive = true;

            this.instances.breadCrumbs = new Breadcrumbs({model: this.router});
            this.instances.mainNav = new Navigation({model: this.router});

            // TODO: gérer le local storage
            // localforage.removeItem('FieldActivities');

            // Current user
            this.instances.userView = new CurrentUser();
            this.instances.userView.$el.appendTo('.navbar .navbar-inner');
            this.instances.userView.render();
            this.instances.mainNav.$el.appendTo('#main-nav');
            this.instances.mainNav.render();
            this.instances.breadCrumbs.$el.insertBefore('#static-menu');
            this.instances.breadCrumbs.render();
            Backbone.history.start();
            window.mapAjaxCall = false;
            window.mapAjaxCall.xhr = false;

            // get users list if not exists
            this.collections.users = new Users();
            this.collections.users.fetch({
                success: function (collection) {
                    if (collection.length === 0){
                        collection.loadFromDB('/user/fieldworkers');
                    }
                }
            });

            // get field activity list
            this.collections.fieldActivityList = new FieldActivities();
            this.collections.fieldActivityList.fetch({
                success: function (collection) {
                    if (collection.length === 0){
                        collection.loadFromDB('/theme/list');
                    }
                }
            });

            // get station list
            this.collections.stations = new Stations();
            this.collections.stations.fetch({
                success: function() {
                    console.log("stations loaded ! ");
                }
            });

            // load stored protocols
            this.collections.protocolsList = new Protocols();
            this.collections.protocolsList.fetch({
                success: function(collection) {
                    collection.reset();
                    collection.loadFromXML("ressources/XML_ProtocolDef_eReleve.xml");
                }
            });

            // load observations
            this.collections.observations = new Observations();
            this.collections.observations.fetch({
                success: function(collection) {
                    console.log("observations loaded ! ");
                    // number of stored observations
                    var ln = collection.length;
                    $("#homeNbObs").text(ln);
                }
            });

            // load obs collection for mydata grid
            this.collections.obsListForMyData = new StationsProtocols();
            this.collections.obsListForMyData.fetch({
                success: function(collection) {
                    console.log("obs loaded !");
                }
            });

            // get id of last stored station & last stored obs
            var idLastStation = parseInt(localStorage.getItem("idLastStation"));
            if (idLastStation){
                this.utils.idLastStation = idLastStation;
            } else {
                this.utils.idLastStation = 0;
            }
            var idLastObs = parseInt(localStorage.getItem("idLastObs"));
            if (idLastObs){
                this.utils.idLastObs = idLastObs;
            } else {
                this.utils.idLastObs = 0;
            }
            $(window).on('hashchange', function(e) {
                // abroad ajax calls
                if (window.mapAjaxCall.xhr) {
                    window.mapAjaxCall.xhr.abort();
                }
                if (this.xhr) {
                    this.xhr.abort();
                }
                console.log("route change...");
                return false;
            });
        }
    };
    return app;*/
    return newApp;
});
