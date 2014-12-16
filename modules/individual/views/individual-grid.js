define([
    'moment',
    'jquery',
    'underscore',
    'backbone',
    'backbone.paginator',
    'backgrid',
    'backgrid.paginator',
    'marionette',
    'radio',
    'config',
    'text!modules2/individual/templates/individual-list.html'
], function(moment, $, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, Radio, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        className: 'full-height grid scroll-auto',
        template: template,

        events :{
            'click tbody > tr': 'detail',
            'click #export-btn': 'export',
        },

        initialize: function(options) {
            this.radio = Radio.channel('individual');
            this.radio.comply('update', this.update, this);

            var Individuals = PageableCollection.extend({
                sortCriteria: {'id':'asc'},
                url: config.coreUrl + 'individuals/search',
                mode: 'server',
                state:{
                    pageSize: 25,
                },
                queryParams: {
                    offset: function() {return (this.state.currentPage - 1) * this.state.pageSize;},
                    criteria: function() {
                        console.log(this.searchCriteria);
                        return JSON.stringify(this.searchCriteria);},
                    order_by: function() {
                        var criteria = [];
                        for(var crit in this.sortCriteria){
                            criteria.push(crit + ':' + this.sortCriteria[crit]);
                        }
                        return JSON.stringify(criteria);},
                },
                fetch: function(options) {
                    options.type = 'POST';
                    PageableCollection.prototype.fetch.call(this, options);
                }
            });

            var individuals = new Individuals();

            var myHeaderCell = Backgrid.HeaderCell.extend({
                onClick: function (e) {
                    e.preventDefault();
                    var that=this;
                    var column = this.column;
                    var collection = this.collection;
                    var sortCriteria = (collection.sortCriteria && typeof collection.sortCriteria.id === 'undefined') ? collection.sortCriteria : {};
                    switch(column.get('direction')){
                        case null:
                            column.set('direction', 'ascending');
                            sortCriteria[column.get('name')] = 'asc';
                            break;
                        case 'ascending':
                            column.set('direction', 'descending');
                            sortCriteria[column.get('name')] = 'desc';
                            break;
                        case 'descending':
                            column.set('direction', null);
                            delete sortCriteria[column.get('name')];
                            break;
                        default:
                            break;
                    }
                    collection.sortCriteria = (Object.keys(sortCriteria).length > 0) ? sortCriteria : {'id': 'asc'};
                    collection.fetch({reset: true,});
                },
            });

            var columns = [{
                name: 'id',
                label: 'ID',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                }),
                headerCell: myHeaderCell
            }, {
                name: 'ptt',
                label: 'PTT',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                }),
                headerCell: myHeaderCell
            }, {
                name: 'age',
                label: 'AGE',
                editable: false,
                cell: 'string',
                headerCell: myHeaderCell
            }, {
                name: 'origin',
                label: 'ORIGIN',
                editable: false,
                cell: 'string',
                headerCell: myHeaderCell
            }, {
                name: 'species',
                label: 'SPECIES',
                editable: false,
                cell: 'string',
                headerCell: myHeaderCell
            }, {
                name: 'sex',
                label: 'SEX',
                editable: false,
                cell: 'string',
                headerCell: myHeaderCell
            }];


            console.log(individuals);

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: individuals,
            });
            var that=this;
            console.log(options.currentFilter);
            individuals.searchCriteria = options.currentFilter || {};
            individuals.fetch( {reset: true,   success : function(resp){ 
                        that.$el.find('#indiv-count').html(individuals.state.totalRecords+' individuals');
                        }
            } );

            /*
            this.paginator = new Backgrid.Extension.Paginator({
                collection: individuals
            });
*/
        },

         export: function(evt) {
            evt.preventDefault();
            this.radio.command('export',{});

        },

        update: function(args) {
            var that=this;
            console.log(args.filter);
            this.grid.collection.searchCriteria = args.filter;
            // Go to page 1
            this.grid.collection.state.currentPage = 1;
            this.grid.collection.fetch({reset: true, success:function(){
                that.$el.find('#indiv-count').html(that.grid.collection.state.totalRecords+' individuals');
            }

            });
        },

        onShow: function() {
            this.$el.parent().addClass('no-padding');
            $('#main-panel').css({'padding-top': '0'});
            this.$el.addClass('grid');


            // var height = $(window).height();
            // height -= $('#header-region').height() + $('#main-panel').outerHeight();
            // this.$el.find('#grid-row').height(height);
            // height = $(window).height();
            // this.$el.height(height-$('#header-region').height());

            //$('#paginator').html(this.paginator.render().el);
            $('#gridContainer').append(this.grid.render().el);
        },

        onDestroy: function(){
            $('#main-panel').css('padding-top', '20');
            this.grid.remove();
            this.grid.stopListening();
            this.grid.collection.reset();
            this.grid.columns.reset();
            delete this.grid.collection;
            delete this.grid.columns;
            delete this.grid;
        },

        detail: function(evt) {
            var row = $(evt.currentTarget);
            var id = $(row).find(':first-child').text()
            Radio.channel('route').trigger('indiv:detail', {id: id});
        }
    });
});
