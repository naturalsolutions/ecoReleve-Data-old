var ecoReleveData = (function(app) {
    //"use strict";

/*********************************************  Protocols  ************************************************/
app.utils.loadProtocols = function (url){
   $.ajax( {
            type: "GET",
            url: url,
            dataType: "xml",
            success: function(xml) 
            {
				//xmlNode = $(xml);	
				// creer la collection de protocoles
				app.collections.protocolsList = new app.Collections.Protocols();
			   $(xml).find('protocol').each(   
				function()
				{
					// créer le modèle protocol
					app.models.protocol = new app.Models.Protocol();
					var id = $(this).attr('id');
					var protName = $(this).find('display_label:first').text();
					var multispecies = $(this).find('multispecies:first').text();
					// renseigner les métadonnées du modèle
					
					app.models.protocol.set("id", id);
					app.models.protocol.set("name", protName);
					app.models.protocol.set("data.multispecies", multispecies);
					
					//créer le schema du modele à partir des champs
					var schema = {};
					
					$(this).find('fields').children().each(function()
					{			 
						var myFieldSet = $(this);
						var fieldsetName = $(this).attr("name");
						
						$(this).children().each(function(){
							var node = $(this);
							var fieldtype = $(this).get(0).nodeName;		 
							switch (fieldtype)
							{	
								case ("field_list"):
									generateListField(node, function(field) {
										var name = field.get("name");
										// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type liste) et le rajouter au schema du protocole
										schema[name] = {}; 
										schema[name].type = "Select";
										schema[name].title = field.get("display_label");
										schema[name].options = field.get("items");
										schema[name].value = field.get("defaultValue");
										schema[name].fieldset = fieldsetName ;
									}); 
									break;
								case ("field_numeric"):	 
									generateNumericField(node,function(field) {
										var name = field.get("name");
										// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type numerique) et le rajouter au schema du protocole
										schema[name] = {}; 
										schema[name].type = "Number";
										schema[name].title = field.get("display_label");
										schema[name].value = field.get("defaultValue");
										schema[name].fieldset = fieldsetName ;
										var minBound = field.get("min_bound");
										var maxBound = field.get("max_bound");
										// validator for min value & max value
										var validatorslist =  new Array();

										if ( minBound != "") {
											debugger;
											var min = {};
											min.type = "minval";
											min.minval = parseInt(minBound);
											validatorslist.push(min);
										}
										
										if ( maxBound != "") {
											var max = {};
											max.type = "maxval";
											max.maxval = parseInt(maxBound);
											validatorslist.push(max);
										}
										schema[name].validators = validatorslist;
									});  
									break;
								case ("field_text"):
									// appeler la méthode qui va générer un modele de type texte et utiliser son callback pour rajouter 1 champ de meme type au modele "protocole"
									generateTextField(node,function(field) { 
										var name = field.get("name");
										// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type texte) et le rajouter au schema du protocole
										schema[name] = {}; 
										schema[name].type = "Text";
										schema[name].title = field.get("display_label");
										schema[name].value = field.get("defaultValue");
										schema[name].fieldset = fieldsetName ;
										// validation
										if (field.get("required") =="true" ){
											schema[name].validators = ['required'];
										}
									//schema[label].model = field ;
									});  
									break;
								case ("field_boolean"):	
									generateBooleanField(node,function(field) { 
										var name = field.get("name");
										// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type texte) et le rajouter au schema du protocole
										schema[name] = {}; 
										schema[name].type = "Text";
										schema[name].title = field.get("display_label");
										schema[name].fieldset = fieldsetName ;
										// validation
										/*if (field.get("required") =="true" ){
											schema[name].validators = "['required']";
										}*/
									//schema[name].model = field ;
									});  
									break;
											
								case ("field_photo"):	
									generatePhotoField(node,function(field) { 
										var name = field.get("name");
										// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type texte) et le rajouter au schema du protocole
										schema[name] = {}; 
										schema[name].type = "Photo";
										schema[name].name = name;
										schema[name].title = field.get("display_label");
										schema[name].template = "photo";
										schema[name].fieldset = fieldsetName ;
										// add hidden field to store file url
										schema["photo_url"] = {}; 
										schema["photo_url"].title = "photo file path";
										schema["photo_url"].type = "Hidden";
										schema["photo_url"].validators = ['required'];
										
										
										
										
										// validation
										/*if (field.get("required") =="true" ){
											schema[name].validators = "['required']";
										}*/
									//schema[name].model = field ;
									});  
									break;					
							}
						});
					});

					//app.Models[protName] = Backbone.Models.extend({schema: schema});
					//new app.Models['Hermann']()
					// for backbone forms
					debugger;
					app.models.protocol.schema = schema;
					// for localstorage => toJson
					app.models.protocol.attributes.schema = schema;
					app.collections.protocolsList.add(app.models.protocol);
					// save the collection of protocols in the localstorage
					app.models.protocol.save();	
					//var dat = app.models.protocol.toJSON()
					//localStorage.setItem("0myProtocol",JSON.stringify(app.models.protocol));
				}); 
				localStorage.setItem("xmlProtocolsIsloaded","true");
				alert("Success in loading file");
				/*
				app.form = new Backbone.Form({
					model: app.models.protocol
				}).render();

				$('#frm').append(app.form.el);
				*/
				
            }, error : function(xml) 
            { alert ("error in loading file !");}
        });
}
 
function generateListField(node, callback){				 
	 
	var fieldId = $(node).attr("id");
	var name = $(node).find('label').text();
	var label = $(node).find('display_label').text(); 
	var itemlist = $(node).find('itemlist').text();
	//var defaultValueId = $(node).find('default_value').attr("id");
	var defaultValueId = $(node).find('default_value').text();
	

	var defaultvalueposition;
	
	var listVal = itemlist.split('|');
	var options = new Array();

	for (var i=0; i< listVal.length; i++)
	{	
		var valItem = listVal[i];
		var valListe = valItem.split(';');
		options.push(valListe[2]);
		if (defaultValueId == valListe[0]){
			defaultvalueposition = i;
		}
	}
	// placer la valeur par défaut en premier de la liste
	var defval = options[defaultvalueposition];
	var firstval = options[0];
	options[0] = defval;
  	options[defaultvalueposition] = firstval;
	// creer 1 modele champ de type liste
	var listField = new app.Models.ListField({
	id: fieldId,
	name : name,
	display_label:label,
	items : options
	});
	callback(listField);
	// mettre la valeur par défaut en première position de la table
}
						
function generateTextField(node, callback){	
		
	var fieldId = $(node).attr("id");
	var name = $(node).find('label').text();
	var label = $(node).find('display_label').text();
	var defaultValue = $(node).find('default_value').text();
	var required = $(node).find('required').text();
	var multiline = $(node).find('multiline').text();
	// creer le modele champ de type texte
	
	var textField = new app.Models.TextField({
			id: fieldId,
			name : name,
			display_label:label,
			multiline: multiline,
			defaultValue:defaultValue,
			required : required
    });

	callback(textField);			
}	

function generateNumericField(node, callback){
	var fieldId = $(node).attr("id");
	var name = $(node).find('label:first').text();
	var label = $(node).find('display_label').text();
	var defaultVal = $(node).find('default_value').text();
	var unit = $(node).find('unit').text();
	var minBound = $(node).find('min_bound').text();
	var maxBound = $(node).find('max_bound').text();
	var precision = $(node).find('precision').text();
	// creer le modele champ numerique
	var numField = new app.Models.NumericField({
		id: fieldId,
		name : name,
		display_label:label,
		unit:unit,
		max_bound :maxBound,
		min_bound: minBound,
		precision:precision,
		defaultValue:defaultVal
		});
	callback(numField);
}

function generateBooleanField(node, callback){
	var fieldId = $(node).attr("id");
	var name = $(node).find('label').text();
	var label = $(node).find('display_label').text();
	var defaultVal = $(node).find('default_value').text();
	var required = $(node).find('required').text();
	// creer le modele champ boolean
	var boolField = new app.Models.BooleanField({
		id: fieldId,
		name : name,
		display_label:label,
		defaultValue:defaultVal,
		required : required
		});
	callback(boolField);
}
function generatePhotoField(node, callback){
	var fieldId = $(node).attr("id");
	var name = $(node).find('label').text();
	var label = $(node).find('display_label').text();
	
	var photoField = new app.Models.PhotoField({
		id: fieldId,
		name : name,
		display_label:label
		});
	callback(photoField);
}
		
/************************************************** GPS ***********************************************************/
app.utils.getPosition = function (){
	var latitude, longitude;
	var myPosition = new Object(); ;
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			//alert ("latitude :" + latitude  + " longitude : " + longitude );
			localStorage.setItem("latitude", latitude);
			localStorage.setItem("longitude", longitude);
			//myPosition.longitude = longitude;
			//return myPosition;
		},erreurPosition,{timeout:10000});
	}
	//return (latitude + ";" + longitude);	
