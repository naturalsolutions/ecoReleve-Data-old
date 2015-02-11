define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'text!modules2/import/templates/tpl-step1.html',

    /*import GPX */
    'modules2/import/_gpx/layouts/lyt-stepOrchestrator',
    'modules2/import/_gpx/layouts/lyt-step2',
    'modules2/import/_gpx/layouts/lyt-step3',
    'modules2/import/_gpx/layouts/lyt-step4',
   
    'text!modules2/import/_gpx/templates/tpl-step2.html',
    'text!modules2/import/_gpx/templates/tpl-step3.html',
    'text!modules2/import/_gpx/templates/tpl-step4.html',

    /*import RFID */
    'modules2/import/_rfid/layouts/lyt-stepOrchestrator', 
    'modules2/import/_rfid/layouts/lyt-step1',
    'modules2/import/_rfid/layouts/lyt-step2',

    'text!modules2/import/_rfid/templates/tpl-step1.html',
    'text!modules2/import/_rfid/templates/tpl-step2.html',


    /*import GSM */

    'modules2/import/_gsm/layouts/lyt-stepOrchestrator', 
    'modules2/import/_gsm/layouts/lyt-step1',

    'text!modules2/import/_gsm/templates/tpl-step1.html',

], function($, _, Backbone, Marionette, Radio, tpl_step1, 

        /*GPX*/  
    GPX_StepperOrchestrator, GPX_Step2, GPX_Step3, GPX_Step4, 
    GPX_tpl_step2, GPX_tpl_step3,GPX_tpl_step4,

        /* RFID*/
    RFID_StepperOrchestrator, RFID_Step2, RFID_Step3,
    RFID_tpl_step1, RFID_tpl_step2,

        /*GSM*/
    GSM_StepperOrchestrator, GSM_Step2, 
    GSM_tpl_step2


    ) {

    'use strict';

    return Marionette.LayoutView.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        className:'container full-height',
        template: tpl_step1,
        regions: {
            stepperRegion : '#stepper',
        },

        events: {
            'click #radio-tile': 'checkRadio',
            'click #nextStepper': 'nextStepper'
        },

        initialize : function(options){
            if (options.type) {
                this.type = options.type;
                console.log(this.type)
            }
            else
                this.type = 'gpx';
            this.model = new Backbone.Model(); 
        },
        init_GSM_stepper : function() {
            

            var SecondStep = new GSM_Step2({
                model: this.model,
                name: 'Data',
                tpl: GSM_tpl_step2
            });

            this.GSM_steps=[];           
            this.GSM_steps[0]= SecondStep;
            this.GSM_stepper = new GSM_StepperOrchestrator({
                model: this.model,
                steps: this.GSM_steps
            });

        },

        init_RFID_stepper : function() {
        

            var SecondStep = new RFID_Step2({
                model: this.model,
                name: "RFID-decoder",
                tpl: RFID_tpl_step1
            });

            var ThirdStep = new RFID_Step3({
                model: this.model,
                name: 'Data',
                tpl: RFID_tpl_step2
            });

            this.RFID_steps=[];           
            this.RFID_steps[0]= SecondStep;
            this.RFID_steps[1]= ThirdStep;

            this.RFID_stepper = new RFID_StepperOrchestrator({
                model: this.model,
                steps: this.RFID_steps
            });

            
        },

        init_GPX_stepper : function() {
   

            var SecondStep = new GPX_Step2({
                model: this.model,
                name: 'Data',
                tpl: GPX_tpl_step2
            });

            var ThirdStep = new GPX_Step3({
                model: this.model,
                name: 'Detail',
                tpl: GPX_tpl_step3
            });

            var FourthStep = new GPX_Step4({
                model: this.model,
                name: 'Metadata',
                tpl: GPX_tpl_step4
            });

            this.GPX_steps=[];           
            this.GPX_steps[0]= SecondStep;
            
            this.GPX_steps[1]= ThirdStep;
            this.GPX_steps[2]= FourthStep;

            this.GPX_stepper = new GPX_StepperOrchestrator({
                model: this.model,
                steps: this.GPX_steps
            });

        },

        onShow : function (){
            $('body').addClass('home-page full-height');
            $('#stepper-header').html('IMPORT');
            $('#main-region').addClass('full-height obscur');
         },
        onDestroy : function () {

            $('#main-region').removeClass('obscur');
        },

        onRender : function(){
        },

        checkRadio : function(e) {

            this.$el.find('input').each(function(){
                $(this).prop('checked', false).removeAttr('checked');
         
            });
            var tile = $(e.currentTarget);
            var radio = tile.find('input');
            radio.prop('checked',true).attr('checked','checked');
            this.type = radio.val();

            if (radio.val() == 'gps-gpx')  
                $('#info-GPX').show();
            else 
                $('#info-GPX').hide(); 
        },

        nextStepper : function(){

            switch(this.type) {
                case 'gpx':
                    this.init_GPX_stepper();
                    this.stepperRegion.show( this.GPX_stepper );
                    break;
                case 'rfid':
                    this.init_RFID_stepper();
                    
                    this.stepperRegion.show( this.RFID_stepper );
                    break;
                case 'gsm':
                    this.init_GSM_stepper();
                    this.stepperRegion.show( this.GSM_stepper );
                
                    break;
            };

               
        },
        
    });
});