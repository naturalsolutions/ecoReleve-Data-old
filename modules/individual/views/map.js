define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'models/point',
    'utils/datalist',
    'utils/map',
    'config',
    'text!modules2/individual/templates/tpl-map.html',
    'ns_modules_map/ns_map',

], function($, _, Backbone, Marionette, Moment, Radio, Point, datalist, map, config, tpl, NsMap) {

    'use strict';



    return Marionette.ItemView.extend({
        template: tpl,
        className: 'full-height',

        events: {
            'resize window' : 'updateSize',
            'click #showIndivDetails': 'showDetail'
        },

        initialize: function(options) {
            this.radio = Radio.channel('individual');
            this.indivId = options.indivId;
            $('#main-panel').css('padding', '0');
            $(window).on('resize', $.proxy(this, 'updateSize'));



        },

        showDetail: function() {
            this.radio.trigger('show-detail');
        },

        onDestroy: function() {
            $('#main-panel').removeClass('no-padding');
            $(window).off('resize', $.proxy(this, 'updateSize'));
        },

        updateSize: function() {
            if(this.map_view) {

                var height = $("#detail-panel").height();
                this.$el.find("#map").height(height);
                this.map_view.updateSize();
            }
        },

        initMap: function(geoJson){
            this.map = new NsMap({
                cluster: true,
                geoJson: geoJson,
                zoom: 3,
                element: 'map',
            });
            this.map.init();
        },

        onShow: function() {
            $.ajax({
                url: config.coreUrl + '/individuals/stations?id=' +this.indivId,
                context: this,
            }).done(function( data ) {
                console.log(data);
                this.initMap(data);
            }).fail(function( msg ) {
                console.log(msg);
            });
        },
    });
});