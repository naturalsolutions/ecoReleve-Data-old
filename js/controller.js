define([
    'backbone',
    'config',
    'event_manager',
    'marionette',
    'radio',
    'views/login',
    'modules/argos/argos-layout',
    'modules/argos/argos-detail',
    'layouts/home',
    'modules/individual/individual-layout',
    'modules/individual/layouts/individual-detail',
    'modules/rfid/rfid-layout',
    'layouts/header',
], function(Backbone, config, eventManager, Marionette, Radio, LoginView, ArgosLayout,
    ArgosDetailLayout, HomeLayout, IndivLayout, IndivDetailLayout, RfidLayout, HeaderLayout) {

    'use strict';

    return Marionette.Controller.extend( {
        initialize: function(options) {
            var radio = Radio.channel('route');
            this.mainRegion = options.mainRegion;
            this.headerRegion = options.headerRegion;
            this.listenTo(radio, 'logout', this.logout);
            this.listenTo(radio, 'login', this.login);
            this.listenTo(radio, 'login:success', this.login);
            this.listenTo(radio, 'argos', this.argos);
            this.listenTo(radio, 'indiv', this.individual);
            this.listenTo(radio, 'indiv:detail', this.individualDetail);
            this.listenTo(radio, 'show:monitoredSite',
                this.monitoredSite);
            this.listenTo(radio, 'rfid', this.rfid);
            this.listenTo(eventManager, 'show:argos:detail', this.argos_detail);
        },

        argos: function() {
            var argosLayout = new ArgosLayout();
            this.mainRegion.show(argosLayout);
            Backbone.history.navigate('argos');
        },

        argos_detail: function(obj) {
            if (obj) {
                var argosDetailLayout = new ArgosDetailLayout(obj);
                this.mainRegion.show(argosDetailLayout);
                Backbone.history.navigate('argos_detail');
            }
            else {
                this.login('argos');
            }
        },

        home: function() {
            var homeLayout = new HomeLayout();
            this.mainRegion.show(homeLayout);
            Backbone.history.navigate('');
        },

        individual: function() {
            var layout = new IndivLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate('individual');
        },

        individualDetail: function(args) {
            var layout = new IndivDetailLayout({indiv:args.id});
            this.mainRegion.show(layout);
            Backbone.history.navigate('individual/' + args.id);
        },

        monitoredSite: function() {
            var layout = new MonitoredSiteLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate('monitored_site');
        },

        insertHeader: function() {
            if(!this.headerRegion.hasView()) {
                this.headerRegion.show(new HeaderLayout());
            }
        },

        login: function(route) {
            $.ajax({
                context: this,
                url: config.coreUrl + 'security/has_access'
            }).done( function() {
                this.insertHeader();
                if(typeof this[route] === 'function') {
                    this[route]();
                }
                else {
                    this.home();
                }
            }).fail( function() {
                Backbone.history.navigate('login');
                this.headerRegion.empty();
                this.mainRegion.show(new LoginView());
            });
        },

        logout: function() {
            $.ajax({
                context: this,
                url: config.coreUrl + 'security/logout'
            }).done( function() {
                this.login();
            });
        },

        rfid: function() {
            var layout = new RfidLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate('rfid');
        }
    });
});
