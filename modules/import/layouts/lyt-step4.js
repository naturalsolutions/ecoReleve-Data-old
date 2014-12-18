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
        
        nextOK: function(){
        
                // create a new collection for models to import
                var filteredCollection  = new Waypoints(this.model.get('data_FileContent').where({import: true}));
                console.log(filteredCollection);
                // now, it will save on localStorage.myCollectionStorage
                //filteredCollection.save();
                
                //console.log('fin, sauvegarde data');
               // get date from form
                var fieldWorkersNumber = this.model.get(this.name + '_import-fwnb');
                var user1 = this.model.get(this.name + '_import-fwnb');
                filteredCollection.each(function(model) {
                    //model.set('fieldActivity', self.selectedActivity);
                    model.set('fieldWorker1', user1);
                    model.set('fieldWorker2', this.model.get(this.name + '_importWorker2'));
                    model.set('fieldWorker3', this.model.get(this.name + '_importWorker3'));
                    model.set('fieldWorker4', this.model.get(this.name + '_importWorker4'));
                    model.set('fieldWorker5', this.model.get(this.name + '_importWorker5'));
                    model.set('fieldActivity',this.model.get(this.name + '_importFieldActivity'));
                    model.set('Precision', 10);
                    model.set('fieldWorkersNumber', fieldWorkersNumber);
                });
                
                var ctx=this;
                

               
               // send filtred collection to the server
               var url=config.coreUrl + 'station/addMultStation/insert';
                $.ajax({
                    url:url,
                    context:this,
                    type:'POST',
                    data: JSON.stringify(filteredCollection.models),
                    dataType:'json',
                    success: function(resp){
                        var storedCollection = new Waypoints();
                        storedCollection.fetch();
                        storedCollection.reset(resp.data);
                        storedCollection.save();
                        console.log(storedCollection);
                        var msg = resp.response;
                        $('#importResponseMsg').text(msg);
                        return true;
                    },
                    error: function(data){
                        alert('error sending gpx collection');
                    }
                });
                
        }
        /*
        feedTpl: function(){
            var NomFichier = this.model.get(this.name + '_FileName');
            this.$el.find('#FileName').val(NomFichier) ;
        },
        */
        

        

    });

});
