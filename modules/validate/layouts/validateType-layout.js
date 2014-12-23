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

            console.log(this.type)
            var Data = Backbone.Collection.extend({
                url: config.coreUrl + 'dataGsm/unchecked/list',
            });

            this.datas = new Data();
            var ModelRow = Backgrid.Row.extend({
              render: function() {
                ModelRow.__super__.render.apply(this, arguments);
                this.$el.data('model', this.model);
                return this;
              }
            });

            var columns = [{
                name: 'platform_',
                label: 'GSM ID',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                }),
                
            }, {
                name: 'ind_id',
                label: 'Individual ID',
                editable: false,
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function (rawValue, model) {
                            if (rawValue==null) rawValue='WARNING ==> No Individual attached !';
                         return rawValue;
                      }
                }),
                cell: 'string',
                
            }, {
                name: 'nb',
                label: 'Number of unchecked locations',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                }),
              
            }];

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: this.datas,
                row:ModelRow
            });

            this.datas.fetch({reset: true});
        },

        onShow: function(){
            this.$el.find('#list').append(this.grid.render().el);
        },

        showDetail: function(evt) {
            var model = $(evt.target).parent().data('model'); 
            console.log(model);
            var ind_id=model.attributes.ind_id;
            var ptt=model.attributes.platform_;
            console.log(ptt);
            Radio.channel('route').command('validate_type_id', this.type, ptt, ind_id);
        },




    });
});
