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
        events:{
            'click .manual-tile' : 'selectMode'
        },
        datachanged_radio: function(e){
            var target= $(e.target);
            var val=$(target).attr('value');
            this.updateModel(val);
        },
        selectMode : function(e){
            $('div.manual-tile').removeClass('select');
            var radioSelection =  $(e.target).hasClass('radio-select');
            if (radioSelection){
                $(e.target).addClass('select');
                $('input[name="stationtype"]').each(function() {
                    $(this).removeAttr('checked').prop('checked',false);
                });
                var radioElements = $(e.target).find('input[type="radio"]');
                var radio =  $(radioElements)[0];
                $(radio).attr('checked','checked').prop('checked',true);
                var val = $(radio).attr('value');
                this.updateModel(val);
            }
        }, 
        updateModel : function(value){
            this.model.set('start_stationtype' , value);
            for(var key in this.model.attributes) {
                if(key != 'start_stationtype'){
                    this.model.set(key,null);
                }
            }
        },
        onShow: function(){
            $('#btnNext').removeClass('disabled');
        }
    });

});
