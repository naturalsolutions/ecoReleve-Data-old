define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step2-map.html',
    'ol3',
    'models/point',
    'bbForms',
], function($, _, Backbone , Marionette, moment, Radio, datalist, config, template,
 ol, Point, BbForms) {

    'use strict';


    return Marionette.ItemView.extend({
        template: template,

        events: {
            'click button#validateBox' : 'validateBox',
        },





        initialize: function(options) {
            console.log('step3');
            this.radio = Radio.channel('exp');
            this.radio.comply('filters2map', this.updateFilters, this);


            this.viewName= options.viewName;
            this.filterInfosList= {
                viewName: this.viewName,
                filters: []
            }

            /**
            *
            * shared criterias
            *
            **/
            
            this.columnForm;

            this.boxCriteria;
            this.columnCriteria;

            this.getGeoJson();
            //this.initColumns();




        },
        updateFilters: function(args){
          this.filterInfosList=args.filters;

          console.log('update');
          var url = config.coreUrl + "/views/filter/" + this.viewName + "/geo?"+"&format=geojson&limit=0";

          $.ajax({
              url: url,
              data: JSON.stringify({criteria:this.filterInfosList}),
              contentType:'application/json',
              type:'POST',
              context: this,
          }).done(function(data){
              this.geoJson= data;
              console.log('success reload: '+data);
              this.updateMap();
              //$('#filter-query-result').html(count);
          }).fail(function(msg){
              console.log(msg);
          });
          
        },
        updateMap: function(){
          this.map.removeLayer(this.vectorLayer);
          
          var sourceT = new ol.source.GeoJSON({
            projection: 'EPSG:3857',
            object: this.geoJson
          });
          
          
          this.vectorLayer = new ol.layer.Vector({
            source: sourceT
          });
          this.map.addLayer(this.vectorLayer);
          this.features= this.vectorLayer.getSource().getFeatures();
        },



        getGeoJson: function(){
          var url = config.coreUrl + "/views/filter/" + this.viewName + "/geo?"+"&format=geojson&limit=0";

          $.ajax({
              url: url,
              data: JSON.stringify({criteria:this.filterInfosList}),
              contentType:'application/json',
              type:'POST',
              context: this,
          }).done(function(data){
              this.geoJson= data;
              console.log('success: '+data);
              console.log(data);
              this.initMap();
              //$('#filter-query-result').html(count);
          }).fail(function(msg){
              console.log(msg);
          });
        },


        initMap: function(){

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

          var sourceT = new ol.source.GeoJSON({
            projection: 'EPSG:3857',
            object: this.geoJson
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
              attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
              })
            }),
            view: new ol.View({
              center: this.vectorLayer.getSource().getFeatures()[0].getGeometry().getCoordinates(),
              zoom: 5
            }),
            interactions: ol.interaction.defaults().extend([boundingBox])
          });
          


          /**
          *
          * BoundingBox boxend Event
          *
          **/
          
          this.features= this.vectorLayer.getSource().getFeatures();
          var bbTmp, fCoord;
          var context=this;
          boundingBox.on('boxend', function() {
              var featuresinBox = [];
              bbTmp= boundingBox.getGeometry().extent;
              context.boxCriteria=bbTmp;
              for (var i=0;i<context.features.length;i++) {
                  fCoord= context.features[i].getGeometry().getCoordinates();
                  if (ol.extent.containsCoordinate( bbTmp, fCoord))
                  {
                      featuresinBox.push(context.features[i]);
                  }
              }
              console.log(featuresinBox);
              $('#geo-query-result').html(featuresinBox.length);
          });

        },


        validateStep: function(){
          $('.btn-next').removeAttr('disabled');
        },

        onShow: function(){
           
        },

        onRender: function(){

        },
    });
});
