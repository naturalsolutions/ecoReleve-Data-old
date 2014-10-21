define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step1.html'
], function($, _, Backbone , Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        events: {
            'change #export-themes': 'updateViewsList',
   /*         'click button.close': 'exitExp',
            'click .exportViewsList': 'step2',*/
        },
        
        initialize: function(options) {

        },
        onShow: function() {
            //datalist.fill('#export-themes', '/themes/list?export=yes');
            this.getItemList("#export-themes", "/theme/list?export=yes");
        },
        updateViewsList: function(e) {
            var viewID = $("#export-themes option:selected").attr('value');
            this.getViewsList(viewID);
        },


        getViewsList:  function(id) {
            $('#export-views').empty();
            if (id !== "") {
                //var serverUrl = localStorage.getItem("serverUrl");
                var serverUrl = config.serverUrl;
                var viewsUrl = config.coreUrl + "/views/list?id_theme=" + id;
                $.ajax({
                    url: viewsUrl,
                    dataType: "text",
                    success: function(data) {
                        /*var len = data.length;
                        for (var i = 0; i < len; i++) {
                            var value = data[i].MapSelectionManager.TSMan_sp_name;
                            var label = data[i].MapSelectionManager.TSMan_Description;
                            $('<li class="exportViewsList" value=\"' + value + '\">' + label + "</li>").appendTo('#export-views');
                        }*/
                            var xmlDoc = $.parseXML(data),
                            $xml = $(xmlDoc),
                            $views = $xml.find("view");

                            $views.each(function() {
                                $('<li id="exportViewsList" class="list-group-item" value=\"' + $(this).attr('id') + '\">' + $(this).text() + '</li>').appendTo('#export-views');
                            });
                    },
                    error: function() {
                        alert("error loading views, please check connexion to webservice");
                    }
                });
            }
        },


        selectCurrentView: function(e) {
            var viewName = $(e.target).get(0).attributes["value"].nodeValue;
            // this.setView(new app.views.ExportFilterView({viewName: viewName}));
            var route = "#export/" + viewName;
        },


        exitExp: function(e) {
/*            app.router.navigate('#', {
                trigger: true
            });*/
        },


        //obsolete : remplace by datalist.fill()
        getItemList: function(element, url, isDatalist){
            
            $(element).empty();
            $('<option value=""></option>').appendTo(element);
            var serverUrl = config.coreUrl;
            url = serverUrl + url;
            $.ajax({
                url: url,
                dataType: "json",
                success: function(data) {
                    var len = data.length;
                    for (var i = 0; i < len; i++) {
                        var label = data[i].caption;
                        var value = data[i].id;
                        if (isDatalist) {
                            $('<option value=\"' + label + '\">' + "</option>").appendTo(element);
                        } else {
                            $('<option value=\"' + value + '\">' + label + "</option>").appendTo(element);
                        }
                    }
                },
                error: function() {
                    alert("error loading items, please check connexion to webservice");
                }
            });

        },




    });
});
