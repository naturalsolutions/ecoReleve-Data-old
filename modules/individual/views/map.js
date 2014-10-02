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
    'text!templates/map.html'
], function($, _, Backbone, Marionette, Moment, Radio, Point, datalist, map, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

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
            this.map_view.remove();
        },

        updateSize: function() {
            if(this.map_view) {
                var height = $(window).height() - $('#header-region').height();
                this.$el.find("#map").height(height);
                this.map_view.updateSize();
            }
        },

        onShow: function() {
            var mapUrl = config.coreUrl + '/individuals/stations?id=' +this.indivId ;
            var point = new Point({
                    latitude: 34,
                    longitude: 44,
                    label: ''
            });
            var mapView = map.init('bird', this.$el.find('#map'), point, 3);
            this.map_view = mapView;
            var url = config.coreUrl + 'individuals/stations?id=' + this.indivId;
            this.map_view.loadGeoJSON(url, 'Positions', 'individual');
            /*app.utils.timlineLayer(mapUrl, mapView, function(nbFeatures) {
                if (nbFeatures > 10){
                app.utils.animatedLayer(nbFeatures, mapUrl, mapView);
                } else {
                    $('#animationDiv').addClass('masqued');
                    $('#map').css('height',windowHeigth-50);
                }
            });
            $('#dateSlider').slider().on('slideStop', function() {
                    // get range of date and update layer
                    var interval = $('#dateSlider').data('slider').getValue();
                    _this.updateTimeLineLayer(interval);
            });
            // update the size of animation div (map legend) by modifying span values
            this.updateAnimationDivWidth(windowWidth);
            */
        },
    });
});
