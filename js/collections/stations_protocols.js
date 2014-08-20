define([
    'backbone',
    'localforage',
    'localforage_backbone',
    'moment',
    'models/station_protocol',
], function(Backbone, localforage, localforage_backbone, moment, StationProtocol){
    'use strict';
    return Backbone.Collection.extend({
        model: StationProtocol,
        sync: Backbone.localforage.sync('StationProtocolList'),

        save: function() {
            this.each(function(model) {
                model.save();
            });
        },

        getFiltredItems: function(stationName, protocolName, beginDate, endDate) {
            // if datemin ="", set his value to 0
            var minDate;
            if(!beginDate){
                minDate = moment(0);
            } else {
                minDate = moment(beginDate);
            }
            var maxDate;
            if(!endDate){
                maxDate = moment("01/01/2100");
            } else {
                maxDate = moment(endDate);
            }

            var filtredCollection = this.models.filter(function(model) {
                var dateVal = moment(model.get('date'));
                var station = model.get('station');
                var checkStation = -1;
                if (station){
                     checkStation = station.indexOf(stationName);
                }
                var protocol = model.get('protocol');
                var checkPprotocol = -1;
                if (protocol){
                    checkPprotocol = protocol.indexOf(protocolName);
                }
                return  (checkStation >= 0) &&  // filter / station name
                    (checkPprotocol >= 0) && // filter / protocole name
                    (dateVal >= minDate) && // filter / date min
                    (dateVal <= maxDate); // filter / date max
            });
            return filtredCollection;
        }
    });
});
