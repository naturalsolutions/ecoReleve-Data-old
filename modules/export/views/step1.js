define([
    'jquery',
    'underscore',
    'backbone',
    'bbForms',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step1.html'

], function($, _, Backbone, BbForms , Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        events: {
            'click #export-themes li': 'getViewsList',
            'click #exportViewsList': 'enableNext',
        },
        initialize: function(options) {
        	this.radio = Radio.channel('exp');
        	//$('body').append(form.el);
        },

        /*
        onBeforeDestroy: function() {
            this.radio.reset();
        },
		*/

        onShow: function() {
            //datalist.fill('#export-themes', '/themes/list?export=yes');
            this.getItemList();
        },

        //obsolete : remplace by datalist.fill()
        getItemList: function(isDatalist){
            var element= $('#export-themes');
            $('#export-themes').empty();

            var url = config.coreUrl + '/theme/list?export=yes';

            $.ajax({
                url: url,
                dataType: "json",
                context: this,
            }).done(function(data){
                var len = data.length;
                for (var i = 0; i < len; i++) {
                    var label = data[i].caption;
                    var value = data[i].id;
                    if (isDatalist) {
                        $('<li>'+label+ '</li>').appendTo(element);
                    } else {
                        $('<li class="list-group-item" value=\"' + value + '\">' + label + "</li>").appendTo(element);
                    }
                }
            }).fail(function(msg){
                alert("error loading items, please check connexion to webservice");
            });
        },


        getViewsList:  function(e) {
            var id=e.currentTarget.getAttribute("value");
            $('#export-views').empty();

            var url = config.coreUrl + "/views/list?id_theme=" + id;

            if (id !== "") {
                $.ajax({
                    url: url,
                    dataType: "text",
                    context: this,
                }).done(function(data){
                    var xmlDoc = $.parseXML(data),
                    $xml = $(xmlDoc),
                    $views = $xml.find("view");

                    $views.each(function() {
                        $('<li id="exportViewsList" class="list-group-item" value=\"' + $(this).attr('id') + '\">' + $(this).text() + '</li>').appendTo('#export-views');
                    });
                }).fail(function(msg){
                        alert("error loading views, please check connexion to webservice");
                });
            }
        },



        enableNext: function(e){
            this.viewName = $(e.target).get(0).attributes["value"].value;
            $(e.target).addClass('validated');
            $('.btn-next').removeAttr('disabled');
            this.radio.command('viewName', {
                viewName: this.viewName,
            });
        },








    });
});
