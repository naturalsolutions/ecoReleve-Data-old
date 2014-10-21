define([
    'marionette',
    'radio',
    'config',
    'text!modules2/export/templates/export.html',

], function(Marionette, Radio, config, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        template: template, 

        Radio: Radio,
        marionette: Marionette,
        config: config,

        


        initialize: function(options){
            //alert('stepper');
            //Marionette.LayoutView.prototype.initialize.call(this);
        },



    });

});
