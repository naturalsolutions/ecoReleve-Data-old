define([
    'marionette',
    'views/info',
    'views/graph',
    'text!templates/home_new.html'
], function(Marionette, InfoView, GraphView, homeTemplate) {

    'use strict';

    return Marionette.LayoutView.extend({
        views: {},
        template: _.template(homeTemplate),
        regions: {
            graph: '#graph',
            info: '#info'
        },

        initialize: function() {
            this.views.info = new InfoView();
            this.views.graph = new GraphView();
        },

        onRender: function(){
            this.graph.show(this.views.graph);
            this.info.show(this.views.info)
        }
    });
});
