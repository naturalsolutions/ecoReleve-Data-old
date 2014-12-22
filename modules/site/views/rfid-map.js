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
        initialize: function(options) {
            this.channel='modules';
        	this.radio = Radio.channel(this.channel);
            this.radio.comply(this.channel+':map:update', this.update, this);            

            this.initGeoJson();
        },

        initGeoJson: function(){

            var url = config.coreUrl+'/monitoredSite/search_geoJSON';

            $.ajax({
                url: url,
                contentType:'application/json',
                type:'GET',
                context: this,
                data: {
                    page: 1,
                    per_page: 20,
                    criteria: null,
                    offset: 0,
                    order_by: '[]',
                },
            }).done(function(datas){
                this.geoJson= datas;
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

        update: function(args){
            var url = config.coreUrl + '/monitoredSite/search_geoJSON';
            $.ajax({
                url: url,
                contentType:'application/json',
                type:'GET',
                context: this,
                data: args.params,
            }).done(function(datas){
                this.updateMap(datas);
            }).fail(function(msg){
                console.log(msg);
            });
        },

        updateMap: function(datas){
          this.map.removeLayer(this.vectorLayer);
          
          var sourceT = new ol.source.GeoJSON({
            projection: 'EPSG:3857',
            object: datas
          });
          
          
          this.vectorLayer = new ol.layer.Vector({
            source: sourceT
          });
          this.map.addLayer(this.vectorLayer);
          this.features= this.vectorLayer.getSource().getFeatures();
        },

    });
});
