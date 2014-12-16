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
        className: 'full-height',

        events: {
            'click button#validateBox' : 'validateBox',
        },





        initialize: function(options) {
            this.radio = Radio.channel('exp');
            this.radio.comply('filters2map', this.updateFilters, this);

            


            this.viewName= options.viewName;
            this.filterInfosList= {
                viewName: this.viewName,
                filters: []
            }


            
            this.columnForm;

            this.boxCriteria=[-180, -90, 180, 90];
            this.validateBox();
            console.log(this.boxCriteria);
            this.columnCriteria;
            this.geoJson;

            this.getGeoJson();
          

        },

        /*
        onBeforeDestroy: function() {
            this.radio.reset();
        },*/

        updateFilters: function(args){
          this.filterInfosList=args.filters;
          var url = config.coreUrl + "/views/filter/" + this.viewName + "/geo?"+"&format=geojson&limit=0";

          $.ajax({
              url: url,
              data: JSON.stringify({criteria:this.filterInfosList}),
              contentType:'application/json',
              type:'POST',
              context: this,
          }).done(function(data){
              this.geoJson= data;
              console.log('reload : success');
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
              this.initMap();
              //$('#filter-query-result').html(count);
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
              attributionOptions: /** @type {olx.control.AttributionOptions} */ ({
                collapsible: false
              })
            }),
            view: new ol.View({
              center: this.vectorLayer.getSource().getFeatures()[0].getGeometry().getCoordinates(),
              zoom: 5
            }),
          });
          
          
        },


        validateStep: function(){
          $('.btn-next').removeAttr('disabled');
        },

        validateBox: function(){
        	this.radio.command('box', { box: this.boxCriteria });
        },

    });
});
