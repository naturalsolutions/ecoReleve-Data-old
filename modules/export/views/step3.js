define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/export/templates/export-step3.html',
    'utils/map',
    'models/point',
], function($, _, Backbone , Marionette, moment, Radio, datalist, config, template, map, Point) {

    'use strict';


    return Marionette.ItemView.extend({
        template: template,

        filters: '',
        viewName: '',
        mapView: '',

        initialize: function(options) {
            console.log('step3');
            this.filters = options.filters;
            this.viewName= options.viewName;
        },


        onShow: function() {
            
            //$("#filterViewName").text(this.currentView);
             var point = new Point({
                     latitude: 31,
                     longitude: 61,
                     label: ''
             });
             $('#map').css({
                 "width": "800px",
                 "height": "400px"
             });

             this.mapView = map.init('bird', this.$el.find('#map'), point, 3);

/*
            var style = new OpenLayers.Style({
                  pointRadius:0.2,strokeWidth:0.2,fillColor:'#edb759',strokeColor:'white',cursor:'pointer'
            });
*/

            var url = config.coreUrl + "/views/filter/" + this.viewName + "/geo?" + this.filters + "&format=geojson&limit=0";

            var ajaxCall = {
                url: url,
                format: "GEOJSON",
                params: {
                    round: "0"
                },
                cluster: true,
                serverCluster: true
            };
            console.log('done');

            /*
            this.mapView.addLayer({
                ajaxCall: ajaxCall,
                layerName: "Observations",
                noSelect: false,
                zoom: 4,
                zoomToExtent: true
            });*/
            

            /*
            //   $(".modal-body").css({"max-height":"600px"});
            var point = new NS.UI.Point({
                latitude: 31,
                longitude: 61,
                label: ""
            });
            this.map_view = this.initMap(point, 3);
            /*var style = new OpenLayers.Style({
                  pointRadius:0.2,strokeWidth:0.2,fillColor:'#edb759',strokeColor:'white',cursor:'pointer'
            });
            this.map_view.addLayer({point : point , layerName : "", style : style, zoom : 3});*/
            //masquer certains controles
            /*
             var controls = this.map_view.map.getControlsByClass("OpenLayers.Contrthis.ol.MousePosition");
            this.map_view.map.removeControl(controls[0]);
            controls = this.map_view.map.getControlsByClass("OpenLayers.Contrthis.ol.Panel");
            this.map_view.map.removeControl(controls[0]);
            // add zoom controls to map
            this.addControlsToMap(); */
            //add bbox content

            /*
            NS.UI.bbox = new NS.UI.BBOXModel();
            // init bbox model
            NS.UI.bbox.set("minLatWGS", "");
            NS.UI.bbox.set("minLonWGS", "");
            NS.UI.bbox.set("maxLatWGS", "");
            NS.UI.bbox.set("maxLonWGS", "");
            var bboxView = new app.views.BboxMapView({
                model: NS.UI.bbox
            });
            bboxView.$el.appendTo("#bbox");
            bboxView.render();

            // add geodata to base layer__________

            //this.displayWaitControl();

            //var serverUrl = app.config.serverUrl;
            //var url = serverUrl + "/views/get/" + this.currentView + "?filter=" + this.filterValue + "&format=geojson&limit=0";
            /*
            var url = config.coreUrl + "/views/filter/" + this.currentView + "/geo?" + this.filterValue + "&format=geojson&limit=0";
            /*
            var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON" , strategies:["BBOX"], cluster:true, params:{round:"0"}});
            this.map_view.addLayer({protocol : protocol , layerName : "Observations", noSelect : false});
            */
            /*
            var ajaxCall = {
                url: url,
                format: "GEOJSON",
                params: {
                    round: "0"
                },
                cluster: true,
                serverCluster: true
            };
            this.map_view.addLayer({
                ajaxCall: ajaxCall,
                layerName: "Observations",
                noSelect: false,
                zoom: 4,
                zoomToExtent: true
            });

            /*var controls = this.map_view.map.getControlsByClass("OpenLayers.Contrthis.ol.MousePosition");
            this.map_view.map.removeControl(controls[0]);
            controls = this.map_view.map.getControlsByClass("OpenLayers.Contrthis.ol.Panel");
            this.map_view.map.removeControl(controls[0]);*/
            // add zoom controls to map
            // this.addControlsToMap(); 

            //this.addControlsToMap();



            /*
           // calculate initial count
            var filterVal = this.filterValue;
            //var query = "filter=" + filterVal;
            app.utils.getFiltredResult("countViewRows", filterVal,this.currentView);
            */
        },/*
        events: {
            'click #export-back-filter': 'backToFilter',
            'click #geo-query': 'getqueryresult',
            'click #export-result': 'getResult',
            'click #export-first-step': 'backToFistStep',
            'click button.close': 'exitExp'
        },*/

        /*
        initMap : function(point, zoom) {
                var initPoint = point || (new NS.UI.Point({
                    latitude: 43.29,
                    longitude: 5.37,
                    label: "bureau"
                }));
                var mapZoom = zoom || 12;
                var map_view = new NS.UI.MapView({
                    el: $("#map"),
                    center: initPoint,
                    zoom: mapZoom
                });
                return map_view;
        },*/
        /*
        backToFilter: function() {
            window.clearInterval(this.timer);
            var route = "#export/" + this.currentView;
            app.router.navigate(route, {
                trigger: true
            });
*/
            /* var currentView = this.currentView;
            window.clearInterval(this.timer);
            app.views.main.setView(".layoutContent", new app.Views.ExportFilterView({viewName: currentView}));
            app.views.main.render();*/
            /*
        },
        addControlsToMap: function() {
            var panel = new OpenLayers.Contrthis.ol.Panel({
                displayClass: 'panel',
                allowDepress: false
            });
            var zoomBox = new OpenLayers.Contrthis.ol.ZoomBox();
            var navigation = new OpenLayers.Contrthis.ol.Navigation();
            var zoomBoxBtn = new OpenLayers.Contrthis.ol.Button({
                displayClass: 'olControlZoomBox',
                type: OpenLayers.Contrthis.ol.TYPE_TOOL,
                eventListeners: {
                    'activate': function() {
                        zoomBox.activate();
                        navigation.deactivate();
                    },
                    'deactivate': function() {
                        zoomBox.deactivate();
                    }
                }
            });
            var navigationBtn = new OpenLayers.Contrthis.ol.Button({
                displayClass: 'olControlNavigation',
                type: OpenLayers.Contrthis.ol.TYPE_TOOL,
                eventListeners: {
                    'activate': function() {
                        navigation.activate();
                        zoomBox.deactivate();
                    },
                    'deactivate': function() {
                        navigation.deactivate();
                    }
                }
            });
            panel.addControls([zoomBoxBtn, navigationBtn]);
            this.map_view.map.addControls([panel, zoomBox, navigation]);
        },
        getqueryresult: function() {
            var selectedview = this.currentView;
            var bboxVal = $("input#updateSelection").val();
            var filterVal = this.filterValue;
            var query = filterVal + "&bbox=" + bboxVal;
            app.utils.getResultForGeoFilter(query, selectedview);
        },
        getResult: function() {
            //window.clearInterval(this.timer);
            app.views.selectedview = this.currentView;
            app.views.bbox = $("input#updateSelection").val() || "";
            app.views.filterVal = this.filterValue;
            var route = "#export/" + this.currentView + "/fields";
            app.router.navigate(route, {
                trigger: true
            });*/
            /*this.remove();
            var myview = new app.views.ExportColumnsSelection ({view: selectedview ,filter:filterVal, bbox: bboxVal});
            myview.render();
            myview.$el.appendTo("#main");*/
            /* app.views.main.setView(".layoutContent", new app.Views.ExportColumnsSelection({view: selectedview ,filter:filterVal, bbox: bboxVal}));
            app.views.main.render();*/

/*
        },
        backToFistStep: function() {
            //window.clearInterval(this.timer);
            app.router.navigate("#export", {
                trigger: true
            });
        },
        exitExp: function(e) {
            app.router.navigate('#', {
                trigger: true
            });
        },
        displayWaitControl: function() {
            var mapDiv = this.map_view.el;
            var width = ((screen.width) / 2 - 200);
            var height = ((screen.height) / 2 - 200);
            var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>";
            var st = $("#waitControl").html();
            if ($("#waitControl").length === 0) {
                $(mapDiv).append(ele);
            }
        }

*/
        





    });
});
