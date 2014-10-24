define([
    //'jquery',
   // 'underscore',
    //'backbone',
    'marionette',
    'utils/protocols',
    'bbForms',
    'text!modules2/input/templates/input-forms.html',
    'text!modules2/input/templates/form-bird-biometry.html'
], function(Marionette, Protocols, BbForms,template, tplBirdBiometry) {
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
                var form;
                var protocolName = protocolsModels[i].get('name');
                
                // if protocol == 'bird biometry', use customized template
                if (protocolName =='Bird Biometry'){
                    var tpl = $(tplBirdBiometry).html();
                    form = new BbForms({
                        model: protocolsModels[i],
                        idPrefix : 'prtocol-' + i + '-',
                        protocolName : protocolName,
                        template:  _.template(tpl)
                    }).render();
                } else {
                    form = new BbForms({
                        model: protocolsModels[i],
                         //idPrefix : null
                        idPrefix : 'prtocol-' + i + '-',
                        protocolName : protocolName
                    }).render();

                }
                // add this form to view forms list to use it later when commit/validate form
                this.forms.push(form);
                var activeTab ="";
                //console.log(form);
                var formContent = form.el;
                // activate first element of tab
                if(i===0){activeTab ="active";}
                $('#tabProtsUl').append('<li class=' + activeTab + '><a href="#tab_' + i + '" data-toggle="tab"><span></span>'+ protocolName +'</a></li>');
                var tabId = 'tab_' + i;
                $('#tabProtsCoentent').append('<div class="tab-pane '+  activeTab+ '" id="' + tabId +'"></div>');
                $('#' + tabId).append(formContent);
                $('#' + tabId).append('<div><button protocolName ="' + protocolName +'" class="inputProtocolValidation">save</button></div>');
            }
            // hide loader
            $('#myLoader').loader('destroy');
        },
        commitForm : function(e){
            // get current protocol name stored in submit button
            var currentProtocol =  $(e.target).attr('protocolName');
            var currentForm = this.getCurrentForm(currentProtocol);
            if(currentForm){
                var errors = currentForm.commit({ validate: true });
                console.log(errors);
                var currentInstance = currentForm.model;
                console.log(currentInstance);
                //change look of selected tab element
                var spn = $('#tabProtsUl').find('li.active').find('span')[0];
               
                if(!errors){
                    $(spn).text('-');
                } else {
                    $(spn).text('-x-');
                }
            } else {
                console.log('pas de formulaire pour ce protocole');
            }
            $('body').animate({scrollTop: 0}, 500);
        },
        getCurrentForm : function(protocolName){
            for(var i=0;i<this.forms.length;i++){
                if (this.forms[i].options.protocolName == protocolName){
                    return this.forms[i];
                }
            }
           return null;
        }

    });
});
