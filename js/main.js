(function(){
    "use strict";

    require.config({
        baseUrl: 'js/lib',
        paths: {
            app: '../app',
            collections: '../collections',
            config: '../config',
            router: '../router',
            templates: '../../templates',
            text: '../tools/text',
            views: '../views',
            jquery: 'jquery/jquery-1.11.1',
            underscore: 'underscore/underscore-1.6.0',
            backbone: 'backbone/backbone-1.1.2'
        }
    });

    require(['app'], function(app){
        app.init();
    });
})();
