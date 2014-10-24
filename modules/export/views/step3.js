define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step3.html',
    'ol3',
    'models/point',
], function($, _, Backbone , Marionette, moment, Radio, datalist, config, template, ol, Point) {

    'use strict';


    return Marionette.ItemView.extend({
        template: template,

        filters: '',
        viewName: '',
        mapView: '',

        initialize: function(options) {
            console.log('step3');
            this.filters_coll = options.filters;
            this.viewName= options.viewName;
            this.filters_coll.each(function(item) {
                console.log('item', item.attributes);
            });
            this.query= options.query;



        },


        onShow: function() {
           
            //$("#filterViewName").text(this.currentView);

            /*
             var source = new ol.source.GeoJSON({
                 projection: 'EPSG:3857',
                 url: url
             });*/


            var url = config.coreUrl + "/views/filter/" + this.viewName + "/geo?" + this.query + "&format=geojson&limit=0";
            var vectorSourceData;


            var image = new ol.style.Circle({
              radius: 5,
              fill: null,
              stroke: new ol.style.Stroke({color: 'red', width: 1})
            });

            var styles = {
              'Circle': [new ol.style.Style({
                stroke: new ol.style.Stroke({
                  color: 'red',
                  width: 2
                }),
                fill: new ol.style.Fill({
                  color: 'rgba(255,0,0,0.2)'
                })
              })]
            };

            var styleFunction = function(feature, resolution) {
              return styles[feature.getGeometry().getType()];
            };



            var sourceT = new ol.source.GeoJSON({
                projection: 'EPSG:3857',
                url: url
            });



            var boundingBox = new ol.interaction.DragBox({
                condition: ol.events.condition.shiftKeyOnly,
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                        })
                    })
            });

            var vectorLayer = new ol.layer.Vector({
              source: sourceT
            });

            this.map = new ol.Map({
            
              layers: [
                new ol.layer.Tile({
                  source: new ol.source.OSM()
                })
                    //vectorLayer
              ],
            
              target: 'map',
              controls: ol.control.defaults({
                attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                  collapsible: false
                })
              }),
              view: new ol.View({
                center: [0, 0],
                zoom: 2
              }),
              interactions: ol.interaction.defaults().extend([boundingBox])
            });
            this.map.addLayer(vectorLayer);


            //vectorLayer.on(event, loadEnd, this);
/*            vectorLayer.events.register("loadend", '', function(e){
                alert('');
            });*/



/*
            this.map.events.register('loadend', vectorLayer, function (e) {
                console.log(e);
            });
*/


            boundingBox.on('boxend', function() {

                var features= vectorLayer.getSource().getFeatures();
                var featuresinBox = [];
                for (var i=0;i<features.length;i++) {
                    if (ol.extent.containsCoordinate(
                        boundingBox.getGeometry().extent,
                        features[i].getGeometry().getCoordinates())
                        )
                    {
                        console.log(features[i].getCoordinates());
                        featuresinBox.push(features[i]);
                    }
                }

                console.log(featuresinBox);
                $('#geo-query-result').html(featuresinBox.length);
            });


        },

        onRender: function(){

        },

    });
});
