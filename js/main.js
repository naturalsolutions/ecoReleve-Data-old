(function(){
    "use strict";

    require.config({
        baseUrl: 'js/lib',
        paths: {
            app: '../app',
            config: '../config',
            router: '../router',
            templates: '../../templates',
            text: '../text',
            views: '../views',
            jquery: 'jquery/jquery-1.11.1',
            underscore: 'underscore/underscore-1.6.0',
            backbone: 'backbone/backbone'
        }
    });

    require(['app'], function(app){
        console.log('Initialize app');
        app.init();
    });
})();
