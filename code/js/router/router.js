 app.Router = Backbone.Router.extend({
	
	/*initialize: function () {
       
    },*/

	routes: {
		"": "home" ,
		"entryStation": "entryStation",
		"msgBox" : "alert",
		"proto-choice": "protoChoice",
		"stationInfos": "stationInfos",
		"data-entry": "dataEntry"
	}, 

	initialize: function(options){
	//	this.appView = options.appView;
	},
	home: function(){
		app.views.homeView = new app.Views.HomeView();
		//var homeView = new HomeView();
		//this.appView.showView(homeView);
		RegionManager.show(app.views.homeView);
	},

	entryStation: function(){
		app.views.stationPositionView = new app.Views.StationPositionView();
		RegionManager.show(app.views.stationPositionView);
		initMap();
		$('#map').css('width', '100%');
		myPositionOnMap();
	},
	alert: function(){
		app.views.alertView = new app.Views.AlertView();
		RegionManager.show(app.views.alertView);
	},
	protoChoice : function(){
		app.views.protocolChoiceView = new app.Views.ProtocolChoiceView();
		RegionManager.show(app.views.protocolChoiceView);
	},
	stationInfos : function(){
		// default date
		var currentDate = new Date();  
		 var str = $("#sation-position-form").serialize();
		generateStation(str);
		app.views.stationInfosView = new app.Views.StationInfosView();
	    RegionManager.show(app.views.stationInfosView);
		//set the date
		$(".datepicker").datepicker();
		$(".datepicker").css('clip', 'auto'); 
        var currentDate = new Date();
        $(".datepicker").datepicker("setDate",currentDate);
		// set the time
		getTime();
	},
	dataEntry : function(){
		app.views.dataEntryView = new app.Views.DataEntryView({model: app.models.station});
		RegionManager.show(app.views.dataEntryView);
	}
 });
 
