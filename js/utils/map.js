define([
    'models/point',
    'views/map'
], function(Point, Map) {

    'use strict';

    return {
        init: function(target, point, zoom) {
            var initPoint = point || (new Point({
                latitude: 43.29,
                longitude: 5.37,
                label: "bureau"
            }));
            var mapZoom = zoom || 12;
            var map_view = new Map({
                el: $(target),
                center: initPoint,
                zoom: mapZoom
            });
            return map_view;
        }
    };
});
