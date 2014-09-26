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
            'click #indivTile': 'indiv',
            'click #rfidTile': 'rfid',
            'click #transmitterTile': 'transmitter',
            'click #monitoredSiteTile' : 'monitoredSite'
        },

        onShow: function() {
            this.info.show(new InfoView());
            this.graph.show(new GraphView());
        },

        onRender: function(){
            $.vegas ({
                src: 'images/home_fond.jpg'
            });
        },

        onDestroy: function() {
            $('.vegas-background').hide();
        },

        argos: function() {
            Radio.channel('route').trigger('argos');
        },

        gsm: function() {
            Radio.channel('route').command('gsm');
        },

        indiv: function() {
            Radio.channel('route').trigger('indiv');
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
