define([
    'marionette',
    'views/graph',
    'views/info',
    'chart',
    'config',
    'text!templates/home_new.html'
], function(Marionette, GraphView, InfoView, Chart, config, homeTemplate) {

    'use strict';

    return Marionette.LayoutView.extend({
        className:'home container',
        views: {},
        template: _.template(homeTemplate),
        regions: {
            info: '#info'
        },

        initialize: function() {
            this.views.info = new InfoView();
        },

        onRender: function(){
            console.log('render home');
            if(this.views.graph === undefined){
                this.views.graph = new GraphView();
            }
            this.info.show(this.views.info);
        }
    });
});
