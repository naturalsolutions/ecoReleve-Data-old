define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'ol3',
    'text!modules2/validate/gsm/templates/tpl-map.html',
    'L',
    'leaflet_cluster',
    'leaflet_google',


], function($, _, Backbone , Marionette, config, Radio,
    ol, tpl, L, cluster
    ) {

    'use strict';

    return Marionette.ItemView.extend({
        template: tpl,
        className: 'full-height col-xs-12',

        events: {

        },
        initialize: function(options) {
            this.init=true;
            console.log(options);
            this.gsmID=options.gsmID;
            this.id_ind=options.id_ind;
            this.initGeoJson();

            Radio.channel('gsm-detail').comply('selectOneByHour', this.selectOneByHour, this);
            Radio.channel('gsm-detail').comply('clearAllMap', this.clearAll, this);
            Radio.channel('gsm-detail').comply('focus', this.focus, this);
            Radio.channel('gsm-detail').comply('updateMap', this.updateMap, this);
        },

        initGeoJson: function(){
            var url = config.coreUrl+ 'dataGsm/' +this.gsmID+ '/unchecked/'+this.id_ind+'?format=geojson';
            $.ajax({
                url: url,
                contentType:'application/json',
                type:'GET',
                context: this,
                data: {
                    page: 1,
                    per_page: 20,
                    criteria: null,
                    offset: 0,
                    order_by: '[]',
                },
            }).done(function(datas){
                this.geoJson= datas;
                this.initLeafMap(datas);
            }).fail(function(msg){
                console.log(msg);
            });
        },

        initLeafMap: function(data){

          /*=============================
          =            Icons            =
          =============================*/
          var ctx= this;
          
          this.focusedIcon = new L.DivIcon({className: 'custom-marker focus'});
          this.selectedIcon = new L.DivIcon({className: 'custom-marker selected'});
          this.icon = new L.DivIcon({className: 'custom-marker'});
          
          

          var CustomMarkerClusterGroup = L.MarkerClusterGroup.extend({
            _defaultIconCreateFunction: function (cluster, contains) {
              var childCount = cluster.getChildCount();



              var c = ' marker-cluster-';
              if(contains) c+=' marker-cluster-contains';
              var size;
              if (childCount < 10) {
                size= 25;
                c += 'small';
              } else if (childCount < 100) {
                size = 35;
                c += 'medium';
              } else if (childCount < 1000) {
                size = 45;
                c += 'medium-lg';
              } else {
                size = 55;
                c += 'large';
              }

              return new L.DivIcon({ html: '<span>' + childCount + '</span>', className: 'marker-cluster' + c, iconSize: new L.Point(size, size) });
            },
          });



          var markers = new CustomMarkerClusterGroup({
              disableClusteringAtZoom : 18,
              maxClusterRadius: 100,
              polygonOptions: {color: "rgb(51, 153, 204)", weight: 3},
          });

          this.dict={};
          var marker;

          var passed = false, center;
          var center = new L.LatLng(data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]);


          var tab=[];
          function parseParent(m){
            var c=m.__parent;
            if(m.__parent){
              tab.push(m.__parent);
              parseParent(m.__parent);
              m.__parent.setIcon(ctx.selectedIcon);
              var childMarkers = c.getAllChildMarkers();
              var childCount = c.getChildCount();

              var classe = ' marker-cluster-';
              var size;
              if (childCount < 10) {
                size= 25;
                classe += 'small';
              } else if (childCount < 100) {
                size = 35;
                classe += 'medium';
              } else if (childCount < 1000) {
                size = 45;
                classe += 'medium-lg';
              } else {
                size = 55;
                classe += 'large';
              }

              var nbContains=0; 
              var contains=false;
              for (var i = 0; i < childMarkers.length; i++) {
                if(childMarkers[i].checked){
                  nbContains++;
                  contains=true;
                }else{
                  if(nbContains!=0){
                    contains=false;
                  }
                }
              };

              if (contains) {
                var iconC = new L.DivIcon({ html: '<span>' + childCount + ':' + nbContains +'</span>', className: 'marker-cluster marker-cluster-contains' + classe, iconSize: new L.Point(size, size) });
                c.setIcon(iconC);
              
              }
              /*else{
                var icon = new L.DivIcon({ html: '<span>' + childCount + '</span>', className: 'marker-cluster' + classe, iconSize: new L.Point(size, size) });
                c.setIcon(icon);
              };
              */
            }

          };

          var geoJsonLayer = L.geoJson(data, {
              // onEachFeature: function (feature, layer) {

              // },
              pointToLayer: function(feature, latlng) {
                marker = L.marker(latlng, {icon: ctx.icon});
                marker.checked=false;
                ctx.dict[feature.id] = marker;



                marker.on('click', function(){
                  ctx.updateGrid(this);
                  parseParent(this);

                  //markers.getVisibleParent(this).setIcon(ctx.selectedIcon);
                })
                return marker;
              },
          });



          /*===========================
          =            Map            =
          ===========================*/
          
          this.map = new L.Map('map', {
            center: center,
            zoom: 3,
            minZoom: 2,
            inertia: true,
            zoomAnimation: true,
          });
          var googleLayer = new L.Google('HYBRID', {unloadInvisibleTiles: true,
            updateWhenIdle: true,
            reuseTiles: true
          }
          );
          this.map.addLayer(googleLayer);

          markers.addLayer(geoJsonLayer);
          this.map.addLayer(markers);
          this.map.setZoom(2);
        },

        setIconMarker: function(marker){    
          if(marker.checked){
            marker.setIcon(this.selectedIcon);
          }else{
            marker.setIcon(this.icon);
          }

        },

        updateGrid: function(marker){
          if(marker.checked){
            marker.checked=false;
          }else{
            marker.checked=true;  
          }

          marker.checked = !marker.checked;

          this.setIconMarker(marker);

          Radio.channel('gsm-detail').command('updateGrid', marker);
        },

        updateMap: function(id){
          var marker = this.dict[id];

          if(marker.checked){
            marker.checked=false;
          }else{
            marker.checked=true;  
          }

          this.setIconMarker(marker);
        },

        selectOneByHour: function(models){
          var id, marker;
          for (var i = 0; i < models.length; i++) {
            id = models[i].get('id');
            marker = this.dict[id];
            marker.checked=true;
            this.setIconMarker(marker);
          };
        },




        focus: function(id){
          var marker = this.dict[id];

          if(this.lastFocused && this.lastFocused != marker){
            this.setIconMarker(this.lastFocused);
          }
          this.lastFocused = marker;
          marker.setIcon(this.focusedIcon);

          /*=====================================
          =            Center On Map            =
          =====================================*/
                    
          var center = marker.getLatLng();
          this.map.panTo(center);
          //quick fix for refresh bug
          this.map.setZoom(2);
          this.map.setZoom(18);
        },


        clearAll: function(models){
          var id, marker;
          for (var i = 0; i < models.length; i++) {
            id = models[i].get('id');
            marker = this.dict[id];
            marker.checked=false;
            this.setIconMarker(marker);
          };
        },





 
    });
});
