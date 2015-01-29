define([
     'stepper/lyt-stepperOrchestrator',
     'radio'
], function(StepperOrchestrator,Radio) {

    'use strict';

    return StepperOrchestrator.extend({

        /*==========  Next / Prev  ==========*/
        onShow: function(){

            
        },
        

        prevStep: function(){
          
        }, 


        /*
        toStep: function(numstep){
           
            this.currentStep = numstep;
            this.step_content.show( this.steps[this.currentStep], {preventDestroy: true} );
            this.check();
            this.styleNav();

            if (this.currentStep==this.steps.length-1){
                this.$el.find('#btnNext').attr( 'disabled', 'disabled');
            }
            if (this.currentStep==0){
                this.$el.find('#btnPrev').attr( 'disabled', 'disabled');
            }
            else {this.$el.find('#btnPrev').removeAttr('disabled'); }
        }*/

    });

});
