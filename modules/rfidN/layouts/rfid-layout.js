var rfid='rfidN';
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'bbForms',
    'modules2/'+rfid+'/views/rfid-grid',
    'modules2/'+rfid+'/views/rfid-map',
    'text!modules2/'+rfid+'/templates/rfid-tpl.html',
    'text!modules2/'+rfid+'/tools/tpl-filters.html',

], function($, _, Backbone, Marionette, config, Radio,
    BbForms, 
    ViewGrid, ViewMap,
    tpl, tplFilters) {

    return Marionette.LayoutView.extend({
        className: 'full-height',
        template: tpl,

        events: {
            'click button#update' : 'update',
            'click button#display-grid' : 'displayGrid',
            'click button#display-map' : 'displayMap',
            'click button#today' : 'today',
            'click button#reset' : 'reset',
            'click button#add' : 'add',
            'click button#deploy' : 'deploy',
        },

        initialize: function(){
            this.radio = Radio.channel('route');
            this.datas={};
            this.form;
            this.datas;

            var url = config.coreUrl + 'rfid/getFields';

            var jqxhr = $.ajax({
                url: url,
                data: JSON.stringify({criteria: this.datas}),
                contentType:'application/json',
                type:'POST',
                context: this,
            }).done(function(data){
                this.initFilters(data);
                this.datas=data;
                
            }).fail(function(msg){
                console.log(msg);
            });

            this.forms=[];
        },
        onShow: function(){
            //this.initFilters();

            this.map= new ViewMap();
            this.grid= new ViewGrid();

        },

        displayGrid: function(){
            $('.pannel-map').removeClass('active');
            $('.pannel-grid').addClass('active');
        },

        displayMap: function(){
            $('.pannel-grid').removeClass('active');
            $('.pannel-map').addClass('active');
        },

        onDestroy: function() {
            $('body').removeClass('');
        },

        initFilters: function(data){
 
            
            for(key in data){
                var form;
                var type=data[key];
                var fieldName = key;
                var schm={};



                schm['Column'] = {type: 'Hidden', title:'Column', value: fieldName};    

                schm['Operator'] = {type : 'Select', title:null, options: this.getOpOptions(type), editorClass: 'form-control' };

                schm['Value'] = {
                    type : this.getFieldType(type), 
                    editorClass: 'form-control', 
                    options: [{  
                        dateFormat: 'd/m/yyyy',
                        defaultValue: new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear() 
                    }] };

                form = new BbForms({
                    template: _.template(tplFilters),
                    schema: schm,
                    data: {
                      Column: fieldName,
                    },
                    templateData: {filterName: key}
                }).render();
                $('#filters').append(form.el);

                this.forms.push(form);
            };


                $('#filters #dateTimePicker').each(function(){
                    $(this).datetimepicker();
                });
            
        },

        displayFilter: function(elem){

        },


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
                    console.log(currentForm.getValue());
                }
            };
            this.grid.update(filters);
            this.map.update(filters);
        },

        today: function(){
            var filters=[];
            var today = new Date();
            today.setHours(00);
            today.setMinutes(00);
            today.setSeconds(01);
            filters.push({"Column":"begin_date","Operator":">","Value": today});
            today.setHours(23);
            today.setMinutes(59);
            today.setSeconds(59);
            filters.push({"Column":"end_date","Operator":"<","Value": today});

            console.log(filters);

            this.grid.update(filters);
            this.map.update(filters);

        },

        reset: function(){
            $('#filters').empty();
            this.forms=[];
            this.initFilters(this.datas);

            var filters=[];
            this.grid.update(filters);
            this.map.update(filters);

        },


        add: function(){
            this.radio.command('rfidN:add');
        },
        deploy: function(){
            this.radio.command('rfidN:deploy');
        },

        save: function(){
            this.grid.save();
        },

    });
});
