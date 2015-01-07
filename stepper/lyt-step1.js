define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'stepper/level1-demo',
    'stepper/lyt-step',

], function($, _, Backbone, Marionette, Radio, View1, Step) {

    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/

        parent:null,

        events : {
            'click #reset' : 'reset',
            'keyup input:not(:checkbox,:radio)' : 'datachanged_text',
            'change input:not(:checkbox,:radio)' : 'datachanged_text',
            'change input:checkbox' : 'datachanged_checkbox',
            'change input:radio' : 'datachanged_radio',
            'change select' : 'datachanged_select',
        },
        
        regions:{
            main : '#main',
        },

        elemIndex:0,

        onDestroy: function(){
            console.log('destroy');
            this.contents=this.$el.html();
        },

        initialize: function(args){
            this.name=args.name;
            this.template=args.tpl;

            this.model=args.model; //global model
            this.stepAttributes=[]; //all attributes per step
        },

        parseOneTpl: function(myTpl){// Initialisation du model à partir du template

            var tpl = $(myTpl);

            var ctx=this;
            this.$el.find('input:not(:checkbox,:radio)').each(function(){

                var name= ctx.name+'elem'+ctx.elemIndex++;
                $(this).attr('id', name);

                var rq = $(this).hasClass('required');
                var obj={name : name, required : rq, };

                ctx.stepAttributes.push(obj);
                var val=ctx.model.get(obj.name); //get val
                ctx.model.set(obj.name, val);

            });

            this.$el.find('select').each(function(){

                var name= ctx.name+'elem'+ctx.elemIndex++;
                $(this).attr('id', name);

                var name = $(this).attr('id');
                var obj={name : name};

                ctx.stepAttributes.push(obj);
                var val=ctx.model.get(obj.name);
                ctx.model.set(obj.name, val);
            });
            //add radio & checkbox

        },

        onShow: function(){

        },

        onRender: function(){
            if(this.contents)
            this.$el.html(this.contents);

            this.elemIndex=0;
            this.view1=new View1();
            this.main.show(this.view1, {preventDestroy: true});
            console.log('two');
            this.parseOneTpl(this.template);
            this.feedTpl();
        },

        feedTpl: function(){

            var ctx=this;

            this.$el.find('input:not(:checkbox,:radio,:submit)').each(function(){
                var id = $(this).attr('id');
                for (var i = 0; i < ctx.stepAttributes.length; i++) {
                    if(id==ctx.stepAttributes[i].name)
                        $(this).attr('value', ctx.model.get(id));                        
                        $(this).val(ctx.model.get(id));                        
                };
            });

            this.$el.find('input:checkbox').each(function(){
                var id = $(this).attr('id');
                var tmp=ctx.model.get(id);
                if(tmp){ $(this).attr('checked', 'checked') }
            });
            this.$el.find('input:radio').each(function(){
                var id = $(this).attr('name');
                var tmp=ctx.model.get(id);
                if($(this).val() == tmp){ $(this).attr('checked', 'checked') }
            });
            this.$el.find('select').each(function(){
                var id = $(this).attr('id');
                var val=ctx.model.get(id);
                if(val)
                $(this).val(val);
            });

        },

        /*==========  Method with default behavior to be extended if needed ==========*/

        /* Default behavior, set value to "" to all input elements */
        reset: function(){
            for(var att in this.stepAttributes){
                this.model.set(this.stepAttributes[att].name, null); 
            };
            this.render();
            this.displayErrors();

        },
        
        /* Default behavior, no check, nextEnable will do the job */
        nextOK: function(){
            var ajax=true;
            if(ajax && this.validate()){
                return true;
            }else{
                return false;
            }
        },

        displayErrors: function(){
            for(var rq in this.stepAttributes ){
                var o = this.stepAttributes[rq];
                if(o.required && !this.model.get(o.name)){
                    this.$el.find('#'+o.name).addClass('incorrect');
                }
                else{
                    this.$el.find('#'+o.name).removeClass('incorrect');
                }
            }
        },

        validate: function(){
            this.displayErrors();
            for(var rq in this.stepAttributes ){
                var o = this.stepAttributes[rq];
                if(o.required && !this.model.get(o.name)){
                    return false;
                }
            }
            return true;
        },
        
        datachanged_text: function(e){
            var target= $(e.target);
            var id=target.attr('id');

            var val=target.val();
            this.model.set(id, val);
        },

        datachanged_checkbox: function(e){
            var target= $(e.target);
            var id=target.attr('id');
            var val=target.val();

            if(target.is(':checked')){
                this.model.set(id, val);
            }else{
                this.model.set(id, null);                
            }
        },

        datachanged_radio: function(e){
            var target= $(e.target);
            var id=target.attr('name');
            var val=target.val();
            this.model.set(id, val);
        }, 

        datachanged_select: function(e){
            var target= $(e.target);
            var id=target.attr('id');
            var val=target.val();
            this.model.set(id, val);
        },



    });

});