//	return myPosition;
}
app.utils.myPositionOnMap = function (){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			app.point = new OpenLayers.LonLat(longitude, latitude);
			//if (showMyLocation == 1 ){
				 if (app.utils.markers && app.utils.marker){
				app.utils.markers.removeMarker(app.utils.marker);
				}
				app.point = app.point.transform(
									new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
									new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
									);
				app.utils.addMarker(app.point);
				app.map.setCenter(app.point);
				app.map.panTo(app.point);
				app.map.updateSize();
			//}
		// renseigner les coordonnées dans la zone dédiée
		//$("#sation-position-latitude").val(latitude);
		$('input[name*="latitude"]').val(latitude);
		$('input[name*="longitude"]').val(longitude);

		//$("#sation-position-longitude").val(longitude);
		
		
		},erreurPosition,{timeout:10000});
	}
}

function erreurPosition(error){
	var info = "Erreur lors de la geolocalisation : ";
	switch(error.code) {
	case error.TIMEOUT:
		info += "Timeout !";
	break;
	case error.PERMISSION_DENIED:
		info += "Vous n’avez pas donne la permission";
	break;
	case error.POSITION_UNAVAILABLE:
		info += "La position n’a pu etre determinee, verifiez l'etat du GPS";
	break;
	case error.UNKNOWN_ERROR:
		info += "Erreur inconnue";
	break;
	}
	//alert (info);
	localStorage.setItem( "latitude", "");
	localStorage.setItem( "longitude", "" );
}

