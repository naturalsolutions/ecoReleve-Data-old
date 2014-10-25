define([
	'jquery',
	'underscore',
	'backbone',
    'marionette',
    'radio',
    'models/export_filter',
    'text!modules2/export/templates/export.html',
    'modules2/export/views/step1',
    'modules2/export/views/step2',
    'modules2/export/views/step3',

], function($, _, Backbone, Marionette, Radio, model, template, Step1, Step2, Step3) {

    'use strict';

    return Marionette.LayoutView.extend({
        template: template,
        className: '',

        regions: {
            mainRegion: '#first-container',
            second:'#second-container',
            step_1_Container: '#step1',
            step_2_Container: '#step2',
            step_3_Container: '#step3',
            step_4_Container: '#step4',

        },

        events: {
            'click button.btn-next' : 'nextStep',
            'click #btnPrev' : 'prevStep',
            'click #exportViewsList': 'forceNext',
        },

        viewName:'',
        query:'',

        initialize: function(options){

        	this.radio = Radio.channel('exp');

        	this.radio.comply('shared', this.initFilters, this);


            this.filters_coll = new Backbone.Collection;            //this.radio = this.Radio.channel('step');
            //Stepper.prototype.initialize.call(this);
            //this.radio.comply('step2', this.alerte, this);
        },

        onBeforeDestroy: function() {
            this.radio.reset();
        },

        onShow: function() {
        	$('.btn-next').attr('disabled', 'disabled');

            this.step_1_Container.show( new Step1());
            //$('.btn-next').attr('disabled', 'disabled');
        },

        alerte: function(args){
        	//var names = args.filters.pluck("label");
        	

            //alert(args);
        },

        initFilters: function(args){
        	this.filters_coll=args.filters;
        	this.query=args.query;
        },


        /*Go2Step2*/
        forceNext: function(e){

            //init
            this.viewName = $(e.target).get(0).attributes["value"].value;
            $('#importWizard').wizard('next');
            this.nextStep();
        },

        prevStep: function(){
            var step = $('#importWizard').wizard('selectedItem').step;
            $('.btn-next').attr('disabled', 'disabled');
            if(step ==2){
                this.step_2_Container.show( new Step2({viewName:this.viewName}));
            }
        },
        nextStep: function(){
            var step = $('#importWizard').wizard('selectedItem').step;
            $('.btn-next').attr('disabled', 'disabled');


            if(step ==2){
                this.step_2_Container.show( new Step2(
                	{
                		viewName:this.viewName,
                		model: new model({})
                	}
                ));
                console.log('step2');
            }
            if(step == 3){
                this.filters = $("#filterForView").val();
                console.log('step3');
                this.step_3_Container.show( new Step3({
                	viewName:this.viewName,
                	filters: this.filters_coll,
                	query: this.query
                }));
            }
            if(step == 4){
            	this.step_4_Container.show(new Step4({viewName: this.filtersName}));
            }
        },



    });

});
