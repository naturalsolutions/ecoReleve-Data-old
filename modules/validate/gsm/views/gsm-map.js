define([
    'ol3',
    'config',
    'radio',
    'modules2/map/views/basemap'
], function(ol, config, Radio, BaseMap) {

    'use strict';

    return BaseMap.extend({

        initialize: function(options) {
            this.gsmID = options.gsmID;
            Radio.channel('gsm-detail').comply('moveCenter', this.moveCenter, this);
            Radio.channel('gsm-detail').comply('updateMap', this.updateMap, this);
            Radio.channel('gsm-detail').comply('colorizeSelectedRows', this.colorizeSelectedRows, this);
        },

        onShow: function() {
            BaseMap.prototype.onShow.apply(this, []);
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

            this.colorInteraction = new ol.interaction.Select({
                style:this.selected_style,
            });

            this.interaction = new ol.interaction.Select({
               
            });
            this.mapInteraction = new ol.interaction.Select({
              condition: ol.events.condition.click,
              style:this.selected_style,
            });
            this.map.addInteraction(this.mapInteraction);
            this.map.addInteraction(this.colorInteraction);
            this.map.addInteraction(this.interaction);

            this.mapInteraction.getFeatures().on('add', function(e) {
                
                this.clear();
                self.interaction.getFeatures().clear();
                console.log(e.element);
                if (self.colorInteraction.getFeatures().remove(e.element)) {
                    console.log('already checked');
                    Radio.channel('gsm-detail').command('updateGrid', {id:e.element.id_, checked:false});
                }
                else Radio.channel('gsm-detail').command('updateGrid', {id:e.element.id_, checked:true});

            });
            this.loadGeoJSON(config.coreUrl + 'dataGsm/' + this.gsmID + '/unchecked?format=geojson');
        },

        onRender: function() {
            this.$el.height($(window).height() - $("#header-region").height() -
                $("#info-container").height());
        },

        onRemove: function() {
            Radio.channel('gsm-detail').stopComplying('moveCenter');
        },

        updateMap: function(model) {
            var id = model.get('id');
            var lat = model.get('lat');
            var lon = model.get('lon');
            var nblayers =  this.map.getLayers().getLength();
            // vector layer is the latest one 
            var feature = this.map.getLayers().item(nblayers - 1).getSource().getFeatureById(id);
            //var feature = this.map.getLayers().item(1).getSource().getFeatureById(id);
            this.interaction.getFeatures().clear();
            this.interaction.getFeatures().push(feature);
            // center map to selected point
            var center = [lon, lat];
            this.moveCenter(center);

        },

        colorizeSelectedRows: function(data){
           
            var nblayers =  this.map.getLayers().getLength();
            var featureLayer=this.map.getLayers().item(nblayers - 1).getSource();
           
            this.colorInteraction.getFeatures().clear();
            var i;
            for (i in data){
                var model=data[i];
                var feature= featureLayer.getFeatureById(model.get('id'));
                this.colorInteraction.getFeatures().push(feature);
            }
   
        }
    });
});