/****************************************************** MAP ********************************************************/
app.utils.initMap = function () {
//$("#map").attr('style', 'width:620px;height:250px;');
	app.map = new OpenLayers.Map("map",
    {// maxExtent: new OpenLayers.Bounds(-20037508,-20037508,20037508,20037508),
		numZoomLevels: 15,
           // maxResolution: 156543,
        units: 'm',
          //  projection: "EPSG:900913",
        controls: [
			//  new OpenLayers.Control.LayerSwitcher({roundedCornerColor: "#575757"}),
              new OpenLayers.Control.TouchNavigation({
							dragPanOptions: {
							enableKinetic: true
							}}),
			  new OpenLayers.Control.MousePosition()
        ],
         displayProjection:  new OpenLayers.Projection("EPSG:4326")
	});	 
	var cycle = new OpenLayers.Layer.OSM("OpenCycleMap",
                                        ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                                         "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                                         "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]/*,
                                          {
                                            eventListeners: {
														tileloaded: updateStatus
													}
										}*/);
	
	app.map.addLayer(cycle);

	var defStyle = {strokeColor: "red", strokeOpacity: "0.7", strokeWidth: 4, cursor: "pointer"};		
	var sty = OpenLayers.Util.applyDefaults(defStyle, OpenLayers.Feature.Vector.style["default"]);		
	var sm = new OpenLayers.StyleMap({
			'default': sty,
			'select': {strokeColor: "bleu", fillColor: "blue"}
	});
	app.utils.markers = new OpenLayers.Layer.Markers( "Markers");
	app.map.addLayer(app.utils.markers);
	app.point = app.point.transform(
							new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
							new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
							);
	app.utils.addMarker(app.point);
	app.map.setCenter(app.point,12);
	app.map.updateSize();
	

} // fin initMap 
app.utils.myObservationsOnMap =  function (collection){
	
	// point pour recuperer les coord du dernier point 
	var lastpoint ;
	debugger
	// ajouter layer switcher control
	 app.map.addControl(new OpenLayers.Control.LayerSwitcher());  

	// Strategy debut ************************************

	var features = [];
	// style
	var colors = {
		low: "rgb(52, 98, 224)", 
		middle: "rgb(241, 211, 87)", 
		high: "rgb(253, 156, 115)"
	};

	// Define three rules to style the cluster features.
	var lowRule = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.LESS_THAN,
			property: "count",
			value: 15
		}),
		symbolizer: {
			fillColor: colors.low,
			fillOpacity: 0.9, 
			strokeColor: colors.low,
			strokeOpacity: 0.5,
			strokeWidth: 12,
			pointRadius: 10,
			label: "${count}",
			labelOutlineWidth: 1,
			fontColor: "#ffffff",
			fontOpacity: 0.8,
			fontSize: "12px"
		}
	});
	var middleRule = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "count",
			lowerBoundary: 15,
			upperBoundary: 50
		}),
		symbolizer: {
			fillColor: colors.middle,
			fillOpacity: 0.9, 
			strokeColor: colors.middle,
			strokeOpacity: 0.5,
			strokeWidth: 12,
			pointRadius: 15,
			label: "${count}",
			labelOutlineWidth: 1,
			fontColor: "#ffffff",
			fontOpacity: 0.8,
			fontSize: "12px"
		}
	});
	var highRule = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.GREATER_THAN,
			property: "count",
			value: 50
		}),
		symbolizer: {
			fillColor: colors.high,
			fillOpacity: 0.9, 
			strokeColor: colors.high,
			strokeOpacity: 0.5,
			strokeWidth: 12,
			pointRadius: 20,
			label: "${count}",
			labelOutlineWidth: 1,
			fontColor: "#ffffff",
			fontOpacity: 0.8,
			fontSize: "12px"
		}
	});

	// Create a Style that uses the three previous rules
	var style = new OpenLayers.Style(null, {
		rules: [lowRule, middleRule, highRule]
	}); 
	
	collection.each(function(o) {
		debugger;
		var stationId = o.get('stationId');
		var myStationModel = app.collections.stations.get(stationId);
		var lon = myStationModel.get('longitude');
		var lat = myStationModel.get('latitude');
		var lonlat = new OpenLayers.LonLat(lon, lat);
		lonlat.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
		var f = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat));
		features.push(f);
		lastpoint = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
	});
	
	var vector = new OpenLayers.Layer.Vector("Features", {
		renderers: ['Canvas','SVG'],
		strategies:[
			new OpenLayers.Strategy.AnimatedCluster({
				distance: 10,
				animationMethod: OpenLayers.Easing.Expo.easeOut,
				animationDuration: 20
			})
		],
		styleMap:  new OpenLayers.StyleMap(style)
	});
	app.map.addLayer(vector);
	vector.addFeatures(features);
	//****************************************** fin strategy 
	app.map.setCenter(lastpoint,12);
	app.map.panTo(lastpoint);	
	//app.map.updateSize();
	//app.map.setCenter(lastpoint);
	//app.map.panTo(lastpoint);	
	
}

