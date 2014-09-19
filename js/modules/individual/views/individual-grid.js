define([
    'moment',
    'jquery',
    'underscore',
    'backbone',
    'backgrid',
    'marionette',
    'radio',
    'config',
    'text!templates/individual/individual-list.html'
], function(moment, $, _, Backbone, Backgrid, Marionette, Radio, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

        events :{
            'click tbody > tr': 'detail',
        },

        initialize: function() {
            this.radio = Radio.channel('individual');
            this.radio.comply('update', this.update, this);

            var Individual = Backbone.Model.extend({});
            var Individuals = Backbone.Collection.extend({
                model: Individual,
                url: config.coreUrl + 'individuals/search'
            });
            var individuals = new Individuals();

            var columns = [{
                name: 'id',
                label: 'ID',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                })
            }, {
                editable: false,
                name: 'ptt',
                label: 'PTT',
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                })
            }, {
                editable: false,
                name: 'age',
                label: 'AGE',
                cell: 'string'
            }, {
                editable: false,
                name: 'origin',
                label: 'ORIGIN',
                cell: 'string'
            }, {
                editable: false,
                name: 'species',
                label: 'SPECIES',
                cell: 'string'
            }, {
                editable: false,
                name: 'sex',
                label: 'SEX',
                cell: 'string'
            }];

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: individuals,
            });

            individuals.fetch({
                reset: true,
                data:JSON.stringify({limit:50}),
                contentType:'application/json',
                type:'POST'
            });
        },

        update: function(args) {
            this.grid.collection.fetch({
                reset: true,
                data:JSON.stringify({criteria:args.filter, limit:50}),
                contentType:'application/json',
                type:'POST'
            });
        },

        onShow: function() {
            var height = $(window).height();
            height -= $('#header-region').height() + $('#main-panel').outerHeight();
            this.$el.height(height);
            $('#gridContainer').append(this.grid.render().el);
        },

        onDestroy: function(){
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
