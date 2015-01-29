define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'bootstrap_slider',
    'grid/model-grid',
    'backgrid',
    'modules2/import/_rfid/layouts/deploy-modal',
    'sweetAlert',
    'stepper/lyt-step',
    'text!modules2/import/_rfid/templates/tpl-step1.html',
    
], function($, _, Backbone, Marionette, config, Radio, bootstrap_slider, NSGrid, Backgrid, DeployRFID, swal, Step, templ) {
    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
       
        //className: 'import-container-rfid container',
       regions:{
            modal : '#rfid-Modal'
        },


        events: _.extend({},Step.prototype.events, {
            'change #input-mod' : 'updateGrid',
            'click #deploy_remove' : 'deployRFID',

        }),

        initModel: function() {
 
            this.radio = Radio.channel('rfid_pose');
            this.grid= new NSGrid({
               // columns: this.cols,
                channel: 'rfid_pose',
                url: config.coreUrl + 'rfid/pose/',
                pageSize : 20,
                pagingServerSide : false,
            });          
            this.parseOneTpl(this.template);
            var obj={name : this.name + '_RFID_identifer',required : true};
            this.stepAttributes = [obj] ;
            
        },

        onShow: function(){
        },

        onRender: function(){
            var content ='';
            $.ajax({
                context: this,
                url: config.coreUrl + 'rfid',
            }).done( function(data) {
                var len = data.length;
                for (var i = 0; i < len; i++) {
                    var label = data[i].identifier;
                    content += '<option value="' + label +'">'+ label +'</option>';
                }
                $('select[name="RFID_identifer"]').append(content);
                 this.feedTpl() ;
            })
            .fail( function() {
                alert("error loading items, please check connexion to webservice");
            });  
                 
            this.$el.find('#rfid-grid').html(this.grid.displayGrid());
            this.$el.find('#paginator').prepend(this.grid.displayPaginator());
        
        },

        updateGrid: function(){
            console.log($('#input-mod').val());
            var data = new Backbone.Model();
            data.filters = [{'Column':'identifier','Operator':'=','Value':$('#input-mod').val()}];
            this.radio.command('rfid_pose:grid:update',data);

        },
        deployRFID: function(){
            console.log('deploy')
            $('#rfid-Modal').modal('show');
            this.deploy_rfid = new DeployRFID();
            this.modal.show(this.deploy_rfid);
         
        }
    });


});
