define([
    'marionette',
    'radio',
    'text!modules2/export/templates/export.html',
    'modules2/export/views/step1',
    'modules2/export/views/step2',
    'modules2/export/views/step3',

], function(Marionette, Radio, template, Step1, Step2, Step3) {

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
        },

        events: {
            'click button.btn-next' : 'nextStep',
            'click #btnPrev' : 'prevStep',
            'click #exportViewsList': 'forceNext',
        },

        viewName:'',
        filters:'',

        initialize: function(options){
            //this.radio = this.Radio.channel('step');
            //Stepper.prototype.initialize.call(this);
            //this.radio.comply('step2', this.alerte, this);
            console.log('testcache');
        },

        onBeforeDestroy: function() {
            //this.radio.reset();
        },

        onShow: function() {
            this.step_1_Container.show( new Step1());
            //$('.btn-next').attr('disabled', 'disabled');
        },

        alerte: function(){
            alert('alerte');
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
                this.step_2_Container.show( new Step2({viewName:this.viewName}));
                console.log('step2');
            }
            if(step == 3){
                this.filters = $("#filterForView").val();
                console.log('step3');
                this.step_3_Container.show( new Step3({viewName:this.viewName, filters: this.filters}));
            }
            if(step == 4){

            }
        },



    });

});
