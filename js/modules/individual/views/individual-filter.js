define([
    "jquery",
    "underscore",
    "backbone",
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!templates/individual/individual-filter.html'
], function($, _, Backbone, Marionette, Moment, Radio, datalist, config, template) {

    "use strict";

    return Marionette.ItemView.extend({
        template: template,

        events: {
            'click #clear-btn' : 'clear',
            'change :text': 'update',
            'focus :text': 'fill',
            'submit': 'catch',
            'click #save-btn' : 'saveCriterias',
            'click #indivSavedSearch .indiv-search-label' : 'selectSavedFilter',
            'click .glyphicon-remove' : 'deleteSavedFilter',
            'click :checkbox' : 'setNull'
        },

        initialize: function() {
            this.radio = Radio.channel('individual');
            this.filter = {};

            // Saved filters
            var storedCriterias = localStorage.getItem('indivFilterStoredCriterias') || "";
            if (!storedCriterias){
                this.criterias =  [];
            } else {
                this.criterias = JSON.parse(storedCriterias);
            }
        },

        catch: function(evt) {
            evt.preventDefault();
            this.update();
        },

        clear: function(evt) {
            evt.preventDefault();
            $("form").trigger("reset");
            this.filter = {};
            this.radio.trigger('update', {filter:{}});
            $('body').animate({scrollTop: 0}, 400);
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

        onShow: function(evt) {
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
            var crit = evt.target.id;
            var val = evt.target.value;
            this.filter[crit] = val;
            this.radio.trigger('update', {filter:this.filter});
            $('body').animate({scrollTop: 0}, 400);
        },

        getParams : function(){
            var inputs = $("input");
            var criteria  = {};
            inputs.each(function(){
                var name  = this.id;
                var value = $(this).val();
                if (value){
                    criteria[name] = parseInt(Number(value)) || value;
                }
            });
            return criteria;
        },

        setNull: function(evt) {
            var id = evt.target.id.split('-')[1];
            var value = evt.target.value
            console.log(id);
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
            for (var name in crit) {
                $('#'+name).val(crit[name]);
            }
            this.filter = crit;
            this.radio.trigger('update', {filter:this.filter});
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
