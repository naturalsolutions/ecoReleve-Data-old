define([
    'jquery',
    'underscore',
    'backbone',
    'backgrid',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!modules2/gsm/templates/gsm-detail.html'
], function($, _, Backbone, Backgrid, Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        className:'detailsGsmPanel',

        events: {
            'click .backgrid-container tr': 'updateMap',
            'click #importChecked' : 'importChecked'
        },

        initialize: function() {
            this.radio = Radio.channel('gsm-detail');
            this.radio.comply('updateGrid', this.updateGrid, this);
        },

        updateGrid: function(id) {
            //console.log('detail' + id);
        },

        updateMap: function(evt) {
            var tr = $(evt.target).parent();
            var id = tr.find('td').first().text();
            var currentModel = this.locations.where({id: parseInt(id)})[0];
           // console.log(currentModel);
            Radio.channel('gsm-detail').command('updateMap', currentModel);
        },
        importChecked : function() {
            var importList = [];
            this.locations.each(function(model) {
                var location ={};
                location.id= model.get('id');
                location.import = model.get('import');
                importList.push(location);
            });
            console.log(importList);
        },

        onShow: function() {
            var gsm = 12;
            var Locations = Backbone.Collection.extend({
                url: config.coreUrl + 'dataGsm/' + gsm + '/unchecked?format=json'
            });

            this.locations = new Locations();

            var myCell = Backgrid.NumberCell.extend({
                decimals: 3
            });

            var columns = [{
                name: "id",
                label: "ID",
                editable: false,
                renderable: false,
                cell: "integer"
            }, {
                name: "date_",
                label: "Date",
                editable: false,
                cell: Backgrid.DatetimeCell
            }, {
                editable: false,
                name: "lat",
                label: "LAT",
                cell: myCell
            }, {
                editable: false,
                name: "lon",
                label: "LON",
                cell: myCell
            }, {
                editable: false,
                name: "dist",
                label: "DIST (km)",
                cell: myCell
            }, {
                editable: true,
                name: "import",
                label: "IMPORT",
                cell: "boolean"
            }];

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: this.locations
            });

            $("#locations").append(this.grid.render().el);
            var height = $(window).height() - $('#header-region').height();
            height -= $('#details').height() + $('#left-panel').outerHeight(true) - $('#left-panel').height();
            this.$el.find('#locations').height(height);
            this.locations.fetch({reset: true});
        },

        /*
        completeCard: function(options) {
            this.$el.find('#indivLastObs').text(
                moment.unix(options.lastObs).format("YYYY-MM-DD")
            );
            this.$el.find('#indivNbObs').html(options.nbObs);
        },

        hideDetail: function() {
            this.radio.trigger('hide-detail');
        },

        onDestroy: function() {
            $('body').css('background-color', 'white');
            this.radio.stopComplying('loaded');
            this.grid.remove();
            this.grid.stopListening();
            this.grid.collection.reset();
            this.grid.columns.reset();
            delete this.grid.collection;
            delete this.grid.columns;
            delete this.grid;
        },

        setSpecieImage: function(species) {
            var file = null;
            switch (species) {
                case 'Saker Falcon' :
                case 'Peregrine Falcon' :
                case 'Falcon' :
                case 'Gyr Falcon':
                case 'Barbary Falcon':
                case 'Hybrid Gyr_Peregrine Falcon':
                case 'Eurasian Griffon Vulture':
                case 'Desert Eagle Owl':
                    // set image
                    file = 'faucon.png';
                    break;
                case 'Asian Houbara Bustard' :
                case 'North African Houbara Bustard' :
                    file = 'houtarde.png';
                    break;
                case 'Black-bellied Sandgrouse':
                    file = 'Black-bellied Sandgrouse.png';
                    break;
                case 'Crocodile':
                    file = 'crocodile.png';
                    break;
                case 'Horseshoe Snake':
                case 'Mograbin Diadem Snake':
                    file = 'Snake.png';
                    break;
                case 'Pelican':
                    file = 'Pelican.png';
                    break;
                case 'Rat (Atlantoxerus)':
                    file = 'rat.png';
                    break;
                case 'Spur Thighed Tortoise (graeca)':
                    file = 'tortoise.png';
                    break;
               default:
                      file = 'specie.png';
            }
            $('#birdSpecieImg').attr('src','images/'+ file);
        },
        */
    });
});
