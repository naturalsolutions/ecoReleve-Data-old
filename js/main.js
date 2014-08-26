var ecoReleveData = (function(){
    "use strict";

    require.config({
        baseUrl: 'js/lib',
        config: {
            moment: {
                noGlobal: true
            }
        },
        shim:{
            bootstrap: {
                deps: ['jquery']
            },
            metro: {
                deps: ['jquery', 'jquery_ui']
            },
            marionette: {
                deps : ['jquery', 'underscore', 'backbone'],
                exports : 'Marionette'
            },
            sha1: {
                exports: "sha1"
            }
        },
        paths: {
            app: '../app',
            collections: '../collections',
            config: '../config',
            controller: '../controller',
            event_manager: '../event-manager',
            layouts: '../layouts',
            controllers: '../controllers',
            models: '../models',
            router: '../router',
            // Libs
            bootstrap: 'bootstrap/3.2.0/bootstrap',
            chart: 'chart/1.0.1-beta4/Chart',
            marionette: 'marionette/2.1.0/backbone.marionette',
            sha1: 'sha1/sha1',
            templates: '../../templates',
            text: '../tools/text',
            views: '../views',
            localforage: 'localforage/localforage-0.9.2',
            jquery: 'jquery/jquery-1.11.1',
            jquery_ui: 'jquery-ui/1.11.1/jquery-ui',
            metro: 'metro/metro.min',
            moment: 'moment/moment-2.8.1',
            underscore: 'underscore/underscore-1.6.0',
            backbone: 'backbone/backbone-1.1.2',
            localforagebackbone: 'localforage.backbone/0.4.0/localforage.backbone',
        }
    });

    require(['app'], function(app){
        //app.init();
        app.start();
        ecoReleveData = app;
    });
})();
