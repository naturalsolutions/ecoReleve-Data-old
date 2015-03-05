define([
    'marionette',
    'radio',
    'config',
    'modules2/validate/views/gsm-grid',
    'modules2/validate/views/gsm-info',
    'modules2/validate/views/gsm-map',
    'text!modules2/validate/templates/gsm.html'
], function(Marionette, Radio, config, Grid, Info,
    Map, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container no-padding',
        template: template,

        regions: {
            grid: '#grid-container',
            info: '#info-container',
            map: '#map-container'
        },

        initialize: function(options) {
            this.gsmID = options.gsmID;
        },

        onBeforeDestroy: function() {
        },

        onShow: function() {
            this.info.show(new Info());
            this.grid.show(new Grid({gsmID:this.gsmID}));
            this.map.show(new Map({gsmID:this.gsmID}));
        },
        onRender : function() {
            
        }
    });
});
