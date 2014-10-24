define([
    'marionette',
    'radio',
    'config',
    'modules2/gsm/views/gsm-grid',
    'modules2/gsm/views/gsm-info',
    'modules2/gsm/views/gsm-map',
    'text!modules2/gsm/templates/gsm.html'
], function(Marionette, Radio, config, Grid, Info,
    Map, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container-fluid no-padding',
        template: template,

        regions: {
            grid: '#grid-container',
            info: '#info-container',
            map: '#map-container'
        },

        initialize: function(options) {
            this.radio = Radio.channel('gsm-detail');
            this.gsmID = options.gsmID;
        },

        onBeforeDestroy: function() {
            this.radio.reset();
        },

        onShow: function() {
            this.info.show(new Info());
            this.grid.show(new Grid({gsmID:this.gsmID}));
            this.map.show(new Map({gsmID:this.gsmID}));
        },
    });
});
