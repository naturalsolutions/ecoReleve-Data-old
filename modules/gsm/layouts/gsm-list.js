define([
    'marionette',
    'radio',
    'config',
    'text!modules2/gsm/templates/gsm-list.html'
], function(Marionette, Radio, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        className: 'container-fluid no-padding',
        template: template,

        events: {
            'click table.backgrid tbody tr': 'showDetail'
        },

        onShow: function() {
            var Data = Backbone.Collection.extend({
                url: config.coreUrl + 'dataGsm/unchecked/list',
            });

            var data = new Data();

            var columns = [{
                name: "platform_",
                label: "GSM ID",
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                })
            }, {
                name: "nb",
                label: "Number of unchecked locations",
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

            this.$el.find("#gsm-list").append(this.grid.render().el);

            data.fetch({reset: true});
        },

        showDetail: function(evt) {
            var id = $(evt.target).parent().find('td').first().text();
            Radio.channel('route').command('gsm', id);
        }
    });
});
