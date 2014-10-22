var ecoReleveData = (function(){
    'use strict';

    require.config({
        baseUrl: 'js/lib',
        config: {
            moment: {
                noGlobal: true
            }
        },
        shim:{

            pnotify: {
                deps:['bootstrap','jquery'],
                exports: 'pnotify'
            },

            bootstrap_slider: {
                deps: ['bootstrap','jquery'],
                exports: 'bootstrap_slider'
            },

            dateTimePicker : {
                deps: ['jquery', 'moment','bootstrap']  ,
                exports: 'dateTimePicker'
            },

            backgrid: {
                deps: ['jquery', 'underscore', 'backbone'],
                exports: 'Backgrid'
            },
            bootstrap: {
                deps: ['jquery']
            },
            chart: {
                exports : 'Chart'
            },
            metro: {
                deps: ['jquery', 'jquery_ui']
            },
            marionette: {
                deps : ['jquery', 'underscore', 'backbone'],
                exports : 'Marionette'
            },
            ol3: {
                exports: 'ol'
            },
            openlayers: {
                exports: 'OpenLayers'
            },
            sha1: {
                exports: 'sha1'
            },
            vegas: {
                deps:['jquery']
            },
            fuelux:{
                deps:['jquery','bootstrap'],
                exports: 'Fuelux'
            },
            backboneLocalstorage :{
                deps:['backbone'],
                exports: 'backboneLocalstorage'
            },
            bbForms  : {
                deps:['backbone']
               // exports: 'nsForms'
            }
            /*,
            nsForms : {
                deps:['backbone','layoutManager'],
                exports: 'nsForms'
            }*/

        },
        paths: {
            app: '../app',
            collections: '../collections',
            config: '../config',
            controller: '../controller',
            google: '../utils/google-maps-loader',
            layouts: '../layouts',
            controllers: '../controllers',
            models: '../models',
            modules: '../modules',
            modules2: '../../modules',
            router: '../router',
            utils: '../utils',
            // Libs
            backgrid: '../../bower_components/backgrid/lib/backgrid',
            'backgrid.paginator': 'backgrid.paginator/backgrid.paginator',
            'backbone.paginator': 'backbone.paginator/2.0.2/backbone.paginator',
            backboneLocalstorage : 'backbone.localstorage/backbone.localStorage-min',
            bootstrap: 'bootstrap/3.2.0/bootstrap',
            chart: '../../bower_components/chartjs/Chart',
            dropzone: '../../bower_components/dropzone/downloads/dropzone-amd-module',
            marionette: 'marionette/2.1.0/backbone.marionette',
            openlayers: 'openlayers/openlayers',
            ol3: 'openlayers/3.0.0/build/ol-debug',
            radio: '../../bower_components/backbone.radio/build/backbone.radio',
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

            vegas: '../../bower_components/vegas/dist/jquery.vegas',
            fuelux : '../../bower_components/fuelux/dist/js/fuelux',
            bbForms : 'backbone.forms/backbone-forms.min',
            nicescroll:'nicescroll/jquery.nicescroll',
            dateTimePicker: '../../bower_components/eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
            bootstrap_slider: '../../bower_components/seiyria-bootstrap-slider/js/bootstrap-slider',
            pnotify: '../../bower_components/pnotify/pnotify.core'
        }

    });

    require(['app'], function(app){
        //app.init();
        app.start();
        ecoReleveData = app;
    });
})();
