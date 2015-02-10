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
    'ns_modules_com',

], function($, _, Backbone, Marionette, Radio, View1, Step, Waypoints,Map,Grid, Com) {

    'use strict';

    return Step.extend({
        /*===================================================
        =            Layout Stepper Orchestrator            =
        ===================================================*/
        className: 'importGPX',

        events : {
            'change #importFieldActivity' : 'setFieldActivity',
            'click #resetFieldActivity' : 'resetFieldActivity',
        },
        regions: {
            gridRegion: '#gridContainer',
            mapRegion : '#mapContainer'
        },
        feedTpl: function(){
            
        },
        initModel: function(myTpl){
            this.parseOneTpl(this.template);
        },
        onShow: function(){
            var collection = this.model.get('data_FileContent') ;

            this.com = new Com();


            var myCell = Backgrid.NumberCell.extend({
                decimals: 5,
                orderSeparator: ' ',
            });


            var map = new Map({
                com: this.com,
                collection: collection
            });

            
            this.mapRegion.show(map);

            

            //map.addCollection(collection);

            Radio.channel('import').command('initGrid');

            var mygrid = new Grid({
                collections : collection,
                com: this.com,
            });

            this.gridRegion.show(mygrid);
                
        },
        setFieldActivity : function(e){
            var currentFieldVal = $(e.target).val();
            this.$el.find('#locations tr').each(function(){
                $(this).find('select').val(currentFieldVal);
            });
            var collection = this.model.get('data_FileContent') ; 
             collection.each(function(model) {
                model.set('fieldActivity',currentFieldVal);
            });
        },


        resetFieldActivity : function(e){
            console.log('passed');
            this.$el.find('#importFieldActivity').val('');
            this.$el.find('#locations tr').each(function(){
                $(this).find('select').val('');
            });
            var collection = this.model.get('data_FileContent') ; 
             collection.each(function(model) {
                model.set('fieldActivity','');
            });
        }
    });

});
