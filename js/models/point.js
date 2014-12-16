define([
    'backbone'
], function(Backbone){

    'use strict';

    return Backbone.Model.extend({
        schema: {
            latitude:    { type: 'Number' },
            longitude:   { type: 'Number' },
            label : { type: 'Text' }
        }
    });
});

/* Reste des modèles présents dans NS.UI.Map */

/*
NS.UI.PointsList =  Backbone.Collection.extend({
    Model: NS.UI.Point
});
NS.UI.Protocol =  Backbone.Model.extend({
    schema: {
        url:    { type: 'Text' },
        format:   { type: 'Text' },
        cluster : { type: 'Boolean' },
        params : { type: 'Object' },
        strategies :{ type: '[]' }
    }
});
NS.UI.BBOXModel = Backbone.Model.extend({
    schema: {
        minLonWGS: { type: 'Number' },
        minLatWGS: { type: 'Number' },
        maxLonWGS: { type: 'Number' },
        maxLatWGS: { type: 'Number' }
    }
});*/
