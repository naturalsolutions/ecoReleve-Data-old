define([
    'jquery',
    'backbone',
    'localforage',
    'localforage_backbone',
    'models/protocol',
    'models/field'
], function($, Backbone, localforage, localforage_backbone, Protocol, field){
    'use strict';

    function generateListField(node, callback) {
        var fieldId = $(node).attr("id");
        var name = $(node).find('label').text();
        var label = $(node).find('display_label').text();
        var defaultValueId = $(node).find('defaultValue').attr('id');
        var defaultvalueposition;
        var options = [];
        $(node).find('itemList[lang="en"]').children().each(function() {
            var label = $(this).find('label').text();
            var value = $(this).find('value').text();
            options.push(label);
        });

        var listField = new field.ListField({
            id: fieldId,
            name: name,
            display_label: label,
            items: options
        });
        callback(listField);
    };

    function generateTextField(node, callback) {
        var fieldId = $(node).attr("id");
        var name = $(node).find('label').text();
        var label = $(node).find('display_label').text();
        var defaultValue = $(node).find('default_value').text();
        var required = $(node).find('required').text();
        var multiline = $(node).find('multiline').text();
        var textField = new field.TextField({
            id: fieldId,
            name: name,
            display_label: label,
            multiline: multiline,
            defaultValue: defaultValue,
            required: required
        });
        callback(textField);
    };

    function generateStringField(node, callback) {
        var fieldId = $(node).attr("id");
        var name = $(node).find('label').text();
        var label = $(node).find('display_label').text();
        var textField = new field.TextField({
            id: fieldId,
            name: name,
            display_label: label,
        });
        callback(textField);
    };

    function generateNumericField(node, callback) {
        var fieldId = $(node).attr("id");
        var name = $(node).find('label:first').text();
        var label = $(node).find('display_label').text();
        var defaultVal = $(node).find('default_value').text();
        var unit = $(node).find('unit').text();
        var minBound = $(node).find('min_bound').text();
        var maxBound = $(node).find('max_bound').text();
        var precision = $(node).find('precision').text();
        var numField = new field.NumericField({
            id: fieldId,
            name: name,
            display_label: label,
            unit: unit,
            max_bound: maxBound,
            min_bound: minBound,
            precision: precision,
            defaultValue: defaultVal
        });
        callback(numField);
    };

    function generateFloatField (node, callback) {
        var fieldId = $(node).attr("id");
        var name = $(node).find('label:first').text();
        var label = $(node).find('display_label').text();
        // creer le modele champ numerique
        var floatField = new field.NumericField({
            id: fieldId,
            name: name,
            display_label: label,
        });
        callback(floatField);
    };

    function generateDateField (node, callback) {
        var fieldId = $(node).attr("id");
        var name = $(node).find('label:first').text();
        var label = $(node).find('display_label').text();
        // creer le modele champ numerique
        var dateField = new field.DateField({
            id: fieldId,
            name: name,
            display_label: label,
        });
        callback(dateField);
    };

    function generateBooleanField(node, callback) {
        var fieldId = $(node).attr("id");
        var name = $(node).find('label').text();
        var label = $(node).find('display_label').text();
        var defaultVal = $(node).find('default_value').text();
        var required = $(node).find('required').text();
        // creer le modele champ boolean
        var boolField = new field.BooleanField({
            id: fieldId,
            name: name,
            display_label: label,
            defaultValue: defaultVal,
            required: required
        });
        callback(boolField);
    };

    function generatePhotoField(node, callback) {
        var fieldId = $(node).attr("id");
        var name = $(node).find('label').text();
        var label = $(node).find('display_label').text();

        var photoField = new field.PhotoField({
            id: fieldId,
            name: name,
            display_label: label
        });
        callback(photoField);
    };

    return Backbone.Collection.extend({
        sync: Backbone.localforage.sync('ProtocolsList'),
        model: Protocol,

        initialize : function() {
        },

        save: function() {
            this.each(function(model) {
                model.save();
            });
        },

        loadFromXML: function(url) {
            var collection = this;
            $.ajax({
                url: url,
                dataType: 'xml'
            }).done( function(xml) {
                $(xml).find('protocol').each( function() {
                    // créer le modèle protocol
                    var protocol = new Protocol();
                    var id = $(this).attr('id');
                    var protName = $(this).find('display_label:first').text();

                    protocol.set('id', id);
                    protocol.set('name', protName);

                    // key words
                    var keywords = [];
                    $(this).find('keyword').each( function() {
                        var keyword = $(this).text();
                        keyword = keyword.trim();
                        keywords.push(keyword);
                    });

                    protocol.set('keywords', keywords);
                    //créer le schema du modele à partir des champs
                    var schema = {};
                    var nbFields = 0;
                    $(this).find('fields').children().each( function() {
                        var myFieldSet = $(this);
                        var fieldsetName = $(this).attr('name');

                        $(this).children().each( function() {
                            var node = $(this);
                            var fieldtype = $(this).get(0).nodeName;

                            switch (fieldtype) {
                                case ('field_list'):
                                    generateListField(node, function(field) {
                                        var name = field.get('name');
                                        // creer un champ dont le nom correspond au label et dont le type correspond au model 'field' (champ de type liste) et le rajouter au schema du protocole
                                        schema[name] = {};
                                        schema[name].type = 'Select';
                                        schema[name].title = field.get('display_label');
                                        schema[name].options = field.get('items');
                                        schema[name].value = field.get('defaultValue');
                                        schema[name].fieldset = fieldsetName;
                                        schema[name].required = true;
                                        nbFields += 1;
                                    });
                                    break;

                                case ('field_number'):
                                    generateNumericField(node, function(field) {
                                        var name = field.get('name');
                                        // creer un champ dont le nom correspond au label et dont le type correspond au model 'field' (champ de type numerique) et le rajouter au schema du protocole
                                        schema[name] = {};
                                        schema[name].type = 'Number';
                                        schema[name].title = field.get('display_label');
                                        schema[name].initialData = field.get('defaultValue');
                                        schema[name].fieldset = fieldsetName;
                                        var minBound = field.get('min_bound');
                                        var maxBound = field.get('max_bound');
                                        // validator for min value & max value
                                        var validatorslist = [];

                                        if (minBound !== '') {
                                            var min = {};
                                            min.type = 'minval';
                                            min.minval = parseInt(minBound);
                                            validatorslist.push(min);
                                        }

                                        if (maxBound !== '') {
                                            var max = {};
                                            max.type = 'maxval';
                                            max.maxval = parseInt(maxBound);
                                            validatorslist.push(max);
                                        }
                                        schema[name].validators = validatorslist;
                                        nbFields += 1;
                                    });
                                    break;

                                case ('field_text'):
                                    // appeler la méthode qui va générer un modele de type texte et utiliser son callback pour rajouter 1 champ de meme type au modele 'protocole'
                                    generateTextField(node, function(field) {
                                        var name = field.get('name');
                                        // creer un champ dont le nom correspond au label et dont le type correspond au model 'field' (champ de type texte) et le rajouter au schema du protocole
                                        schema[name] = {};
                                        schema[name].type = 'Text';
                                        schema[name].title = field.get('display_label');
                                        schema[name].value = field.get('defaultValue');
                                        schema[name].fieldset = fieldsetName;
                                        // validation
                                        if (field.get('required') == 'true') {
                                            schema[name].validators = ['required'];
                                        }
                                        nbFields += 1;
                                        //schema[label].model = field ;
                                    });
                                    break;

                                case('field_varchar'):
                                    generateStringField (node, function(field) {
                                        var name = field.get('name');
                                        // creer un champ dont le nom correspond au label et dont le type correspond au model 'field' (champ de type texte) et le rajouter au schema du protocole
                                        schema[name] = {};
                                        schema[name].type = 'Text';
                                        schema[name].title = field.get('display_label');
                                        nbFields += 1;
                                    });
                                    break;

                                case('field_datetime'):
                                    generateStringField (node, function(field) {
                                        var name = field.get('name');
                                        // creer un champ dont le nom correspond au label et dont le type correspond au model 'field' (champ de type texte) et le rajouter au schema du protocole
                                        schema[name] = {};
                                        schema[name].type = 'Time';
                                        schema[name].title = field.get('display_label');
                                        nbFields += 1;
                                    });
                                    break;

                                case ('field_boolean'):
                                    generateBooleanField(node, function(field) {
                                        var name = field.get('name');
                                        // creer un champ dont le nom correspond au label et dont le type correspond au model 'field' (champ de type texte) et le rajouter au schema du protocole
                                        schema[name] = {};
                                        schema[name].type = 'Boolean';
                                        schema[name].title = field.get('display_label');
                                        schema[name].fieldset = fieldsetName;
                                        nbFields += 1;
                                    });
                                    break;

                                case ('field_float'):
                                    generateFloatField(node, function(field) {
                                        var name = field.get('name');
                                        // creer un champ dont le nom correspond au label et dont le type correspond au model 'field' (champ de type texte) et le rajouter au schema du protocole
                                        schema[name] = {};
                                        schema[name].type = 'Float';
                                        schema[name].title = field.get('display_label');
                                        schema[name].fieldset = fieldsetName;
                                        nbFields += 1;
                                    });
                                    break;

                                case ('field_date'):
                                    generateDateField(node, function(field) {
                                        var name = field.get('name');
                                        // creer un champ dont le nom correspond au label et dont le type correspond au model 'field' (champ de type texte) et le rajouter au schema du protocole
                                        schema[name] = {};
                                        schema[name].type = 'Date';
                                        schema[name].title = field.get('display_label');
                                        schema[name].fieldset = fieldsetName;
                                        nbFields += 1;
                                    });
                                    break;

                                case ('field_photo'):
                                    generatePhotoField(node, function(field) {
                                        var name = field.get('name');
                                        // creer un champ dont le nom correspond au label et dont le type correspond au model 'field' (champ de type texte) et le rajouter au schema du protocole
                                        schema[name] = {};
                                        schema[name].type = 'Photo';
                                        schema[name].name = name;
                                        schema[name].title = field.get('display_label');
                                        schema[name].template = 'photo';
                                        schema[name].fieldset = fieldsetName;
                                        // add hidden field to store file url
                                        schema['photo_url'] = {};
                                        schema['photo_url'].title = 'photo file path';
                                        schema['photo_url'].type = 'Hidden';
                                        schema['photo_url'].validators = ['required'];
                                        nbFields += 1;
                                    });
                                    break;
                                default:
                                    break;
                            }
                        });
                    });
                    protocol.schema = schema;
                    // for localstorage => toJson
                    protocol.attributes.schema = schema;
                    // update protocol if exists
                    if (nbFields > 0) {
                        var prot = collection.get(id);
                        if (prot === undefined) {
                            collection.add(protocol);
                            protocol.save();
                        } else {
                            prot.destroy();
                            collection.add(protocol);
                            protocol.save();
                        }
                    } else {
                        alert('Protocol ' + protName + ' non updated ! check fields list and type.');
                    }
                });
                localforage.setItem('xmlProtocolsIsloaded', 'true');
            }).fail( function() {
                alert('error in loading xml file !');
            });
        }
    });
});
