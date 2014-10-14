define([
    'marionette',
    'radio',
    'modules2/home/views/graph',
    'modules2/home/views/info',
    'text!modules2/home/templates/home.html'
], function(Marionette, Radio, GraphView, InfoView, template) {
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
            'click #transmitterTile': 'transmitter',
            'click #monitoredSiteTile' : 'monitoredSite'
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
