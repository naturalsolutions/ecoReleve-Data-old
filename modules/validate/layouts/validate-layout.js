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

        },

        onRender: function(){
            $('body').addClass('validate').addClass('full-height');
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
