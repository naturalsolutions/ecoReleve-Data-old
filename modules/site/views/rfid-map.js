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

            var gmap = new google.maps.Map(document.getElementById('map'), {
              mapTypeControl: true,
              panControl: false,
              disableDefaultUI: true,
              keyboardShortcuts: false,
              draggable: true,
              disableDoubleClickZoom: true,
              scrollwheel: true,
              streetViewControl: false,
              scaleControl: true,
              mapTypeId: google.maps.MapTypeId.HYBRID,
               
            });
            var center=this.vectorLayer.getSource().getFeatures()[0].getGeometry().getCoordinates();


            var view = new ol.View({
                    center: center,
                    maxZoom: 18
                });

            view.on('change:center', function() {
              var center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
              gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
            });



            view.on('change:resolution', function() {
              gmap.setZoom(view.getZoom());
            });



            var olMapDiv = document.getElementById('olmap');


            this.map = new ol.Map({
                layers: [
                    // new ol.layer.Tile({
                    //     source: new ol.source.OSM()
                    // }),
                    this.vectorLayer
                ],
                target: olMapDiv,
                controls: ol.control.defaults({
                    attributionOptions:({
                        collapsible: false
                    })
                }),
                interactions: ol.interaction.defaults({
                    altShiftDragRotate: false,
                    dragPan: false,
                    rotate: false
                }).extend([new ol.interaction.DragPan({kinetic: null})]),
                view: view,
            });
            view.setZoom(10);
            view.setCenter(center);


            olMapDiv.parentNode.removeChild(olMapDiv);
            gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);
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
