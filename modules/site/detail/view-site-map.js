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
            this.model.bind('change', this.initMap, this);
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
            var activePos = {'type':'FeatureCollection', 'features': []};

            var oldPos = {'type':'FeatureCollection', 'features': []};

            
            var infos = this.model.attributes.positions;
            console.log(this.model);
            for (var i = 0; i < infos.length; i++) {
                console.log(infos[i]['end'])
                if(!infos[i]['end']){
                    activePos.features.push({
                        'type':'Feature',
                        'geometry':{
                            'type':'Point',
                            'coordinates': [ 
                                infos[i]['lon'],
                                infos[i]['lat']
                            ]
                        },
                    });
                }
                else{
                    oldPos.features.push({
                        'type':'Feature',
                        'geometry':{
                            'type':'Point',
                            'coordinates': [ 
                                infos[i]['lon'],
                                infos[i]['lat']
                            ]
                        },
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
                    width: 1.5
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
                    width: 1.5
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

            this.map = new ol.Map({
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    }),
                    this.layerOldPos,
                    this.layerActivePos,
                ],
                target: 'map',
                controls: ol.control.defaults({
                    attributionOptions:({
                        collapsible: false
                    })
                }),
                view: new ol.View({
                    center: this.layerActivePos.getSource().getFeatures()[0].getGeometry().getCoordinates(),
                    zoom: 5
                }),
            });
        },

        update: function(){


        },
    });
});
