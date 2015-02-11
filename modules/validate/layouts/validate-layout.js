define([
    'jquery',
    'underscore',
    'marionette',
    'radio',
    'config',
    'text!modules2/validate/templates/tpl-validate.html'
], function($, _, Marionette, Radio, config, template) {

    'use strict';

    return Marionette.LayoutView.extend({
        className: 'container full-height',
        template: template,

        events: {
            'click #gsm' : 'gsm',
            'click #rfid' : 'rfid',
            'click #argosTile' : 'gps',
        },

        initialize: function() {
            this.id_sta = 1;
            var LocationModel = Backbone.Model.extend({
               defaults : {
                    id : null,
                    lat : null ,
                    lon : null,
                    ele: null,
                    comments: null,
                    precision: null,
                    end_date: null,
                    begin_date: null,
                    site : null
                }
            });
            var SiteModel = Backbone.Model.extend({
               defaults : {
                    id : null,
                    name : null ,
                    type : null,
                    active: null,
                    location : null,

                }
            });
            var mySite = new SiteModel ({
                name: 'TEST14345689',
                type: 'Cave',
                active: 1,
                location: new LocationModel({
                    lat: 35.823,
                    lon: -2.85,
                    end_date: '28/06/2015 13:00:00',
                    begin_date: '06/04/2015 13:00:00',
                    precision : 10,
                    comments: null,
                    ele : 100
                })
            });
            mySite.url= config.coreUrl+'monitoredSite/newSite';
            
           /* mySite.save({
                error: function(model, response, options){
                    console.log(model)

                },
                success: function (model, response, options) {
                    console.log(this)
                }
            });*/

            var loc = new LocationModel({
                    lat: 31.823,
                    lon: -2.987,
                    end_date: '06/12/2015 13:00:00',
                    begin_date: '06/11/2015 13:00:00',
                    precision : 10,
                    comments: null,
                    ele : 100,
                    site: 13921
                });
            loc.url = config.coreUrl+'monitoredSite/newLocation';
            loc.save({
                error: function(model, response, options){
                    console.log(model)

                },
                success: function (model, response, options) {
                    console.log(model)
                }
            });
            console.log(loc)


        },

        onRender: function(){
            $('body').addClass('home-page').addClass('full-height');
            $('#main-region').addClass('obscur full-height');

        },



        onDestroy: function() {
            $('body').removeClass('validate').removeClass('full-height');
            $('#main-region').removeClass('obscur');
        },

        gsm: function(){
            Radio.channel('route').command('validate:type', 'gsm');
        },
        rfid: function(){
            Radio.channel('route').command('validate:type', 'rfid');
        },
        gps: function(){
            //Radio.channel('route').command('validate:type', 'argos');
            
            var Proto_Model = Backbone.Model.extend({
                url : config.coreUrl + 'station/'+this.id_sta+'/prev',

            });

            var model = new Proto_Model({
                
            });
            var self = this;
            console.log('model created');
            model.fetch({success: function(data) {
                console.log(data);
                console.log(data.attributes['PK'])
                self.id_sta = data.attributes['PK'];
               
            }});
            
         /*   model.once('change', function() {
                model.set({

                    FK_TSta_ID : 2191151,
                    Element_Nb : 4,
                    Name_Impact : 'up',
                    Comments : 'autre'

                });

                console.log(model);
                model.save();

            });*/
           


           /* $.ajax({
                url:config.coreUrl + 'station/250179/protocol/Biometry/35968',
                success : function(data){
                    console.log(data);
                }
            })*/
        },
    });
});
