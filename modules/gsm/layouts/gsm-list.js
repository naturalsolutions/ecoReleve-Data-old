define([
    'dropzone',
    'jquery',
    'marionette',
    'radio',
    'config',
    'text!modules2/gsm/templates/gsm-list.html',
    'modules2/import/_gsm/views/step2',

], function(Dropzone, $, Marionette, Radio, config, template, Step2) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container no-scroll',
        template: template,

        events: {
/*            'click table.backgrid tbody tr': 'showDetail',
*/          
            'click #btnNext' : 'nextStep',
            'click #btnPrev' : 'prevStep',
        },


        regions: {
            step2 : '#step2',
        },

        initialize: function() {
            Dropzone.autoDiscover = false;
        },

        onDestroy: function(){
            $('body').removeClass('full-height').removeClass('no-scroll')
            $('#main-region').removeClass('full-height obscur');

        },

        onShow: function() {
             $('body').addClass('full-height').addClass('no-scroll').addClass('home-page');
            $('#main-region').addClass('full-height obscur');

            // Initialize a drop zone for import
            var previewNode = document.querySelector('#template');
            previewNode.id = '';
            var previewTemplate = previewNode.parentNode.innerHTML;
            previewNode.parentNode.removeChild(previewNode);

            var myDropzone = new Dropzone(this.el, {
                url: config.coreUrl + 'dataGsm/upload', // Set the url
                thumbnailWidth: 80,
                thumbnailHeight: 80,
                parallelUploads: 8,
                previewTemplate: previewTemplate,
                autoQueue: false, // Make sure the files aren't queued until manually added
                previewsContainer: '#previews', // Define the container to display the previews
                clickable: '.fileinput-button' // Define the element that should be used as click trigger to select files.
            });

            myDropzone.on('addedfile', function(file) {
              // Hookup the start button
              file.previewElement.querySelector('.start').onclick = function() { myDropzone.enqueueFile(file); };
            });



            // Update the total progress bar
            myDropzone.on('totaluploadprogress', function(progress) {
              document.querySelector('#total-progress .progress-bar').style.width = progress + '%';
            });

            myDropzone.on('sending', function(file) {
              // Show the total progress bar when upload starts
              document.querySelector('#total-progress').style.opacity = '1';
              // And disable the start button
              file.previewElement.querySelector('.start').setAttribute('disabled', 'disabled');
            });

            // Hide the total progress bar when nothing's uploading anymore
            myDropzone.on('queuecomplete', function(progress) {
                document.querySelector('#total-progress').style.opacity = 0;
                document.querySelector('#total-progress .progress-bar').style.width = 0;
            });


            myDropzone.on('error', function() {
              $('#btnNext').attr('disabled');
              $('#btnNext').removeAttr('disabled');

            });
            myDropzone.on('success', function() {
              $('#btnNext').removeAttr('disabled');
            });


            // Setup the buttons for all transfers
            // The 'add files' button doesn't need to be setup because the config
            // `clickable` has already been specified.
            document.querySelector('#actions .start').onclick = function() {
              myDropzone.enqueueFiles(myDropzone.getFilesWithStatus(Dropzone.ADDED));
            };
            document.querySelector('#actions .cancel').onclick = function() {
              myDropzone.removeAllFiles(true);
            };
        },


        prevStep: function(){
            var step = $('#importWizard').wizard('selectedItem').step;
            if(step == 1){
                Radio.channel('route').trigger('import');                
            }else{
                $('#importWizard').wizard('previous');
                //Radio.channel('route').command('import:gsm');
            }
        },
        


        nextStep: function(){
            $('#importWizard').wizard('next');
            this.step2.show(new Step2());

        },



        /*

        showDetail: function(evt) {
            var id = $(evt.target).parent().find('td').first().text();
            //Radio.channel('route').command('gsm', id);
        }

        */
    });
});
