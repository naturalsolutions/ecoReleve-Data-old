define([
    'marionette',
    'radio',
    'vegas',
    'views/graph',
    'views/info',
    'text!templates/home_new.html'
], function(Marionette, Radio, vegas, GraphView, InfoView, template) {
    'use strict';
    return Marionette.LayoutView.extend( {
        className:'container',
        template: template,
        regions: {
            graph: '#graph',
            info: '#info',
            tiles: '#tiles'
        },

        events: {
            'click #argosTile': 'argos',
            'click #gsmTile': 'gsm',
            'click #indivTile': 'individual',
            'click #rfidTile': 'rfid',
            'click #monitoredSiteTile' : 'monitoredSite',
			'click #importTile' : 'import',
            'click #transmitterTile': 'transmitter',
            'click #inputTile' : 'dataEntry'
        },

        onShow: function() {
            this.info.show(new InfoView());
            this.graph.show(new GraphView());
        },

        onRender: function(){
            $('body').addClass('home-page');
/*            $.vegas ({
                src: 'images/home_fond.jpg'
            });*/
        },

        onDestroy: function() {
            $('body').removeClass('home-page');
        },

        argos: function() {
            Radio.channel('route').trigger('argos');
        },

        gsm: function() {
            Radio.channel('route').command('gsm');
        },

		import: function() {
            Radio.channel('route').trigger('import');
        },

        dataEntry : function() {
            Radio.channel('route').trigger('input');
        },

        individual: function() {
            Radio.channel('route').command('individual');
        },

        monitoredSite: function() {
            Radio.channel('route').trigger('monitoredSite');
        },

        rfid: function() {
            Radio.channel('route').trigger('rfid');
        },

        transmitter: function() {
            Radio.channel('route').trigger('transmitter');
        }
    });
});
