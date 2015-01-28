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
        events: {
            'click #import-btn': 'import_checked',
            'click #1pH-btn': 'perhour',
            'click #clearAll-btn': 'clearAll',
        },

        initialize: function(){
            console.log(this.model.attributes.ptt);
            
            this.model.urlRoot=config.coreUrl+'dataGsm/'+this.model.attributes.ptt+'/details',
            this.model.fetch();
            console.log(this.model);
        },

        onShow: function() {
         
        },
        serializeData: function(){
            var data = this.model.toJSON();
            return data;
        },
        import_checked : function(){
            Radio.channel('gsm-detail').command('import',this.model.attributes.ind_id);
        },

        perhour: function(){
            Radio.channel('gsm-detail').command('1perhour');
        },


        clearAll: function(){
            Radio.channel('gsm-detail').command('clearAll');
        }

    });
});
