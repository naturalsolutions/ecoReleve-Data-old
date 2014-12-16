define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'config',
    'radio',
    'backgrid',
    'bbForms',
    'backbone.paginator',
    'backgrid.paginator',


], function($, _, Backbone , Marionette, config, Radio,
    BbGrid, BbForms, PageableCollection, Paginator
    ){

    'use strict';

    return Marionette.ItemView.extend({
        events: {
/*            'click button#save' : 'save',
*/        },
        initialize: function() {
        	this.radio = Radio.channel('rfidN');

            var Locations = PageableCollection.extend({
                url: config.coreUrl + 'rfid/search',
                mode: 'client',
                state:{
                    pageSize: 25
                },
                queryParams: {
                    order: function(){
                    }
                },
                fetch: function(options) {
                    options.type = 'POST';
                    options.contentType='application/json';
                    PageableCollection.prototype.fetch.call(this, options);
                }
            });

            this.locations = new Locations();
            this.display();
        },

        display: function(){
            var myCell = Backgrid.NumberCell.extend({
                decimals: 3,
                orderSeparator: ' '
            });


            var columns = [{
                editable: true,
                name: 'FK_creator',
                label: 'FK_creator',
                cell: 'integer'
            }, {
                editable: true,
                name: 'identifier',
                label: 'identifier',
                cell: 'string'
            }, {
                editable: true,
                name: 'creation_date',
                label: 'creation_date',
                cell: 'date'
            }, {
                editable: true,
                name: 'lat',
                label: 'lat',
                cell: myCell
            }, {
                editable: true,
                name: 'lon',
                label: 'lon',
                cell: myCell
            }, {
                editable: true,
                name: 'begin_date',
                label: 'begin_date',
                cell: 'date'
            }, {
                editable: true,
                name: 'end_date',
                label: 'end_date',
                cell: 'date'
            }, {
                editable: true,
                name: 'name_Type',
                label: 'name_Type',
                cell: 'string'
            }, {
                editable: true,
                name: 'Name',
                label: 'Name',
                cell: 'string'
            }
            ];


            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: this.locations
            });



            var tmp=JSON.stringify({ criteria : ''});

            $('#grid').append(this.grid.render().el);

            this.paginator = new Backgrid.Extension.Paginator({
                collection: this.locations
            });

            $('#grid').append(this.paginator.render().el);
            this.locations.fetch({reset: true, data:  tmp });

            var tmp=this.locations;
            var url=config.coreUrl + 'rfid/update'; 


            this.locations.on('backgrid:edited', this.info, this);

        },

        info: function(m){
            var url=config.coreUrl+'/rfid/update';
            m.url=url;
            if(m.hasChanged())
                m.save();
        },

        onRender: function(){

        },

        update: function(filters){
            var url = config.coreUrl + 'rfid/search';
            var tmp=JSON.stringify({ criteria : filters});
            this.locations.fetch({reset: true, data: tmp });
        },

        save: function(){
            /*
            var url=config.coreUrl+'/test/';
            for (var i = 0; i < this.locations.fullCollection.length; i++) {
                    this.locations.fullCollection.models[i].url=url;
            };
            this.locations.fullCollection.url=url;
            console.log(this.locations.fullCollection.models);

            this.locations.fullCollection.sync('update', url);
            */
        },





    });
});
