define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'stepper/lyt-step',
    'dropzone',
    'config',

], function($, _, Backbone, Marionette, Step, Dropzone, config) {

    'use strict';

    return Step.extend({
        
        initialize: function() {
            Step.prototype.initialize.apply(this, arguments);
        },

/*        onRender: function(){
            //console.log($('div#previews'));
            //var myDropzone = new Dropzone("div#previews");
        },     */

        onShow: function() {
            console.log(this.el);


            console.log(document.getElementById('previews'));


            // Initialize a drop zone for import
           var previewNode = document.querySelector('#template');
            console.log(previewNode)
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


      
        
     
    });

});
