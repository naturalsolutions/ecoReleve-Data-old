define([
    'marionette',
    'radio',
    'config',
    'backbone',
    'models/individual',
    'modules2/validate/gsm/views/gsm-grid',
    'modules2/validate/gsm/views/gsm-info',
    'modules2/validate/gsm/views/gsm-map',
    'text!modules2/validate/gsm/templates/gsm.html'
], function(Marionette, Radio, config,Backbone,Individual, Grid, Info,
    Map, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container no-padding',
        template: template,

        regions: {
            grid: '#grid-container',
            info: '#info-container',
            map: '#map-container'
        },

        initialize: function(options) {
            var self=this;
            this.radio = Radio.channel('gsm-detail');
            this.gsmID = options.gsmID;
            this.indivNbObs=options.NbObs;
            console.log( this.indivNbObs);
        },

        onBeforeDestroy: function() {
            this.radio.reset();
        },

        onShow: function() {
            this.info.show(new Info({
                model: new Individual({
                   id:this.gsmID,
                   last_observation: null,
                   duration: null,
                   indivNbObs:this.indivNbObs
                })
            }));
            this.grid.show(new Grid({gsmID:this.gsmID}));
            this.map.show(new Map({gsmID:this.gsmID}));
        },
    });
});
