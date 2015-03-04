define([
     'stepper/lyt-stepperOrchestrator',
     'radio'
], function(StepperOrchestrator,Radio) {

    'use strict';

    return StepperOrchestrator.extend({


        /*==========  Next / Prev  ==========*/
        onShow: function(){
            StepperOrchestrator.prototype.onShow.apply(this, arguments);
             Backbone.history.navigate('#import/gpx');
             $('#stepper-header span').html('Import > Gpx')
        },
        displayPrev: function() {
            $('#btnPrev').show();
        },

      
        prevStep: function(){
            if(this.currentStep ==0){
               Radio.channel('route').trigger('import');
            } else {
                this.currentStep === 0 ? this.currentStep : this.currentStep--;
                this.toStep(this.currentStep);
            }
           
        }, 

        finish: function() {
            console.log('finish')
            var currentStep = this.steps[this.currentStep];
            currentStep.importFile();
            
        }
    });

});
