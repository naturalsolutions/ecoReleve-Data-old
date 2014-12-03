define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'ol3',

], function($, _, Backbone , Marionette, config, Radio,
    ol
    ) {

    'use strict';

    return Marionette.ItemView.extend({
        events: {

        },
        initialize: function(args) {
        	this.radio = Radio.channel('rfidN');
            this.geoJson, this.vectorLayer;
            this.getGeoJson();
        },

        getGeoJson: function(){
            //tmp
            var url = config.coreUrl + "/rfid/search_geoJSON";



            $.ajax({
                url: url,
                contentType:'application/json',
                type:'POST',
                data : JSON.stringify({criteria : ''}),
                context: this,
            }).done(function(data){
                this.geoJson= data;
                this.initMap();
            }).fail(function(msg){
                console.log(msg);
            });
        },

        initMap: function(){
            var sourceT = new ol.source.GeoJSON({
                projection: 'EPSG:3857',
                object: this.geoJson
            });

            this.vectorLayer = new ol.layer.Vector({
                source: sourceT
            });

            this.map = new ol.Map({
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    }),
                    this.vectorLayer
                ],
                target: 'map',
                controls: ol.control.defaults({
                    attributionOptions:({
                        collapsible: false
                    })
                }),
                view: new ol.View({
                    center: this.vectorLayer.getSource().getFeatures()[0].getGeometry().getCoordinates(),
                    zoom: 5
                }),
            });
        },

        update: function(filters){
            var url = config.coreUrl + "/rfid/search_geoJSON";
            $.ajax({
                url: url,
                contentType:'application/json',
                type:'POST',
                data : JSON.stringify({criteria : filters}),
                context: this,
            }).done(function(data){
                this.updateMap(data);

            }).fail(function(msg){
                console.log(msg);
            });
        },

        updateMap: function(data){
          this.map.removeLayer(this.vectorLayer);
          
          var sourceT = new ol.source.GeoJSON({
            projection: 'EPSG:3857',
            object: data
          });
          
          
          this.vectorLayer = new ol.layer.Vector({
            source: sourceT
          });
          this.map.addLayer(this.vectorLayer);
          this.features= this.vectorLayer.getSource().getFeatures();
        },

    });
});
