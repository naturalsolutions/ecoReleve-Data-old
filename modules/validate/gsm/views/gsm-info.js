define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.paginator',
    'backgrid',
    'backgrid.paginator',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/validate/gsm/templates/gsm-info.html'
], function($, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
    });
});
