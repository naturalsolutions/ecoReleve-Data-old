define([
    'moment',
    'marionette',
    'radio',
    'config',
    'modules2/input/views/input-stations-filter',
    'modules2/input/views/input-stations-grid',
    'text!modules2/input/templates/input-all-stations.html'
], function(moment, Marionette, Radio, config, FilterView, GridView, template) {
    'use strict';
    return Marionette.LayoutView.extend({
        //className: 'container-fluid no-padding',
        template: template,
        regions: {
            left: '#filter-left-panel',
            main: '#filter-main-panel'
        },
        onShow: function() {
            this.left.show(new FilterView());
            this.main.show(new GridView());
        },
        onBeforeDestroy: function() {
           Radio.channel('stations').reset();
           // move datetimepicker divs from the DOM
           $('div.bootstrap-datetimepicker-widget').remove();
        }
    });
});
