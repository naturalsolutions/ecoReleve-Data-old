define([
     'stepper/lyt-stepperOrchestrator',
     'radio',
     'backbone',
     'underscore'
], function(StepperOrchestrator,Radio, Backbone,_) {

    'use strict';

    return StepperOrchestrator.extend({

        
        onShow: function(){
            StepperOrchestrator.prototype.onShow.apply(this, arguments);
            Backbone.history.navigate('#import/rfid');
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
        	var currentStep = this.steps[this.currentStep];
        	currentStep.importFile();
            
        }


    });

});
