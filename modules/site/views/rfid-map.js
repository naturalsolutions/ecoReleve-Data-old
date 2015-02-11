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
                this.radio.comply(this.channel+':map:update', this.updateGeoJson, this);
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
            
            var gmap = new google.maps.Map(document.getElementById('map'), {
              mapTypeControl: false,
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

            this.addClusterLayer(this.geoJson);

            var center=this.sourceGeo.getFeatures()[0].getGeometry().getCoordinates();
            var view = new ol.View({
                    center: center,
                    maxZoom: 18,
                    minZoom: 2
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
            view.setZoom(3);
            view.setCenter(center);


              var ctx = this
              this.map.on('singleclick', function(evt) {                         
               var feature = ctx.map.forEachFeatureAtPixel(evt.pixel,
                 function(feature, layer) {
                  if(feature.values_.features.length == 1){
                    var id=feature.values_.features[0].values_['id'];
                    Radio.channel('route').command('site:detail', id);
                  }                                
               });                                                         
             });    

            olMapDiv.parentNode.removeChild(olMapDiv);
            gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);
        },

        addClusterLayer: function(geoJson){
          this.sourceGeo = new ol.source.GeoJSON({
              projection: 'EPSG:3857',
              object: geoJson
          });

          var clusterSource = new ol.source.Cluster({
            distance: 50,
            source: this.sourceGeo,
          });

          var styleCache = {};
          this.vectorLayer = new ol.layer.Vector({
              source: clusterSource,
              style: function(feature, resolution) {
                var size = feature.get('features').length;
                var style = styleCache[size];
                var radius = 30;
                var color= 'rgba(20, 60, 80, 0.8)';
                if(size <= 10000){
                    radius = 25;
                    color= 'rgba(24, 71, 95, 0.8)';
                }
                if(size <= 1000){
                    radius = 20;
                    color= 'rgba(24, 71, 95, 0.8)';
                }
                if(size <= 100){
                    radius = 15;
                    color= 'rgba(33, 99, 132, 0.8)';
                }
                if(size <= 10){
                    radius = 10;
                    color= 'rgba(42, 126, 162, 0.8)';
                }
                if(size == 1){
                    radius = 5;
                    color= 'rgba(51, 153, 204, 1)';
                }

                if (!style) {
                  style = [new ol.style.Style({
                    image: new ol.style.Circle({
                      radius: radius,
                      stroke: new ol.style.Stroke({
                        color: '#fff'
                      }),
                      fill: new ol.style.Fill({
                        color: color

                      })
                    }),
                    text: new ol.style.Text({
                      text: (size == 1 )? '' : size.toString() ,
                      fill: new ol.style.Fill({
                        color: '#fff'
                      })
                    })
                  })];
                  styleCache[size] = style;
                }
                return style;
              }
          });


     
        },

        updateGeoJson: function(args){
          
            var url = config.coreUrl + '/monitoredSite/search_geoJSON';
            $.ajax({
                url: url,
                contentType:'application/json',
                type:'GET',
                context: this,
                data: args.params,
            }).done(function(geoJson){
                this.updateMapLayer(geoJson);
            }).fail(function(msg){
                console.log(msg);
            });


        },

        updateMapLayer: function(geoJson){
          this.map.removeLayer(this.vectorLayer);
          this.vectorLayer.getSource().clear('fast');
          this.addClusterLayer(geoJson);
          this.map.addLayer(this.vectorLayer);
          this.features=this.vectorLayer.getSource();

          console.log(this.features);
        },

    });
});
