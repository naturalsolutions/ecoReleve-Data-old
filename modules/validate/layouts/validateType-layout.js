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
        className: 'container ',
        template: template,

        events: {
            'click table.backgrid tbody tr :not(.btn)': 'showDetail'
        },

        initialize: function(options) {
            this.type=options.type;
            var self = this;

            console.log(this.type);
            switch(this.type){
                case 'gsm':
                    var Data = Backbone.Collection.extend({
                        url: config.coreUrl + 'dataGsm/unchecked/list',
                    });
                    break;
                case 'argos':
                    var Data = Backbone.Collection.extend({
                        url: config.sensorUrl + 'argos/unchecked/list',
                    });
                    break;
                default:
                    console.warn('type error');
                    break;
            };

/*            var Data = Backbone.Collection.extend({
                url: config.coreUrl + 'dataGsm/unchecked/list',
            });
*/

            this.datas = new Data();
            var ModelRow = Backgrid.Row.extend({
              render: function() {
                ModelRow.__super__.render.apply(this, arguments);
                this.$el.data('model', this.model);
                if (this.model.attributes.ind_id == null) {
                    this.el.classList.add('red-row');
                }
                return this;
              }
            });


            var ImportCell = Backgrid.Cell.extend({
                template: _.template('<div style="text-align:center;"><button class="btn">Validate 1/hour</button></div>'),
                events: {
                  'click': 'importRow'
                },
                importRow: function (e) {
                  e.preventDefault();
                  self.auto_valide(e);
                },
                render: function () {
                  this.$el.html(this.template());
                  this.delegateEvents();
                  return this;
                }
            });

            var ImportAllCell = Backgrid.HeaderCell.extend({
                template: _.template('<button class="btn btn-success">Validate ALL 1/hour</button>'),
                events: {
                  'click': 'importAllRow'
                },
                importAllRow: function (e) {
                  e.preventDefault();
                  
                  self.auto_valide_ALL(e);
                },
                render: function () {
                  this.$el.html(this.template());
                  this.delegateEvents();
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
                            if (rawValue==null) {
                                rawValue='WARNING ==> No Individual attached !';
                            }
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
              
            }, {
                name: 'begin_date',
                label: 'Begin date',
                editable: false,
                cell: 'String',
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function (rawValue, model) {
                            if (rawValue==null) {
                                rawValue='Row data between : '+model.attributes.min_date; ;
                            }
                         return rawValue;
                      }
                }),
              
            }, {
                name: 'end_date',
                label: 'End date',
                editable: false,
                cell: 'String',
                formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
                    fromRaw: function (rawValue, model) {
                            if (model.attributes.begin_date==null) {
                                rawValue='to '+model.attributes.max_date; ;
                            }
                         return rawValue;
                      }
                }),
              
            }, {
                name: 'Import',
                label: 'Import',
                editable: false,
                cell: ImportCell,
                headerCell: ImportAllCell
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
            $('body').addClass('home-page full-height');
            $('#main-region').addClass('obscur full-height');
        },
        onDestroy: function() {
            $('#main-region').removeClass('obscur');
        },
        showDetail: function(evt) {
            if ($(evt.target).is('button')) {
                return
            }
            var model = $(evt.target).parent().data('model'); 
            var ind_id=model.attributes.ind_id;
            var ptt=model.attributes.platform_;
            Radio.channel('route').command('validate_type_id', this.type, ptt, ind_id);
        },

        auto_valide: function (evt) {
            console.log('import click ! ')
            var model = $(evt.target).parent().parent().parent().data('model'); 
            var ind_id=model.attributes.ind_id;
            var ptt=model.attributes.platform_;

            $.ajax({
                url:config.coreUrl+'dataGsm/' + ptt + '/unchecked/'+ind_id+'/import/auto',
                contentType: 'application/json',
                type: 'POST',
                
            });

        },

        auto_valide_ALL: function () {
            console.log('import ALLL click ! ')
            $.ajax({
                url:config.coreUrl+'dataGsm/unchecked/importAll/auto',
                contentType: 'application/json',
                type: 'POST',
                
            });

        },




    });
});
