define([
    'dropzone',
    'jquery',
    'marionette',
    'radio',
    'config',
    'text!modules2/gsm/templates/gsm-list.html'
], function(Dropzone, $, Marionette, Radio, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        className: 'container-fluid no-padding',
        template: template,

        events: {
            'click table.backgrid tbody tr': 'showDetail'
        },

        initialize: function() {
            Dropzone.autoDiscover = false;
        },

        onShow: function() {
            var Data = Backbone.Collection.extend({
                url: config.coreUrl + 'dataGsm/unchecked/list',
            });

            var data = new Data();

            var columns = [{
                name: 'platform_',
                label: 'GSM ID',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                })
            }, {
                name: 'nb',
                label: 'Number of unchecked locations',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                })
            }];

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: data
            });

            this.$el.find('#gsm-list').append(this.grid.render().el);

            data.fetch({reset: true});

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

        showDetail: function(evt) {
            var id = $(evt.target).parent().find('td').first().text();
            Radio.channel('route').command('gsm', id);
        }
    });
});
