define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'ol3',
    'text!modules2/validate/gsm/templates/tpl-map.html',
    'cluster',


], function($, _, Backbone , Marionette, config, Radio,
    ol, tpl, cluster
    ) {

    'use strict';

    return Marionette.ItemView.extend({
        template: tpl,
        className: 'full-height col-xs-12',

        events: {

        },
        initialize: function(options) {

            console.log(options);
            this.gsmID=options.gsmID;
            this.id_ind=options.id_ind;
            this.initGeoJson();
            
            Radio.channel('gsm-detail').comply('moveCenter', this.select, this);
            Radio.channel('gsm-detail').comply('updateMap', this.center, this);
            Radio.channel('gsm-detail').comply('colorizeSelectedRows', this.select, this);
        },
        select: function(models){
          
          var id = models[0].get('id');
          var marker = this.dict[id];
          var chkIcon = new L.DivIcon({className: 'custom-marker active'});
          var icon = new L.DivIcon({className: 'custom-marker'});
          //console.log(marker.checked)
          if(marker.checked){
            marker.checked=false;
            marker.setIcon(icon);
          }else{
            marker.checked=true;  
            marker.setIcon(chkIcon);
          }
          
        },
        center: function(model){
          var id = model.get('id');
          var marker = this.dict[id];

          var focusIcon = new L.DivIcon({className: 'custom-marker focus'});
          var icon = new L.DivIcon({className: 'custom-marker active'});
          marker.setIcon(focusIcon);
          var icon = new L.DivIcon({className: 'custom-marker'});

          if(marker.checked){
            marker.setIcon(chkIcon);
          }else{
              marker.setIcon(focusIcon);
            
          }


          if(this.lastFocused && this.lastFocused != marker)
            this.lastFocused.setIcon(icon);
          this.lastFocused = marker;

          var center = marker.getLatLng();
          this.map.panTo(center);
          //quick fix
          this.map.setZoom(3);
          this.map.setZoom(18);

        },

        initLeaf: function(data){

          var CustomMarkerClusterGroup = L.MarkerClusterGroup.extend({
            _defaultIconCreateFunction: function (cluster) {
              var childCount = cluster.getChildCount();

              var c = ' marker-cluster-';
              var size;
              console.log()
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
              maxClusterRadius: 50,
              polygonOptions: {color: "rgb(51, 153, 204)", weight: 3},
          });

          this.dict={};
          var ctx= this, marker;

          var passed = false, center;
          var center = new L.LatLng(data.features[0].geometry.coordinates[1], data.features[0].geometry.coordinates[0]);


          var icon = new L.DivIcon({className: 'custom-marker'});
          var iconActive = new L.DivIcon({className: 'custom-marker active'});

          var geoJsonLayer = L.geoJson(data, {
              // onEachFeature: function (feature, layer) {

              // },
              pointToLayer: function(feature, latlng) {
                marker = L.marker(latlng, {icon: icon});
                marker.checked=false;
                ctx.dict[feature.id] = marker;

                marker.on('click', function(){
                  ctx.selectUnselect(this);
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
          var googleLayer = new L.Google('HYBRID');
          this.map.addLayer(googleLayer);

          markers.addLayer(geoJsonLayer);
          this.map.addLayer(markers);
        },


        selectUnselect: function(marker){
          console.log(marker);
          var chkIcon = new L.DivIcon({className: 'custom-marker active'});
          var icon = new L.DivIcon({className: 'custom-marker'});
          //console.log(marker.checked)

          if(marker.feature.checked){
            marker.feature.checked=false;
            marker.setIcon(icon);
            this.grid(marker.feature);
          }else{
            marker.feature.checked=true;  
            marker.setIcon(chkIcon);
            this.grid(marker.feature);
          }
        },

        grid: function(feature){
          Radio.channel('gsm-detail').command('updateGrid', feature);
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
                this.initLeaf(datas);
            }).fail(function(msg){
                console.log(msg);
            });
        },

        initMap: function(){
            this.distance=50,

            console.log('passed')
            var gmap = new google.maps.Map(document.getElementById('map'), {
              mapTypeControl: false,
              panControl: false,
              disableDefaultUI: true,
              keyboardShortcuts: false,
              draggable: true,
              disableDoubleClickZoom: true,
              scrollwheel: true,
              streetViewControl: false,
              scaleControl: true,
              mapTypeId: google.maps.MapTypeId.HYBRID,
            });



            this.addClusterLayer(this.geoJson);

            var center=this.sourceGeo.getFeatures()[0].getGeometry().getCoordinates();
            var view = new ol.View({
                    center: center,
                    maxZoom: 18,
                    minZoom: 2
            });

            view.on('change:center', function() {
              var center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
              gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
            });
            view.on('change:resolution', function() {
              gmap.setZoom(view.getZoom());
            });


            var olMapDiv = document.getElementById('olmap');


            this.map = new ol.Map({
                layers: [
                    // new ol.layer.Tile({
                    //     source: new ol.source.OSM()
                    // }),
                    this.vectorLayer
                ],
                target: olMapDiv,
                controls: ol.control.defaults({
                    attributionOptions:({
                        collapsible: false
                    })
                }),

                interactions: ol.interaction.defaults({
                    altShiftDragRotate: false,
                    dragPan: false,
                    rotate: false
                }).extend([new ol.interaction.DragPan({kinetic: null})]),
                view: view,
            });
            view.setZoom(3);
            view.setCenter(center);


            /*
            var self=this;
            this.selected_style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                          color: 'green'
                    }),
                    stroke: new ol.style.Stroke({
                        color: [255, 255, 255, 0.75],
                        width: 1.5
                    })
                }),
                zIndex: 1000
            });
            */

            /*
            var selectSingleClick = new ol.interaction.Select({



            });
*/
            

            /*
            this.colorInteraction = new ol.interaction.Select({
                style:this.selected_style,
            });


            
            this.interaction = new ol.interaction.Select({
               
            });*/
            
            /*
            this.mapInteraction = new ol.interaction.Select({
              condition: ol.events.condition.click,
              style:this.selected_style,
            });
            */
  

            //this.map.addInteraction(this.mapInteraction);
            //this.map.addInteraction(this.colorInteraction);
            //this.map.addInteraction(selectSingleClick);


            /*
            this.mapInteraction.getFeatures().on('add', function(e) {

                console.log(e)
                console.log(this)

                //self.interaction.getFeatures().clear();
                console.log(e.element);
                /*
                if (self.colorInteraction.getFeatures().remove(e.element)) {
                    console.log('already checked');
                    //Radio.channel('gsm-detail').command('updateGrid', {id:e.element.id_, checked:false});
                }
                else Radio.channel('gsm-detail').command('updateGrid', {id:e.element.id_, checked:true});
                
            });
            */



            
            this.checked=[];
            
              var ctx = this;
              this.map.on('singleclick', function(evt) {                         
               var feature = ctx.map.forEachFeatureAtPixel(evt.pixel,
                 function(feature, layer) {
                  var currentFeature;
                    //console.log(feature)
                    for (var i = 0; i < feature.values_.features.length; i++) {
                      currentFeature=feature.values_.features[i];
                      //console.log(currentFeature);
                      if(currentFeature.style==1){
                        currentFeature.style=0;
                      }else{
                        currentFeature.style=1;
                      }
                    };


                  //console.log(feature);

                  //console.log(ctx.clusterSource);
                  /*
                  var currentFeature = feature.values_.features[0];

                  if(true){
                    var id=currentFeature.id_;
                    ctx.checked.push(id);
                    var style = new ol.style.Style({
                      image: new ol.style.Circle({
                        radius: 8,
                        stroke: new ol.style.Stroke({
                          color: '#fff'
                        }),
                        fill: new ol.style.Fill({
                          color: 'red'

                        })
                      }),
                      text: new ol.style.Text({
                        text: '',
                        fill: new ol.style.Fill({
                          color: '#fff'
                        })
                      })
                    });
                    currentFeature.id_=0;
                    //console.log(feature);
                    currentFeature.setStyle(style);
                  }*/                                
               });                                                         
             });


            olMapDiv.parentNode.removeChild(olMapDiv);
            gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);
        },

        addClusterLayer: function(geoJson){
          var ctx=this;
          
          this.sourceGeo = new ol.source.GeoJSON({
              projection: 'EPSG:3857',
              object: geoJson
          });

          this.clusterSource = new ol.source.Cluster({
            distance: ctx.distance,
            source: this.sourceGeo,
          });



          var styleCache = {};
          this.vectorLayer = new ol.layer.Vector({
              source: this.clusterSource,
              style: function(feature, resolution) {
                //console.log()
                var size = feature.get('features').length;
                var style = styleCache[size];
                var radius = 30;
                var color= 'rgba(20, 60, 80, 0.8)';
                if(size <= 10000){
                    radius = 25;
                    color= 'rgba(24, 71, 95, 0.8)';
                }
                if(size <= 1000){
                    radius = 20;
                    color= 'rgba(24, 71, 95, 0.8)';
                }
                if(size <= 100){
                    radius = 15;
                    color= 'rgba(33, 99, 132, 0.8)';
                }
                if(size <= 10){
                    radius = 10;
                    color= 'rgba(42, 126, 162, 0.8)';
                }
                if(size == 1){
                    radius = 5;
                    color= 'rgba(51, 153, 204, 1)';
                }
                //console.log('passed');

                /*
                var id=feature.values_.features[0].id_;
                console.log(id);
                console.log(ctx.checked);
                for (var i = 0; i < ctx.checked.length; i++) {
                  if(id == ctx.checked[i] && size == 1){
                    console.log('same');
                    color='red';
                      style = [new ol.style.Style({
                        image: new ol.style.Circle({
                          radius: radius,
                          stroke: new ol.style.Stroke({
                            color: '#fff'
                          }),
                          fill: new ol.style.Fill({
                            color: color

                          })
                        }),
                        text: new ol.style.Text({
                          text: (size == 1 )? '' : size.toString() ,
                          fill: new ol.style.Fill({
                            color: '#fff'
                          })
                        })
                      })];
                      //styleCache[size] = style;
                     
                    return style;               
                  }
                };
                */



                if (!feature.style) {
                  style = [new ol.style.Style({
                    image: new ol.style.Circle({
                      radius: radius,
                      stroke: new ol.style.Stroke({
                        color: '#fff'
                      }),
                      fill: new ol.style.Fill({
                        color: color

                      })
                    }),
                    text: new ol.style.Text({
                      text: (size == 1 )? '' : size.toString() ,
                      fill: new ol.style.Fill({
                        color: '#fff'
                      })
                    })
                  })];
                  styleCache[size] = style;
                }
                return style;
              }
          });




     
        },

        updateGeoJson: function(args){
            
            var url = config.coreUrl+ 'dataGsm/' +this.gsmID+ '/unchecked/'+this.id_ind+'?format=geojson';
            $.ajax({
                url: url,
                contentType:'application/json',
                type:'GET',
                context: this,
                data: args.params,
            }).done(function(geoJson){
                this.updateMapLayer(geoJson);
            }).fail(function(msg){
                console.log(msg);
            });
        },

        updateMapLayer: function(geoJson){
          this.map.removeLayer(this.vectorLayer);
          this.vectorLayer.getSource().clear('fast');
          this.addClusterLayer(geoJson);
          this.map.addLayer(this.vectorLayer);
          this.features=this.vectorLayer.getSource();
        },

    });
});
