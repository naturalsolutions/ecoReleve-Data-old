define([
    "jquery",
    "underscore",
    "backbone",
    "event_manager",
    'marionette',
    'config',
    'text!templates/argos.html'
], function($, _, Backbone, eventManager, Marionette, config, argosTemplate) {
    "use strict";
    return Marionette.LayoutView.extend ({
        className: "container-fluid",
        template: argosTemplate,
        ui: {
            ptt: "#ptt",
            ind: "#ind"
        },

        events: {
            "click #filter-btn": "filter",
            "click #clear-btn": "clear",
            "click tr": "detail"
        },

        initialize: function() {
            var url = config.sensorUrl + "/argos/unchecked/list";
            this.collection = new Backbone.Collection();
            this.data = new Backbone.Collection();
            this.listenTo(this.collection, "reset", this.render)
            $.ajax({
                context: this,
                url: url,
                dataType: "json"
            })
            .done( function(data) {
                this.data.reset(data);
                this.collection.reset(data);
            });
        },

        filter: function(elt) {
            elt.preventDefault();
            var filter = {};
            var ptt = this.ui.ptt.val();
            var ind = this.ui.ind.val();
            if(ptt || ind){
                if(ptt) { filter.ptt = parseInt(ptt); }
                if(ind) { filter.ind_id = parseInt(ind); }
                this.collection.reset(this.data.where(filter));
            }

        },

        clear: function(elt) {
            elt.preventDefault();
            this.collection.reset(this.data.models);
        },

        detail: function(e) {
            var row = $(e.currentTarget);
            var id = row.attr("data-id");
            eventManager.trigger("show:argos:detail", {
                collection: this.data.clone(),
                idToShow: id
            });
        },

        onDestroy: function() {
            this.data.reset();
            delete this.data;
        },
    });
});
