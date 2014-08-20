var ecoReleveData = (function(){
    "use strict";

    require.config({
        baseUrl: 'js/lib',
        config: {
            moment: {
                noGlobal: true
            }
        },
        paths: {
            app: '../app',
            chart: 'chart/1.0.1-beta4/Chart',
            collections: '../collections',
            config: '../config',
            models: '../models',
            router: '../router',
            templates: '../../templates',
            text: '../tools/text',
            views: '../views',
            localforage: 'localforage/localforage-0.9.2',
            jquery: 'jquery/jquery-1.11.1',
            moment: 'moment/moment-2.8.1',
            underscore: 'underscore/underscore-1.6.0',
            backbone: 'backbone/backbone-1.1.2',
            localforage_backbone: 'localforage-backbone/localforage.backbone-0.4.0',
        }
    });

    require(['app'], function(app){
        app.init();
        ecoReleveData = app;
    });
})();
