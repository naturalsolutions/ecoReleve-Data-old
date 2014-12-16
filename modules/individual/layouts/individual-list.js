define([
    'moment',
    'marionette',
    'radio',
    'config',
    'modules2/individual/views/individual-filter',
    'modules2/individual/views/individual-grid',
    'text!modules2/individual/templates/individual-layout.html'
], function(moment, Marionette, Radio, config, FilterView, GridView, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container-fluid no-padding',
        template: template,

        regions: {
            left: '#left-panel',
            main: '#main-panel'
        },

        onShow: function() {
            var currentFilter = JSON.parse(sessionStorage.getItem('individual:currentFilter')) || null;
            this.left.show(new FilterView({currentFilter:currentFilter}));
            this.main.show(new GridView({currentFilter:currentFilter}));
        },

        onBeforeDestroy: function() {
            Radio.channel('individual').reset();
        }
    });
});
