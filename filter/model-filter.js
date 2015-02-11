define([
    'jquery',
    'underscore',
    'backbone',
    'config',
    'radio',
    'bbForms',
    'text!filter/tpl-filters.html',


], function($, _, Backbone, config, Radio, BbForms, tpl){
    'use strict';
    return Backbone.Model.extend({


        /*=====================================
        =            Filter Module            =
        =====================================*/
        
        initialize: function(options){
            this.channel= options.channel;
            this.radio=Radio.channel(this.channel);

            this.url = options.url;

            this.datas={};
            this.form;
            this.datas;

            this.url = options.url + 'getFilters';

            this.forms=[];
            
            
            if(options.filters){
                this.initFilters(options.filters);
            }
            else{
                this.getFields();                
            }
        }, 



        getFields: function(){
            var ctx=this;

            var jqxhr = $.ajax({
                url: ctx.url,
                data: JSON.stringify({criteria: ctx.datas}),
                contentType:'application/json',
                type:'GET',
                context: this,
            }).done(function(data){
                this.initFilters(data);
                this.datas=data;
            }).fail(function(msg){
                console.log(msg);
            });
        },

        initFilters: function(data){
            var form;
            for(var key in data){

                 form = this.initFilter(data, key);

                $('#filters').append(form.el).append('<br>');

                this.forms.push(form);
                
            };

                /*
                $('#filters #dateTimePicker').each(function(){
                    $(this).datetimepicker();
                });*/
                //$('#filters').load('filter/tpl-filters.html');


        },

        displayFilter: function(){

        },


        initFilter: function(data, key){
            var form;
            var type=data[key];
            var fieldName = key;
            var classe ='';
            if(fieldName == 'Status') classe = 'hidden';

            var md = Backbone.Model.extend({
                    schema : {
                        Column : {type: 'Hidden', title: null, value: fieldName},
                        Operator : {type : 'Select', title: null, options: this.getOpOptions(type),editorClass: 'form-control '+classe,
                         },
                            
                        Value : {
                            type : this.getFieldType(type),
                            title : fieldName,
                            editorClass: 'form-control filter', 
                            options: this.getValueOptions(type)
                        }
                    },
                    defaults: {
                        Column : fieldName,
                    }  
            });


            var mod = new md();

            form = new BbForms({
                template: _.template(tpl),
                model: mod,
                data: {
                  Column: key,
                },
                templateData: {filterName: key}
            }).render();

            return form;
        },

        /*
        setTemplate: function(tpl){
            console.log('template');
            this.template = _.template(tpl);
            
        },
        */


        getValueOptions: function(type){
            var valueOptions;
            switch(type){
                case "Select": 
                    return valueOptions = [];
                    break;
                case "DATETIME":
                    return valueOptions = [{
                        dateFormat: 'd/m/yyyy',
                        defaultValue: new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear() 
                        }];
                    break;
                default:
                    return valueOptions = '';
                    break;
            }
        },

        getOpOptions: function(type){
            var operatorsOptions;
            switch(type){
                case "String": 
                    return operatorsOptions= ['Is', 'Is not', 'Contains'];
                    break;
                case "Select": 
                    return operatorsOptions= ['Is', 'Is not'];
                    break;
                case "DATETIME":
                    return operatorsOptions= ['<', '>', '=', '<>', '<=', '>='];
                    break;
                case "Checkboxes":
                    return operatorsOptions= ['='];
                default:
                    return operatorsOptions= ['<', '>', '=', '<>', '<=', '>='];
                    break;
            }
        },

        getFieldType: function(type){
            var typeField;
            switch(type){
                case "String": 
                    return typeField="Text";
                    break;
                case 'Select': 
                    return typeField='Select';
                    break;
                case "DATETIME":
                    return typeField="BackboneDatepicker"; //DateTime
                    break;
                case 'Checkboxes':
                    return typeField="Checkboxes";
                    break;
                default:
                    return typeField="Number";
                    break;
            }  
        },

        update: function(){
            var filters= [];
            var currentForm, value;
            for (var i = 0; i < this.forms.length; i++) {
                currentForm=this.forms[i];
                console.log(currentForm.getValue());
                if(!currentForm.validate() && currentForm.getValue().Value){

                    value = currentForm.getValue();

                    /*
                    if(currentForm.getValue().Value.length == 2){
                        return false;
                    }else{ 
                        (currentForm.getValue().Value[0] == 'Active')? value['Value'] = true : value['Value'] = false;
                    }*/

                    filters.push(value);
                    


                    currentForm.$el.find('input.filter').addClass('active');
                }else{
                    currentForm.$el.find('input.filter').removeClass('active')

                };
            };
            this.radio.command(this.channel+':grid:update', { filters : filters });

            console.log(filters);
        },


        feed: function(type){
            $.ajax({
                url: config.coreUrl+'monitoredSite/'+type,
                context: this,
            }).done(function( data ) {
                this.feedOpt(type, data);
            }).fail(function( msg ) {
                console.log(msg);
            });
        },

        feedOpt: function(type, list){
            var optTpl;
            $('#'+type+' select[name=Value]').append('<option value=""></option>');
            for (var i = 0; i < list.length; i++) {
                optTpl = '<option value="'+list[i]+'">'+list[i]+'</option>';
                $('#'+type+' select[name=Value]').append(optTpl);
            };
        },


        /*
        reset: function(){
            $('#filters').find('select').each(function(){
                $(this).prop('selectedIndex',0);                
            });
            $('#filters').find('input').each(function(){
                $(this).reload();
            });
        },*/

    });
});

