
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
	console.log("MAJ champs");
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
		case "observer1":
			app.models.station.set("observer1", fieldValToDisplay);
		break;
		case "observer2":
			app.models.station.set("observer2", fieldValToDisplay);
		break;
		case "observer3":
			app.models.station.set("observer3", fieldValToDisplay);
		break;
		case "observer4":
			app.models.station.set("observer4", fieldValToDisplay);
		break;
		case "observer5":
			app.models.station.set("observer5", fieldValToDisplay);
		break;
		}
	}
	// ajouter la station à la liste de stations initialisée lors du lancement de l'appli
	app.collections.stations.add(app.models.station);
	// save the collection of stations in the localstorage
	app.models.station.save();	
	console.log(" station sauvegardée");
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
function insertObserverField(id){
	app.global.nbObs =  id;
	if(id < 6){																		
		var fieldHtml = '<div class="border-color-red" id="stat-infos-Obs-' + id + '">'
					  + 	'<div class="input-control select">'
					  +			'<fieldset><span><h2>Observer' + id + '</h2></span>'
					  +				'<select name="observer' + id +'">'
					  + 				'<option value="Observer 1">Observer 1 </option>'
					  + 				'<option value="Observer 2">Observer 2 </option>'
					  + 				'<option value="Observer 3">Observer 3 </option>'
					  + 				'<option value="Observer 4">Observer 4 </option>'
					  + 				'<option value="Observer 5">Observer 5 </option>'
					  + 			'</select></fieldset></div></div>'  ;
					  
		$("#stat-infos-obsList").append(fieldHtml);
		var newId = parseInt(id) + 1;
		$("#station-info-add-obs").attr("idObs",newId);
	}
}

function removeObserverField(id){
	debugger;
	if (id > 1){
		var idField = '#stat-infos-Obs-' + id ;		
		$(idField).remove();
		//var newId = parseInt(id) - 1;
		//$("#station-info-add-obs").attr("idObs",newId);
		$("#station-info-add-obs").attr("idObs", id);
		app.global.nbObs =  id;
	}
	
}
function updateNbObservers(nb){
	var limite = parseInt(nb) +1;
	if (nb > 1){
		for (var i= 2; i< limite ; i++){
			insertObserverField(i);
		}
	}
}
$("#station-info-add-obs").live("click", function(){
	var idObs = $("#station-info-add-obs").attr("idObs");
	//alert ("idobs a ajouter : " + idObs);
	insertObserverField(idObs);
	
});
$("#station-info-rem-obs").live("click", function(){
	var idObs = $("#station-info-add-obs").attr("idObs");
	var newId = parseInt(idObs) - 1;
	//alert ("idobs a suppr : " + newId);
	removeObserverField(newId);

});

