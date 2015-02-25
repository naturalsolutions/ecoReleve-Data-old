var ecoReleveData = (function(){
    'use strict';

    var bower = '../../bower_components/';
    var ns_modules = '../../ns_modules/'; //dev versions
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
            /*
            ol3: {
                exports: 'ol'
            },
            openlayers: {
                exports: 'OpenLayers'
            },*/


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
            },
            swiper : {
                deps:['jquery']
            },
            leaflet_cluster : {
                deps:['L'],
            },
            leaflet_google : {
                deps:['L'],
            },
            backgridSelect_all : {
                deps:['backgrid']
            },
            simplePagination : {
                deps:['jquery']
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
            stepper: '../../Stepper',
            step: '../../stepper/lyt-step',

            ns_modules_com: ns_modules+'ns_com',
            ns_modules_map: ns_modules+'ns_map',

            ns_modules_grid: ns_modules+'ns_grid',


            /*
            ns_modules_filter: ns_modules+'ns_filter',
            ns_modules_stepper: ns_modules+'Stepper',
            */

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
            jquery_ui: bower+'jquery-ui/jquery-ui.min',


            L: bower+'leaflet/dist/leaflet',
            leaflet_cluster: bower+'leaflet.markercluster/dist/leaflet.markercluster',
            leaflet_google: bower+'leaflet-plugins/layer/tile/Google',




            /*============================
            =            Libs            =
            ============================*/
            
            //underscore: 'underscore/underscore-1.6.0',
            bbForms : 'backbone.forms/backbone-forms',
            'backgrid.paginator': 'backgrid.paginator/backgrid.paginator',
            'backbone.paginator': 'backbone.paginator/2.0.2/backbone.paginator',
            backgridSelect_all:'../../bower_components/backgrid-select-all/backgrid-select-all',

            backboneLocalstorage : 'backbone.localstorage/backbone.localStorage-min',
            //openlayers: 'openlayers/openlayers',
            //ol3: 'openlayers/3.0.0/build/ol-debug',
            sha1: 'sha1/sha1',
            localforage: 'localforage/localforage-0.9.2',
            jquery: 'jquery/jquery-1.11.1',
            //jquery_ui: 'jquery-ui/1.11.1/jquery-ui',

            localforagebackbone: 'localforage.backbone/0.4.0/localforage.backbone',
            nicescroll:'nicescroll/jquery.nicescroll',
            simplePagination : 'simplePagination/jquery.simplePagination',

            /*===============================
            =            NS Libs            =
            ===============================*/

            fancytree : 'NS.UI.autocompTree/Scripts/jquery.fancytree-all',
            autocompTree : 'NS.UI.autocompTree/Scripts/jquery.autocompTree',
            swiper : 'idangerous.swiper/idangerous.swiper'
        }

    });

    require(['app'], function(app){
        app.start();
        ecoReleveData = app;
    });
})();
