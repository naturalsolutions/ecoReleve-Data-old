define([
    'ol3',
    'config',
    'radio',
    'modules2/map/views/basemap'
], function(ol, config, Radio, BaseMap) {

    'use strict';

    return BaseMap.extend({

        initialize: function() {
            Radio.channel('gsm').comply('moveCenter', this.moveCenter, this);
        },

        onShow: function() {
            BaseMap.prototype.onShow.apply(this, []);
            var interaction = new ol.interaction.Select({
                condition: ol.events.condition.click
            });
            this.map.addInteraction(interaction);
            interaction.getFeatures().on('add', function(e) {
                Radio.channel('gsm-detail').command('addToSelected', e.element.values_.id);
            });
            this.loadGeoJSON(config.coreUrl + 'dataGsm/278/unchecked');
        },

        onRemove: function() {
            Radio.channel('gsm').stopComplying('moveCenter');
        }
    });
});
