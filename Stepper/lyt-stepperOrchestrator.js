define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'stepper/lyt-step',
    'text!stepper/tpl-stepperOrchestrator.html',

], function($, _, Backbone, Marionette, Radio, LS, tpl) {

    'use strict';

    return Marionette.LayoutView.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        template: tpl,

        events: {
            'click #infos' : 'infos',
            'click #btnNext' : 'nextStep',
            'click #btnPrev' : 'prevStep',
        },

        regions: {
            StepManager: '#StepManager',
            step_content: '#step-content',
            actions: '#actions',
        },

        currentStep:0,



        
        onDestroy: function(){

        },

        initialize: function(options){
            this.steps=options.steps;
            var current;
            for(var i=0; i < this.steps.length; i++){
                current=this.steps[i];
                current.parent = this;
            }
            this.model=options.model;
            this.listenTo(this.model,'change', this.modelChanged);
            this.keyboard();
            
        },


        onShow: function(){

        },

        onRender: function(){
            this.initNavSteps();
            this.toStep(0);
        },

        initNavSteps: function(){
            for (var i = 0; i < this.steps.length; i++) {
                this.$el.find('#step-nav').append('<li class="step-item" id='+this.steps[i].name+'><span class="badge">'+i+'</span><span class="hidden-xs">'+this.steps[i].name+'</span><span class="chevron"></span></li>');
            };            
        },

        modelChanged:function(){
            this.check();
            //this.resetFromStep();
        },


        resetFromStep:function(){
            for (var i=this.currentStep+1; i < this.steps.length; i++){
                this.steps[i].reset();
            }
        },


        keyboard: function(){
            var ctx=this;
            $(document).keydown(function(e) {

                switch(e.which) {
                    case 37: // left
                        if(e.ctrlKey)
                        ctx.prevStep();
                    break;

                    case 38: // up
                    break;

                    case 39: // right
                        if(e.ctrlKey)
                        ctx.nextStep();
                    break;

                    case 40: // down
                    break;

                    default: return; // exit this handler for other keys
                }
                //e.preventDefault(); // prevent the default action (scroll / move caret)
            });
        },

        /*==========  Next / Prev  ==========*/

        nextStep: function(){
            if(this.steps[this.currentStep].nextOK()) {
                this.currentStep++;
                this.toStep(this.currentStep);
            }
        },

        prevStep: function(){
            this.currentStep === 0 ? this.currentStep : this.currentStep--;
            this.toStep(this.currentStep);
        },
        

        toStep: function(numstep){
           
            this.currentStep = numstep;
            this.step_content.show( this.steps[this.currentStep], {preventDestroy: true} );
            this.check();
            this.styleNav();

            if (this.currentStep==this.steps.length-1){
                this.$el.find('#btnNext').attr( 'disabled', 'disabled');
            }
        },


        check: function(){
            if(this.steps[this.currentStep].validate()) {
                this.$el.find('#btnNext').removeAttr('disabled');                
            }
            else{
                this.$el.find('#btnNext').attr( 'disabled', 'disabled' );
            }
        },


        /*==========  Style Nav Steps  ==========*/

        styleNav: function(){
            this.$el.find('#step-nav li.step-item.active').removeClass('active');
            this.$el.find('#step-nav li#'+this.steps[this.currentStep].name).addClass('active');
            for (var i = 0; i < this.currentStep; i++) {
               this.$el.find('#step-nav li#'+this.steps[i].name).addClass('complete');
            };
            for (var i = this.currentStep; i < this.steps.length; i++) {
               this.$el.find('#step-nav li#'+this.steps[i].name).removeClass('complete');
            };
        },


        GetStepByName: function(StepName){
               for (var i=0; i < this.steps.length; i++){
                if (this.steps[i].name == StepName ) return this.steps[i].Name ;
            }  
            return null;
        },

        
        infos: function(){
            console.log(this.model);
        },

        


    });

});
