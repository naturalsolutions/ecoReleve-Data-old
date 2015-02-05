define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'text!./tpl-demo.html',
    'ns_modules/ns_map',
    'ns_modules/ns_com',


], function($, _, Backbone , Marionette, config, tpl, NsMap, Com ) {

    'use strict';

    return Marionette.LayoutView.extend({
        template: tpl,
        className: 'map-view',
        events: {

        },

        regions: {
          rg : '#rg',
        },

        /*====================================
        =            Interactions            =
        ====================================*/

        /*
        features & interactions
        - click on map: 
          - focus -> grid
          - popup -> focus -> grid
          - selection/desecletion -> grid
          - 
        Map: 
        - focus ok
        - popup ko
        - selection/deselection (cluster) ok
        - selection bbBox 
        - bar controll 
        

        Grid : 
        - focus
        - selection/deselcetion

        */


        initialize: function() {
          this.com = new Com();

        },
        onShow: function(){
          this.rg.show(new NsMap({
            url: config.coreUrl+'dataGsm/278/unchecked/68602?format=geojson',
            cluster: true,
            popup: false,
            com : this.com,
            action: {click: 'popup', }
          }));
        },



    });
});
