define([
    //'jquery',
   // 'underscore',
    //'backbone',
    'marionette',
    'utils/protocols',
    'bbForms',
    'text!modules2/input/templates/input-station-details.html'
], function(Marionette, Protocols, BbForms,template) {
    'use strict';
     return Marionette.ItemView.extend({
        template : template,

        initialize: function() {
            this.forms = [];
        },
        events: {
            'click .inputProtocolValidation' : 'commitForm'
        },

        onShow: function() {
            
        },
        onRender: function() {
            this.getProtocolsList();
        },

        onRemove: function() {
           
        },
        getProtocolsList : function(){
            var filesList = [];
            // get list of json files (protocols)
           $.ajax({
              url: "./modules/input/data/",
              context: this,
              success: function(data){
                    $(data).find("a:contains(.json)").each(function(){
                        var filePath = $(this).attr("href");
                        // example of filePath: "/ecoreleve/modules/input/data/protocols.json"
                        var tab = filePath.split("/");
                        // file name is stored in the last element of the tab
                        var fileName = tab[tab.length -1];
                        filesList.push(fileName);
                    });
                    console.log(filesList);
                    this.generateProtocols(filesList);
              }
            });

        },
        generateProtocols :function(list){
            window.deferreds = [];
            this.protocolsModels = [];
            var self = this;
            // for each file name, load file and generate protocol model
            for (var i=0; i< list.length;i++){
                var fileName = list[i];
                var filePath ='./modules/input/data/' + fileName;
                // display loader
                $('#myLoader').loader();
                // load file
                window.deferreds.push($.getJSON(filePath, function(data) {
                    var Protocol = Backbone.Model.extend({
                        schema : data.schema
                    });
                    var protocol = new Protocol();
                    protocol.set('name',data.name);

                    self.protocolsModels.push(protocol);
                }));

            }
            $.when.apply(null, window.deferreds).done(function() {
                //console.log(self.protocolsModels);
                self.generateForms(self.protocolsModels);
            });
        },
        generateForms : function(protocolsModels){
            // for each protocol model generate a backbone form
            $('#input-forms').empty();
            $('#input-forms').append('<ul class="nav nav-tabs" id="tabProtsUl"></ul>');
            $('#input-forms').append('<div class="tab-content" id="tabProtsCoentent"></div>');

            for (var i=0; i< protocolsModels.length;i++){
                var protocolName = protocolsModels[i].get('name');
                var form = new BbForms({
                     model: protocolsModels[i],
                     //idPrefix : null
                     idPrefix : 'prtocol-' + i + '-',
                     protocolName : protocolName
                }).render();
                // add this form to view forms list to use it later when commit/validate form
                this.forms.push(form);
                var activeTab ="";
                //console.log(form);
                var formContent = form.el;
                // activate first element of tab
                if(i===0){activeTab ="active";}
                $('#