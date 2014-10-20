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
                        source: new ol.source.MapQuest({layer: 'sat'})
                    })
                ],
                view: new ol.View({
                    center: ol.proj.transform([-4.01,33.06], 'EPSG:4326', 'EPSG:3857'),
                    maxZoom: 10,
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

        addOverlay: function(coord) {
            if (this.overlay) {
                this.map.removeOverlay( this.overlay);}

            this.overlay=new ol.Overlay ({
                  position: ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'),
                  element: $('<i class="large glyphicon glyphicon-map-marker"></img>').css({'font-size':'25px'})
              });
            this.map.addOverlay(this.overlay);
        },

        moveCenter: function(newCenter) {
            
           // this.addOverlay(newCenter);
           console.log(newCenter);
            this.map.getView().setCenter(ol.proj.transform(newCenter, 'EPSG:4326', 'EPSG:3857'));
        },
        addCollection : function(collection){
            var features=[];
            var self = this;
            collection.each(function(model) {
                var feature = self.getFeature(model);
                features.push(feature);
            }); 
            this.addLayer(features);
        },
        getFeature: function(model){
                var id = model.get('id');
                var latitude = model.get('latitude');
                var longitude = model.get('longitude');
                var label = model.get('name');
                var feature = new ol.Feature({
                  geometry: new ol.geom.Point(ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857')),
                  label: label
                });
                feature.setId(id);
                return(feature);
        },
        addModel : function(model){
            var feature = this.getFeature(model);
            var features=[];
            features[0] = feature;
            this.addLayer(features);
        },
        addLayer: function(features){
            var vectorSource = new ol.source.Vector({
              features: features
            });
            var vectorLayer = new ol.layer.Vector({
              source: vectorSource
            });
            this.map.addLayer(vectorLayer);
            var extent = vectorSource.getExtent();
            this.map.getView().fitExtent(extent, this.map.getSize());
        }
    });
});
