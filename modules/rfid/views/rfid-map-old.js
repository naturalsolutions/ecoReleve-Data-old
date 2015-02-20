define([
    'radio',
    'modules2/map/views/basemap',
    'ns_modules_map/ns_map',

], function(Radio, BaseMap, NsMap) {

    'use strict';

    return BaseMap.extend({

        initialize: function() {
            Radio.channel('rfid').comply('moveCenter', this.moveCenter, this);
            Radio.channel('rfid').comply('addOverlay', this.addOverlay, this);
        },

        onRender: function() {
            this.$el.find('#map').height($('#form-container').height())
        },

        onRemove: function() {
            Radio.channel('rfid').stopComplying('moveCenter');
            Radio.channel('rfid').stopComplying('addOverlay');
        }
    });
});
