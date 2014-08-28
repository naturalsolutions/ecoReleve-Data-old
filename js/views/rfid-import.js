define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'text!templates/rfid-import.html'
], function($, _, Backbone, eventManager, Marionette, config, template) {
    "use strict";

    return Marionette.ItemView.extend({
        className: "full-width",
        template: template,
        events: {
            "click #btn-import": "importFile"
        },

        ui: {
            progress: ".progress",
            progressBar: ".progress-bar"
        },

        onRender: function() {
            this.ui.progress.hide();
        },

        importFile: function(event) {
            event.stopPropagation();
            event.preventDefault();
            var reader = new FileReader();
            var file = $("#input-file").get(0).files[0] || null;
            var url = config.sensorUrl + "rfid/import";
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
                $.ajax({
                    type: "POST",
                    url: url,
                    data: data,
                    processData: false,
                    contentType: false
                }).done( function(data) {
                        alert(data);
                }).fail( function(data) {
                    alert(data);
                });
            };
            if(file) {
                this.ui.progress.show();
                reader.readAsText(file);
            }
        }
    });
});