app.utils.addMarker = function (point){
	var size = new OpenLayers.Size(23,27);
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var icon = new OpenLayers.Icon('images/marker.png',size,offset);
	//marker = new OpenLayers.Marker(lonLatToMercator(new OpenLayers.LonLat(x,y)),icon);
	app.utils.marker = new OpenLayers.Marker(point,icon);
	app.utils.markers.addMarker(app.utils.marker);
}
/****************************************************************** *********************************************/
app.utils.generateStation =  function (formValues){
	var fieldsvals = formValues.split("&");
	var len = fieldsvals.length;
	// initialiser un nouveau model station 
	app.models.station = new app.Models.Station();
	var nbStoredStations = app.collections.stations.length;
	// identifiant de la station 
	var idStation = nbStoredStations + 1 ; 
	app.models.station.set("id",idStation );
	app.global.selectedStationId = idStation;
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
app.utils.addStationInfos = function (formValues){
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
		var fieldValToDisplay = fieldVal.substring(0,1) + fieldValsub.replace(maReg, " ");
			
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
app.utils.getTime =  function (fieldName){
	var currentDate = new Date();  
	var Heure = currentDate.getHours();
	var Min = currentDate.getMinutes();
	if (Min < 10){
			Min = "0" + Min ; 
	}
	$('input[name*="' +  fieldName + '"]').val(Heure + ":" + Min);
	//$("#mytime").val(Heure + ":" + Min);
	//setTimeout("app.utils.getTime()",1000);
 }
app.utils.validateFields = function (){
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
app.utils.insertObserverField  = function (id){
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
app.utils.removeObserverField = function (id){
	if (id > 1){
		var idField = '#stat-infos-Obs-' + id ;		
		$(idField).remove();
		//var newId = parseInt(id) - 1;
		//$("#station-info-add-obs").attr("idObs",newId);
		$("#station-info-add-obs").attr("idObs", id);
		app.global.nbObs =  id;
	}
	
}
app.utils.updateNbObservers = function (nb){
	var limite = parseInt(nb) +1;
	if (nb > 1){
		for (var i= 2; i< limite ; i++){
			app.utils.insertObserverField(i);
		}
	}
}
// get the date format in MM/DD/YYYY
Date.prototype.defaultView=function(){
	var dd=this.getDate();
	if(dd<10)dd='0'+dd;
	var mm=this.getMonth()+1;
	if(mm<10)mm='0'+mm;
	var yyyy=this.getFullYear();
	return String(mm+"\/"+dd+"\/"+yyyy)
}
// get distinct values from an array
Array.prototype.distinct = function(){
   var map = {}, out = [];
	debugger;
   for(var i=0, l=this.length; i<l; i++){
      if(map[this[i]]){ continue; }

      out.push(this[i]);
      map[this[i]] = 1;
   }
   return out;
}
/******************************************************* photo capture *****************************************/
app.utils.onPhotoDataSuccess = function (imageData){
/*     $("#smallImage").attr("style","display:block");
var source = "data:image/jpeg;base64," + imageData;
$("#smallImage").attr("src", source);
localStorage.setItem("myphoto",source);
var myImage = localStorage.getItem("myphoto");
$("#smallImage").attr("src", myImage);
*/
}
app.utils.onPhotoFileSuccess = function (imageData) {
    //$("#smallImage").attr("style","display:block");
    //$("#smallImage").attr("src", imageData);
	//alert (imageData);
	//$('#capture').attr("value", imageData);

	app.form.fields.photo_url.setValue(imageData);
	$("#image").attr("src",imageData);
	$("#image").attr("height","200");
	$("#image").attr("width","200");
}

app.utils.onFail = function(message) {
      alert('Failed because: ' + message);
}
/********************************************************plugin jquery Datatables *****************************************/

app.utils.fnGetSelected =  function ( oTableLocal ){
    return oTableLocal.$('tr.row_selected');
}
app.utils.reloadProtocols =  function ( oTableLocal ){
	app.collections.protocolsList = new app.Collections.Protocols();
	app.collections.protocolsList.fetch({async: false});

	if (app.collections.protocolsList.length == 0 ){
			//load protocols file
			initalizers.push(app.utils.loadProtocols("ressources/XML_ProtocolDef_eReleve.xml"));
			//initalizers.push(app.utils.loadProtocols("http://82.96.149.133/html/ecoReleve/ecoReleve-data/ressources/XML_ProtocolDef2.xml"));
	} 
		// check if "schema" object exists to genegate form UI
	app.collections.protocolsList.each(function(protocol) {
			protocol.schema = protocol.attributes.schema ;
	});
}
/***********************************************************  Phonegap File API *************************************************/
app.utils.onFSSuccess =  function (fs){ 
	app.global.fileSystem = fs;
}
app.utils.onError =  function(e){ 
	var HTML = "<h2>Error</h2>"+e.toString();
	alert (HTML);
}
app.utils.appendFile =  function (f){ 
	//var data = app.global.dataToSave ;
	f.createWriter(function(writerOb) {
        writerOb.onwrite=function() {
            //logit("Done writing to file.<p/>");
        }
        //go to the end of the file...
       // writerOb.seek(writerOb.length);
        writerOb.write(app.utils.appendFile.textToWrite);
    })
}
// file access (read)
app.utils.gotFileEntry=  function (fileEntry) {
		//alert(fileEntry.root.fullPath);
        //fileEntry.file(app.utils.gotFile, app.utils.onError);
		var fileUrl = fileEntry.fullPath;
		// load xml protocols file
		app.utils.loadProtocols(fileUrl);
}
/*
app.utils.gotFile = function (file){
        //readDataUrl(file);
        app.utils.readAsText(file);
}
app.utils.readAsText = function (file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            alert("Read as text");
            //alert(evt.target.result);
        };
        reader.readAsText(file);
		//app.utils.loadProtocols("file:///XML_ProtocolDef_eReleve.xml");
}
*/
// ----------------------------------------------- Database Initialisation ------------------------------------------ //
app.utils.initializeDB = function(db){
  try {
    if (db) {
      // creer la table TIndividus
      		var query = 'CREATE TABLE IF NOT EXISTS TIndividus(Tind_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Tind_FieldWorker1 VARCHAR,'
			+'Tind_FieldWorker2 VARCHAR, Tind_FieldActivity_Name VARCHAR, Tind_Name VARCHAR, Tind_Region VARCHAR, Tind_Place VARCHAR, Tind_DATE VARCHAR,'
			+'Tind_LAT VARCHAR, Tind_LON VARCHAR, Tind_Site_name VARCHAR,Tind_MonitoredSite_type VARCHAR, Tind_label VARCHAR, Tind_Sex VARCHAR,'
			+'Tind_Origin VARCHAR, Tind_Species VARCHAR, Tind_Status VARCHAR, Tind_Tr_Shape VARCHAR, Tind_Tr_Model VARCHAR, Tind_Tr_Number VARCHAR,' 
			+ 'Tind_NumBagBre VARCHAR, Tind_Chip VARCHAR, Tind_TCaracThes_Mark_Color_1_Precision VARCHAR, Tind_PTT VARCHAR, Tind_Frequency VARCHAR,'
			+'Tind_NumBagRel VARCHAR, Tind_Fk_TInd_ID VARCHAR, Tind_FreqOpti VARCHAR)';
      deferreds.push(app.utils.runQuery(query , []));

    }
  } 
  catch (err) { 
   console.log(err);
  }
}
// ----------------------------------------------- Utilitaire de requêtes------------------------------------------ //


app.utils.runQuery = function (query , param) {
    return $.Deferred(function (d) {
        app.global.db.transaction(function (tx) {
            tx.executeSql(query, param, 
            successWrapper(d), failureWrapper(d));
        });
    });
};

function successWrapper(d) {
    return (function (tx, data) {
        d.resolve(data)
    })
};

function failureWrapper(d) {
    return (function (tx, error) {
       console.log('failureWrapper');
       console.log(error);
        d.reject(error)
    })
}
app.utils.findAll = function(callback) {
        app.global.db.transaction(
            function(tx) {
                var sql = "SELECT * FROM TIndividus LIMIT 50";
             
                tx.executeSql(sql,[], function(tx, results) {
                    var len = results.rows.length,
                        listIndiv = [],
                        i = 0;
                    for (; i < len; i = i + 1) {
                        listIndiv[i] = results.rows.item(i);
                    }
					callback(listIndiv);
                });
            },
            function(tx, error) {
                console.log(tx);
            }
        );
}

app.utils.loadFileIndiv = function (db){	
	var dfd = $.Deferred();
	var arr = [];
    $.ajax({
       type: 'GET',
       url: 'ressources/Indiv_LastPositions.csv',
       data: null,
       success: function(text) {
			//$("#birdsHeader").html("Chargement du fichier indiv...");
			console.log("generation de la table individus");
			//$("#waitControlIndiv").attr('style', 'display:inherit; position:absolute; left:'+((w_screen*0.5)-50)+'px; top:'+((h_screen*0.5)-50)+'px; width:100px;height:100px; z-index:5;');
           var fields = text.split(/\n/);
           var data = fields.slice(1,fields.length);
           for(var j = 0; j < data.length; j += 1) {
				// suivre l'état d'avancement de generation de la table dans la BD
				//$("#birdsHeader").html("Chargement de la ligne " + j + " /" + data.length + "...");
				var dataFields = data[j].split(';');
				var  values = ""
				for(var k = 0; k < dataFields.length; k += 1) {
				values = values +"'"+dataFields[k]+"',";
				}
				var n=values.lastIndexOf(",");
				var val = values.substr(0,n);
				var query = "INSERT INTO TIndividus (Tind_FieldWorker1 ,"
				+"Tind_FieldWorker2 , Tind_FieldActivity_Name , Tind_Name , Tind_Region , Tind_Place , Tind_DATE ,"
				+"Tind_LAT , Tind_LON , Tind_Site_name ,Tind_MonitoredSite_type , Tind_label , Tind_Sex ,"
				+"Tind_Origin , Tind_Species , Tind_Status , Tind_Tr_Shape , Tind_Tr_Model , Tind_Tr_Number ," 
				+ "Tind_NumBagBre , Tind_Chip , Tind_TCaracThes_Mark_Color_1_Precision , Tind_PTT , Tind_Frequency ,"
				+"Tind_NumBagRel , Tind_Fk_TInd_ID , Tind_FreqOpti ) VALUES ("+ val +")";
				//insertRow(req);
				arr.push(app.utils.runQuery(query , []) ); 
           }
		   /*localStorage.setItem('fileIndivLoaded', "true");
		   $("#birdsHeader").html("Birds");
		   $("#waitControlIndiv").attr('style', 'display:none;');*/
		    $.when.apply(this, arr).then(function () {
				return  dfd.resolve();
				
			});
       }
    });
}













 return app;
})(ecoReleveData);