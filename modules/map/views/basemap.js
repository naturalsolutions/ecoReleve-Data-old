define([
    'jquery',
	'underscore',
    'backbone',
    'marionette',
    'ol3',
    'radio',
    'config',
    'text!modules2/map/templates/map.html'
], function($, _, Backbone, Marionette, ol, Radio, config, template) {
    'use strict';
    return Marionette.ItemView.extend({
        template: template,
        events: {
            'change #layerswitcher input[name=layer]': 'switchLayer',
            'click #layerswitcherBtn' : 'showLayerSwitcher'
        },
        onShow: function() {
            var mapDefault = config.mapDefault;
            var layers = [];
           
            layers[0] = new ol.layer.Group({ layers: [ new ol.layer.Tile({ source: new ol.source.MapQuest({layer: 'sat'}) }), new ol.layer.Tile({ source: new ol.source.MapQuest({layer: 'hyb'}) }) ] });
            layers[1] = new ol.layer.Tile({ source: new ol.source.MapQuest({layer: 'sat'}) });
            layers[2] = new ol.layer.Tile({ source: new ol.source.MapQuest({layer: 'osm'}) });
            /*layers[3] = new ol.layer.Tile({ source: new ol.source.OSM() });*/
            this.map = new ol.Map({
                target: 'map',

                controls: ol.control.defaults().extend([ new ol.control.ScaleLine({ units:'metric' }) ]),
                layers: layers,

                view: new ol.View({
                    center: ol.proj.transform([-4.01,33.06], 'EPSG:4326', 'EPSG:3857'),
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

                  element: $('<i class="large glyphicon glyphicon-map-marker"></img>').css({'font-size':'25px', 'left':'-12px', 'top':'-25px'})

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
                // test if the name is correct (integer value), if not, use PK name
                var test = Number(id);
                if (!test){
                    id = model.get('PK');
                }
                var latitude = model.get('latitude');
                if(!latitude){
                    latitude = model.get('LAT');
                }
                var longitude = model.get('longitude');
                if(!longitude){
                    longitude = model.get('LON');
                }
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
        },
        switchLayer : function(){
            var checkedLayer = parseInt($('#layerswitcher input[name=layer]:checked').val());
            var layers =  this.map.getLayers().getArray();
            for (var i = 0, ii = layers.length; i < ii; ++i){
             layers[i].setVisible(i==checkedLayer);
            }
        },
        showLayerSwitcher : function(){
            if($('#toolbox').hasClass( "masqued" )){
                $('#toolbox').removeClass('masqued');
                $('#layerswitcherBtn span').text(' >> ');
            }
            else {
                 $('#toolbox').addClass('masqued');
                 $('#layerswitcherBtn span').text(' << ');
            }
        }

    });
});
