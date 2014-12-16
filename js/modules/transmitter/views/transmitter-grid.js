define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'config',
    'text!templates/transmitter/transmitter-list.html'
], function($, _, Backbone, Marionette, Radio, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

        events :{
            'click tbody > tr': 'detail',
        },

        initialize: function() {
            this.radio = Radio.channel('transmitter');
            this.listenTo(this.radio, 'update', this.update);

            var Transmitter = Backbone.Model.extend({});
            var Transmitters = Backbone.Collection.extend({
                model: Transmitter,
                url: config.coreUrl + 'transmitter/search'
            });
            this.transmitters = new Transmitters();
            this.listenTo(this.transmitters, 'reset', this.render);

            var columns = [{
                name: 'PK_id',
                label: 'ID',
                editable: false,
                cell: Backgrid.IntegerCell.extend({
                    orderSeparator: ''
                })
            }, {
                editable: true,
                name: 'type_',
                label: 'TYPE',
                cell: 'string'
            }, {
                editable: true,
                name: 'identifier',
                label: 'IDENTIFIER',
                cell: 'string'
            }, {
                editable: true,
                name: 'ptt',
                label: 'PTT',
                cell: 'string'
            }, {
                editable: false,
                name: 'creation_date',
                label: 'CREATION DATE',
                cell: 'datetime'
            }];

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: this.transmitters
            });

            this.transmitters.fetch({
                reset: true,
                data:JSON.stringify({limit:50}),
                contentType:'application/json',
                type:'POST'
            });
        },

        update: function(args) {
            this.transmitters.fetch({
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
            delete this.transmitters;
        },

        detail: function(evt) {
            var row = $(evt.currentTarget);
            var id = $(row).find(':first-child').text()
            Radio.channel('route').trigger('transmitter:detail', {id: id});
        }
    });
});
