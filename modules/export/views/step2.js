define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step2.html',

    'bbForms',
    'models/export_filter',
    'text!modules2/export/tools/tpl-filters.html'

], function($, _, Backbone , Marionette, moment, Radio, datalist, config, template, BbForms, FilterModel, tplFilters) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        events: {
            //selectField
            'change #export-view-fields': 'selectField',
            //selectOperator
            //'click #export-field-select-btn': 'selectField',
            //Check Button
            'click #filter-query-btn': 'filterQuery',
        },

        initialize: function(options) {

            this.radio = Radio.channel('exp');
            this.selectedFields = [];

            this.filterList=[];

            this.filters_coll = new Backbone.Collection;
            this.labels="";
            this.viewName= options.viewName;

            $("#filterViewName").text(this.viewName);

            this.generateFilter();

        },
        onBeforeDestroy: function() {
            this.radio.reset(); 
        },
        generateFilter : function() {
            var viewUrl = config.coreUrl + "/views/" + this.viewName + "/count";
            var jqxhr = $.ajax({
                url: viewUrl,
                context: this,
                dataType: "json"
            }).done(function(count){
                count += " records";
                $("#countViewRows").text(count);
                this.getFieldsListForSelectedView(this.viewName); //call
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
            var fieldId = fieldName.replace("@", "-");

            var operatorsOptions;

            var fieldType = $("#export-view-fields option:selected").attr('type');

            var type = $("#export-view-fields option:selected").attr('type');

            switch(type){
                case "string": 
                    operatorsOptions= ['<', '>', '<>', '=', ''];
                    break;
                default:
                    break;
            }

            //var filterModel = new FilterModel();
            console.log('test'+filterModel);

/*            filterModel.set();
*/
            
            var filterModel = new FilterModel({
                Operator: operatorsOptions,
                Value: 'Your input data'
            });

            console.log(filterModel);
            
            var form = new BbForms({
                template: _.template(tplFilters),
                model: filterModel,
                templateData: {filterName: fieldName }
            }).render();

            $('#filter-query').append(form.el);
            console.log(filterModel.get("label"));

/*            form.on('Operator:change', function(form, titleEditor, extra) {
                  console.log(':: Value changed to "' + titleEditor.getValue() + '".');
             });*/

            this.filterList.push(form);

            console.log(filterModel.get("label"));

            $('#export-filter-list').append(form.el);


            var ln = this.selectedFields.length;
            var isSelected = false;
            if (fieldName === "") {
                isSelected = true;
            } else {
                if (ln > 0) {
                    for (var i = 0; i < ln; i++) {
                        if (this.selectedFields[i] == fieldId) {
                            isSelected = true;
                            return;
                        }
                    }
                }
            }


            


            if (isSelected === false) {
                var fieldType = $("#export-view-fields option:selected").attr('type');



                var fieldIdattr = fieldName.replace("@", "-");
                // generate operator
                var operatorDiv = this.generateOperator(fieldType,fieldIdattr);
                var inputDiv = this.generateInputField(fieldType,fieldIdattr);




                var fieldFilterElement = "<div class ='row-fluid filterElement' id='div-" + fieldIdattr + "'><div class='span4 name' >" + fieldName + "</div><div class='span1 operator'>" + operatorDiv + "</div><div class='span3 exportFilterRowVal'>";


                fieldFilterElement += inputDiv + "</div><div class='span3'><span id='filterInfoInput'></span></div><div class='span1'><a cible='div-" + fieldIdattr + "' class='btnDelFilterField'><img src='assets/img/export/Cancel.png'/></a></div></div>";


                $("#export-filter-list").append(fieldFilterElement);
                $("#export-filter-list").removeClass("masqued");
                $('#filter-query').removeClass("masqued");


                this.selectedFields.push(fieldIdattr);

                



            }
        },

        generateOperator: function(type, id) {




            var operatorDiv;
            switch (type) {
                case "string":
                    operatorDiv = "<select id='"+id+"' class='filter-select-operator'><option>=</option><option>LIKE</option><option>IN</option><option>IS NOT NULL</option><option>IS NULL</option></select>"; //"LIKE";
                    break;
                case "integer":
                    operatorDiv = "<select id='"+id+"' class='filter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option><option>IS NOT NULL</option><option>IS NULL</option></select>";
                    break;
                    /*case "datetime":
            operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option></select>";
              break;*/
                case "text":
                    operatorDiv = "<select id='"+id+"' class='filter-select-operator'><option>=</option><option>LIKE</option><option>IN</option><option>IS NOT NULL</option><option>IS NULL</option></select>"; //"LIKE";
                    break;
                default:
                    operatorDiv = "<select id='"+id+"' class='filter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option><option>IS NOT NULL</option><option>IS NULL</option></select>";
            }
            return operatorDiv;
        },



        generateInputField: function(type, id) {
            var inputDiv = "";
            switch (type) {
                case "datetime":
                    inputDiv = "<input id='in_"+id+"' type='date' placeholder='YYYY-MM-DD' class='fieldval'/>";
                    break;
                default:
                    inputDiv = "<input id='in_"+id+"' type='text' class='fieldval'/>";
            }
            return inputDiv;
        },


        /*check*/
        filterQuery: function() {

            
            for (var i = 0; i < this.filterList.length; i++) {
                console.log(this.filterList[i]);
            };

            var fieldName, operator, condition;

            this.filters_coll.reset();

            var query = "";
            var self = this;
            $(".filterElement").each(function() {



                fieldName = $(this).find("div.name").text();
                condition = $(this).find("input.fieldval").val();
                operator = $(this).find("select.filter-select-operator option:selected").text();



                self.filters_coll.push({
                    label: fieldName,
                    operator: condition,
                    value: operator
                });


                if (operator == "IN") {
                    query += fieldName+'='+operator +','+condition.replace(';','|')+'&';
                }
                else if (operator == "IS NOT NULL" || operator == "IS NULL") {
                    query += fieldName+'='+operator+'&';
                }
                else{
                    query += fieldName+'='+operator +','+condition+'&';
                    //query += Anne=>,2012&
                }
                /*if (operator == "LIKE") {
                    operator = " LIKE ";
                }
                if (operator == "IN") {
                    operator = " IN ";
                }
                if (operator == "IS NOT NULL" || operator == "IS NULL") {
                    operator =" "+operator;//.replace(/ /g,'');
                }

                query += fieldName + operator + condition + ",";*/
            });


            // delete last character "&"

            
            query = query.substring(0, query.length - 1);
            var selectedView = this.viewName;
            $("#filterForView").val(query);
            this.getFiltredResult("filter-query-result", query, selectedView);
            this.query = query;
            


            this.radio.command('shared', {
                filters: this.filters_coll,
                query: this.query
             });



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

    });
});
