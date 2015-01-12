define([
	'jquery',
	'underscore',
	'backbone',
    'marionette',
    'radio',
    'modules2/input/layouts/lyt-stepOrchestrator',  //'stepper/lyt-stepperOrchestrator',
    //'stepper/lyt-step',
    'modules2/input/layouts/lyt-step1',
    'modules2/input/layouts/lyt-step2',
    'modules2/input/layouts/lyt-step3',
    'modules2/input/layouts/lyt-step4',
    'text!stepper/tpl-demo.html',
    'text!modules2/input/templates/tpl-step1.html',
    'text!modules2/input/templates/tpl-step2.html',
    'text!modules2/input/templates/tpl-step3.html',
    'text!modules2/input/templates/tpl-step4.html',
     'modules2/input/layouts/individual-list'

], function($, _, Backbone, Marionette, Radio, StepperOrchestrator, Step1, Step2, Step3, Step4, tpl, tpl_step1, tpl_step2, tpl_step3,tpl_step4,IndivFilter) {

    'use strict';

    return Marionette.LayoutView.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        
        template: tpl,
        className: 'full-height',

        regions: {
            stepperRegion : '#stepper',
            indivFilterRegion : '#indivFilter'
        },
        events : {
            'click span.picker': 'filterIndivShow',
            'click button.filterClose' : 'filterMask',
        },
        initialize: function(){
            this.model = new Backbone.Model();
        },

        onRender: function(){

            var FirstStep = new Step1({
                model: this.model,
                name: 'start',
                tpl: tpl_step1
            });

            var SecondStep = new Step2({
                model: this.model,
                name: 'station',
                tpl: tpl_step2
            });

            var ThirdStep = new Step3({
                model: this.model,
                name: 'protocols',
                tpl: tpl_step3
            });

            var FourthStep = new Step4({
                model: this.model,
                name: 'end',
                tpl: tpl_step4
            });

            this.steps=[];
            this.steps[0]= FirstStep;            
            this.steps[1]= SecondStep;
            this.steps[2]= ThirdStep;
            this.steps[3]= FourthStep;

            this.stepper = new StepperOrchestrator({
                
                model: this.model,
                steps: this.steps
            });
            this.stepperRegion.show( this.stepper );
        },
        onShow : function(){
            // add indiv window container
            $('#stepper').append('<div id="indivFilter"></div>');
        },
        filterIndivShow : function(e){
            $(e.target).parent().parent().find('input').addClass('target');
            var modal = new IndivFilter();
            // navigate to the modal by simulating a click
            var element = '<a class="btn" data-toggle="modal" data-target="#myModal" id="indivIdModal">-</a>';
            $('body').append(element);
            this.indivFilterRegion.show(modal);
            $('#indivIdModal').click();
        },
        filterMask : function(){
            var inputIndivId = $('input.pickerInput');
            $(inputIndivId).removeClass('target');
            this.indivFilterRegion.reset();
            $('#indivIdModal').remove();
            $('div.modal-backdrop.fade.in').remove();
        }
    });
});
