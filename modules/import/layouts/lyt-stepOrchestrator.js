define([
     'stepper/lyt-stepperOrchestrator',
     'radio'
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
                if (currentStep.name =='type'){
                     // get file type 
                    var fileType = currentStep.model.get('type_filetype');

                    switch(fileType) {
                        case 'gps-gpx':
                            this.currentStep++;
                            this.toStep(this.currentStep);
                            break;
                        case 'rfid':
                            this.radio.command('import:rfid');
                            break;
                        case 'gsm':
                            this.radio.command('import:gsm');
                            break;
                        /*default:
                            this.validate();*/
                    };
                }
                else if(currentStep.name =='finish'){
                    console.log('import home');
                   
                    //this.toStep(0);
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
    });

});
