define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'ns_modules_map/ns_map',
    'text!ns_modules_map/tpl-map.html',
    'L',


], function($, _, Backbone , Marionette, config, Radio, NsMap, tpl, L
    ) {

    'use strict';

    return Marionette.ItemView.extend({
        template: tpl,
        className: 'full-height',
        events: {

        },

        onBeforeDestroy: function(){
          this.map.destroy();
        },

        initialize: function(options) {
            //Radio.channel('rfid').comply('moveCenter', this.moveCenter, this);
            Radio.channel('rfid').comply('addOverlay', this.addMarker, this);
        },

        onShow: function(){
            this.map = new NsMap({
                zoom: 3,
                popup: true,
                element : 'map',
            });
            var ctx = this;
            this.map.init();
        },

        addMarker: function(args){
            this.map.addMarker(false, args[1], args[0]);
        },
    });
});
