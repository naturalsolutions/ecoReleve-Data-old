define([
    'moment'
], function(moment) {

    'use strict';

    return {
        isValid: function(datetime) {
            var dateFormats = ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'];
            return moment(datetime, dateFormats, true).isValid();
        }
    };
});
