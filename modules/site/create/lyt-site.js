define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'bbForms',
    'modules2/site/views/rfid-grid',
    'modules2/site/views/rfid-map',
    'text!modules2/site/templates/tpl-site.html',
    'text!modules2/site/tools/tpl-filters.html',
    'filter/model-filter',

], function($, _, Backbone, Marionette, config, Radio,
    BbForms, 
    ViewGrid, ViewMap,
    tpl, tplFilters, NSFilter) {

    return Marionette.LayoutView.extend({
        className: 'full-height monitored-sites',
        template: tpl,

        regions: {
            leftRegion
        },

        initialize: function(){

        },

    });
});


