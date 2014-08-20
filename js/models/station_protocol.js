define([
    'backbone',
    'localforage',
    'localforage_backbone',
], function(Backbone, localforage, localforage_backbone){
    'use strict';
    return Backbone.Model.extend(
        // Instance properties
        { sync: Backbone.localforage.sync() },
        // Class properties
        {
            schema: {
                idStation: { type: 'Text', title: 'id' },
                station: { type: 'Text', title: 'station'},
                LAT: { type: 'Text', title: 'latitude', required: true },
                LON: { type: 'Text', title: 'longitude', required: true },
                date:{ type: 'Text', title: 'date' }, //,validators: ['required']
                protocol: { type: 'Text', title:'protocol' }
            },
            verboseName: "stationProtocol"
        }
    );
});
