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
    'config',

], function($, _, Backbone, Marionette, Radio, View1, Step, Waypoints,Map,Grid,config) {

    'use strict';

    return Step.extend({

        events : {
            'change .fiedWrk' : 'updateNbFieldworks'
        },
       importFile: function(){
            // create a new collection for models to import
            var filteredCollection  = new Waypoints(this.model.get('data_FileContent').where({import: true}));
            console.log(filteredCollection);

            var fieldWorkersNumber = this.model.get(this.name + '_import-fwnb');
            var user1 = this.model.get(this.name + '_importWorker1');
            var self = this;
            filteredCollection.each(function(model) {
                //model.set('fieldActivity', self.selectedActivity);
                // get current value, if not exisits, replace it with the global val
                var currentFieldActivity = model.get('fieldActivity');
                /*if(!currentFieldActivity ) {
                    currentFieldActivity = self.model.get(self.name + '_importFieldActivity');
                }*/
                model.set('fieldWorker1', user1);
                model.set('fieldWorker2', self.model.get(self.name + '_importWorker2'));
                model.set('fieldWorker3', self.model.get(self.name + '_importWorker3'));
                model.set('fieldWorker4', self.model.get(self.name + '_importWorker4'));
                model.set('fieldWorker5', self.model.get(self.name + '_importWorker5'));
                model.set('fieldActivity',currentFieldActivity);
                model.set('Precision', 10);
                model.set('fieldWorkersNumber', fieldWorkersNumber);
            });
           // send filtred collection to the server
           var url=config.coreUrl + 'station/addMultStation/insert';
           var result = false; 
            $.ajax({
                url:url,
                context:this,
                type:'POST',
                data: JSON.stringify(filteredCollection.models),
                dataType:'json',
                async: false,
                success: function(resp){
                    var storedCollection = new Waypoints();
                    storedCollection.fetch();
                    storedCollection.reset(resp.data);
                    storedCollection.save();
                    console.log(storedCollection);
                    var msg = resp.response;
                    this.model.set('ajax_msg', msg) ; 
                    result = true; 
                },
                error: function(data){
                    alert('error sending gpx collection');
                }
            });
            return result;
        },
        onShow: function(){
            this.getUsers();
        },
        getUsers : function(){
            var url = config.coreUrl + 'user';
            $.ajax({
                context: this,
                url: url,
                dataType: 'json'
            }).done( function(data) {
                this.generateDatalist(data);
            });
        },
        generateDatalist : function(data){
            var UsersList = '';
            data.forEach(function(user) {
                //value="' + user.PK_id +'"
                UsersList += '<option>' + user.fullname + '</option>';
            });
            $('#import-worker1').append(UsersList);
        },
        updateNbFieldworks : function(e){
            var fieldValue = $(e.target).val();
            var nbFW = parseInt($('#import-fwnb').val());
            if(fieldValue){
                nbFW += 1;
            } else {
                nbFW -= 1;
            }
            $('#import-fwnb').val(nbFW);
        }
    });

});
