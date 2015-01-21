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
            var key;
            for(key in data){

                var form;
                var type=data[key];
                var fieldName = key;
                var schm={};


                if(type!='BIT'){
                    schm['Column'] = {type: 'Hidden', title: null, value: fieldName};    

                    schm['Operator'] = {type : 'Select', title: null, options: this.getOpOptions(type), editorClass: 'form-control' };

                    schm['Value'] = {
                        type : this.getFieldType(type),
                        title : fieldName,
                        editorClass: 'form-control', 
                        options: [{  
                            dateFormat: 'd/m/yyyy',
                            defaultValue: new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear() 
                        }] };
                    

                    form = new BbForms({
                        template: _.template(tpl),
                        schema: schm,
                        data: {
                          Column: fieldName,
                        },
                        templateData: {filterName: key}
                    }).render();
                    $('#filters').append(form.el);



                    this.forms.push(form);
                }
            };

                /*
                $('#filters #dateTimePicker').each(function(){
                    $(this).datetimepicker();
                });*/
                //$('#filters').load('filter/tpl-filters.html');


        },


        displayFilter: function(){

        },

        /*
        setTemplate: function(tpl){
            console.log('template');
            this.template = _.template(tpl);
            
        },
        */

        getOpOptions: function(type){
            var operatorsOptions;
            switch(type){
                case "String": 
                    return operatorsOptions= ['Not Like', 'Like'];
                    break;
                case "DATETIME":
                    return operatorsOptions= ['<', '>', '=', '<>', '<=', '>='];
                    break;
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
                case "DATETIME":
                    return typeField="BackboneDatepicker"; //DateTime
                    break;
                default:
                    return typeField="Number";
                    break;
            }  
        },

        update: function(){
            var filters= [];
            var currentForm;
            for (var i = 0; i < this.forms.length; i++) {
                currentForm=this.forms[i];
                if(!currentForm.validate()){
                    filters.push(currentForm.getValue());
                }
            };
            this.radio.command(this.channel+':grid:update', { filters : filters });
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
