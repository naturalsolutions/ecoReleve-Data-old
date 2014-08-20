define([
    'jquery',
    'underscore',
    'backbone',
    'collections/users',
    'config',
    'router',
    'views/breadcrumbs',
    'views/navigation',
    'views/current_user'
], function($, _, Backbone, Users, config, router, Breadcrumbs, Navigation, CurrentUser){
    'use strict';
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
        router: router,
        instances: {},

        init: function(){
            // Customize Underscore templates behaviour: 'with' statement is prohibited in JS strict mode
            //_.templateSettings.variable = 'data';
            this.instances.breadCrumbs = new Breadcrumbs({model: router});
            this.instances.mainNav = new Navigation({model: router});


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
            // get fieldActivity
            this.collections.users.fetch().then(function () {
                if (this.collections.users.length === 0){
                    this.utils.getUsersListForStrorage("/user/fieldworkers");
                }
            });
            // get field activity list
            this.collections.fieldActivityList = new this.collections.FieldActivities();
            this.collections.fieldActivityList.fetch().then(function () {
                if (this.collections.fieldActivityList.length === 0){
                    this.utils.getFieldActivityListForStrorage("/theme/list");
                }
            });
            // get station list
            this.collections.stations = new this.collections.Stations();
            this.collections.stations.fetch().then(function() {
                console.log("stations loaded ! ");
            });
            // load stored protocols
            this.collections.protocolsList = new this.collections.Protocols();
            this.collections.protocolsList.fetch().then(function(){
                //if (this.collections.protocolsList.length === 0){
                this.collections.protocolsList.reset();
                this.utils.loadProtocols("config/XML_ProtocolDef_eReleve.xml");
                //}
            });
            // load observations
            this.collections.observations = new this.collections.Observations();
            this.collections.observations.fetch().then(function() {
                console.log("observations loaded ! ");
                // number of stored observations
                var ln = this.collections.observations.length;
                $("#homeNbObs").text(ln);
            });
            // load obs collection for mydata grid
            this.collections.obsListForMyData = new this.collections.StationsProtocols();
            this.collections.obsListForMyData.fetch().then(function() {
                console.log("obs loaded !");
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
    return app;
});
