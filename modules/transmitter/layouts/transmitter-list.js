define([
    'marionette',
    'radio',
    'modules2/transmitter/views/transmitter-filter',
    'modules2/transmitter/views/transmitter-grid',
    'text!modules2/transmitter/templates/left3-main9.html'
], function(Marionette, Radio, Filter, Grid, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'full-height',
        template: template,

        regions: {
            left: '#left-panel',
            main: '#main-panel'
        },

        onShow: function() {
            this.left.show(new Filter());
            this.main.show(new Grid());
        },

        onBeforeDestroy: function() {
            Radio.channel('transmitter').reset();
        },
    });
});
