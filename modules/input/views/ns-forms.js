	
define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'radio',
    'bbForms',
    'models/station'
], function($, _, Backbone, moment, Radio, BbForms, Station) {

    'use strict';
    /*var tn = NsForms;  
    return NS.UI.Form.extend({
        className:'NewStation',

        events: {

        },
        initialize: function() {
        	var station = new Station();
        	this.initialData = station;
        }
            

    });
    */
   // var station = new Station();
    return  BbForms( {
    	//model: station   ,
    	 initialize: function() {
        	var station = new Station();
        	this.model = station;
        }
    });

   // return form;

});



/*


	app.views.StationFormView = NS.UI.Form.extend({
		initialize: function(options) {
			//this.usersList = options.usersTab ; 
			NS.UI.Form.prototype.initialize.apply(this, arguments);
			this.on('submit:valid', function(instance) {
				//var tm = instance;
				// add date time
				var dateSt = new Date(instance.attributes.Date_);
				var dd = dateSt.getDate();
				var mm = dateSt.getMonth()+1;
				var yyyy = dateSt.getFullYear();
				var hrs = dateSt.getHours();
				var mins =dateSt.getMinutes();
				var time = instance.attributes.time_;
				// convert month and day to format mm and dd if value < 10
				if (mm < 10) {mm = "0" + mm;}
				if (dd < 10) {dd = "0" + dd;}
				var myDateTimeString = yyyy +"-"+mm+"-"+ dd +" "+ time + ":00.00";
				instance.attributes.Date_ = myDateTimeString;
				instance.attributes.date = mm + "/" + dd + "/" + yyyy	;
				// add station id
				var idLastStation = app.utils.idLastStation;
				instance.attributes.stationId = idLastStation + 1;
				// autoincrement last station id
				app.utils.idLastStation += 1;
				// store value
				localStorage.setItem("idLastStation", app.utils.idLastStation);
				// replace field workers name by id
				var fieldWorker1 = instance.attributes.FieldWorker1;
				// get users dalist id
				var user1ControlId = $("[name='FieldWorker1']").attr("id");
				var idList = "#" + user1ControlId + "List";
				// replace fieldWorker1 name by fieldworker id
				var userId;
				if (instance.attributes.FieldWorker1){
					userId = this.getUserId(idList,"FieldWorker1");
					instance.attributes.FieldWorker1 = userId;
				}
				if (instance.attributes.FieldWorker2){
					userId = this.getUserId(idList,"FieldWorker2");
					instance.attributes.FieldWorker2 = userId;
				}
				if (instance.attributes.FieldWorker3){
					userId = this.getUserId(idList,"FieldWorker3");
					instance.attributes.FieldWorker3 = userId;
				}
				if (instance.attributes.FieldWorker4){
					userId = this.getUserId(idList,"FieldWorker4");
					instance.attributes.FieldWorker4 = userId;
				}
				if (instance.attributes.FieldWorker5){
					userId = this.getUserId(idList,"FieldWorker5");
					instance.attributes.FieldWorker5 = userId;
				}
				app.collections.stations.add(instance);
				app.collections.stations.save();
				// store last station to be used later 
				app.utils.LastStation = instance;
				app.router.navigate('#proto-choice', {
					trigger: true
				});
			});
		},
		getUserId : function(idList, inputName){
            var x = $("[name='" + inputName + "']").val();
            var z = $(idList);
            var val = $(z).find('option[value="' + x + '"]').text();
            return val;
        }
	});*/


