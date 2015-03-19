define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'ns_modules_map/ns_map',


], function($, _, Backbone , Marionette, config, Radio, NsMap
    ) {

    'use strict';

    return Marionette.ItemView.extend({
        events: {

        },

        onBeforeDestroy: function(){
          this.map.destroy();
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
                this.initMap(datas);
            }).fail(function(msg){
                console.error(msg);
            });
        },

        initMap: function(geoJson){
            this.map = new NsMap({
                cluster: true,
                geoJson: geoJson,
                zoom: 3,
                popup: true,
                element : 'map',
            });
            var ctx = this;
            this.map.init();
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
                this.map.updateLayers(geoJson);
            }).fail(function(msg){
                console.warn(msg);
            });
        },
    });
});
