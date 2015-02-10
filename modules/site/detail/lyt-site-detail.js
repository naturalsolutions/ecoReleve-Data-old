define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'text!./tpl-site-detail.html',
    './view-site-map',
    './view-site-infos',
    'models/monitoredsite',

], function($, _, Backbone, Marionette, config, Radio, tpl, MapView, InfosView, Site) {

    return Marionette.LayoutView.extend({
        template: tpl,
        className: 'full-height',

        events: {
            'click #back' : 'back2list',
        },

        regions: {
            pan_detail : '#pan-detail',
        },

        initialize: function(options){
            this.id = options.id;
            this.model = new Site({id: this.id});
            $.ajax({
                url: config.coreUrl+ '/monitoredSite/detail/'+this.id+ '/geoJSON',
                success: function(data) {
                    console.log(data)
                }
                
            });
        },

        onRender: function(){
            this.pan_detail.show(new InfosView({
                model: this.model,
                id: this.id
            }));
            this.map = new MapView({
                model: this.model,
                id: this.id
            });

        },

        displayView: function(){

        },

        back2list: function(){
            Radio.channel('route').command('site');
        },
    });
});
