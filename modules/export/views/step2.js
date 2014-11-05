define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step2-filters.html',
    'bbForms',
    'models/export_filter',
    'text!modules2/export/tools/tpl-filters.html',
    'ol3'
], function($, _, Backbone , Marionette, moment, Radio,
 datalist, config, template, BbForms, FilterModel, tplFilters, ol) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        events: {
            'change #export-view-fields': 'selectField',
            'click #filter-query-btn': 'check',
        },



        initialize: function(options) {
            this.radio = Radio.channel('exp');


            this.selectedFields = [];
            this.filterList=[];
            this.filterInfosList= {};
            //this.filters_coll = new Backbone.Collection;
            this.labels="";
            this.viewName= options.viewName;


            this.generateFilter();
            this.getFieldsListForSelectedView(this.viewName);




        },
        onShow: function(){
            $("#filterViewName").text(this.viewName);
        },
        onBeforeDestroy: function() {
            this.radio.reset(); 
        },

        generateFilter : function() {
            var viewUrl = config.coreUrl + "/views/" + this.viewName + "/count";
            var jqxhr = $.ajax({
                url: viewUrl,
                context: this,
                dataType: "json",
            }).done(function(count){
                console.log('plouf');
                count += " records";

                $("#countViewRows").text(count);
                 //call
            }).fail(function(msg){
                $("#countViewRows").text("error !");
            });
        },
        getFieldsListForSelectedView : function() {
            var viewUrl = config.coreUrl + "/views/details/" + this.viewName;
            var jqxhr = $.ajax({
                url: viewUrl,
                context: this,
                dataType: "json"
            }).done(function(data){
                var fieldsList = [];
                var exportFieldsList =[];
                for (var i = 0; i < data.length; i++) {
                    var optionItem = "<option type='" + data[i].type + "'>" + data[i].name + "</option>";
                    $("#export-view-fields").append(optionItem);
                    exportFieldsList.push(data[i].name);
                }
                $("#filter-btn").removeClass("masqued");
            }).fail(function(msg){
                alert('error');
            });
        },




        selectField: function() {
            var fieldName = $("#export-view-fields option:selected").text();
            //var fieldId = fieldName.replace("@", "-");


            /**
            *
            * Instanciate a new FilterModel // Filter
            *
            **/
            
            
            var filterModel = new FilterModel({
                Column: fieldName,
                Operator: operatorsOptions,
                Value: 'Default Data'
            });

            //console.log(filterModel);
            
            /**
            *
            * Instanciate a new BbForm
            *
            **/
            


            var form = new BbForms({
                template: _.template(tplFilters),
                model: filterModel,
                templateData: {filterName: fieldName }
            }).render();


            



            /**
            *
            * Set options per type
            *
            **/
            var operatorsOptions;
            var type = $("#export-view-fields option:selected").attr('type');
            switch(type){
                case "string": 
                    operatorsOptions= ['>', '<>', '='];
                    form.fields.Operator.editor.setOptions(operatorsOptions);
                    break;
                default:
                    break;
            }


            $('#filter-query').append(form.el);
            this.filterList.push(form);

            form.on('Operator:change', function(form, titleEditor, extra) {
                  console.log(':: Value changed to "' + titleEditor.getValue() + '".');

            });



            //console.log(filterModel.get("label"));

            /*ergo*/
            $('#export-filter-list').append(form.el).removeClass('masqued');
            $('#filter-query').removeClass("masqued");
        },


        /*check*/
        filterQuery: function() {
            var currentFilter;


            /**
            *
            * Push filters
            *
            **/
            
            for (var i = 0; i < this.filterList.length; i++) {
                var currentForm=this.filterList[i];
                //console.log(currentForm.getValue());
                if(!currentForm.validate()){
                    this.filterInfosList.filters.push(currentForm.getValue());
                }
            };



            /**
            *
            * Ajax Call
            *
            **/
            





            var fieldName, operator, condition;

            //this.filters_coll.reset();

            var query = "";
            var self = this;
            $(".filterElement").each(function() {



                fieldName = $(this).find("div.name").text();
                condition = $(this).find("input.fieldval").val();
                operator = $(this).find("select.filter-select-operator option:selected").text();


                /*
                self.filters_coll.push({
                    label: fieldName,
                    operator: condition,
                    value: operator
                });
                */
            });


            // delete last character "&"
            
            
            

            


        },

        removeFilter: function(){

        },

        check: function(){
            this.filterInfosList= {
                viewName: this.viewName,
                filters: []
            } 

            /**
            *
            * push filter if it passes validation
            *
            **/

            var currentForm;
            for (var i = 0; i < this.filterList.length; i++) {
                currentForm=this.filterList[i];
                //console.log(currentForm.getValue());
                if(!currentForm.validate()){
                    this.filterInfosList.filters.push(currentForm.getValue());
                }
            };


            /**
            *
            * Call
            *
            **/
            

            var viewUrl = config.coreUrl + "/views/filter/" + this.viewName + "/count" ;
            $.ajax({
                url: viewUrl,
                data: JSON.stringify({criteria:this.filterInfosList}),
                contentType:'application/json',
                type:'POST',
                context: this,
            }).done(function(count){
                console.log('success: '+count);
                $('#geo-query-result').html(count);
                this.validate();
            }).fail(function(msg){
                console.log(msg);
            });


        },



        validate: function(){
            this.radio.command('filters', {
                filters: this.filterInfosList,
            });
            this.radio.command('filters2map', {
                filters: this.filterInfosList,
            });
            $('.btn-next').removeAttr('disabled');
        },


        getFiltredResult: function(element, query, view) {
            var viewUrl = config.coreUrl + "/views/filter/" + view + "/count?" + query;
            $.ajax({
                url: viewUrl,
                dataType: "json",
                context: this,
            }).done(function(count){
                $("#filter-query-result").html(' <br/><p>filtred count:<span> ' + count + ' records</span></p>');
                if(count!=0){
                    $('.btn-next').removeAttr('disabled');
                    var filterValue = $("#filterForView").val();
                }
            }).fail(function(msg){
                $("#filter-query-result").html(' <h4>error</h4>');
            });
        },




        /**
        *
        * Map
        *
        **/


    });


    /**
    *
    * Map
    *
    **/
    
});
