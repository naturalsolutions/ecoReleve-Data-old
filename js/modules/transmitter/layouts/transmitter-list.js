define([
    'marionette',
    'radio',
    'modules/transmitter/views/transmitter-filter',
    'modules/transmitter/views/transmitter-grid',
    'text!templates/left3-main9.html'
], function(Marionette, Radio, Filter, Grid, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container-fluid',
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
