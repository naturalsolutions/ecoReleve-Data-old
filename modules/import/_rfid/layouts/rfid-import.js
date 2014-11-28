define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'text!modules2/import/_rfid/templates/rfid-import.html',
    'bootstrap_slider',
    'modules2/import/_rfid/views/step2'
    
], function($, _, Backbone, Marionette, config, Radio, template, bootstrap_slider, Step2) {
    'use strict';


    return Marionette.LayoutView.extend({

        template: template,

        regions:{
            step1 : '#step1',
            step2 : '#step2',
        },

        collection: new Backbone.Collection(),
        className: 'import-container-rfid container',

        events: {
            'click #btn-import': 'importFile',
            'click #input-file': 'clear',
            'focus #input-mod': 'clear',

            'click button.btn-next' : 'nextStep',
            'click button.btn-prev' : 'prevStep',
        },

        ui: {
            progress: '.progress',
            progressBar: '.progress-bar',
            fileHelper: '#help-file',
            fileGroup: '#group-file',
            modHelper: '#help-mod',
            modGroup: '#group-mod',
            modInput: '#input-mod'
        },



        initialize: function() {
            this.listenTo(this.collection, 'reset', this.render)
            $.ajax({
                context: this,
                url: config.coreUrl + 'rfid',
            }).done( function(data) {
                this.collection.reset(data);
            });
        },

        onShow: function(){
            $('.btn-next').attr('disabled', 'disabled');
        },

        onRender: function(){
            this.step2.show(new Step2());
        },


        prevStep: function(){
            var step = $('#importWizard').wizard('selectedItem').step;
            if(step == 1){
                Radio.channel('route').trigger('import');                
            }else{
                $('#importWizard').wizard('previous');
                //Radio.channel('route').command('import:rfid');

            }
        },
        
        nextStep: function(){
            $('#importWizard').wizard('next');
            this.step2.show(new Step2());
        },



        importFile: function(event) {
            event.stopPropagation();
            event.preventDefault();
            this.clear();

            var module = this.ui.modInput.val();

            if( module !== '') {

                var reader = new FileReader();
                var file = $('#input-file').get(0).files[0] || null;
                var url = config.coreUrl + 'rfid/import';
                var data = new FormData();
                var self = this;

                reader.onprogress = function(data) {
                    if (data.lengthComputable) {
                        var progress = parseInt(data.loaded / data.total * 100).toString();
                        self.ui.progressBar.width(progress + '%');
                    }
                };

                reader.onload = function(e, fileName) {
                    data.append('data', e.target.result);
                    data.append('module', module);
                    $.ajax({
                        type: 'POST',
                        url: url,
                        data: data,
                        processData: false,
                        contentType: false
                    }).done(function(data) {
                        $('#btnNext').removeAttr('disabled');
                        Radio.channel('rfid').command('showValidate',{});


                    }).fail( function(data) {
                        $('#btnNext').attr('disabled', disable);
                        alert('Please verify your file or contact administrator');
                    });
                };

                if(file) {
                    this.clear();
                    this.ui.progress.show();
                    reader.readAsText(file);
                }
                else {
                    this.ui.fileGroup.addClass('has-error');
                    this.ui.fileHelper.text('Required');
                }
            }
            else {
                this.ui.modGroup.addClass('has-error');
                this.ui.modHelper.text('Required');
            }
        },

        clear: function() {
            this.ui.progressBar.width('0%');
            this.ui.progress.hide();
            this.ui.fileHelper.text('');
            this.ui.fileGroup.removeClass('has-error');
            this.ui.modHelper.text('');
            this.ui.modGroup.removeClass('has-error');
        }
    });
});
