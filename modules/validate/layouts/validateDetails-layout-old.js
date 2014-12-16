define([
    'jquery',
    'underscore',
    'marionette',
    'radio',
    'config',
    'text!modules2/validate/templates/tpl-validateDetails.html'
], function($, _, Marionette, Radio, config, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container no-padding',
        template: template,


        initialize: function() {
            
        },



    });
});
