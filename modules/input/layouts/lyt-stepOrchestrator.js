define([
     'stepper/lyt-stepperOrchestrator',
     'radio',

], function(StepperOrchestrator,Radio) {

    'use strict';

    return StepperOrchestrator.extend({
        
        /*==========  Next / Prev  ==========*/
        onShow: function(){
            console.log('onShow');
            //this.radio = Radio.channel('route');
            this.radio = Radio.channel('input');
            this.radio.comply('navigateNextStep', this.nextStep, this);

        },
        nextStep: function(){
            var currentStep = this.steps[this.currentStep];
            if(currentStep.nextOK()) {
                this.currentStep++;
                if (this.currentStep== this.steps.length) { this.finish(); }
                else {this.toStep(this.currentStep); }
            }
        },

        prevStep: function(){
            if(this.currentStep === (this.steps.length - 1)){
                this.$el.find('#btnNext').find( 'span').text('Next');
            }
            this.currentStep === 0 ? this.currentStep : this.currentStep--;
            this.toStep(this.currentStep);
        },
        changeStep : function(e){
            // desactivate navigation
        }
        
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
