define([
    'backbone',
    'config',
    'marionette',
    'radio',
    'modules2/header/layouts/header',
    'modules2/login/views/login',
    'modules2/home/layouts/home',
    'modules/argos/argos-layout',
    'modules/argos/argos-detail',
    'modules2/individual/layouts/individual-list',
    'modules2/individual/layouts/individual-detail',
    'modules2/rfid/layouts/rfid-layout',
    'modules2/gsm/layouts/gsm-detail',
    'modules2/gsm/layouts/gsm-list',
    'modules2/transmitter/layouts/transmitter-list',
	'modules2/import/layouts/import-layout',
    'modules2/input/layouts/input-station'
    //'modules/transmitter/layouts/transmitter-list'

], function(Backbone, config, Marionette, Radio, HeaderLayout, LoginView, HomeLayout, ArgosLayout,
    ArgosDetailLayout, IndivLayout, IndivDetailLayout, RfidLayout,
    GSMDetailLayout, GSMListLayout, TransmitterLayout, ImportLayout, InputLayout) {

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
            radio.on('show:argos:detail', this.argos_detail);
            radio.on('transmitter', this.transmitter, this);
            radio.comply('gsm', this.gsm, this);
            radio.comply('individual', this.individual, this);
            this.listenTo(radio, 'indiv:detail', this.individualDetail);
            this.listenTo(radio, 'show:monitoredSite',
                this.monitoredSite);
            this.listenTo(radio, 'rfid', this.rfid);

			this.listenTo(radio, 'import', this.importGpx);
            this.listenTo(radio, 'input', this.inputData);
            this.listenTo(radio, 'home', this.home);


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

        gsm: function(page) {
            if (Number(page)) {
                var layout = new GSMDetailLayout({gsmID:page});
                this.mainRegion.show(layout);
                Backbone.history.navigate('gsm/' + page);
            }
            else {
                var layout = new GSMListLayout();
                this.mainRegion.show(layout);
                Backbone.history.navigate('gsm');
            }
        },

        home: function() {
            var homeLayout = new HomeLayout();
            this.mainRegion.show(homeLayout);
            Backbone.history.navigate('');
        },

        individual: function(page) {
            if(Number(page)){
                this.individualDetail({id:page});
            }
            else{
                var layout = new IndivLayout();
                this.mainRegion.show(layout);
                Backbone.history.navigate('individual');
            }
        },

        individualDetail: function(args) {
            var layout = new IndivDetailLayout({indiv:args.id});
            this.mainRegion.show(layout);
            Backbone.history.navigate('individual/' + args.id);
        },

        importGpx: function() {
            var layout = new ImportLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate('import');
        },
        inputData : function() {
            var layout = new InputLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate('input');
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

        login: function(route, page) {
            $.ajax({
                context: this,
                url: config.coreUrl + 'security/has_access'
            }).done( function() {
                this.insertHeader();
                if(typeof this[route] === 'function') {
                    page ? this[route](page) : this[route]();
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
        },

        transmitter: function() {
            var layout = new TransmitterLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate('transmitter');
        }
    });
});
