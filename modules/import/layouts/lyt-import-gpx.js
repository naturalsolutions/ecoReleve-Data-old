define([
	'jquery',
	'underscore',
	'backbone',
    'marionette',
    'radio',
    'modules2/import/layouts/lyt-stepOrchestrator',  //'stepper/lyt-stepperOrchestrator',
    'stepper/lyt-step',
    'modules2/import/layouts/lyt-step2',
    'modules2/import/layouts/lyt-step3',
    'modules2/import/layouts/lyt-step4',
    'modules2/import/layouts/lyt-step5',
    'text!stepper/tpl-demo.html',
    'text!modules2/import/templates/tpl-step1.html',
    'text!modules2/import/templates/tpl-step2.html',
    'text!modules2/import/templates/tpl-step3.html',
    'text!modules2/import/templates/tpl-step4.html',
    'text!modules2/import/templates/tpl-step5.html',

], function($, _, Backbone, Marionette, Radio, StepperOrchestrator, Step, Step2, Step3, Step4,Step5, tpl, tpl_step1, tpl_step2, tpl_step3,tpl_step4,tpl_step5 ) {

    'use strict';

    return Marionette.LayoutView.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        className:'full-height',
        template: tpl,
        regions: {
            stepperRegion : '#stepper',
        },

        initialize: function(){
            this.model = new Backbone.Model();

        },
        onShow: function (){
             $('#stepper-header').html('IMPORT');
         },
        onRender: function(){

            var FirstStep = new Step({
                model: this.model,
                name: 'type',
                tpl: tpl_step1
            });


            var SecondStep = new Step2({
                model: this.model,
                name: 'data',
                tpl: tpl_step2
            });

            var ThirdStep = new Step3({
                model: this.model,
                name: 'detail',
                tpl: tpl_step3
            });

            var FourthStep = new Step4({
                model: this.model,
                name: 'metadata',
                tpl: tpl_step4
            });

            var FifthStep = new Step5({
                model: this.model,
                name: 'finish',
                tpl: tpl_step5
            });

            this.steps=[];
            this.steps[0]= FirstStep;            
            this.steps[1]= SecondStep;
            
            this.steps[2]= ThirdStep;
            this.steps[3]= FourthStep;
            this.steps[4]= FifthStep;

            this.stepper = new StepperOrchestrator({
                model: this.model,
                steps: this.steps
            });
            this.stepperRegion.show( this.stepper );

        },
    });
});
