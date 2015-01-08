define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'stepper/level1-demo',
    'stepper/lyt-step'


], function($, _, Backbone, Marionette, Radio, View1,Step) {

    'use strict';

     return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        
        datachanged_radio: function(e){
            var target= $(e.target);
            var val=$(target).attr('value');
            this.model.set(this.name + '_' + target.attr('name') , val);
            // init all other model attributes
            for(var key in this.model.attributes) {
                if(key != 'start_stationtype'){
                    this.model.set(key,null);
                }
            }
        }
    });

});
