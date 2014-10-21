define([
    'ol3',
    'radio',
    'modules2/map/views/basemap'
], function(ol, Radio, BaseMap) {

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
            Radio.channel('rfid').stopComply('addOverlay');
        }
    });
});
