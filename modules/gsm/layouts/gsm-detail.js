define([
    'marionette',
    'radio',
    'config',
    'modules2/gsm/views/gsm-detail',
    'modules2/gsm/views/gsm-map',
    'text!templates/left5-main7.html'
], function(Marionette, Radio, config, DetailView,
    Map, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container-fluid no-padding',
        template: template,

        regions: {
            left: '#left-panel',
            main: '#main-panel'
        },

        initialize: function(options) {
            this.radio = Radio.channel('gsm-detail');
            this.indiv = options.indiv;
        },

        hideDetail: function() {
            var callback = $.proxy(this, 'updateSize', 'hide');
            this.left.$el.toggle(callback);
        },

        showDetail: function() {
            var callback = $.proxy(this, 'updateSize', 'show');
            this.left.$el.toggle(callback);
        },

        updateSize: function(type) {
            if(type === 'hide'){
                $("#showIndivDetails").removeClass('masqued');
                this.main.$el.removeClass('col-lg-7');
                this.main.$el.addClass('col-lg-12');
            } else {
                $("#showIndivDetails").addClass('masqued');
                this.main.$el.removeClass('col-lg-12');
                this.main.$el.addClass('col-lg-7');
            }
            $(window).trigger('resize');
        },

        onBeforeDestroy: function() {
            this.radio.reset();
        },

        onShow: function() {
            this.left.show(new DetailView());
            this.main.show(new Map());
        },
    });
});
