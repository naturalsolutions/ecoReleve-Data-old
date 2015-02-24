define([
    'jquery',
    'underscore',
    'marionette',
    'radio',
    'config',
    'bbForms',
    'text!modules2/site/templates/tpl-create.html',
    'ns_modules_map/ns_map',
], function($, _, Marionette, Radio, config, BbForms, tpl, NsMap) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'full-height',
        template: tpl,

        events: {
            'click button#create' : 'create',
            'blur #field-lat input': 'majMap',
            'blur #field-lng input': 'majMap',
        },

        initialize: function() {
        },

        majMap: function(e){
            var lat = this.$el.find('#field-lat input').val();
            var lng = this.$el.find('#field-lng input').val();
            console.log(lat)
            console.log(lng)

            if(lat && lng){
                this.map.addMarker(false, lat, lng);
            }
        },

        getTpl: function(name){
            var tpl = _.template('<div  id="field-'+name+'" data-editor><label for="">'+name+'</label></div>');
            return tpl;
        },

        onShow: function(){
            var ctx = this;
            var md = Backbone.Model.extend({
                schema : {
                    name : {type: 'Text', validators: ['required'], editorClass: 'form-control', title: 'Name'},

                    type : {type: 'Text', validators: ['required'], editorClass: 'form-control'},

                    active: { type: 'Checkbox', validators: true},

                    location : {title:'First location : ', type: 'Object', editorClass: 'subForm',  subSchema: {
                        lat : {type: 'Number', validators: ['required'], template: ctx.getTpl('lat'), editorClass: 'form-control'},
                        lon : {type: 'Number', validators: ['required'], template: ctx.getTpl('lng'), editorClass: 'form-control'},
                        ele: {type: 'Number', validators: ['required'], editorClass: 'form-control'},
                        comments: {type: 'Text', validators: ['required'], editorClass: 'form-control'},
                        precision: {type: 'Number', validators: ['required'], editorClass: 'form-control'},
                        begin_date: {type: 'BackboneDatepicker', validators: ['required'], options: [{
                        dateFormat: 'd/m/yyyy',
                        defaultValue: new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear() 
                        }]}, //DTP
                        end_date: {type: 'BackboneDatepicker', options: [{
                        dateFormat: 'd/m/yyyy',
                        defaultValue: new Date().getDate() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getFullYear() 
                        }]}, //DTP
                        
                    }},
                },
            });
            var mod = new md();
            this.form = new BbForms({
                model: mod,
            }).render();
            $('#form').append(this.form.el).append('<br>');



            $('#form #dateTimePicker').each(function(){
                console.log($(this));
                $(this).datetimepicker();
            });


            /*===========================
            =            Map            =
            ===========================*/
            this.map = new NsMap({
                zoom: 3,
                element : 'map',
            });

            this.map.init();
        },

        create: function(){


            if(!this.form.validate()){
                console.log(this.form.getValue());

                var site = this.form.getValue();
                var mySite = new Backbone.Model(site);

                mySite.url= config.coreUrl+'monitoredSite/newSite';
                
                var ctx = this;
                mySite.save({
                    error: function(model, response, options){
                        ctx.$el.find('#error').html('An error occured');
                    },
                    success: function (model, response, options) {
                        console.log(this)
                    }
                });
            }
        },

    });
});



