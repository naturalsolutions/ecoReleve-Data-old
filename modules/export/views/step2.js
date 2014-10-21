define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step2.html'
], function($, _, Backbone , Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        events: {
            //selectField
            'change #export-view-fields': 'selectField',
            //selectOperator
            'click #export-field-select-btn': 'selectField',
            //Next Button
            'click #filter-query-btn': 'filterQuery',
        },
        initialize: function(options) {
            this.viewName=options.viewName;
            this.selectedFields = [];
            $("#filterViewName").text(this.viewName);
            this.generateFilter(this.viewName);
        },


        generateFilter : function(viewName) {
            var viewUrl = config.coreUrl + "/views/" + this.viewName + "/count";
            var count;
            var jqxhr = $.ajax({
                url: viewUrl,
                context: this,
                dataType: "json"
            }).done(function(data){
                count=data;
                count += " records";
                $("#countViewRows").text(count);
                this.getFieldsListForSelectedView(this.viewName);
            }).fail(function(msg){
                $("#countViewRows").text("error !");
            });
        },

        getFieldsListForSelectedView : function(viewName) {
            var viewUrl = config.coreUrl + "/views/details/" + this.viewName;


            var jqxhr = $.ajax({
                url: viewUrl,
                context: this,
                dataType: "json"
            }).done(function(data){
                var fieldsList = [];
                var exportFieldsList = [];
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
            // check if field is already selected
            var ln = this.selectedFields.length;
            var isSelected = false;
            if (fieldName === "") {
                isSelected = true;
            } else {
                if (ln > 0) {
                    for (var i = 0; i < ln; i++) {
                        if (this.selectedFields[i] == fieldId) {
                            isSelected = true;
                            break;
                        }
                    }
                }
            }

            if (isSelected === false) {
                var fieldType = $("#export-view-fields option:selected").attr('type');
                var fieldIdattr = fieldName.replace("@", "-");
                // generate operator
                var operatorDiv = this.generateOperator(fieldType,fieldIdattr);

                var fieldFilterElement = "<div class ='row-fluid filterElement' id='div-" + fieldIdattr + "'>" 
                    + fieldName /*select*/ + "" + operatorDiv /*input*/ + " <br /> ";

                var inputDiv = this.generateInputField(fieldType,fieldIdattr);
                fieldFilterElement += inputDiv + "<a cible='div-" + fieldIdattr + "' class='btnDelFilterField'><img src='assets/img/export/Cancel.png'/></a></div>";

                $("#export-filter-list").append(fieldFilterElement);
                $("#export-filter-list").removeClass("masqued");
                $('#filter-query').removeClass("masqued");


                this.selectedFields.push(fieldIdattr);
            }
        },

        generateOperator: function(type, id) {
            var operatorDiv;


            /*AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA*/
            switch (type) {
                case "string":
                    operatorDiv = "<select id='"+id+"' class='form-control filter-select-operator'><option>=</option><option>LIKE</option><option>IN</option><option>IS NOT NULL</option><option>IS NULL</option></select>"; //"LIKE";
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
                    operatorDiv = "<select id='"+id+"' class=' form-controlfilter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option><option>IS NOT NULL</option><option>IS NULL</option></select>";
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
            var query = "";
            var self = this;
            $(".filterElement").each(function() {

                var fieldName = $(this).find("div.name").text();
                var condition = $(this).find("input.fieldval").val();
                var operator = $(this).find("select.filter-select-operator option:selected").text();

                if (operator == "IN") {
                    query += fieldName+'='+operator +','+condition.replace(';','|')+'&';
                }
                else if (operator == "IS NOT NULL" || operator == "IS NULL") {
                    query += fieldName+'='+operator+'&';
                }
                else{
                    query += fieldName+'='+operator +','+condition+'&';
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
        },


        getFiltredResult: function(element, query, view) {
            $("#" + element + "").html();
            $("#" + element + "").html('<img src="images/ajax-loader-linear.gif" />');
            //var serverUrl = localStorage.getItem("serverUrl");
            //var serverUrl = app.config.serverUrl;
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
                        this.selectExtend();
                    }
            }).fail(function(msg){
                    $("#filter-query-result").html(' <h4>error</h4>');
            });
        },

        selectExtend: function() {
            var selectedView = this.viewName;
            var filterValue = $("#filterForView").val();
            if ((this.selectedFields.length > 0) && (!this.query)) {
                var getFilter = this.filterQuery();
                $.when(getFilter).then(function() {

                    //app.views.filterValue = $("#filterForView").val();

                });
            } else if (this.selectedFields.length === 0) {
                    //app.views.filterValue = "";
            
            } else {
                //app.views.filterValue = filterValue;
            }
        },

        





    });
});
