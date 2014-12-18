var ecoReleveData = (function(){
    'use strict';

    var bower = '../../bower_components/';
    require.config({
        baseUrl: 'js/lib',
        config: {
            moment: {
                noGlobal: true
            }
        },
        shim:{
            marionette: {
                deps : ['jquery', 'underscore', 'backbone'],
                exports : 'Marionette'
            },
            bbForms  : {
                deps:['backbone']
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
            fuelux:{
                deps:['jquery','bootstrap'],
                exports: 'Fuelux'
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
            sweetAlert: {
                exports:'sweetAlert'
            },
            bootstrap_slider: {
                deps: ['bootstrap','jquery'],
                exports: 'bootstrap_slider'
            },
            dateTimePicker : {
                deps: ['jquery', 'moment','bootstrap']  ,
                exports: 'dateTimePicker'
            },
            backboneLocalstorage :{
                deps:['backbone'],
                exports: 'backboneLocalstorage'
            },

            fancytree :  {
                 deps:['jquery','jquery_ui']
            },
            autocompTree : {
                 deps:['fancytree']
            }

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

            templates: '../../templates',
            text: '../tools/text',
            views: '../views',

            /*===============================
            =            Modules            =
            ===============================*/
            
            grid: '../../grid',
            filter: '../../filter',
            stepper: '../../stepper',
            step: '../../stepper/lyt-step',


            /*=============================
            =            Bower            =
            =============================*/
            underscore: bower+'underscore/underscore',
            backbone: bower+'backbone/backbone',
            marionette: bower+'marionette/lib/backbone.marionette.min',
            radio: bower+'backbone.radio/build/backbone.radio',
            backgrid: bower+'backgrid/lib/backgrid',
            chart: bower+'/chartjs/Chart',
            bootstrap: bower+'bootstrap/dist/js/bootstrap.min',
            dropzone: bower+'dropzone/downloads/dropzone-amd-module',
            fuelux : bower+'fuelux/dist/js/fuelux',
            bootstrap_slider: bower+'seiyria-bootstrap-slider/js/bootstrap-slider',  
            sweetAlert: bower+'sweetalert/lib/sweet-alert.min',
            dateTimePicker: bower+'eonasdan-bootstrap-datetimepicker/src/js/bootstrap-datetimepicker',
            moment: bower+'moment/min/moment.min',
            //jquery: bower+'jquery-1.11.0/dist/jquery',
            //jquery_ui: bower+'jquery-ui/jquery-ui.min',




            /*============================
            =            Libs            =
            ============================*/
            
            //underscore: 'underscore/underscore-1.6.0',
            bbForms : 'backbone.forms/backbone-forms',
            'backgrid.paginator': 'backgrid.paginator/backgrid.paginator',
            'backbone.paginator': 'backbone.paginator/2.0.2/backbone.paginator',
            backgridSelect_all:'../../bower_components/backgrid-select-all/backgrid-select-all',

            backboneLocalstorage : 'backbone.localstorage/backbone.localStorage-min',
            openlayers: 'openlayers/openlayers',
            ol3: 'openlayers/3.0.0/build/ol-debug',
            sha1: 'sha1/sha1',
            localforage: 'localforage/localforage-0.9.2',
            jquery: 'jquery/jquery-1.11.1',
            jquery_ui: 'jquery-ui/1.11.1/jquery-ui',

            localforagebackbone: 'localforage.backbone/0.4.0/localforage.backbone',
            nicescroll:'nicescroll/jquery.nicescroll',


            /*===============================
            =            NS Libs            =
            ===============================*/

            fancytree : 'NS.UI.autocompTree/Scripts/jquery.fancytree-all',
            autocompTree : 'NS.UI.autocompTree/Scripts/jquery.autocompTree'
        }

    });

    require(['app'], function(app){
        app.start();
        ecoReleveData = app;
    });
})();
