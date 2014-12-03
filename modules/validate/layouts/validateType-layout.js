define([
    'jquery',
    'underscore',
    'marionette',
    'radio',
    'config',
    'text!modules2/validate/templates/tpl-validateType.html'
], function($, _, Marionette, Radio, config, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container no-padding',
        template: template,

        events: {
            'click table.backgrid tbody tr': 'showDetail'
        },

        initialize: function(options) {
            this.type=options.type;


            var Data = Backbone.Collection.extend({
                url: config.coreUrl + 'dataGsm/unchecked/list',
            });

            var data = new Data();

            var columns = [{
                name: 'platform_',
                label: 'GSM ID',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                })
            }, {
                name: 'nb',
                label: 'Number of unchecked locations',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                })
            }];

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: data
            });

            data.fetch({reset: true});
        },

        onShow: function(){
            this.$el.find('#list').append(this.grid.render().el);
        },

        showDetail: function(evt) {
            var id = $(evt.target).parent().find('td').first().text();
            Radio.channel('route').command('validate:type:id', this.type, id);
        },




    });
});
