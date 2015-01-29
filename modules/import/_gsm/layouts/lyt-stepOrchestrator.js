define([
     'stepper/lyt-stepperOrchestrator',
     'radio'
], function(StepperOrchestrator,Radio) {

    'use strict';

    return StepperOrchestrator.extend({

       onShow: function(){
            StepperOrchestrator.prototype.onShow.apply(this, arguments);

            Backbone.history.navigate('#import/gsm');
        	console.log('orchestraor show');
        	$('#btnPrev').show();
        },

        displayPrev: function() {
        	$('#btnPrev').show();
        },

        prevStep: function(){
            if(this.currentStep ==0){
            	//app.router.navigate('#import', {trigger: true});      	
               Radio.channel('route').trigger('import');
            } else {
                this.currentStep === 0 ? this.currentStep : this.currentStep--;
                this.toStep(this.currentStep);
            }
           
        }, 
      
        finish: function() {
        	console.log('finish')
        	var currentStep = this.steps[this.currentStep-1];
        	currentStep.importFile();
            
        }

    });

});
