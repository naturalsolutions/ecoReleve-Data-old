define([
    'ol3',
    'config',
    'radio',
    'modules2/map/views/basemap-google'
], function(ol, config, Radio, BaseMap) {

    'use strict';

    return BaseMap.extend({

        initialize: function() {
            Radio.channel('input').comply('updateMap', this.updateMap, this);
            Radio.channel('input').comply('movePoint', this.movePoint, this);
        },
        onShow: function() {
            BaseMap.prototype.onShow.apply(this, []);
            
            var style =  new ol.style.Style({
              image: new ol.style.Circle({
                radius: 4,
                fill: new ol.style.Fill({color: 'red'})
              })
            });

            var select = new ol.interaction.Select({
                condition: ol.events.condition.click,
                style: style
            });

            this.map.addInteraction(select);

            /*var featureOverlay = new ol.FeatureOverlay({
                //position: ol.proj.transform(coord, 'EPSG:4326', 'EPSG:3857'),
                //element: $('<i class="large glyphicon glyphicon-map-marker"></img>').css({'font-size':'30px', 'left':'-12px', 'top':'-25px'})
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                      color: 'rgba(255, 0, 0, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                      color: '#ffcc33',
                      width: 2
                    }),
                    image: new ol.style.Circle({
                      radius: 7,
                      fill: new ol.style.Fill({
                        color: '#ffcc33'
                      })
                    })
                  })

            });
            //this.map.addOverlay(this.overlay);
            featureOverlay.setMap(this.map);*/
            var modify = new ol.interaction.Modify({
              features: select.getFeatures(),
              // the SHIFT key must be pressed to delete vertices, so
              // that new vertices can be drawn at the same position
              // of existing vertices
              deleteCondition: function(event) {
                return ol.events.condition.shiftKeyOnly(event) &&
                    ol.events.condition.singleClick(event);
              }
            });
            this.map.addInteraction(modify);
            select.getFeatures().on('add', function(e) {
                //Radio.channel('import-gpx').command('updateGrid', e.element.id_);
            });
             select.getFeatures().on('remove', function(e) {
                //Radio.channel('import-gpx').command('updateGrid', e.element.id_);
                // get the moved feature
                var feature  = e['element'];
                var geometry = feature['values_'];
                // get new position in degrees
                var newPosition =  new ol.geom.Point(ol.proj.transform(geometry.geometry.flatCoordinates, 'EPSG:3857', 'EPSG:4326'));
                // get coordinates fixed to 5 
                var newLongitude = newPosition.flatCoordinates[0].toFixed(5);
                var newLatitude = newPosition.flatCoordinates[1].toFixed(5);
                Radio.channel('input').command('updateCoordinates', {longitude: newLongitude, latitude:newLatitude});
            });
            // add popup
            var element = document.getElementById('popup');
            var popup = new ol.Overlay({
              element: element,
              positioning: 'bottom-center',
              stopEvent: false
            });
            this.map.addOverlay(popup);

            // display popup on click
            this.map.on('click', function(evt) {
              var feature = this.forEachFeatureAtPixel(evt.pixel,
                  function(feature, layer) {
                    return feature;
                  });
              if (feature) {
                //console.log("feature : " + feature.values['id']);
                var geometry = feature.getGeometry();
                var coord = geometry.getCoordinates();
                var prop = feature.getProperties();
                var id = feature.getId() || '';
                var label = prop.label || '';
                popup.setPosition(coord);
                var popupContent = 'id: '+ id + '<br/>name: '+ label ;
                $(element).popover('destroy');
                $(element).popover({
                  'placement': 'top',
                  'html': true,
                  'content': popupContent
                });
                //$(element).popover('destroy');
                //$(element).popover();
                $(element).popover('show');
              } else {
                $(element).popover('destroy');
              }
            });
        },
        onRender: function() {
           this.$el.height($(window).height() - $("#header-region").height()-200);
                //$("#info-container").height());
        },
        onRemove: function() {
            Radio.channel('input').stopComplying('updateMap');
        },
        updateMap: function(model) {
            var id = model.get('PK');
            var lat = model.get('LAT');
            var lon = model.get('LON');
            var nblayers =  this.map.getLayers().getLength();
            // vector layer is the latest one 
            var feature = this.map.getLayers().item(nblayers - 1).getSource().getFeatureById(id);
            //this.interaction.getFeatures().clear();
            //this.interaction.getFeatures().push(feature);
            var center = [lon, lat];
            this.moveCenter(center);
            //this.map.getView().setZoom(9);
        },
        movePoint : function(model){
            //var id = model.get('id');
            var lat = model.get('latitude');
            var lon = model.get('longitude');
            var nblayers =  this.map.getLayers().getLength();
            // vector layer is the latest one 
            var source = this.map.getLayers().item(nblayers - 1).getSource();

            //var feature = source.getFeatures()[0];
            source.clear();
            //console.log("feature: ");
            //console.log(feature);
            //this.map.getLayers().item(1).getSource();
             var geometry =  new ol.geom.Point(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'));
            var ft = new ol.Feature({
                  geometry: geometry,
                  label: "position"
            });
            source.addFeature(ft);
            console.log("geometry : ");
            console.log(geometry );
            //feature.setGeometry(geometry);
            //this.interaction.getFeatures().clear();
            //this.interaction.getFeatures().push(ft);
            console.log("feature: ");
            //console.log(feature);
            var center = [lon, lat];
            this.moveCenter(center);
            this.map.getView().setZoom(14);

        }
    });
});
