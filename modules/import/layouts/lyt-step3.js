define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'stepper/level1-demo',
    'stepper/lyt-step',
    'collections/waypoints',
    'modules2/import/views/import-map',
    'modules2/import/views/import-grid',

], function($, _, Backbone, Marionette, Radio, View1, Step, Waypoints,Map,Grid) {

    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        events : {
            'change #importFieldActivity' : 'setFieldActivity'
        },
        regions: {
            gridRegion: '#gridContainer',
            mapRegin : '#mapContainer'
        },
        feedTpl: function(){
            
        },
        initModel: function(myTpl){
            this.parseOneTpl(this.template);
        },
        onShow: function(){
        
            var map = new Map();
                this.mapRegin.show(map);
                var collection = this.model.get('data_FileContent') ; 
                map.addCollection(collection);
                Radio.channel('import').command('initGrid');
                var mygrid = new Grid({collections : collection});
                this.gridRegion.show(mygrid);
                
        },
        setFieldActivity : function(e){
            var currentFieldVal = $(e.target).val();
            var collection = this.model.get('data_FileContent') ; 
             collection.each(function(model) {
                model.set('fieldActivity',currentFieldVal); 
            });
        }
    });

});
