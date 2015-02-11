define([
    'config',
    'radio',
    'ns_modules_map/ns_map',
    'text!modules2/import/templates/import-gpx-map.html',

], function(config, Radio, NsMap, tpl) {

    'use strict';

    return Marionette.LayoutView.extend({
        template: tpl,


        
        regions: {
            rg_map: '#rg_map',
        },
        

        initialize: function(options) {
            this.com = options.com;
            this.coll = options.collection;

            var features = {
                'features': [], 
                'type': 'FeatureCollection'
            };

            var feature, attr;
            this.collection.each(function(m){

                attr = m.attributes;
                feature = {
                    'type': 'Feature',
                    'id': attr.id,
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [attr.longitude, attr.latitude],
                    }, 
                    'properties': {
                        'date': '2014-10-23 12:39:29'
                    }, 
                    
                };
                features.features.push(feature);
            });

            this.features = features;

        },
        
        onShow: function(){
            this.map = new NsMap({
                cluster: true,
                popup: false,
                geoJson: this.features,
                com : this.com,
            });
            this.rg_map.show(this.map);
            this.map.init();
        },


        /*
        onShow: function() {
            BaseMap.prototype.onShow.apply(this, []);
            this.interaction = new ol.interaction.Select({
                condition: ol.events.condition.click
            });
            this.map.addInteraction(this.interaction);
            this.interaction.getFeatures().on('add', function(e) {
                //Radio.channel('import-gpx').command('updateGrid', e.element.id_);
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
                console.log(feature);
                //console.log('feature : ' + feature.values['id']);
                var geometry = feature.getGeometry();
                var coord = geometry.getCoordinates();
                var prop = feature.getProperties();
                var id = feature.getId();
                var label = prop.label;
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
        onRemove: function() {
            Radio.channel('import-gpx').stopComplying('updateMap');
        },
        updateMap: function(model) {
            var id = model.get('id');
            var lat = model.get('latitude');
            var lon = model.get('longitude');
            var nblayers =  this.map.getLayers().getLength();
            // vector layer is the latest one 
            var feature = this.map.getLayers().item(nblayers - 1).getSource().getFeatureById(id);
            this.interaction.getFeatures().clear();
            this.interaction.getFeatures().push(feature);
            var center = [lon, lat];
            this.moveCenter(center);
            //this.map.getView().setZoom(8);
        }
        */
    });
});
