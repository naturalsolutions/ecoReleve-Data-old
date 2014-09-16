define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'moment',
    'radio',
    'utils/datalist',
    'config',
    'text!templates/individual/detail.html'
], function($, _, Backbone, Marionette, moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,
        className:'detailsIndivPanel',

        events: {
            'click #hideIndivDetails': 'hideDetail',
        },

        modelEvents: {
            'change': 'render'
        },

        initialize: function() {
            this.model.fetch();
            this.radio = Radio.channel('individual');
            this.radio.comply('loaded', this.completeCard, this);
            $('body').css('background-color', 'black');
        },

        completeCard: function(options) {
            this.$el.find('#indivLastObs').text(
                moment.unix(options.lastObs).format("YYYY-MM-DD")
            );
            this.$el.find('#indivNbObs').html(options.nbObs);
        },

        hideDetail: function() {
            this.radio.trigger('hide-detail');
        },

        onRender: function() {
            var history = new Backbone.Collection(this.model.get('history'));

            var columns = [{
                name: "name",
                label: "Name",
                editable: false,
                cell: 'string'
            }, {
                editable: false,
                name: "value",
                label: "Value",
                cell: "string"
            }, {
                editable: false,
                name: "from",
                label: "From",
                cell: "string"
            }, {
                editable: false,
                name: "to",
                label: "To",
                cell: "string"
            }];

            // Initialize a new Grid instance
            this.grid = new Backgrid.Grid({
                columns: columns,
                collection: history
            });

            this.setSpecieImage(this.model.get('species'));
            $('#birdSexPic').attr('src','images/sexe_' + this.model.get('sex') + '.png');
            $('#birdOriginPic').attr('src','images/origin_' + this.model.get('origin') + '.png');
            if (this.model.get('age') === 'adult'){
                $("#birdAgePic").attr("src","images/age_adult.png");
            }
            $("#history").append(this.grid.render().el);
            var height = $(window).height() - $('#header-region').height();
            height -= $('#details').height() + $('#left-panel').outerHeight(true) - $('#left-panel').height();
            this.$el.find('#history').height(height);
        },

        onDestroy: function() {
            $('body').css('background-color', 'white');
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
    });
});
