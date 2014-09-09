define([
    'marionette',
    'radio',
    'config',
    'models/individual',
    'modules/individual/views/detail',
    'modules/individual/views/map',
    'text!templates/left5-main7.html'
], function(Marionette, Radio, config, Individual, DetailView,
    MapView, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container-fluid',
        template: template,

        regions: {
            left: '#left-panel',
            main: '#main-panel'
        },

        initialize : function(options) {
            this.indiv = options.indiv;
        },

        onShow: function() {
            this.left.show(new DetailView( {
                model: new Individual({id: this.indiv})
            }));
            this.main.show(new MapView({
                indivId: this.indiv
            }));
        },
    });
});
