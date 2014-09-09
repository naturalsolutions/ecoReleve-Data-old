define([
    'moment',
    'marionette',
    'radio',
    'config',
    'modules/individual/views/individual-filter',
    'modules/individual/views/individual-grid',
    'text!templates/left3-main9.html'
], function(moment, Marionette, Radio, config, FilterView, GridView, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container-fluid',
        template: template,

        regions: {
            left: '#left-panel',
            main: '#main-panel'
        },

        onShow: function() {
            this.left.show(new FilterView());
            this.main.show(new GridView());
        },

        onBeforeDestroy: function() {
            Radio.channel('individual').reset();
        }
    });
});
