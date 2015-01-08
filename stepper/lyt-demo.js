define([
	'jquery',
	'underscore',
	'backbone',
    'marionette',
    'radio',
    'stepper/lyt-stepperOrchestrator',
    'stepper/lyt-step',
    'stepper/lyt-step1',
    'text!stepper/tpl-demo.html',
    'text!stepper/tpl-step1.html',
    'text!stepper/tpl-step2.html',
    'text!stepper/tpl-step3.html',


], function($, _, Backbone, Marionette, Radio, StepperOrchestrator, Step, Step1,  tpl, tpl_step1, tpl_step2, tpl_step3) {

    'use strict';

    return Marionette.LayoutView.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        
        template: tpl,
        regions: {
            stepperRegion : '#stepper',
        },
        


        initialize: function(){

            this.model = new Backbone.Model();

        },

        onShow: function(){

            var FirstStep = new Step({
                model: this.model,
                name: 'Step1',
                tpl: tpl_step1
            });


            var SecondStep = new Step1({
                model: this.model,
                name: 'step2',
                tpl: tpl_step2
            });

            var ThirdStep = new Step({
                model: this.model,
                name: 'Step3',
                tpl: tpl_step3
            });

            this.steps=[];
            this.steps[0]= FirstStep;            
            this.steps[1]= SecondStep;
            this.steps[2]= ThirdStep;

            this.stepper = new StepperOrchestrator({
                model: this.model,
                steps: this.steps
            });
            this.stepperRegion.show( this.stepper );

        },
    });
});
