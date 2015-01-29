define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'modules2/rfid/layouts/rfid-deploy',
    'modules2/rfid/views/rfid-map',
    'sweetAlert',
    'modules2/map/views/basemap',
    
], function($, _, Backbone, Marionette, config, Radio, DeployRFID, Map, swal, BaseMap) {
    'use strict';

    return DeployRFID.extend({
        regions: {
            mapRegion: "#map-container"
        },
        initialize: function() {
            this.map2 = new BaseMap();
            DeployRFID.prototype.initialize.apply(this, arguments);
        },

        onShow: function() {
            this.$el.find('#input-begin').attr('placeholder', config.dateLabel);
            this.$el.find('#input-end').attr('placeholder', config.dateLabel);
            //this.mapRegion.show(this.map);
            this.mapRegion.show(this.map2);

        },

        onRender: function() {
         /*   var map = Map.extend({
                onRender: function() {
                    this.$el.find('#map').height('300px');
                },
            });
            this.map=new map();*/
            this.mapRegion.show(this.map2);

        },

        onDestroy: function() {
          
        },
     
    });


});
