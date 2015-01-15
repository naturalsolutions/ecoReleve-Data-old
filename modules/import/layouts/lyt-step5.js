define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'stepper/lyt-step',

], function($, _, Backbone, Marionette, Step) {

    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/

        events : {
           // 'click button#btnNext' : 'navigate'
        },
        onShow: function(){
            var msg = this.model.get('ajax_msg') ; 
            $('#importResponseMsg').text(msg); 
        },
        navigate : function(){
            alert('clicked !');
        },
        nextOK: function(){
            return true;
        }
    });

});
