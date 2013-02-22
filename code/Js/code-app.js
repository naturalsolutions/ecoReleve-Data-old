
RegionManager = (function (Backbone, $) {
	var currentView;
	var el = "#content";
	var region = {};
	var closeView = function (view) {
	if (view && view.close) {
	view.close();
	}
	};

	var openView = function (view) {
	view.render();
	$(el).html(view.el);
	if (view.onShow) {
	view.onShow();
	}

	};

	region.show = function (view) {
	closeView(currentView);
	currentView = view;
	openView(currentView);
	};

	return region;
})(Backbone, jQuery);

function generateStation(formValues){
	var fieldsvals = formValues.split("&");
	var len = fieldsvals.length;
	// initialiser un nouveau model station 
	app.models.station = new app.Models.Station();
	var nbStoredStations = app.collections.stations.length;
	// identifiant de la station 
	app.models.station.set("id", nbStoredStations + 1);
	for (var i=0; i < len ; i++){
		var tab = fieldsvals[i].split('=');
		var fieldName = tab[0];
		
		switch (fieldName)
		{
		case "latitude":
		app.models.station.set("latitude", tab[1]);
		break;
		case "longitude":
		app.models.station.set("longitude", tab[1]);
		break;
		}
	}
	// ajouter la station à la liste de stations initialisée lors du lancement de l'appli
	app.collections.stations.add(app.models.station);
}
function addStationInfos(formValues){
	var maReg =/[+]/g; // sert à remplcer le caractère '+' 
	var maReg2 =/%3A/g; // :
	var maReg3 =/%2F/g;// '/'
	
	var fieldsvals = formValues.split("&");
	var len = fieldsvals.length;
	for (var i=0; i < len ; i++){
		var tab = fieldsvals[i].split('=');
		var fieldName = tab[0];
		// enlever le signe '+' et le remplacer par un ' ' s'il existe
		var fieldVal = tab[1];
		var fieldValsub = fieldVal.substring(1, fieldVal.length);
		fieldValToDisplay = fieldVal.substring(0,1) + fieldValsub.replace(maReg, " ");
			
		switch (fieldName)
		{
		case "station_name":
			app.models.station.set("station_name", fieldValToDisplay);
			break;
		case "field_activity":
			app.models.station.set("field_activity", fieldValToDisplay);
		break;
		case "date_day":
			var fld = fieldValToDisplay.substring(1, fieldVal.length);
			var fldDisplay = fieldValToDisplay.substring(0,1) + fld.replace(maReg3, "/");
			app.models.station.set("date_day", fldDisplay);
			break;
		case "time_now":
			var fld = fieldValToDisplay.substring(1, fieldVal.length);
			var fldDisplay = fieldValToDisplay.substring(0,1) + fld.replace(maReg2, ":");
			app.models.station.set("time_now", fldDisplay);
			break;
		case "observer":
			app.models.station.set("observer", fieldValToDisplay);
		break;
		}
	}
	// ajouter la station à la liste de stations initialisée lors du lancement de l'appli
	app.collections.stations.add(app.models.station);
}
function getTime(){
	var currentDate = new Date();  
	var Heure = currentDate.getHours();
	var Min = currentDate.getMinutes();
	if (Min < 10){
			Min = "0" + Min ; 
	}
	$("#mytime").val(Heure + ":" + Min);
	setTimeout("getTime()",1000);
 }
function validateFields(){
	var valRetour = 1;
	$( "input" ).each(function() {
		var valInput = $(this).val();
		if (valInput == ""){
			valRetour = 0;
			return false;
		}
	});
	return valRetour ; 
}
