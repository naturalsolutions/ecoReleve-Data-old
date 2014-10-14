define([
    "jquery",
    "underscore",
    "backbone",
    'marionette',
    'radio',
    'utils/datalist',
    'utils/forms',
    'config',
    'text!modules2/individual/templates/individual-filter.html'
], function($, _, Backbone, Marionette, Radio, datalist, forms, config, template) {

    "use strict";

    return Marionette.ItemView.extend({
        template: template,

        events: {
            'click #clear-btn': 'clear',
            'change input[type=text]': 'update',
            'change select': 'update',
            'focus input[type=text]': 'fill',
            'submit': 'catch',
            'click #save-btn': 'saveCriterias',
            'click #export-btn': 'export',
            'click #indivSavedSearch .indiv-search-label': 'selectSavedFilter',
            'click .glyphicon-remove': 'deleteSavedFilter',
        },

        initialize: function(options) {
            this.radio = Radio.channel('individual');

            // Saved filters
            var storedCriterias = localStorage.getItem('indivFilterStoredCriterias') || "";
            if (!storedCriterias){
                this.criterias =  [];
            } else {
                this.criterias = JSON.parse(storedCriterias);
            }

            // Current filter
            this.filter = options.currentFilter || {};
        },

        catch: function(evt) {
            evt.preventDefault();
        },

        export: function(evt) {
            evt.preventDefault();
            $.ajax({
                url: config.coreUrl + 'individuals/search/export',
                data: JSON.stringify({criteria:this.filter}),
                contentType:'application/json',
                type:'POST'
            }).done(function(data) {
                var url = URL.createObjectURL(new Blob([data], {'type':'text/csv'}));
                var link = document.createElement('a');
                link.href = url;
                link.download = 'individual_search_export.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        },

        clear: function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            this.clearForm();
            this.filter = {};
            sessionStorage.clear('individual:currentFilter');
            this.updateGrid();
        },

        clearForm: function() {
            this.$el.find('form').trigger('reset');
            this.$el.find('input').prop('disabled', false);
        },

        fill: function(evt) {
            var id = evt.target.id;
            var list = $('#'+id+'_list');
            if( list.children().length === 0 && id !== 'id') {
                var source = {
                    url: config.coreUrl + 'individuals/search/values',
                    data: {}
                };
                source.data.field_name = id;
                datalist.fill(source, list);
            }
        },

        setInputTextFromFilter: function(filter) {
            this.clearForm();
            for (var name in filter) {
                var value = filter[name].value;
                var op = filter[name].op;
                var input = this.$el.find('input#' + name);
                var select = this.$el.find('select#select-' + name);
                // value is not null
                if(value) {
                    input.val(value);
                }
                // value is null
                else {
                    forms.resetInput(input);
                    input.prop('disabled', true);
                }
                select.val(op);
            }
            this.updateGrid();
        },

        onShow: function(evt) {
            if(!$.isEmptyObject(this.filter)) {
                this.setInputTextFromFilter(this.filter);
            }
            $('#left-panel').css('padding-right', '0');
        },

        onDestroy: function(evt) {
            $('#left-panel').css('padding-right', '15');
        },

        onRender: function() {
            this.updateSaved();
        },

        updateSaved: function() {
            if (this.criterias.length === 0 ) {
                this.$el.find("#indivSavedSearch").html("<p class='text-center'>No saved criterias</p>");
            } else {
                var html = "<ul class='unstyled'>";
                for(var i=0; i < this.criterias.length;i++) {
                    html += "<li id='" + i + "'><span class='indiv-search-label'>" +
                    this.criterias[i].name +
                    "</span><span class='indiv-search-icon glyphicon glyphicon-remove'/></li>";
                }
                html += "</ul>";
                this.$el.find("#indivSavedSearch").html(html);
            }
        },

        update: function(evt) {
            // Input
            if (evt.target.type === 'text') {
                var name = evt.target.id;
                var input = $(evt.target);
                var value = evt.target.value;
                var op = $('select#select-' + name).val();
            }
            // Select
            else {
                var name = evt.target.id.split('-')[1];
                var input = $('input#' + name);
                var value = input.val();
                var op = evt.target.value;
            }
            switch(op) {
                case 'is':
                case 'is not':
                case 'begin with':
                case 'not begin with':
                    input.prop('disabled', false);
                    (value === '') ? this.removeFilter(name) : this.setFilter(name, value, op);
                    break;
                case 'null':
                case 'not null':
                    forms.resetInput(input);
                    input.prop('disabled', true);
                    this.setFilter(name, null, op);
                    break;
                default:
                    break;
            }
        },

        updateGrid: function() {
            sessionStorage.setItem('individual:currentFilter', JSON.stringify(this.filter));
            this.radio.command('update', {filter:this.filter});
            $('body').animate({scrollTop: 0}, 400);
        },

        getParams : function(){
            var inputs = $('input[type=text]');
            var criteria  = {};
            inputs.toArray().forEach(function(element){
                var input = element;
                var value = element.value;
                var name = element.id;
                var op = $('select#select-' + name).val();
                //TODO: put the switch in a function ?
                switch(op) {
                    case 'is':
                    case 'is not':
                    case 'begin with':
                    case 'not begin with':
                        if(value !== '') {
                            criteria[name] = {
                                value: value,
                                op: op
                            };
                        }
                        break;
                    case 'null':
                    case 'not null':
                        criteria[name] = {
                            value: null,
                            op: op
                        };
                        break;
                    default:
                        break;
                }
            }, this);
            return criteria;
        },

        setFilter: function(key, value, op) {
            this.filter[key] = {};
            this.filter[key]['value'] = value;
            this.filter[key]['op'] = op;
            this.updateGrid();
        },

        removeFilter: function(key) {
            if(this.filter[key]) {
                delete this.filter[key];
                this.updateGrid();
            }
        },

        saveCriterias : function() {
            var params = this.getParams();
            if (!jQuery.isEmptyObject(params)){
                this.addModalWindow(params);
            } else {
                alert("Please input criterias to save.");
            }
        },

        addModalWindow : function(params){
            var searchName = prompt("Please input serach name : ", "");
            if(searchName){
                var searchItem = {};
                searchItem.name = searchName;
                // id searchItem = ln + 1
                searchItem.query = JSON.stringify(params);
                this.criterias.push(searchItem);
                localStorage.setItem('indivFilterStoredCriterias',JSON.stringify(this.criterias));
                alert("Search criterias saved.");
                this.updateSaved();
            }
        },

        selectSavedFilter : function(e) {
            var selectedElement = e.target;
            var liElement = selectedElement.parentNode;
            var id = parseInt($(liElement).attr('id'));
            var crit = JSON.parse(this.criterias[id].query);
            this.filter = crit;
            sessionStorage.setItem('individual:currentFilter', JSON.stringify(this.filter));
            this.setInputTextFromFilter(this.filter);
        },

        deleteSavedFilter : function(e) {
            var selectedElement = e.target;
            var liElement = selectedElement.parentNode.parentNode;
            // get li id  => id of filter object
            var idx = parseInt($(liElement).attr('id'));
            // delete object from criterias list and update displayed list
            this.criterias.splice(idx,1);
            localStorage.setItem('indivFilterStoredCriterias',JSON.stringify(this.criterias));
            this.updateSaved();
        },
    });
});
