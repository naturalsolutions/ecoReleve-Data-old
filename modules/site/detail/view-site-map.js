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
            this.model = options.model;
            this.id= options.id;
            //this.model.bind('change', this.initMap, this);
            this.initGeoJson();
        },

        initGeoJson: function(){

            var url = config.coreUrl+'/monitoredSite/detail/'+this.id+ '/geoJSON';

            $.ajax({
                url: url,
                contentType:'application/json',
                type:'GET',
                context: this,
            }).done(function(datas){
                this.geoJson= datas;
                console.log(datas)
                this.initMap();
            }).fail(function(msg){
                console.log(msg);
            });
        },

        initMap: function(){
            var activePos = {'type':'FeatureCollection', 'features': []};

            var oldPos = {'type':'FeatureCollection', 'features': []};



            var infos = this.geoJson;



            for (var i = 0; i < infos.length; i++) {
                if(!infos[i]['properties']['end']){
                    activePos.features.push({
                        'type':'Feature',
                        'geometry': infos[i].geometry
                    });
                }
                else{
                    oldPos.features.push({
                        'type':'Feature',
                        'geometry':infos[i].geometry
                    });
                }
            };




            /*========================================
            =            Active Positions            =
            ========================================*/
            
            var sourceActivePos = new ol.source.GeoJSON({
                projection: 'EPSG:3857',
                object: activePos,
            });

            var styleActivePos = new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 7,
                    fill: new ol.style.Fill({
                        color: 'green'
                  }),
                  stroke: new ol.style.Stroke({
                    color: [255, 255, 255, 0.75],
                    width: 2
                  })
                }),
                zIndex: 100000
            });

            this.layerActivePos = new ol.layer.Vector({
                source: sourceActivePos,
                style: styleActivePos
            });

            /*========================================
            =            Old Positions               =
            ========================================*/
            var sourceOldPos = new ol.source.GeoJSON({
                projection: 'EPSG:3857',
                object: oldPos,
            });
            var styleOldPos = new ol.style.Style({
                image: new ol.style.Circle({
                  radius: 7,
                    fill: new ol.style.Fill({
                    color: [0, 153, 255, 1]
                  }),
                  stroke: new ol.style.Stroke({
                    color: [255, 255, 255, 0.75],
                    width: 2
                  })
                }),
                zIndex: 99999
            });     


            this.layerOldPos = new ol.layer.Vector({
                source: sourceOldPos,
                style: styleOldPos
            });


            /*===========================
            =            Map            =
            ===========================*/

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
              //maxZoom: 18,
               
            });

            var center = this.layerActivePos.getSource().getFeatures()[0].getGeometry().getCoordinates();
            center[0]; //offset legend encart

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
                    this.layerOldPos,
                    this.layerActivePos,
                ],
                target: olMapDiv,
                interactions: ol.interaction.defaults({
            altShiftDragRotate: false,
            dragPan: false,
            rotate: false
            }).extend([new ol.interaction.DragPan({kinetic: null})]),



                controls: ol.control.defaults({
                    attributionOptions:({
                        collapsible: false
                    })
                }),
                view: view,
            });
            
            var zoom = 5;
            var timer = setInterval(function(){
                view.setZoom(zoom);
                if(zoom >= 10)
                    clearInterval(timer);
                zoom++;
            }, 300);
            view.setCenter(center);

            olMapDiv.parentNode.removeChild(olMapDiv);
            gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);






        },

        update: function(){


        },
    });
});
