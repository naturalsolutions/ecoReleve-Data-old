define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'radio',
    'config',
    'text!modules2/transmitter/templates/transmitter-list.html'
], function($, _, Backbone, Marionette, Radio, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

        className: 'full-height grid container-fluid',

        events :{
            'click tbody > tr': 'detail',
            'click #btn-export': 'exportGrid'
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
            /*
            var margin = 20;
            this.$el.css('margin-top', margin + 'px');
            var height = $(window).height();
            height -= $('#header-region').height() + margin;
            this.$el.height(height);
            */
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
        },

        exportGrid: function() {
            $.ajax({
                url: config.coreUrl + 'transmitter/export',
                data: JSON.stringify({criteria:this.filter}),
                contentType:'application/json',
                type:'POST'
            }).done(function(data) {
                var url = URL.createObjectURL(new Blob([data], {'type':'text/csv'}));
                var link = document.createElement('a');
                link.href = url;
                link.download = 'individual_search_export.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        },
    });
});
