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
            'click #next-btn': 'perhour'
        },

        initialize: function(){
            
            this.model.urlRoot=config.coreUrl+'dataGsm/details',
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
            Radio.channel('gsm-detail').command('import',{id_ind:this.model.ind_id});
        },

        perhour: function(){
            Radio.channel('gsm-detail').command('1perhour',{});

        }

    });
});
