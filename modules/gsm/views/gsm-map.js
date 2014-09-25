define([
    'ol3',
    'config',
    'radio',
    'modules2/map/views/basemap'
], function(ol, config, Radio, BaseMap) {

    'use strict';

    return BaseMap.extend({

        initialize: function() {
            Radio.channel('gsm-detail').comply('moveCenter', this.moveCenter, this);
            Radio.channel('gsm-detail').comply('updateMap', this.updateMap, this);
        },

        onShow: function() {
            BaseMap.prototype.onShow.apply(this, []);
            this.interaction = new ol.interaction.Select({
                condition: ol.events.condition.click
            });
            this.map.addInteraction(this.interaction);
            this.interaction.getFeatures().on('add', function(e) {
                Radio.channel('gsm-detail').command('updateGrid', e.element.id_);
            });
            this.loadGeoJSON(config.coreUrl + 'dataGsm/12/unchecked?format=geojson');
        },

        onRemove: function() {
            Radio.channel('gsm-detail').stopComplying('moveCenter');
        },

        updateMap: function(model) {
            var id = model.get('id');
            var lat = model.get('lat');
            var lon = model.get('lon');
            var feature = this.map.getLayers().item(1).getSource().getFeatureById(id);
            //console.log(feature);
            this.interaction.getFeatures().clear();
            this.interaction.getFeatures().push(feature);
            // center map to selected point
            var center = [lon, lat];
            //this.map.getView().setCenter(ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857'));
            this.moveCenter(center);

        }
    });
});
