define([
    'jquery',
    'marionette',
    'ol3',
    'radio',
    'config',
    'text!modules2/map/templates/map.html'
], function($, Marionette, ol, Radio, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

        onShow: function() {
            var mapDefault = config.mapDefault;
            this.map = new ol.Map({
                target: 'map',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.MapQuest({layer: 'osm'})
                    })
                ],
                view: new ol.View({
                    center: ol.proj.transform(mapDefault.center, 'EPSG:4326', 'EPSG:3857'),
                    maxZoom: 16,
                    zoom: mapDefault.zoom
                })
            });
        },

        loadGeoJSON: function(url) {
            var source = new ol.source.GeoJSON({
                projection: 'EPSG:3857',
                url: url
            });
            source.on('change', function() {
                var extent = source.getExtent();
                this.map.getView().fitExtent(extent, this.map.getSize());
            }, this);
            var layer = new ol.layer.Vector({
                source: source
            });
            this.map.addLayer(layer);
        },

        moveCenter: function(newCenter) {
            this.map.getView().setCenter(ol.proj.transform(newCenter, 'EPSG:4326', 'EPSG:3857'));
        }
    });
});
