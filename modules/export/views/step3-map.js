define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'config',
    'text!modules2/export/templates/export-step3-map.html',
    'models/point',
    'bbForms',
    'ns_modules_map/ns_map',

], function($, _, Backbone , Marionette, moment, Radio, config, template, Point, BbFormsn, NsMap) {

    'use strict';


    return Marionette.ItemView.extend({
        template: template,
        className: 'full-height',

        events: {
            'click button#validateBox' : 'validateBox',
        },

        onBeforeDestroy: function(){
          this.ns.destroy();
        },

        initialize: function(options) {
            this.radio = Radio.channel('exp');
            this.radio.comply('filters2map', this.updateFilters, this);

            this.viewName= options.viewName;
            this.filterInfosList= {
                viewName: this.viewName,
                filters : options.filters.filters
            }
            this.columnForm;
            this.boxCriteria=[-180, -90, 180, 90];
            this.validateBox();
            this.columnCriteria;
            this.geoJson;
            this.getGeoJson();
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
              this.initMap(data);
          }).fail(function(msg){
              console.log(msg);
          });
        },

        initMap: function(geoJson){
            this.ns = new NsMap({
                cluster: true,
                selection: true,
                bbox: true,
                geoJson: geoJson,
                zoom: 3,
                element : 'map-step3',
            });

            this.ns.init();

            var ctx = this;
            $(this.ns).on('ns_bbox_end', function(e, bbox){
              ctx.boxCriteria=[
                bbox._northEast.lng,
                bbox._northEast.lat,
                bbox._southWest.lng,
                bbox._southWest.lat
              ];
              ctx.validateBox();
            });
        },

        onShow: function(){
          $('#btnNext').removeAttr('disabled');
        },

        validateBox: function(){
        	this.radio.command('box', { box: this.boxCriteria });
        },

    });
});
