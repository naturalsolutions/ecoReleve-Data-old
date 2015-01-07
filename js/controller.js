var module = 'modules2';
define([
    'backbone',
    'config',
    'marionette',
    'radio',
    ''+module+'/header/layouts/header',
    ''+module+'/login/views/login',
    ''+module+'/home/layouts/home',
    'modules/argos/argos-layout',
    'modules/argos/argos-detail',
    ''+module+'/individual/layouts/individual-list',
    ''+module+'/individual/layouts/individual-detail',
    ''+module+'/rfid/layouts/rfid-layout',

    ''+module+'/gsm/layouts/gsm-list',
    ''+module+'/transmitter/layouts/transmitter-list',
	''+module+'/import/layouts/lyt-import-gpx',
    ''+module+'/input/layouts/lyt-input',
    ''+module+'/export/layouts/export-layout',
    

    ''+module+'/stations/layouts/basemap',
    ''+module+'/rfidN/layouts/rfid-layout',


    ''+module+'/import/_rfid/layouts/rfid-import',



    ''+module+'/validate/layouts/validate-layout',
    ''+module+'/validate/layouts/validateType-layout',
    ''+module+'/validate/gsm/layouts/gsm-detail',


    /*
    'stepper/lyt-demo',
    'grid/lyt-demo',
    'filter/lyt-demo',
    */

    //'modules/transmitter/layouts/transmitter-list'

], function(Backbone, config, Marionette, Radio, HeaderLayout, LoginView, HomeLayout, ArgosLayout,
    ArgosDetailLayout, IndivLayout, IndivDetailLayout, Rfid_Layout,
    GSMListLayout, TransmitterLayout, ImportLayout, InputLayout, ExportLayout, Stations, Rfid_N_Layout,


    Import_RFID_lyt,
    ValidateLayout, ValidateLayoutType, ValidateGSMDetailLayout
    /*DemoStepper, DemoGrid, Demofilter*/) {

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
            radio.comply('individual', this.individual, this);
            this.listenTo(radio, 'indiv:detail', this.individualDetail);
            this.listenTo(radio, 'show:monitoredSite',
                this.monitoredSite);
            radio.comply('rfid', this.rfid, this);
            radio.comply('stations', this.stations, this);
            this.listenTo(radio, 'input', this.inputData);

            /*==========  Home  ==========*/
            
            this.listenTo(radio, 'home', this.home);

            /*==========  files imports  ==========*/
            
			this.listenTo(radio, 'import', this.import);
            radio.comply('import:rfid', this.import_rfid, this);            
            radio.comply('import:gsm', this.import_gsm, this);

            /*==========  Export  ==========*/
            
            radio.comply('export', this.export, this);

            /*==========  RFID N (Visu)  ==========*/
            
            radio.comply('rfidN', this.rfidN, this);
            radio.comply('rfidN:add', this.rfidN_add, this);
            radio.comply('rfidN:deploy', this.rfidN_deploy, this);

            /*==========  validate  ==========*/
            
            radio.comply('validate', this.validate, this);
            radio.comply('validate:type', this.validate_type, this);
            radio.comply('validate_type_id', this.validate_type_id, this);
            this.radio = radio ;

        },

        stations: function(){
            var stations = new Stations();
            this.mainRegion.show(stations);
            Backbone.history.navigate('map');
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



        rfid: function() {
            var layout = new RfidLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate('rfid');
        },

        transmitter: function() {
            var layout = new TransmitterLayout();
            this.mainRegion.show(layout);
            Backbone.history.navigate('transmitter');
        },



        /*=======================================
        =            Routes & Radios            =
        =======================================*/
        

        /*==========  Login / Logout  ==========*/
        

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

        /*==========  Check Login / Rights  ==========*/
        

        checkLogin: function(callback, ctx, args){
            var ajax=$.ajax({
                context: this,
                url: config.coreUrl + 'security/has_access'
            }).done( function() {
                this.insertHeader();
                callback.apply(ctx, args);
            }).fail( function() {
                Backbone.history.navigate('login');
                this.headerRegion.empty();
                this.mainRegion.show(new LoginView());
            });
        },

        checkRights: function(){

        },

        /*==========  Home  ==========*/

        home: function() {
            var route = '';
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                this.mainRegion.show(new HomeLayout());
            }, this);
        },
        

        /*==========  Validate  ==========*/
        
        validate: function(){
            var route = 'validate/';
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                this.mainRegion.show(new ValidateLayout());
            }, this);
        },
        validate_type: function(type){
            var route = 'validate/'+type;
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                this.mainRegion.show(new ValidateLayoutType({type : type}));
            }, this);
        },
        validate_type_id: function(options){
            var route = 'validate/'+ options.type +'/'+ options.id;
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                this.mainRegion.show(new ValidateGSMDetailLayout({
                    type : options.type,
                    gsmID : options.id,
                    NbObs:options.NbObs
                }));
            }, this);  
        },


        /*==========  Exports  ==========*/

        export: function(){
            var route = 'export/';
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                this.mainRegion.show(new ExportLayout());
            }, this); 
        },

        /*==========  Filtes Imports  ==========*/
        
        import: function() {
            var route = 'import/';
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                this.mainRegion.show(new ImportLayout());
            }, this); 
        },

        import_gsm: function() {
            var type = 'gsm';
            var route = 'import/' + type;
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                this.mainRegion.show(new GSMListLayout({
                    type : type
                }));
            }, this); 
        },

        import_rfid: function() {
            var type = 'rfid';
            var route = 'import/' + type;
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                this.mainRegion.show(new Import_RFID_lyt({
                    type : type
                }));
            }, this); 
        },


        /*==========  RFID N (Visu)  ==========*/
        
        rfidN: function(){
            var route = 'rfidN/'
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                this.mainRegion.show(new Rfid_N_Layout());
            }, this); 
        },

        rfidN_add: function(){
            var route = 'rfidN/add/';
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                var lyt = new Rfid_Layout()
                this.mainRegion.show(lyt);
                lyt.showAdd();
            }, this);
        },

        rfidN_deploy: function(){
            var route = 'rfidN/deploy/';
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                var lyt = new Rfid_Layout()
                this.mainRegion.show(lyt);
                lyt.showDeploy();
            }, this);
        },

        
        /*==========  Demo  ==========*/
        
        //stepper
        demo_stepper: function(){
            var route = 'demo_stepper/';
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                var lyt = new DemoStepper()
                this.mainRegion.show(lyt);
            }, this);
        },        


        //grid
        demo_grid: function(){
            var route = 'demo_grid/';
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                var lyt = new DemoGrid()
                this.mainRegion.show(lyt);
            }, this);
        },  


        //filter
        demo_filter: function(){
            var route = 'demo_filter/';
            this.checkLogin(function() {
                Backbone.history.navigate(route);
                var lyt = new Demofilter()
                this.mainRegion.show(lyt);
            }, this);
        },        







    });
});
