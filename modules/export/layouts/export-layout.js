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
    'modules2/export/views/step2-map',

    'modules2/export/views/step3-map',

    'modules2/export/views/step4',
    'modules2/export/views/step4-preview',

    'modules2/export/views/step5',
    'fuelux'



], function($, _, Backbone, Marionette, Radio, model, template, 
    Step1, Step2_Filters, Step2_Map, Step3_Map, Step4_Columns, Step4_Preview, Step5) {

    'use strict';

    return Marionette.LayoutView.extend({
        template: template,
        className: 'full-height',

        
        regions: {
            step_1_Container: '#step1',

            step_2_Filters_Container: '#step2-filters',
            step_2_Map_Container: '#step2-map',

            step_3_Map_Container: '#step3-map',

            step_4_Columns_Container: '#step4-columns',
            step_4_Preview_Container: '#step4-preview',

            step_5_Container: '#step5',
        },

        events: {
            'click button.btn-next' : 'nextStep',
            'click button.btn-prev' : 'prevStep',
        },


        initialize: function(){
        	this.radio = Radio.channel('exp');

        	this.radio.comply('filters', this.initFilters, this);
            this.radio.comply('columns', this.initColumns, this);
            this.radio.comply('box', this.initBox, this);
            this.radio.comply('viewName', this.initViewName, this);

            this.filters_coll;
            this.columns, this.box;

            $('body').addClass('export-layout');
            $('body').addClass('home-page');
            $('#main-region').addClass('full-height obscur');
        },

        initViewName: function(args){
        	this.viewName=args.viewName;
        	console.log(this.viewName);
        },
        initFilters: function(args){
            this.filters_coll=args.filters;
            console.log(this.filters_coll);
        },
        initColumns: function(args){
            this.columnCriteria=args.columns;
            console.log(this.columnCriteria);
        },
        initBox: function(args){
            this.boxCriteria=args.box;
            console.log(this.boxCriteria);
        },

        onBeforeDestroy: function() {
            this.radio.reset();
            $('body').removeClass('export-layout');
            $('#main-region').removeClass('obscur');
        },
        
        onShow: function() {
        	$('.btn-next').attr('disabled', 'disabled');
            var step1= new Step1();
            var passed='passed2';
            this.step_1_Container.show( step1 );
            $('body').addClass('home-page');
            $('#main-region').addClass('full-height obscur');
        },

        alerte: function(args){
            alert(args);
        },

        prevStep: function(){
            $('#importWizard').wizard('previous');
        },

        nextStep: function(){

            
            $('#importWizard').wizard('next');
            var step = $('#importWizard').wizard('selectedItem').step;
            $('.btn-next').attr('disabled', 'disabled');

            
            switch(step) {
                case 1:
                    break;
                case 2:
                    this.step_2_Filters_Container.show( new Step2_Filters(
                        {
                            viewName:this.viewName,
                        }
                    ));
                    this.step_2_Map_Container.show( new  Step2_Map({
                        viewName:this.viewName,
                    }));
                    break;
                case 3:
                    this.step_3_Map_Container.show( new  Step3_Map({
                        viewName:this.viewName,
                        filters: this.filters_coll,
                    }));
                    break;
                case 4:
                    this.step_4_Columns_Container.show( new Step4_Columns({
                        viewName:this.viewName,
                        filters: this.filters_coll,
                    }));
                    this.step_4_Preview_Container.show( new Step4_Preview({
                        viewName:this.viewName,
                        filterCriteria: this.filters_coll,
                        boxCriteria: this.boxCriteria,
                    }));
                    break;
                case 5:
                    this.step_5_Container.show( new Step5({
                        viewName:this.viewName,
                        filterCriteria: this.filters_coll,
                        boxCriteria: this.boxCriteria,
                        columnCriteria: this.columnCriteria
                    }));
                    break;

                default:
                    break;

            }
        },


    });

});
