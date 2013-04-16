 $("#homePage").live("click",function(){
	Backbone.history.navigate('');
	window.location.reload();
});

 /*$("#sation-infos-submit").live("click",function(){
		var val = validateFields();
		if (val == 1 ){
			var str = $("#sation-infos-form").serialize();
			addStationInfos(str);
			app.views.protocolChoiceView = new app.Views.ProtocolChoiceView();
			RegionManager.show(app.views.protocolChoiceView);
		}
		else {
			alert ("Please enter data in the empty fields ");
		
		}
		return false;
		
});*/

/*
 $("#sation-position-submit").live("click",function(){
	    var str = $("#sation-position-form").serialize();
		generateStation(str);
		app.views.stationInfosView = new app.Views.StationInfosView();
	    RegionManager.show(app.views.stationInfosView);
		return false;
});

*/