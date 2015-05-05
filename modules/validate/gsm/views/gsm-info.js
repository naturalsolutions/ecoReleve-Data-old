define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.paginator',
    'backgrid',
    'backgrid.paginator',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/validate/gsm/templates/gsm-info.html'
], function($, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        modelEvents: {
            'change': 'render'
        },

        initialize: function(options){
            this.type = options.type;
            
            if(this.type == 'gsm'){
                this.model.urlRoot=config.coreUrl+'dataGsm/'+this.model.attributes.ptt+'/details';
            }else{
                this.model.urlRoot=config.sensorUrl+'argos/'+this.model.attributes.ptt+'/details';
            };

            this.model.fetch();
        },

        onShow: function() {
         
        },
        serializeData: function(){
            var data = this.model.toJSON();
            return data;
        }

    });
});
