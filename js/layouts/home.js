define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'views/info',
    'text!templates/home_new.html'
], function($, _, Backbone, Marionette, InfoView, homeTemplate) {

    'use strict';

    return Backbone.Marionette.LayoutView.extend({
        template: _.template(homeTemplate),

        regions: {
            graph: '#graph',
            info: '#info'
        }
    });
});
