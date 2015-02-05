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
          'click #reset' : 'resetAll',
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
            this.popup = options.popup;
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
              this.selectOne(ids);
              break;
            case 'selectionMultiple':
              this.selectMultiple(ids);
              break;
            case 'popup':
              this.popup(ids);
              break;
            case 'resetAll':
              this.resetAll();
              break;
            default:
              console.log('verify the action name');
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
        initMap: function( center, geoJsonLayer, markers){
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
          var marker;
          var ctx = this;
          var center = new L.LatLng(
            geoJson.features[0].geometry.coordinates[1],
            geoJson.features[0].geometry.coordinates[0]
          );
          var markers = new L.FeatureGroup();

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
                  ctx.interaction('selection', feature.id);
                  //ctx.interaction('popup', feature.id);

                })
                return marker;
              },
          });
          this.initMap(center, geoJsonLayer, markers );

        },


        defaultClusterStyle: function(childCount){
          var classe = ' marker-cluster-';
          var size = 30;
          if (childCount < 10) {
            size+=5;
            classe += 'small';
          } else if (childCount < 100) {
            size+=15;
            classe += 'medium';
          } else if (childCount < 1000) {
            size+= 25;
            classe += 'medium-lg';
          } else {
            size+= 35;
            classe += 'large';
          }
          return {size : size, classe : classe};
        },

        /*==========  initClusters  ==========*/
        initClusters: function(geoJson){
          var firstLvl= true;
          this.firstLvl= [];
          var ctx= this;
          var CustomMarkerClusterGroup = L.MarkerClusterGroup.extend({
            _defaultIconCreateFunction: function (cluster, contains) {
              if(firstLvl){
                ctx.firstLvl.push(cluster);
              }

              var childCount = cluster.getChildCount();

              var c = ' marker-cluster-';
              if(contains) c+=' marker-cluster-contains';
              var size;
              if (childCount < 10) {
                size= 35;
                c += 'small';
              } else if (childCount < 100) {
                size = 45;
                c += 'medium';
              } else if (childCount < 1000) {
                size = 55;
                c += 'medium-lg';
              } else {
                size = 65;
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
                if(ctx.popup)
                  marker.bindPopup('<b>ID : '+feature.id+'</b><br />');


                ctx.dict[feature.id] = marker;
                marker.on('click', function(){
                  ctx.interaction('selection', [feature.id]);
                  //ctx.interaction('popup', feature.id);

                })
                return marker;
              },
          });
          this.initMap(center, geoJsonLayer, markers);
        },




        /*==========  updateClusterParents :: display selection inner cluster  ==========*/
        updateClusterParents: function(m, parents){
          if(this.cluster){
            var c=m.__parent;
            if(m.__parent){
              parents.push(m.__parent);

              m.__parent.setIcon(this.selectedIcon);

              this.updateClusterParents(m.__parent, parents);

              

              var childMarkers = c.getAllChildMarkers();
              var childCount = c.getChildCount();


              var style = this.defaultClusterStyle(childCount);


              var nbContains=0; 
              var contains=false;


              for (var i = 0; i < childMarkers.length; i++) {
                if(childMarkers[i].checked){
                  nbContains++;
                  contains=true;
                }else{
                  if(nbContains==0){
                    contains=false;
                  }
                }
              };

              childCount-=nbContains;

              if (contains) {
                var iconC = new L.DivIcon({ html: '<span>' + childCount + ' : ' + nbContains +'</span>', className: 'marker-cluster marker-cluster-contains' + style.classe, iconSize: new L.Point(style.size, style.size) });
                c.setIcon(iconC);
              }
              else{
                var icon = new L.DivIcon({ html: '<span>' + childCount + ' : ' + nbContains +'</span>', className: 'marker-cluster' + style.classe, iconSize: new L.Point(style.size, style.size) });
                c.setIcon(icon);
              };
            }
          }
        },



        //updateClusterChilds
        updateClusterStyle: function(c, all){
          var childCount = c.getChildCount();

          var style = this.defaultClusterStyle(childCount);

          //check if you must change cluster style for all cluster or for none
          if(all){
            var iconC = new L.DivIcon({ html: '<span>0 : ' + childCount +'</span>', className: 'marker-cluster marker-cluster-contains' + style.classe, iconSize: new L.Point(style.size, style.size) });
            c.setIcon(iconC);
          }else{
            var icon = new L.DivIcon({ html: '<span>' + childCount + ' : 0</span>', className: 'marker-cluster' + style.classe, iconSize: new L.Point(style.size, style.size) });
            c.setIcon(icon);
          }
          
        },

        updateAllClusters: function(c, all){
          var childClusters = c._childClusters;
          this.updateClusterStyle(c, all);

          for (var i = childClusters.length - 1; i >= 0; i--) {
            this.updateClusterStyle(childClusters[i], all);
            this.updateAllClusters(childClusters[i], all);
          };
          return;
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
            var bbox=[];  
            for(var key in  markers._featureGroup._layers){
              marker =  markers._featureGroup._layers[key];
              if (e.boxZoomBounds.contains(marker._latlng) /*&& !ctx.selectedMarkers[key]*/) {

                  if(!marker._markers){
                    bbox.push(marker.feature.id);
                  }else{
                    childs = marker.getAllChildMarkers();
                    ctx.updateAllClusters(marker, true);
                    for (var i = childs.length - 1; i >= 0; i--) {
                      childs[i].checked = true;
                      ctx.selectedMarkers[childs[i].feature.id] = childs[i];

                      ctx.changeIcon(childs[i]);
                    };
                    if(marker.__parent){
                        ctx.updateClusterParents(marker, []);                             
                    }

                  }
              };
            };
            ctx.com.action('selectionMultiple', bbox);
          });
        },



        /*==========  updateMarkerIcon  ==========*/
        
        selectOne: function(id){
          var marker;
            marker=this.dict[id];
            marker.checked=!marker.checked;
            if(marker.checked){
              this.selectedMarkers[id]=marker;
            }else{
              delete(this.selectedMarkers[id]);
            };
            this.changeIcon(marker);
            this.updateClusterParents(marker, []);
        },

        avoidDoublon: function(id, marker){
          if(!this.selectedMarkers[id])
            this.selectedMarkers[id] = marker;
        },

        selectMultiple: function(ids){
          var marker;
          for (var i = 0; i < ids.length; i++) {            
            marker=this.dict[ids[i]];
            marker.checked = true;

            this.avoidDoublon(ids[i], marker);
            
            this.changeIcon(marker);
            this.updateClusterParents(marker, []);
          };
        },

        /*==========  focusMarker :: focus & zoom on a point  ==========*/
        focus: function(id, zoom){
          var marker = this.dict[id];

          if(this.lastFocused && this.lastFocused != marker){
            this.updateMarkerIcon(this.lastFocused);
          }
          this.lastFocused = marker;
          marker.setIcon(this.focusedIcon);

          var center = marker.getLatLng();
          this.map.panTo(center);
          var ctx = this;

          if(zoom){
            setTimeout(function(){
              ctx.map.setZoom(zoom);
             }, 1000);          
          };

        },


        /*==========  resetMarkers :: reset a list of markers  ==========*/
        resetAll: function(){
          var marker;
          for (var key in this.selectedMarkers) {
              marker = this.selectedMarkers[key];
              marker.checked=!marker.checked;
              this.changeIcon(marker);
          };
          
          if(this.cluster){

            var cluster;
            for (var i = this.firstLvl.length - 1; i >= 0; i--) {
              cluster = this.firstLvl[i];
              this.updateAllClusters(cluster, false);
            };
          
          };
          this.selectedMarkers={};
        },

        addMarker: function(m, lat, lng, popup, icon){
          if(m){
            m.addTo(this.map);
          }else{
            var m = new L.marker([lat, lng]);
            if(popup){
              m.bindPopup(popup);
            }
            if(icon){
              m.setIcon(icon);
            }
            m.addTo(this.map);
          }
        },

        /*==========  updateMarkerPos  ==========*/
        updateMarkerPos: function(id, lat, lng , zoom){
          var marker = this.dict[id];
          var latlng = new L.latLng(lat, lng);
          marker.setLatLng(latlng);
          if(zoom){
            this.focus(id, zoom);            
          }else{
            this.focus(id, false);            
          };
        },

        popup: function(id){
          var marker = this.dict[id];
          marker.openPopup();
        },

    });
});
