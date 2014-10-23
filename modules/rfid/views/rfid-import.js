define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'radio',
    'text!modules2/rfid/templates/rfid-import.html',
    'bootstrap_slider',
    
], function($, _, Backbone, eventManager, Marionette, config, Radio, template, bootstrap_slider) {
    "use strict";

    return Marionette.ItemView.extend({
        collection: new Backbone.Collection(),
        template: template,
        events: {
            "click #btn-import": "importFile",
            "click #input-file": "clear",
            "focus #input-mod": "clear"
        },

        ui: {
            progress: ".progress",
            progressBar: ".progress-bar",
            fileHelper: "#help-file",
            fileGroup: "#group-file",
            modHelper: "#help-mod",
            modGroup: "#group-mod",
            modInput: "#input-mod"
        },

        initialize: function() {
            this.listenTo(this.collection, "reset", this.render)
            $.ajax({
                context: this,
                url: config.coreUrl + "rfid",
            }).done( function(data) {
                this.collection.reset(data);
            });

        },

        importFile: function(event) {
            event.stopPropagation();
            event.preventDefault();
            this.clear();

            var module = this.ui.modInput.val();

            if( module !== "") {

                var reader = new FileReader();
                var file = $("#input-file").get(0).files[0] || null;
                var url = config.coreUrl + "rfid/import";
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
                    data.append("module", module);
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: data,
                        processData: false,
                        contentType: false
                    }).done(function(data) {

                        Radio.channel('rfid').command('showValidate',{});
                            
                    }).fail( function(data) {
                      alert('Please verify your file or contact administrator');
                    });
                };

                if(file) {
                    this.clear();
                    this.ui.progress.show();
                    reader.readAsText(file);
                }
                else {
                    this.ui.fileGroup.addClass("has-error");
                    this.ui.fileHelper.text("Required");
                }
            }
            else {
                this.ui.modGroup.addClass("has-error");
                this.ui.modHelper.text("Required");
            }
        },

        clear: function() {
            this.ui.progressBar.width('0%');
            this.ui.progress.hide();
            this.ui.fileHelper.text("");
            this.ui.fileGroup.removeClass("has-error");
            this.ui.modHelper.text("");
            this.ui.modGroup.removeClass("has-error");
        }
    });
});
