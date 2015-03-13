define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'ns_modules_map/ns_map',

], function($, _, Backbone , Marionette, config, Radio,
    NsMap
    ) {

    'use strict';

    return Marionette.ItemView.extend({
        events: {

        },
        initialize: function(options) {
            this.model = options.model;
            this.id= options.id;
            this.model.bind('change', this.initMap, this);
            this.initGeoJson();
        },

        initGeoJson: function(){
            var url = config.coreUrl+'/monitoredSite/detail/'+this.id+ '/geoJSON';
            $.ajax({
                url: url,
                contentType:'application/json',
                type:'GET',
                context: this,
            }).done(function(datas){
                this.initMap(datas);
            }).fail(function(msg){
                console.log(msg);
            });
        },

        initMap: function(geoJson){
            var activePos = {'type':'FeatureCollection', 'features': []};

            var infos = geoJson;

            for (var i = 0; i < infos.length; i++) {
                console.log('passed');
                if(!infos[i]['properties']['end']){
                    console.log(infos[i].geometry)
                    activePos.features.push({
                        'type':'Feature',
                        'checked' : true,
                        'geometry': infos[i].geometry,
                        'properties' : infos[i].properties,
                    });
                }
                else{
                    activePos.features.push({
                        'type':'Feature',
                        'checked' : false,
                        'geometry':infos[i].geometry,
                        'properties' : infos[i].properties,
                    });
                }
            };

            this.map = new NsMap({
                geoJson: activePos,
                zoom: 9,
                element : 'mapDetail',
                popup: true,
            });
            var ctx = this;
            this.map.init();
        },

        update: function(){

        },
    });
});
