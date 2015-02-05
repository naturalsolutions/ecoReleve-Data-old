define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'text!ns_modules/tpl-map.html',
    'L',
    'leaflet_cluster',
    'leaflet_google',

], function($, _, Backbone , Marionette, tpl, L, cluster
    ) {

    'use strict';

    return Marionette.ItemView.extend({
        template: tpl,
        className: 'map-view',

        events: {
          'click #reset' : 'resetTest',
        },
        bbox : true,

        resetTest: function(){
          this.interaction('resetAll');
        },

        initialize: function(options) {
            //check if there is a communicator
            if(options.com){
              this.com = options.com;   
              this.com.addModule(this);
            }

            this.bbox = options.bbox || this.bbox;
            this.click = options.click;
            this.cluster = options.cluster;
            this.dict={}; //list of markers
            this.selectedMarkers = {}; // list of selected markers


            this.initIcons();
            //local or url furnished
            if(options.url){
              this.requestGeoJson(options.url);
            }else{
              if (this.cluster){
                this.initClusters(options.geoJson);
              }else{
                this.initLayer(options.geoJson);
              }
            }

        },



        action: function(action, ids){
          switch(action){
            case 'focus':
              this.focus(ids);
              break;
            case 'selection':
              this.select(ids);
              break;
            case 'popup':
              this.popup(ids);
              break;
            case 'resetAll':
              this.resetAll();
              break;
            case 'focus':
              console.log('focus');
              break;
            default:
              break;
          }
        },

        interaction: function(action, id){
          if(this.com){
            this.com.action(action, id);                    
          }else{
            this.action(action, id);
          }
        },


        /*==========  requestGeoJson if not furnished  ==========*/
        requestGeoJson: function(url){
          var criterias = {
              page: 1,
              per_page: 20,
              criteria: null,
              offset: 0,
              order_by: '[]',
          };

          var ctx = this;
          var jqxhr = $.getJSON( url, function(criterias){
          }).done(function(geoJson) {
              if (ctx.cluster){
                ctx.initClusters(geoJson)
              }else{
                ctx.initLayer(geoJson);
              }
          })
          .fail(function(msg) {
              console.log( msg );
          });
        
        },
        /*==========  initMap  ==========*/
        initMap: function(geoJsonLayer, markers, center){
            this.map = new L.Map('map', {
              center: center,
              zoom: 3,
              minZoom: 2,
              //inertia: true,
              zoomAnimation: true,
            });

            var googleLayer = new L.Google('HYBRID', {unloadInvisibleTiles: true,
              updateWhenIdle: true,
              reuseTiles: true
            });

            markers.addLayer(geoJsonLayer);
            this.map.addLayer(googleLayer);
            this.map.addLayer(markers);
            this.map.setZoom(2);

            if(this.bbox){
              this.addBBox(markers);
            }

        },


        /*==========  initIcons  ==========*/
        initIcons: function(){
          this.focusedIcon = new L.DivIcon({className: 'custom-marker focus'});
          this.selectedIcon = new L.DivIcon({className: 'custom-marker selected'});
          this.icon = new L.DivIcon({className: 'custom-marker'});
        },

        changeIcon: function(m){
          if (m.checked) {
            m.setIcon(this.selectedIcon);
          }else{
            m.setIcon(this.icon);
          };
        },

        initLayer: function(geoJson){
          //this.initMap(geoJsonLayer, googleLayer, markers);
        },


        /*==========  initClusters  ==========*/
        initClusters: function(geoJson){
          var ctx= this;
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

          var marker;
          var center = new L.LatLng(
            geoJson.features[0].geometry.coordinates[1],
            geoJson.features[0].geometry.coordinates[0]
          );
          var parents=[];
          var geoJsonLayer = L.geoJson(geoJson, {
              // onEachFeature: function (feature, layer) {
              // },
              pointToLayer: function(feature, latlng) {
                marker = L.marker(latlng, {icon: ctx.icon});
                marker.checked=false;
                marker.bindPopup('<b>ID : '+feature.id+'</b><br />');


                ctx.dict[feature.id] = marker;
                marker.on('click', function(){
                  ctx.interaction('selection', [feature.id]);
                  ctx.interaction('popup', feature.id);

                })
                return marker;
              },
          });
          this.initMap(geoJsonLayer, markers, center);
        },


        popup: function(id){
          var marker = this.dict[id];
          marker.openPopup();
        },

        /*==========  updateClusterParents :: display selection inner cluster  ==========*/
        updateClusterParents: function(m, parents){
          var c=m.__parent;
          if(m.__parent){
            parents.push(m.__parent);
            this.updateClusterParents(m.__parent, parents);
            m.__parent.setIcon(this.selectedIcon);
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

        },

  
        /*==========  updateMarkerPos  ==========*/
        updateMarkerPos: function(id){
          var marker = this.dict[id];
          marker.checked=!marker.checked;
          this.updateMarkerIcon(marker);
        },

        addBBox: function(markers){
          var ctx = this;

          var marker, childs;

          this.map.boxZoom['_onMouseUp'] = function(e){
            this._finish();

            var map = this._map,
                layerPoint = map.mouseEventToLayerPoint(e);

            if (this._startLayerPoint.equals(layerPoint)) { return; }

            var bounds = new L.LatLngBounds(
                    map.layerPointToLatLng(this._startLayerPoint),
                    map.layerPointToLatLng(layerPoint));

            map.fire('boxzoomend', {
              boxZoomBounds: bounds
            });
          };

          this.map.on("boxzoomend", function(e) {

            for(var key in  markers._featureGroup._layers){
              marker =  markers._featureGroup._layers[key];
              if (e.boxZoomBounds.contains(marker._latlng) && !ctx.selectedMarkers[key]) {
                  if(!marker._markers){
                    marker.checked = true;
                    ctx.selectedMarkers[key] = marker;
                    ctx.changeIcon(marker);                    
                  }else{
                    childs = marker.getAllChildMarkers();
                    console.log(childs);
                    for (var i = childs.length - 1; i >= 0; i--) {
                      childs[i].checked = true;
                      ctx.selectedMarkers[key] = childs[i];
                      ctx.changeIcon(childs[i]);                    
                    };
                  }
              };
            };
          });
        },



        /*==========  updateMarkerIcon  ==========*/
        
        select: function(ids){
          console.log(ids);
          var marker;
          for (var i = 0; i < ids.length; i++) {            
            marker=this.dict[ids[i]];
            marker.checked=!marker.checked;
            if(marker.checked){
              this.selectedMarkers[ids[i]]=marker;
            }else{
              delete(this.selectedMarkers[ids[i]]);
            };
            this.changeIcon(marker);
            if(this.cluster){
              this.updateClusterParents(marker, []);
            };
          };
        },


        /*==========  focusMarker :: focus & zoom on a point  ==========*/
        focus: function(id){
          var marker = this.dict[id];

          if(this.lastFocused && this.lastFocused != marker){
            this.updateMarkerIcon(this.lastFocused);
          }
          this.lastFocused = marker;
          marker.setIcon(this.focusedIcon);

          var center = marker.getLatLng();
          this.map.panTo(center);
          //quick fix for refresh bug
          this.map.setZoom(2);
          this.map.setZoom(18);
        },


        /*==========  resetMarkers :: reset a list of markers  ==========*/
        resetAll: function(){
          var marker;
          for (var key in this.selectedMarkers) {
              marker = this.selectedMarkers[key];
              marker.checked=!marker.checked;
              this.changeIcon(marker);
          };
          this.selectedMarkers={};
          /*
          if(this.cluster){
            this.updateClusterParents(marker, []);
          };
          */
        },



    });
});
