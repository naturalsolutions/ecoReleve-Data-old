define([
    'marionette',
    'radio',
    'utils/protocols',
    'bbForms',
    'autocompTree',
    'text!modules2/input/templates/input-forms.html',
    'text!modules2/input/templates/form-bird-biometry.html'

], function(Marionette, Radio, Protocols, BbForms, AutocompTree , template, tplBirdBiometry) {

    'use strict';
     return Marionette.ItemView.extend({
        template : template,
        initialize: function() {
            this.forms = [];
        },
        events: {
            'click .inputProtocolValidation' : 'commitForm',
            'click .addSubProto' : 'addSubProto',
            'change input.add-protocol' : 'addForm',
            'click .removeCurrentForm' : 'removeForm',
            'click .autocompTree' : 'createAutocompTree'
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
            this.protocolsRelations = [];
            this.protocolsValidation = [];  // used to check if all protocols are validated to activate next step
            var self = this;
            // array to get protocols names list ( not sub protocols)
            this.protosList = [];
            // for each file name, load file and generate protocol model
            for (var i=0; i< list.length;i++){
                var fileName = list[i];
                var filePath ='./modules/input/data/' + fileName;
                // display loader
                $('#myLoader').loader();
                // load file
                window.deferreds.push($.getJSON(filePath, function(data) {
                    var Protocol = Backbone.Model.extend({
                        schema : data.schema,
                        //fieldsets : data.fieldsets,
                        keywords : data.keywords
                    });
                    var protocol = new Protocol();
                    protocol.set('name',data.name);
                    // protocol.set('idProt',i);
                    if (data.fieldsets.length > 0 ){
                        protocol.set('fieldsets',data.fieldsets);
                        protocol.fieldsets = data.fieldsets;
                    }
                    // if it is a sub protocol, add it to 'protocolsRelations' array
                    if (data.parent){
                        // parent protocol name is store in data.parent
                        var parentName = data.parent;
                        var relation = {};
                        relation.parent = parentName;
                        relation.child = data.name;
                        protocol.set('parent',data.parent);
                        self.protocolsRelations.push(relation);
                    } else {
                        self.protosList.push(data.name);
                    }
                    self.protocolsModels.push(protocol);
                }));
            }
            $.when.apply(null, window.deferreds).done(function() {
                // add relations protocols/sub-protocols
                self. generateRelations();
               // generate protocols datalist 
               self.generateProtocolsDataList(self.protosList);
            });
        },
        generateRelations : function (){
            var ln = this.protocolsRelations.length;
            // array to storage protocols names
            if (ln > 0){
                // get the relation proto/sub-proto and add a field (nestedModel) in the proto schema (see backbone forms nestedModels)
                for (var i=0;i< ln; i++){
                    var parentName = this.protocolsRelations[i].parent;
                    var childName = this.protocolsRelations[i].child;
                    // get the chid and parent models and add the 'nestedModel' field
                    var chidModel, parentModel,protoName;
                    this.protocolsModels.forEach(function(protocol) {
                        protoName = protocol.get('name');
                        if (protoName == parentName){
                            parentModel = protocol;
                        }
                        if (protoName == childName ){
                            chidModel = protocol;
                        }
                    });
                    // create a model for the child
                    var ChildProtocol = Backbone.Model.extend({
                        schema : chidModel.schema,
                    });

                    //add the field
                    /*var field = {} ;
                    var nestedFieldTemplate = _.template('<div class="nestedField col-sm-12" data-editor></div>');
                    field.type =  "NestedModel";
                    field.model =  ChildProtocol;
                    field.template  = nestedFieldTemplate;
                    parentModel.schema[childName] = field;   
                    // parentModel.schema[childName + "2"] = field;                    
                    var fieldset = {};
                    fieldset.fields = [];
                    fieldset.fields.push(childName);
                    
                    //fieldset.fields.push(childName + "2");
                    fieldset.legend = "sub protocol";
                    parentModel.fieldsets.push(fieldset);*/
                    // store nested model name in the parent model
                    parentModel.set('nestedModel',childName);
                    // store nb of instances of nested models, to be used to insert other instances
                    /*parentModel.set('nestedNb',1);
                    console.log(parentModel);*/

                }
            }
            this.generateForms(this.protocolsModels);
        },
        generateProtocolsDataList : function(protosList){
            var datalistContent ='';
            for(var i=0;i<protosList.length;i++){
                // check if protocol is not used
                var currentProto = protosList[i];
                var used = false;
                for(var j=0; j<this.activeProtocols.length; j++){
                    if (this.activeProtocols[j]==currentProto){
                        used = true;
                    }
                }
                if (!used){
                    var element = '<option value="'+ protosList[i]+'"></option>';
                    datalistContent += element;
                }
            }
            $('#protocolsList').append(datalistContent);
        },
        generateForms : function(protocolsModels){
                    // for each protocol model generate a backbone form
                    this.activeProtocols = [];
                    $('#input-forms').empty();
                    $('#input-forms').append('<ul class="nav nav-tabs" id="tabProtsUl"></ul>');
                    $('#input-forms').append('<div class="tab-content" id="tabProtsContent"></div>');
                    var tabOrder = 0;
                    for (var i=0; i< protocolsModels.length;i++){
                        var form;
                        var selectedProtocol = protocolsModels[i]; 
                        var protocolName = selectedProtocol.get('name');
                        // check if selected field activity is concerned by this protocol
                        // field activity list for each protocol is stored in keywords property
                        var fieldActivityList = selectedProtocol.keywords;
                        var displayProtocol = false;
                        var selectedFieldActivity = this.model.get('FieldActivity_Name');
                        for (var j=0; j< fieldActivityList.length;j++){
                            if (fieldActivityList[j]== selectedFieldActivity){
                                displayProtocol = true;
                            }    
                        }
                        // check if it is not a sub-protocol ( a sub-protocol have a parent attribute)
                        var parent = selectedProtocol.get('parent');
                        if(displayProtocol && (!parent)){
                            // if protocol == 'bird biometry', use customized template

                            /*if (protocolName =='Bird Biometry'){
                                var tpl = $(tplBirdBiometry).html();
                                var fieldsets  = protocolsModels[i].fieldsets;
                                  form = new BbForms({
                                    model: protocolsModels[i],
                                    idPrefix : 'prtocol-' + i + '-',
                                    protocolName : protocolName,
                                    fieldsets    : fieldsets
                                   // template:  _.template(tpl)
                                }).render();
                            } else {*/
                            
                            var fieldsets  = selectedProtocol.fieldsets;
                            form = this.generateForm(protocolName,i);

                            /*  form = new BbForms({
                                model: selectedProtocol,
                                 //idPrefix : null
                                idPrefix : 'prtocol-' + i + '-',
                                protocolName : protocolName//,
                            });*/
                            form.render();
                            // add this form to view forms list to use it later when commit/validate form
                            this.forms.push(form);
                            this.activeProtocols.push(protocolName);
                            var activeTab ="";
                            //console.log(form);
                            var formContent = form.el;
                            //var protocolId = protocolsModels[i].get('idProt');
                            // activate first element of tab
                            if(tabOrder===0){activeTab ="active";}
                            $('#tabProtsUl').append('<li class=' + activeTab + '><a href="#tab_' + i + '" data-toggle="tab"><span><i></i></span>'+ protocolName +'</a></li>');
                            var tabId = 'tab_' + i;
                            $('#tabProtsContent').append('<div class="tab-pane '+  activeTab+ '" id="' + tabId +'"></div>');
                            $('#' + tabId).append(formContent);
                            // insert nested fields (sub protocols) container 
                           // $('#' + tabId).append('<div protocolName ="' + protocolName +'" class="nestedContainer"></div>');
                            // create responsive input fields by adding bootstrap class to div blocs
                            $('.bg-hack fieldset>div').addClass('col-sm-4');
                            $('fieldset>div').addClass('form-field');
                            $('fieldset>div input[type=text],input[type=number],select').addClass('form-control');
                            // check if protocol have sub protocols and insert form for sub proto
                            var nestedModelName = selectedProtocol.get('nestedModel'); // if value exisits
                            if (nestedModelName){
                                // generate form and add itt to UI
                                var nestModelForm  = this.generateForm(nestedModelName,0);   //generateSubForm
                                nestModelForm.render();
                                var subformContent =  nestModelForm.el;
                                // add tag 'name' protocol name
                                //$(subformContent).find('form').attr('name',nestedModelName);
                                selectedProtocol.subProtoForms = [];
                                selectedProtocol.subProtoForms.push(nestModelForm);
                                var element = $('<div protocolName ="' + protocolName +'" class="subProtoContainer"></div>');
                                // create a container for sub protocol and append it to tab element
                                $(element).append(subformContent);
                                //var elementContent = $(element).text();
                                //$('#' + tabId).append(element);​​​​​​​​
                                // insert legend and a button to add sub protocols
                                var legend = '<legend>'+ nestedModelName +'</legend>';
                                var btnAddSubProto ='<i class="icon mini reneco add addSubProto" protocolName ="' + protocolName +'"></i>';
                                $('#' + tabId).append(legend);
                                $('#' + tabId).append(btnAddSubProto);
                                $('#' + tabId).append(element);
                                //$('#' + tabId).append('<div protocolName ="' + protocolName +'" class="subProtoContainer">' + subformContent + '</div>');
                                $('.subProtoContainer fieldset>div').addClass('col-sm-4');
                            }
                            $('#' + tabId).append('<div><button protocolName ="' + protocolName +'" class="btn btn-primary inputProtocolValidation">save</button></div>');
                           // $('#' + tabId).append('<div><button protocolName ="' + protocolName +'" class="btn btn-primary addSubProto">add</button></div>');
                            tabOrder += 1;
                        //}
                        }
                    }
                    // hide loader
                    $('#myLoader').loader('destroy');
                },

        addForm : function(){
            var selectedProtocolName = $('input[name="add-protocol"]').val();
            var nbActiveProtocols =  this.activeProtocols.length;
            var idTabProto = 'a'+ nbActiveProtocols + 1; // be sure to have uniq id
            var form = this.generateForm(selectedProtocolName, idTabProto);
            form.render();
            var formContent = form.el;
            $(formContent).find('fieldset>div').addClass('col-sm-4');
            $('#tabProtsUl').append('<li><a href="#tab_' + idTabProto + '" data-toggle="tab"><span><i></i></span>'+ selectedProtocolName +'</a></li>');
            var tabId = 'tab_' + idTabProto ;
            $('#tabProtsContent').append('<div class="tab-pane" id="' + tabId +'"></div>');
            $('#' + tabId).append(formContent);
            $('#' + tabId).append('<div><button protocolName ="' + selectedProtocolName +'" class="btn btn-primary inputProtocolValidation">save</button></div>');
            this.forms.push(form);
            this.activeProtocols.push(selectedProtocolName);
            $('input[name="add-protocol"]').val('');
            // remove the added protocol from datalist
            var optionElement = $('#protocolsList').find('option[value="'+ selectedProtocolName +'"]')[0].remove();
            //$('#protocolsList').remove(optionElement);
        },
        removeForm : function(e){
            var form = $(e.target).parent();
            //console.log(formsContainer);
            $(form).remove();
        },
        commitForm : function(e){
            // get current protocol name stored in submit button
            var currentProtocolName =  $(e.target).attr('protocolName');
            var currentProtocol = this.getProtocolByAttr('name',currentProtocolName);
            var currentForm = this.getCurrentForm(currentProtocolName);
            if(currentForm){
                var errors = [];
                var er = currentForm.commit({ validate: true });
                if(er){
                     errors.push(er);
                } else {
                    this.changeValidationStatus(currentProtocolName);
                }
                // check if there is subforms and commit them
                if(currentProtocol.subProtoForms){
                    var subformsLn = currentProtocol.subProtoForms.length ;
                    var subProtoInstances= [];
                    if (subformsLn > 0){
                        for (var i=0; i<subformsLn; i++){
                            var err = currentProtocol.subProtoForms[i].commit({ validate: true });
                            var currentSubProtoInstance = currentProtocol.subProtoForms[i].model;
                            var name = currentSubProtoInstance.get('name');
                            subProtoInstances.push(currentSubProtoInstance);
                            if (err) {
                                errors.push(err);
                            } else {
                                // add the protocol name to validated protocols array
                                this.changeValidationStatus(name);
                            }
                        }
                    }
                }
                var currentInstance = currentForm.model;
                //change look of selected tab element
                var spn = $('#tabProtsUl').find('li.active').find('span')[0];
                var pictoElement = $(spn).find('i')[0];
                $(pictoElement).removeClass();
                if(errors.length == 0){
                    $(pictoElement).addClass('icon reneco validated braindead');
                    Radio.channel('input').command('inputForms');
                    // change validation statut of current protocol in 'protocolsValidation' array
                    //this.changeValidationStatus(currentProtocolName);
                } else {
                    $(pictoElement).addClass('icon reneco close braindead');
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
        },
        addSubProto : function(e){
            var protoName = $(e.target).attr('protocolName');
            var selectedProtocol = this.getProtocolByAttr('name', protoName);
            if(selectedProtocol){
                var nestedModelName =  selectedProtocol.get('nestedModel');
                console.log('nestedModelName :' + nestedModelName);
                var nestModelForm  = this.generateForm(nestedModelName,0); //generateSubForm
                nestModelForm.render();
                var subformContent =  nestModelForm.el;
                $(subformContent).find('fieldset>div').addClass('col-sm-4');
                // add btn to move sub form
                $(subformContent).append('<a class="btn removeCurrentForm">delete</a>');
                $('div.subProtoContainer[protocolName="' + protoName + '"]').append(subformContent);
                selectedProtocol.subProtoForms.push(nestModelForm);
            }
        },
        getProtocolByAttr : function(attr, value){
            var prot =null;
            this.protocolsModels.forEach(function(protocol) {
                var valprop = protocol.get(attr);
                if (valprop == value){
                    prot = protocol ; 
                }
            });
            return prot ; 
        },
        generateForm: function(modelName,id){
            var protocolModel = this.getProtocolByAttr('name',modelName);
            var form  = new BbForms({
                model: protocolModel,
                idPrefix : 'prtocol-' + id + '-',
                protocolName : modelName//,
            });
            this.protocolsValidation.push({'name' :modelName, 'validated' : false}); // by default form is not yet validated, so value = 0
            return form;
        },
        checkNextStepActivation: function(){
            var isValid = true;
            for(var i=0; i< this.protocolsValidation.length; i++ ){
                var prtocolObj = this.protocolsValidation[i];
                if(! prtocolObj.validated){
                    isValid = false;
                    break;
                }
            }
            // if all forms are validated, activate next step btn
            if(isValid) {
                $('#btnNext').removeClass('disabled');
            }
            console.log("statut de validation : " + isValid);
        },
        changeValidationStatus: function(name){
            this.protocolsValidation.forEach(function(protocol){
                if(protocol.name == name){
                    protocol.validated = true;
                }
            });
            // check if all displayed forms are validated to active next step btn
            this.checkNextStepActivation();
        },
        createAutocompTree : function(e){
            
            var startId = $(e.target).attr('startId');
            
            $(e.target).autocompTree({
                        wsUrl: 'http://192.168.1.199/Thesaurus/App_WebServices/wsTTopic.asmx',
                        //display: {displayValueName:'value',storedValueName:'value'},
                        webservices: 'initTreeByIdWLanguageWithoutDeprecated',  
                        language: {hasLanguage:true, lng:"en"},
                        startId: startId 
            });
            $(e.target).focus();

        }

        /*,
        generateSubForm: function(nestedModelName){
            var nestedModel = this.getProtocolByAttr('name',nestedModelName);
            var nestModelForm  = new BbForms({
                model: nestedModel,
                idPrefix : 'subProtocol-'
            });
            return nestModelForm
        }*/
    });
});
