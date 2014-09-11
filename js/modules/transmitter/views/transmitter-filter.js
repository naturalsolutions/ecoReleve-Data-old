define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!templates/transmitter/transmitter-filter.html'
], function($, _, Backbone, Marionette, Moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

        events: {
            'click #clear-btn' : 'clear',
            'change input': 'update',
            'focus input': 'fill',
            'submit': 'catch',
        },

        initialize: function() {
            this.radio = Radio.channel('transmitter');
            this.filter = {};
        },

        catch: function(evt) {
            evt.preventDefault();
            this.update();
        },

        clear: function(evt) {
            evt.preventDefault();
            $('form').trigger('reset');
            this.filter = {};
            this.radio.trigger('update', {filter:{}});
        },

        fill: function(evt) {
            var id = evt.target.id;
            var list = $('#'+id+'_list');
            if( list.children().length === 0 && id !== 'id') {
                var source = {
                    url: config.coreUrl + 'transmitter/search/values',
                    data: {}
                };
                source.data.field_name = id;
                datalist.fill(source, list);
            }
        },

        update: function(evt) {
            var crit = evt.target.id;
            var val = evt.target.value;
            this.filter[crit] = val;
            this.radio.trigger('update', {filter:this.filter});
        },
    });
});
