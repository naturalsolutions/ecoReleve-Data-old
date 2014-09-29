define([
    'marionette',
    'radio',
    'config',
    'models/individual',
    'modules2/individual/views/detail',
    'modules2/individual/views/map',
    'text!modules2/individual/templates/detail-layout.html'
], function(Marionette, Radio, config, Individual, DetailView,
    MapView, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container-fluid no-padding',
        template: template,

        regions: {
            detail: '#detail-panel',
            main: '#main-panel'
        },

        initialize: function(options) {
            this.radio = Radio.channel('individual');
            this.indiv = options.indiv;
        },

        hideDetail: function() {
            var callback = $.proxy(this, 'updateSize', 'hide');
            this.detail.$el.toggle(callback);
        },

        showDetail: function() {
            var callback = $.proxy(this, 'updateSize', 'show');
            this.detail.$el.toggle(callback);
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
            this.listenTo(this.radio, 'hide-detail', this.hideDetail);
            this.listenTo(this.radio, 'show-detail', this.showDetail);
            this.detail.show(new DetailView( {
                model: new Individual({id: this.indiv})
            }));
            this.main.show(new MapView({
                indivId: this.indiv
            }));
        },
    });
});
