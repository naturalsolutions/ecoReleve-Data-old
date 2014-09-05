define([
    "marionette",
], function(Marionette) {

    "use strict";

    return Backbone.Marionette.Controller.extend({
        initialize: function() {
            this.evt = new Backbone.Wreqr.EventAggregator();
        },

        onDestroy: function() {
            this.evt.stopListening();
            delete this.evt;
        }
});
