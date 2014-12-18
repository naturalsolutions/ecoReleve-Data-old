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
            'click #reset' : 'reset',
            
        },
        regions: {
            gridRegion: '#gridContainer',
            mapRegin : '#mapContainer'
        },
        feedTpl: function(){
            
        },

        initModel: function(myTpl){// Initialisation du model à partir du template    
            //Step.prototype.parseOneTpl.call(this);
           
            this.parseOneTpl(this.template);
            
        },
        onShow: function(){
        
            var map = new Map();
                this.mapRegin.show(map);
                var collection = this.model.get('data_FileContent') ; 
                map.addCollection(collection);
                //Radio.channel('import').command('initGrid');
                var mygrid = new Grid({collections : collection});
                this.gridRegion.show(mygrid);
                
        }
        /*
        feedTpl: function(){
            var NomFichier = this.model.get(this.name + '_FileName');
            this.$el.find('#FileName').val(NomFichier) ;
        },
        */
        

        

    });

});
