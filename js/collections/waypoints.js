define([
    'backbone',
    'backboneLocalstorage'

], function(Backbone, localStorage){
    'use strict';
    return Backbone.Collection.extend({

        localStorage : new Store('waypointList'),
        //sync: LocalforageBackbone.sync('waypointList'),
       save: function() {
            this.each(function(model) {
                model.save();
            });
        },
        destroy : function(){
            do{
                this.each(function(model){
                        model.destroy();
                });
            }
            while (this.length > 0);  
        }
    });

    });
