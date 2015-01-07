define([
     'stepper/lyt-stepperOrchestrator',
     'radio',

], function(StepperOrchestrator,Radio) {

    'use strict';

    return StepperOrchestrator.extend({
        
        /*==========  Next / Prev  ==========*/
        onShow: function(){
            this.radio = Radio.channel('route');
        },
        nextStep: function(){
            var currentStep = this.steps[this.currentStep];
            if(currentStep.nextOK()) {
                // if current step == 0 and file type =gpx, navigate to next step
                if (currentStep.name =='type'){
                     // get file type 
                    var fileType = currentStep.model.get('type_filetype');
                    if(fileType == 'gps-gpx'){
                        this.currentStep++;
                        this.toStep(this.currentStep);
                    }
                }
                else {
                    this.currentStep++;
                    this.toStep(this.currentStep);
                }
            }
        },

        prevStep: function(){
            if(this.currentStep === (this.steps.length - 1)){
                this.$el.find('#btnNext').find( 'span').text('Next');
            }
            this.currentStep === 0 ? this.currentStep : this.currentStep--;
            this.toStep(this.currentStep);
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
