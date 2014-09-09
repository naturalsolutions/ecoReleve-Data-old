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
], function($, _, Backbone, Marionette, Moment, Radio, datalist, config, template) {

    'use strict';

    return Marionette.ItemView.extend({
        template: template,

        modelEvents: {
            'change': 'render'
        },

        initialize: function() {
            this.model.fetch();
            $('body').css('background-color', 'black');
            $('#left-panel').css('color', 'white');
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

            this.setSpecieImage(this.model.get('specie'));
            $('#birdSexPic').attr('src','images/sexe_' + this.model.get('sex') + '.png');
            $('#birdOriginPic').attr('src','images/origin_' + this.model.get('origin') + '.png');
            $("#history").append(this.grid.render().el);
        },

        onDestroy: function() {
            $('body').css('background-color', 'white');
        },

        setSpecieImage: function(specie) {
            var file = null;
            switch (specie) {
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

        /*
        onRender: function() {

            $('#birdId').text(this.birdId);
            //var serverUrl = localStorage.getItem('serverUrl');
            var serverUrl = app.config.coreUrl;
            var objectUrl = serverUrl + '/individuals/history?id=' + this.birdId;
            //var mapView = app.utils.displayObjectPositions(this, objectUrl, this.birdId);
            //this.insertView(mapView);
            var url = objectUrl;
            $.ajax({
                url: url,
                dataType: 'json',
                context : this,
                beforeSend: function(){
                      $('#waitCtr').css('display', 'block');
                },
                success: function(data) {
                    //$('#map').css('width',windowWidth/2);
                    var characteristic = data;
                    var sex = characteristic.Sex;
                    var origin = characteristic.Origin || '';
                    var species = characteristic.Species || '';
                    var birthDate = characteristic.Birth_date || '';
                    var deathDate = characteristic.Death_date || '';
                    var comments = characteristic.Comments || '';
                    $('#birdSpecies').text(species);
                    $('#birdBirthDate').text(birthDate);
                    $('#birdSexLabel').text(sex);
                    $('#birdOriginLabel').text(origin);
                    // get image for this specie
                    this.setSpecieImage(species);
                    if(sex ==='male'){
                        $('#birdSexPic').attr('src','images/sexe_m.png');
                    } else {
                        $('#birdSexPic').attr('src','images/sexe_f.png');
                    }
                    if (origin ==='wild'){
                        $('#birdOriginPic').attr('src','images/origin_wild.png');
                    } else {
                        $('#birdOriginPic').attr('src','images/origin_release.png');
                    }


                    var age = characteristic.Age || '';
                    var ptt = characteristic.PTT || '';
                    $('#transmittersVal').html('<b>ptt: </b>' + ptt);
                    $('#birdAgeLabel').text(age);

                    var historyItems = new app.collections.HistoryItems();
                    for (var i in data.history) {
                        var item = data.history[i];
                        var label = item['characteristic'];
                        var value = item['value'];
                        var begin_date = item['from'];
                        var end_date = item['to'];
                        var historyItem = new app.models.HistoryItem();
                        historyItem.set('characteristic', label);
                        historyItem.set('value', value);
                        historyItem.set('begin_date', begin_date);
                        historyItem.set('end_date', end_date);
                        historyItems.add(historyItem);
                        $('#birdAgePic').attr('src','images/age_adult.png');
                        var selectedModel = app.models.selectedModel;
                        if (selectedModel){
                            var atr = selectedModel.attributes;
                            var lastObs = atr['last observation'];
                            var surveyType = atr['survey type'];
                            var transmitter = atr['transmitter'];
                            var monitoringStatus = atr['monitoring status'];
                            $('#birdLastObs').text(lastObs);
                            $('#birdSurveyType').text(surveyType);
                            if (monitoringStatus==='Lost'){
                                $('#birdMonitStatus').html('<img src='images/status_lost.png'/><span>' + monitoringStatus +'</span>');

                            }
                        }
                    }
                    // sort collection by begin date
                    //historyItems.sort();

                    historyItems.sortByField('begin_date');
                    historyItems.models = historyItems.models.reverse();
                )
            }*/
    });
});
