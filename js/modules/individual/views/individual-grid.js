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
            this.listenTo(this.radio, 'update', this.update);

            var Individual = Backbone.Model.extend({});
            var Individuals = Backbone.Collection.extend({
                model: Individual,
                url: config.coreUrl + 'individuals/search'
            });
            this.individuals = new Individuals();
            this.listenTo(this.individuals, 'reset', this.render);

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
                name: 'specie',
                label: 'SPECIE',
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
                collection: this.individuals
            });

            this.individuals.fetch({
                reset: true,
                data:JSON.stringify({limit:50}),
                contentType:'application/json',
                type:'POST'
            });
        },

        update: function(args) {
            this.individuals.fetch({
                reset: true,
                data:JSON.stringify({criteria:args.filter, limit:50}),
                contentType:'application/json',
                type:'POST'
            });
        },

        onShow: function() {
            var margin = 20;
            this.$el.css('margin-top', margin + 'px');
            var height = $(window).height();
            height -= $('#header-region').height() + margin;
            this.$el.height(height);
        },

        onRender: function() {
            $('#gridContainer').append(this.grid.render().el);
        },

        onDestroy: function(){
            delete this.individuals;
        },

        detail: function(evt) {
            var row = $(evt.currentTarget);
            var id = $(row).find(':first-child').text()
            Radio.channel('route').trigger('indiv:detail', {id: id});
        }
    });
});
