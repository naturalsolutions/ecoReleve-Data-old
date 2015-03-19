define([
    'jquery',
    'marionette',
    'ol3',
    'radio',
    'config',
    'google',
    'text!modules2/map/templates/mapGoogle.html'
], function($, Marionette, ol, Radio, config, Gmap,template) {
    'use strict';
    return Marionette.ItemView.extend({
        template: template,
        events: {
            'change #layerswitcher input[name=layer]': 'switchLayer',
            'click #layerswitcherBtn' : 'showLayerSwitcher'
        },
        onShow: function() {

            $('#map').css('height','100%');
            $('#map').css('width','100%');
            $('div.fill').css('height','100%');
            $('div.fill').css('width','100%');
            //var gmap = new Gmap.init('basemap','#gmap');
            var gmap = new google.maps.Map(document.getElementById('gmap'), {
              mapTypeControl: true,
              panControl: false,
              disableDefaultUI: true,
              keyboardShortcuts: false,
              draggable: true,
              disableDoubleClickZoom: true,
              scrollwheel: true,
              streetViewControl: false
               
            });
            var mapDefault = config.mapDefault;
            //var layers = [];
           
            /*layers[0] = new ol.layer.Group({ layers: [ new ol.layer.Tile({ source: new ol.source.MapQuest({layer: 'sat'}) }), new ol.layer.Tile({ source: new ol.source.MapQuest({layer: 'hyb'}) }) ] });
            layers[1] = new ol.layer.Tile({ source: new ol.source.MapQuest({layer: 'sat'}) });
            layers[2] = new ol.layer.Tile({ source: new ol.source.MapQuest({layer: 'osm'}) });*/
            /*layers[3] = new ol.layer.Tile({ source: new ol.source.OSM() });*/
            var view = new ol.View({
                // make sure the view doesn't go beyond the 22 zoom levels of Google Maps
                center: ol.proj.transform([-4.01,33.06], 'EPSG:4326', 'EPSG:3857'),
                maxZoom: 21,
                zoom: mapDefault.zoom
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
                target: olMapDiv,
                interactions: ol.interaction.defaults({
                    altShiftDragRotate: false,
                    dragPan: false,
                    rotate: false
                  }).extend([new ol.interaction.DragPan({kinetic: null})]),
                controls: ol.control.defaults().extend([ new ol.control.ScaleLine({ units:'metric' }) ]),
                //layers: layers,
                view: view
            });
            /*view.setCenter([0, 0]);
            view.setZoom(1);*/
            olMapDiv.parentNode.removeChild(olMapDiv);
            gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);
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
                this.map.removeOverlay( this.overlay);
            }
            //this.overlay=new ol.Overlay ({
            var featureOverlay = new ol.FeatureOverlay({
                //position: ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'),
                //element: $('<i class="large glyphicon glyphicon-map-marker"></img>').css({'font-size':'30px', 'left':'-12px', 'top':'-25px'})
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                      color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                      color: '#ffcc33',
                      width: 2
                    }),
                    image: new ol.style.Circle({
                      radius: 7,
                      fill: new ol.style.Fill({
                        color: '#ffcc33'
                      })
                    })
                  })

              });
            //this.map.addOverlay(this.overlay);
            featureOverlay.setMap(this.map);
        },

        moveCenter: function(newCenter) {
            
           // this.addOverlay(newCenter);
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
            // mask popup if displayed when we move feature
            feature.on('change',function(){
                var element = $('#popup');
                $(element).popover('destroy');
            },feature);
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
            
            var style =  new ol.style.Style({
              image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({color: 'red'}),
                stroke: new ol.style.Stroke({color: 'black', width: 1 })
              })
            });

            var vectorLayer = new ol.layer.Vector({
              source: vectorSource,
              style: style
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
