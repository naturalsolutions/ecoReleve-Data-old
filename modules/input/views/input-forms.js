define([
    'marionette',
    'radio',
    'config',
    'utils/protocols',
    'bbForms',
    'autocompTree',
    'text!modules2/input/templates/input-forms.html',
    'text!modules2/input/templates/form-bird-biometry.html'

], function(Marionette, Radio, config,Protocols, BbForms, AutocompTree , template, tplBirdBiometry) {

    'use strict';
     return Marionette.ItemView.extend({
        template : template,
        initialize: function() {
            this.forms = [];
        },
        events: {
            'click .inputProtocolValidation' : 'commitForm',
            'click .inputProtocolEdit' : 'editForm',
            'click .addSubProto' : 'addSubProto',
            'change input.add-protocol' : 'addForm',
            //'click .removeCurrentForm' : 'removeForm',
            //'click .autocompTree' : 'createAutocompTree',
            'change input[name="st_FieldActivity_Name"]' : 'updateFieldActivity',
            'click .autocompTree' : 'initInputValue',
            'click i.icon.reneco.close.braindead' : 'removeForm',
            'change #stDistFromObs' : 'updateStationDistance',
            'change input[name="stAccuracy"]':'updateAccuracy',
            'click .inputProtocolClear' : 'clearForm'
        },
        onShow: function() {
            this.setFieldActivity();
            console.log('data' + this.options.data);
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
                        keywords : data.keywords,
                        defaults : data.defaults || {}
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
               self.protosList.sort();
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
                    parentModel.set('nestedModel',childName);
                }
            }
            
            var selectedFieldActivity = this.model.get('FieldActivity_Name');
            // if new station, generate empty forms related to field activity
            if(this.data== undefined){
                this.generateForms(this.protocolsModels, selectedFieldActivity);
            // else ( old station, load forms with stored data)7
            } else {

            }
            

        },
        generateProtocolsDataList : function(protosList){
            var datalistContent ='';
            $('#protocolsList').empty();
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
        generateForms : function(protocolsModels, fieldActivity){
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
                for (var j=0; j< fieldActivityList.length;j++){
                    if (fieldActivityList[j]== fieldActivity){
                        displayProtocol = true;
                    }    
                }
                // check if it is not a sub-protocol ( a sub-protocol have a parent attribute)
                var parent = selectedProtocol.get('parent');
                if(displayProtocol && (!parent)){ 
                    var fieldsets  = selectedProtocol.fieldsets;
                    form = this.generateForm(protocolName,i);
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
                    $('#tabProtsUl').append('<li class=' + activeTab + '><a href="#tab_' + i + '" data-toggle="tab"><span><i></i></span>'+ protocolName +'</a><i class="icon reneco close braindead"></i></li>');
                    var tabId = 'tab_' + i;
                    var currentTab = '#' + tabId;
                    $('#tabProtsContent').append('<div class="tab-pane '+  activeTab+ '" id="' + tabId +'"></div>');
                    $(currentTab).append(formContent);
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
                        $(currentTab).append(legend);
                        $(currentTab).append(btnAddSubProto);
                        $(currentTab).append(element);
                        //$('#' + tabId).append('<div protocolName ="' + protocolName +'" class="subProtoContainer">' + subformContent + '</div>');
                        $('.subProtoContainer fieldset>div').addClass('col-sm-4');
                    }
                    $(currentTab).append('<div><button protocolName ="' + protocolName +'" class="btn btn-primary inputProtocolValidation">save</button></div>');
                    $(currentTab).append('<div><button protocolName ="' + protocolName +'" class="btn btn-primary inputProtocolEdit masqued" >edit</button></div>');
                    $(currentTab).append('<div><button class="btn btn-primary inputProtocolClear" >clear</button></div>');
                   // $('#' + tabId).append('<div><button protocolName ="' + protocolName +'" class="btn btn-primary addSubProto">add</button></div>');
                    tabOrder += 1;
                    // set min value to 0 for input type 'number'
                    $('input[type="number"]').attr('min',0);
                    // mark label in red for required fields
                    this.addLabelClass();                }
            }
            // hide loader
            $('#myLoader').loader('destroy');
            this.createAutocompTree();
            // format time field to apply datetime plugin
            this.formatTimeField();
        },
        addForm : function(){
            var tm = this.forms;
            var selectedProtocolName = $('input[name="add-protocol"]').val();
            var nbActiveProtocols =  this.activeProtocols.length;
            var idTabProto = 'a'+ nbActiveProtocols + 1; // be sure to have uniq id
            var form = this.generateForm(selectedProtocolName, idTabProto);
            form.render();
            var formContent = form.el;
            $(formContent).find('fieldset>div').addClass('col-sm-4');
            $('#tabProtsUl').append('<li><a href="#tab_' + idTabProto + '" data-toggle="tab"><span><i></i></span>'+ selectedProtocolName +'</a><i class="icon reneco close braindead"></i></li>');
            var tabId = 'tab_' + idTabProto ;
            var currentTab = '#' + tabId;
            $('#tabProtsContent').append('<div class="tab-pane" id="' + tabId +'"></div>');
            $(currentTab).append(formContent);
            $(currentTab).append('<div><button protocolName ="' + selectedProtocolName +'" class="btn btn-primary inputProtocolValidation">save</button></div>');
            $(currentTab).append('<div><button protocolName ="' + selectedProtocolName +'" class="btn btn-primary inputProtocolEdit masqued">edit</button></div>');
            $(currentTab).append('<div><button class="btn btn-primary inputProtocolClear" >clear</button></div>');
            this.forms.push(form);
            this.activeProtocols.push(selectedProtocolName);
            $('input[name="add-protocol"]').val('');
            // remove the added protocol from datalist
            var optionElement = $('#protocolsList').find('option[value="'+ selectedProtocolName +'"]')[0].remove();
            // active added form
            $('a[href="' + currentTab + '"]').click();
            // set min value to 0 for input type 'number'
            $('input[type="number"]').attr('min',0);
            // add class to label of required input to color it 
            this.addLabelClass();
            this.createAutocompTree();
            this.formatTimeField();
        },
        removeForm : function(e){
            var tabElement = $(e.target).parent().find('a')[0];
            var formName = $(tabElement).text();
            var liElement =  $(e.target).parent();
            $(liElement).remove();
            //this.activeProtocols.push(formName);
            console.log(liElement);
            var tabContainerId = $(tabElement).attr('href');
            $(tabContainerId).remove();
            // remove the protocol from active protocols list
            for(var i = 0; i< this.activeProtocols.length ; i++) {
                if(this.activeProtocols[i] === formName) {
                   this.activeProtocols.splice(i, 1);
                }
            }
            this.generateProtocolsDataList(this.protosList);
        },
        commitForm : function(e){
            // get current protocol name stored in submit button
            var currentProtocolName =  $(e.target).attr('protocolName');
            var currentProtocol = this.getProtocolByAttr('name',currentProtocolName);
            var currentForm = this.getCurrentForm(currentProtocolName);
            // if we edit form, id is stored in save btn
            var formId = $(e.target).attr('editionid');
            if(currentForm){
                var errors = [];
                    var er = currentForm.commit();
                     
                if(er){
                     errors.push(er);
                } else {
                    //this.changeValidationStatus(currentProtocolName);
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
                                //this.changeValidationStatus(name);
                            }
                        }
                    }
                }
                var currentInstance = currentForm.model;
                if(errors.length == 0){
                    // check if there are subforms and insert parent form and sub forms in an array 
                    var formsList = [];
                    // add current station id
                    currentInstance.attributes["FK_TSta_ID"]=this.model.get('PK');
                    // if we need to update form , set id of protocol instance in sqlserver table
                    if (formId){
                        formId = parseInt(formId);
                        currentInstance.attributes["PK"] = formId;
                    }
                    // clear object
                    delete currentInstance.attributes["fieldsets"];
                    formsList.push(currentInstance.attributes);

                    if(currentForm.model.subProtoForms) {
                        var nbSubForms = currentForm.model.subProtoForms.length;
                        // for each sub form get a simple object fields values to send by ajax
                        for (var i=0; i<nbSubForms;i++){
                            var subFormModel = currentForm.model.subProtoForms[i].model;
                            // form content
                            var subFormContent = subFormModel.attributes;
                            // add current station id
                            subFormContent["FK_TSta_ID"]=this.model.get('PK');
                            // add subform values to list forms to push 
                            formsList.push(subFormContent);
                        }
                    }
                    this.saveForm(formsList);
                    currentForm.model.defaults = currentForm.model.attributes;
                } else {
                    this.editTabLook('error');
                }
            } else {
                    console.log('pas de formulaire pour ce protocole');
            }
            $('body').animate({scrollTop: 0}, 500);
        },
        editForm : function(e){
            // activate fields editions and show save btn 
            $('.tab-pane.active form input').removeAttr('disabled');
            $('.tab-pane.active form textarea').removeAttr('disabled');
            // mask edit btn
            $(e.target).addClass('masqued');
            // get name of current used protocol
            var protoName = $(e.target).attr('protocolname');
            // show save btn
            $('button[protocolname="'+ protoName +'"].inputProtocolValidation').removeClass('masqued');
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
            
            //var startId = $(e.target).attr('startId');
            var elementsList = $('.autocompTree');
            for(var i=0;i<elementsList.length;i++){
                //$(e.target).autocompTree({
                var startId = $(elementsList[i]).attr('startId');
                // get current value
                var currentVal = $(elementsList[i]).val();
                $(elementsList[i]).autocompTree({
                    wsUrl: 'http://192.168.1.199/Thesaurus/App_WebServices/wsTTopic.asmx',
                    //display: {displayValueName:'value',storedValueName:'value'},
                    webservices: 'initTreeByIdWLanguageWithoutDeprecated',  
                    language: {hasLanguage:true, lng:"en"},
                    startId: startId 
                });
                // set current valua after applying autocompTree
                $(elementsList[i]).val(currentVal);
            }
            //$(e.target).focus();
        },
        initInputValue : function(e){
            $(e.target).val('');
        },
        saveForm : function(data){
            //data["FK_TSta_ID"]=this.form.model.get('id');
            //delete data["fieldsets"];
            var nbProtos = data.length;
            for (var i=0; i< nbProtos;i++){
                // current protocol name
                var protoName = data[i].name;
                $.ajax({
                    url: config.coreUrl +'station/addStation/addProtocol',
                    data:  data[i],
                    context: this,
                    type:'POST',
                    success: function(data){
                        //console.log('add Protocol');
                        //change look of selected tab element
                        if (data!='error'){
                            var idProtocol = data; // if success, returned value corresponds to new id protocol value 
                             //change look of selected tab element
                            this.editTabLook('ok');
                            // desactivate form edition and mask save btn
                            $('button[protocolname="'+ protoName +'"]').attr('editionId',idProtocol);
                            $('button[protocolname="'+ protoName +'"]').addClass('masqued');
                            $('.tab-pane.active form input').attr('disabled', 'disabled');
                            $('.tab-pane.active form textarea').attr('disabled', 'disabled');
                            //activate edition btn
                            $('button[protocolname="'+ protoName +'"].inputProtocolEdit').removeClass('masqued');

                        } else {
                            alert('error in generating protocol data');
                             //change look of selected tab element
                            this.editTabLook('error');
                        }
                    },
                   error: function (xhr, ajaxOptions, thrownError) {
                        //alert(xhr.status);
                        //alert(thrownError);
                        this.editTabLook('error');
                        alert('error in generating protocol data');

                    }
                });
            }
        },
        editTabLook : function(value){
            var spn = $('#tabProtsUl').find('li.active').find('span')[0];
            var pictoElement = $(spn).find('i')[0];
            $(pictoElement).removeClass();
            if(value=='error'){
               // $(pictoElement).addClass('icon reneco close braindead');
            } else {
                $(pictoElement).addClass('icon small reneco validated');
            }
        },
        addLabelClass : function(){
            // get all required elements
            var requiredElements = $('.required');
            // from input get id and set color for corresponding label 
            for (var i=0; i< requiredElements.length; i++){
                 var requiredElementId = $(requiredElements[i]).attr('id');
                var labelElement = $('label[for="'+requiredElementId + '"]')[0];
                $(labelElement).addClass('labelRequired');
            }
        },
        setFieldActivity : function(){
            var fiedActivity = this.model.get('FieldActivity_Name');
            if(fiedActivity){
                $('input[name="st_FieldActivity_Name"').val(fiedActivity);
                $('input[name="st_FieldActivity_Name"').css('color','black');
            }
        },
        updateFieldActivity : function(e){
            var selectedFieldActivity = $(e.target).val();
            // regenerate forms list linked to the selected field activity
            this.generateForms(this.protocolsModels, selectedFieldActivity);
            this.model.set('FieldActivity_Name', selectedFieldActivity);
            this.updateStationValues();
        },
        updateStationDistance : function(e){
            var selectedDistanceId = $(e.target).val();
            // selected option element
            var st = $(e.target).find('option[value="' + selectedDistanceId +'"]')[0];
            var selectedDistanceName = $(st).text();
            // set values in the current station model
            this.model.set('Id_DistanceFromObs', selectedDistanceId);
            this.model.set('Name_DistanceFromObs', selectedDistanceName);
            this.updateStationValues();
        },
        updateAccuracy : function(e){
            var accuracy = $(e.target).val();
            //alert(accuracy);
        },
        updateStationValues : function(){
            $.ajax({
                url: config.coreUrl +'station/addStation/insert',
                context: this,
                data:  this.model.attributes,
                type:'POST',
                success: function(data){
                    console.log(data);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    //alert(xhr.status);
                    //alert(thrownError);
                    alert('error in updating current station value(s)');
                }
            });
        },
        formatTimeField : function(){
            // format time fields 
            $('.timePicker').datetimepicker({
                pickDate: false,                
                useMinutes: true,              
                useSeconds: false,               
                minuteStepping:1,
                use24hours: true,
                format: 'HH:mm'    
            });
            $('input.timeInput').attr('placeholder' ,'hh:mm');
            $('input[type="text"]').addClass('form-control');
            $('input[type="number"]').addClass('form-control');
            $('select').addClass('form-control');
            $('textarea').addClass('form-control');
            $('form ul').addClass('unstyled');
        },
        clearForm : function(e){
            $(e.target).parent().parent().find('form').find('input').val('');
            $(e.target).parent().parent().find('form').find('textarea').val('');
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
