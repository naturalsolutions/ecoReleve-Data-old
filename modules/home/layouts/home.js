define([
    'marionette',
    'radio',
    'modules2/home/views/graph',
    'modules2/home/views/info',
    'text!modules2/home/templates/home.html',
], function(Marionette, Radio, GraphView, InfoView, template) {
    'use strict';
    return Marionette.LayoutView.extend( {
        className:'container full-height',
        template: template,
        regions: {
            graph: '#graph',
            info: '#info',
            tiles: '#tiles'
        },
        events: {
            //'click #argosTile': 'automatic_import',
            'click #gsmTile': 'gsm',
            'click #indivTile': 'individual',
            //'click #stationsTile': 'stations',
            'click #transmitterTile': 'transmitter',
            'click #monitoredSiteTile' : 'monitoredSite',
            'click #manualTile' : 'dataEntry',
            'click #importTile' : 'import',
            'click #myDataTile' : 'export',
            'click #rfidTile': 'site',
            "click #validate": 'validate',
        },
        initialize: function(){
            this.radio = Radio.channel('route');
        },

        onShow: function() {
            this.info.show(new InfoView());
            this.graph.show(new GraphView());
             $('.credits').show();
        },

        onRender: function(){
            $('body').addClass('home-page');
            //trololo
            // var delay=50;
            // this.$el.find('.tile').each( function(index){
            //     $(this).fadeIn(400+delay);
            //     delay+=50;
            // });
        },

        onDestroy: function() {
            $('body').removeClass('home-page');
        },

        automatic_import: function() {
            this.radio.trigger('automatic_import');
        },
        
        stations: function(){
            this.radio.command('stations');
        },

        gsm: function() {
            this.radio.command('gsm');
        },

        individual: function() {
            this.radio.command('individual');
        },

        monitoredSite: function() {
            this.radio.trigger('monitoredSite');
        },

        transmitter: function() {
            this.radio.trigger('transmitter');
        },
        import: function() {
            this.radio.trigger('import');
        },
        dataEntry : function() {
            this.radio.trigger('input');
        },

        export: function(){
            this.radio.command('export');
        },

        site: function(){
            this.radio.command('site');
        },

        validate: function(){
            this.radio.command('validate');
        },

    });
});
