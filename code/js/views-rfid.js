var ecoReleveData = (function(app) {
	"use strict";

	app.views.Rfid = app.views.BaseView.extend({
		template: 'RfidMonitoring',
		afterRender: function() {
			$.supersized({
				slides: [{
					image: ''
				}]
			});
			
			var sensorUrl = app.config.sensorUrl;
			$.ajax({
					url: sensorUrl+'/monitored_station/list',
					dataType: "json",
					success: function(data) {
						var i = 0;
						for (i = 0; i < data.length; i++){
							$('<option id=\"' + data[i].id + '\" value=\"' + data[i].id + '\">' + data[i].id  + '</option>').appendTo('#lMonitoring');
						}
						$("#lMonitoring").attr('selected', 'selected');
					}
			});
			$.ajax({
					url: sensorUrl+'/rfid/list',
					dataType: "json",
					success: function(data) {
						var i = 0;
						for (i = 0; i < data.length; i++){
							$('<option id=\"' + data[i].id + '\" value=\"' + data[i].id + '\">' + data[i].id  + '</option>').appendTo('#lRfid');
						}
						$("#lRfid").attr('selected', 'selected');
					}
			});
		},
		events: {
			'click #Next': 'add',
		},
		add: function(e) {
			var url = app.config.sensorUrl +'/rifd_monitored/add?rfid='+$('#lRfid').attr("value")+'&site='+$('#lMonitoring').attr("value");
			$.ajax({
				url: url,
				dataType: "json",
				success: function(data){
					alert(data.responseText);
				},
				error : function(data){
					alert(data.responseText);
				}
			});



		}
	});
})(ecoReleveData);