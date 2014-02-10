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
				app.utils.generateProtocolFromXml(xml);
            }, error : function(xml) 
            { alert ("error in loading xml file !");}
        });
}
app.utils.generateProtocolFromXml  = function (xml){			   
			   $(xml).find('protocol').each(   
				function()
				{
					// créer le modèle protocol
					app.models.protocol = new app.Models.Protocol();
					var id = $(this).attr('id');
					var protName = $(this).find('display_label:first').text();
					
					app.models.protocol.set("id", id);
					app.models.protocol.set("name", protName);
					// key words
					var keywords = new Array();
					$(this).find('keyword').each(   
						function(){
						var keyword = $(this).text();
						keyword =app.utils.trim(keyword);
						keywords.push(keyword);
					});
					app.models.protocol.set("keywords", keywords);
					//créer le schema du modele à partir des champs
					var schema = {};
					var nbFields = 0;
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
										schema[name].required = true;
										nbFields += 1;
									}); 
									break;
								case ("field_numeric"):	 
									generateNumericField(node,function(field) {
										var name = field.get("name");
										// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type numerique) et le rajouter au schema du protocole
										schema[name] = {}; 
										schema[name].type = "Number";
										schema[name].title = field.get("display_label");
										schema[name].initialData = field.get("defaultValue");
										schema[name].fieldset = fieldsetName ;
										var minBound = field.get("min_bound");
										var maxBound = field.get("max_bound");
										// validator for min value & max value
										var validatorslist =  new Array();

										if ( minBound != "") {
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
										nbFields += 1;
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
										nbFields += 1;
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
										nbFields += 1;
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
										nbFields += 1;
										
									});  
									break;					
							}
						});
					});


					app.models.protocol.schema = schema;
					// for localstorage => toJson
					app.models.protocol.attributes.schema = schema;
					// update protocol if exists
					if( nbFields > 0 ){
						var prot = app.collections.protocolsList.get(id);
						if ( prot === undefined ) {
							app.collections.protocolsList.add(app.models.protocol);	
							app.models.protocol.save();	
						} else {
							prot.destroy();
							app.collections.protocolsList.add(app.models.protocol);	
							app.models.protocol.save();	
						}
						//alert ("protocol '" + protName + "' successfully updated.");
						
					} else {
						alert("Protocol '" + protName + "' non updated ! check fields list and type.");	
					}

				}); 
				localStorage.setItem("xmlProtocolsIsloaded","true");
						
}
app.utils.getProtocolsFromServer = function (url){
	// call WS protocols
	$.ajax({
		type: "GET",
		url: url,
		dataType: "xml",
		success: function(xml) {
			var procolsList = new Array();
			var listColumns = new Array();
			$(xml).find('protocole').each( function()
			{
				var protocol = {};
				protocol.val= $(this).attr('id');
				protocol.label = $(this).text();
				// delete spaces in the begin and the end of string
				protocol.protName = app.utils.trim(protocol.label);
				procolsList.push(protocol);
				listColumns.push(protocol.label);
			}); 
			

			$('body').css({'background-image':''});
			app.views.configdataLayout= new Backbone.Layout({
				template: "#config-data-layout"
			});
			$("#content").empty().append(app.views.configdataLayout.el);
			var tplview = _.template($('#config-protos-template').html()); 
			app.views.configdataLayout.setView(".container", new app.Views.ConfigProtocols ({template:tplview}));
			app.views.configdataLayout.render();
			

			
			var formModel = new app.Models.ProtoModel();
			var schema = {
				Protocols:{ type: 'CheckBox', title:'Protocols', options : procolsList /*, inline : 'true'*/}  //,validators: ['required']
			};
			formModel.schema = schema ;
			formModel.constructor.schema = formModel.schema;
			formModel.constructor.verboseName  = "protocols";			
			//var myView = new app.Views.LocationFormView({initialData:formModel});
			
			
			//var myView = new app.Views.ProtocolsUpdateFormView({initialData:app.models.location, protocols : app.global.usersTab});
			var myView = new app.Views.ProtocolsUpdateFormView({initialData:formModel});
		
			app.views.configdataLayout.setView("#configProtocolsForm",myView );
			
			//app.views.configdataLayout.render();
			

			app.views.configdataLayout.render();
			$("div.form-actions").hide();
			$("#configChooseProtocols").on("click", $.proxy(myView.onSubmit, myView));
			$('.navbar-inner').css({ 'background-image': '#2E8BCC'});
			$('.navbar-inner').css({ 'background': '#2E8BCC'});
			$("#configInfos").text("");
		}
		, error : function (xhr, ajaxOptions, thrownError) {
		alert ("Server is not accessible !");
		$("#configInfos").text("");
		app.router.navigate('#config', {trigger: true});
	  }
	}); 
}
app.utils.loadWaypoints = function (url){
   $.ajax( {
            type: "GET",
            url: url,
            dataType: "xml",
            success: function(xml) 
            {
				//xmlNode = $(xml);	
				// creer la collection de Waypoints
				app.collections.waypointsList = new app.Collections.Waypoints(); 
				// id waypoint
				var id = 0;
			   $(xml).find('wpt').each(   
				function()
				{
					// créer le modèle protocol
					app.models.waypoint = new app.Models.Waypoint();
					var latitude = $(this).attr('lat');
					var longitude = $(this).attr('lon');
					var waypointName = $(this).find('name').text();
					var waypointTime = $(this).find('time').text();
					
					// renseigner les métadonnées du modèle
					id += 1;
					var idwpt = "wpt" + id;
					app.models.waypoint.set("id", idwpt);
					app.models.waypoint.set("name", waypointName);
					app.models.waypoint.set("latitude", latitude);
					app.models.waypoint.set("longitude", longitude);
					app.models.waypoint.set("waypointTime", waypointTime);
					app.models.waypoint.set("used", false);
					
					//create schema model from fields 
					var schema = {};
					app.collections.waypointsList.add(app.models.waypoint);
					// save the collection of protocols in the localstorage
					app.models.waypoint.save();	
				}); 
				localStorage.setItem("xmlWaypointsIsloaded","true");			
            }, error : function(xml) 
            { alert ("error in loading file !");}
        });
}
app.utils.loadWaypointsFromFile = function (xml){
	// test if collection of waypoints exists and clean it
	try {
		/*var exists = localStorage.getItem("xmlWaypointsIsloaded");
		if ( exists != "true"){*/
			app.collections.waypointsList = new app.collections.Waypoints(); 
		/*}
		var len = app.collections.waypointsList.length;
		if (len > 0 ) {
			app.utils.clearCollection(app.collections.waypointsList); 
		}*/
		// id waypoint
		var id = 0;
		$("#spanGeneratingGpx").removeClass("masqued");
	   $(xml).find('wpt').each(   
		function()
		{
			// créer le modèle protocol
			app.models.waypoint = new app.models.Waypoint();
			var latitude = $(this).attr('lat');
			var longitude = $(this).attr('lon');
			var waypointName = $(this).find('name').text();
			var waypointTime = $(this).find('time').text();

			// changer le format de date de "AAA/MM/JJ HH:MM:SS"  a  jj/mm/aaaa
			waypointTime = changeDateFormat(waypointTime,"gpx");
			// renseigner les métadonnées du modèle
			id += 1;
			var idwpt = "wpt" + id;
			app.models.waypoint.set("id", idwpt);
			app.models.waypoint.set("name", waypointName);
			app.models.waypoint.set("latitude", latitude);
			app.models.waypoint.set("longitude", longitude);
			app.models.waypoint.set("waypointTime", waypointTime);
			//app.models.waypoint.set("used", false);
			app.collections.waypointsList.add(app.models.waypoint);
			// save the collection of protocols in the localstorage
			//app.models.waypoint.save();	

		}); 
		if (id!=0){
			//localStorage.setItem("xmlWaypointsIsloaded","true");
			// update tile displayed date
			var d = new Date();  
			var newDate = d.defaultView();
			localStorage.setItem("gpxLastImportDate",newDate);
			var fileName = localStorage.getItem("gpxFileName");
			$("#spanGeneratingGpx").html("Gpx file '" +  fileName + "' is successfully loaded! You have " + id + " waypoints &nbsp;&nbsp;");
			$("#importLoadNext").removeAttr("disabled");
		} else {
			$("#spanGeneratingGpx").html("");
			alert("Please check gpx file structure. There is not stored waypoints !");
		
		}
	}
	catch (e) {
		localStorage.setItem("xmlWaypointsIsloaded", "false");
		alert ("error loading gpx file");
	}
}
function changeDateFormat(dateObs, format){
		var dateSplit, date,formatDate, YYYY,MM ,DD ;
	if (typeof (format) ==="undefined" ){
		dateSplit = dateObs.split(" ");
		date = dateSplit[0];
		formatDate= date.split("-");
		YYYY = formatDate[0];
		MM = formatDate[1];
		DD = formatDate[2];
		MM -= 1;
	} else {
		dateSplit = dateObs.split("T");
		date = dateSplit[0];
		formatDate= date.split("-");
		YYYY = formatDate[0];
		MM = formatDate[1];
		DD = formatDate[2];
		MM -= 1;
	}
	var dateEN = new Date(2013, 1 - 1, 26);
	dateEN.setHours(0,0,0, 0);
	dateEN.setDate(DD);
	dateEN.setMonth(MM);
	dateEN.setFullYear(YYYY); 
	return dateEN; 
}
function generateListField(node, callback){				 
	 
	var fieldId = $(node).attr("id");
	var name = $(node).find('label').text();
	var label = $(node).find('display_label').text(); 
	var itemlist = $(node).find('itemlist').text();
	//var defaultValueId = $(node).find('default_value').attr("id");
	var defaultValueId = $(node).find('default_value').attr('id');
	

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
	
	options[0] = (defval === null) ? "" : defval;
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
	var myPosition = new Object(); 
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			localStorage.setItem("latitude", latitude);
			localStorage.setItem("longitude", longitude);
			//myPosition.longitude = longitude;
			//return myPosition;
		},erreurPosition,{timeout:10000});
	}
	//return (latitude + ";" + longitude);	
//	return myPosition;
}
app.utils.myPositionOnMap = function (callback){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			app.point = {};
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			app.point.latitude = latitude;
			app.point.longitude = longitude;
			$('input[name*="latitude"]').val(latitude);
			$('input[name*="longitude"]').val(longitude);
			callback();  		
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
	localStorage.setItem( "latitude", "");
	localStorage.setItem( "longitude", "" );
}

app.utils.initMap = function (point, zoom) {			
	
	var initPoint = point || (new NS.UI.Point({ latitude : 43.29, longitude: 5.37, label:"bureau"}));
	
	var mapZoom = zoom || 12;
	var map_view = new NS.UI.MapView({ el: $("#map"), center: initPoint, zoom: mapZoom});	
	return map_view ;
}

app.utils.addTracks = function (urlFile, layerName){
	var protocol = new NS.UI.Protocol({ url : urlFile , format: "KML", strategies:["Fixed"], popup: true});
	app.mapView.addLayer({protocol : protocol , layerName : layerName });	
	app.global.traksLoaded = true ;	
	$("#waitLoadingTracks").html(" <img src='images/loader.gif'/>");
	$('a#displayTracks').text('Hide tracks');
	setTimeout(hideWaitLoadingTrack, 5000);	
}
function hideWaitLoadingTrack(){
	$("#waitLoadingTracks").html("");
}
/****************************************************************** *********************************************/
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

app.utils.getProtocolDetails = function(protocolName){
			// check internet connexion
	if (navigator.onLine == true){
		// check if server url is configurated
		var serverUrl = localStorage.getItem( "serverUrl");
		if ((serverUrl === undefined) || (serverUrl ==null)){
			alert ("Please configurate the server url");
		} else {
	// call WS protocols
			var serverUrl = localStorage.getItem("serverUrl");
			//var link = serverUrl + "cake/proto/proto_get?proto_name=TProtocol_" + protocolName;
			var link = serverUrl + "/proto/proto_get?id_proto=" + protocolName;
			$.ajax({
				type: "GET",
				url: link,
				dataType: "xml",
				success: function(xml) {
					app.utils. generateProtocolFromXml(xml)
				}, 
				error : function (xhr, ajaxOptions, thrownError) {
				alert(xhr.status);
				alert(thrownError);
			  }
			}); 		
		}
	} else {
		alert("you are not connected ! Please check your connexion ");
	}
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
	f.createWriter(function(writerOb) {
        writerOb.onwrite=function() {
        }
        //go to the end of the file...
       // writerOb.seek(writerOb.length);
        writerOb.write(app.utils.appendFile.textToWrite);
    })
}
app.utils.gotFileEntry=  function (fileEntry) {
	var fileUrl = fileEntry.fullPath;
	// load xml protocols file
	app.utils.loadProtocols(fileUrl);
}
app.utils.clearCollection =  function (collection){
	collection.each(function(model) { model.destroy(); } ); 
	var len = collection.length;
	while (len > 0 ){
		collection.each(function(model) { model.destroy(); } ); 
		len = collection.length;
	}
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
       url: 'ressources/indiv_LastPositions.csv',
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
app.utils.checkURL = function(value) {
    var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    if (urlregex.test(value)) {
        return (true);
    }
    return (false);
}

app.utils.checkServer = function(url){
	$("#serverUrlInfo").text("Please wait, Checking server state ... ");
	$.ajax( {
		type: "GET",
		dataType: "text",
		url: url,
		success: function(data) 
		{
			alert ("access to the server is ok ! ");
			$("#serverUrlInfo").text(" ");
			localStorage.setItem( "serverUrl" , url);
			app.router.navigate('#config', {trigger: true});
		}, error : function(XMLHttpRequest, textStatus, errorThrown) {
			alert ("error, check the server access ! ");
			$("#serverUrlInfo").text(" ");
			
		}
	});
}
app.utils.trim = function (myString)
{
	return myString.replace(/^\s+/g,'').replace(/\s+$/g,'');
} 
app.utils.filldatable = function(params, paramsMap){
	//debugger;	
	$("#allDataInfosPanel").hide();
	var serverUrl = localStorage.getItem("serverUrl");
	//var cluster = $("#select_cluster option:selected").attr('value');
	var cluster = $('.cluster:checked').val();
	var ajaxSource
	if (paramsMap){
		ajaxSource = serverUrl + '/station/get?' + params + '&' + paramsMap;
	}else{
		ajaxSource = serverUrl + '/station/get?' + params;
	}
	
	app.utils.getDataForGrid(ajaxSource,function(collection){
		var rowsNumber = collection.length ;
		app.utils.initGridServer(collection, rowsNumber,ajaxSource, [2,6,7,8]);
	});

	/*
	app.xhr = "";
	app.xhr = $.ajax({
		url: ajaxSource,
		dataType: "json",
		success: function(data) {
			// create schema model and dynamic fields for the grid
			var rowsNumber = data.count;
			var dataValues = data.values;
			var firstRow = dataValues[0];
			var listColumns = [];
			var schema = {};
			for (key in firstRow){
				var colName = key;
				schema[colName] =  {'title': colName, type: 'Text', sortable: true};
			}

			  app.models.ExportGridModel = Backbone.Model.extend({
					}, {
						// Declare schema and verbose name at model level
						schema: schema,
						verboseName: 'Data'
				});
				
				app.collections.AllDataCollection = Backbone.Collection.extend({
				  model:  app.models.ExportGridModel
				});
				app.collections.VisibleListInGrid = Backbone.Collection.extend({
				  model:  app.models.ExportGridModel
				});

				 var gridCollection = new app.collections.AllDataCollection();

			var ln = dataValues.length;
			for (var i=0;i<ln;i++){
				rowValue = dataValues[i];
				var gridModel = new app.models.ExportGridModel();
				for(key in rowValue){
				  	var colName = key;
				  	var colValue = rowValue[key];
				  	gridModel.set(colName,colValue);		
			    }
				//listColumns
				gridCollection.add(gridModel);
			}

			app.utils.initGridServer(gridCollection, rowsNumber,ajaxSource);

		},
		error : function(){
		}
	});

	*/

}
fnStyleTable = function(){
	//console.log( 'DataTables has redrawn the table' );
	// $("#allDataBoxList").css("style", "width: 450px;");
	 setTimeout(function(){
		$("#allDataBoxList").removeAttr("style");
		//$("#allDataBoxList").css("style", "width: 380px;");
		//console.log( 'j suis ici' );
		},1000);
}
/*fnCallback = function(json){
	console.log( 'DataTables has redrawn the table' );
	$("#allDataBoxList").css("style", "width: 450px;");
	 
}*/

app.utils.fnShowHide  = function(iCol){
	/* Get the DataTables object again - this is not a recreation, just a get of the object */
	var oTable = $('#allDataBoxList').dataTable();
	var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
	oTable.fnSetColumnVis( iCol, bVis ? false : true );
	$("#allDataBoxList").css("style", "width: 380px;");
}
app.utils.fillTaxaList = function(){
	$('#lTaxon').empty();
	var serverUrl = localStorage.getItem("serverUrl");
	$.ajax({
		url: serverUrl + "/proto/proto_taxon_get?id_proto="+$("#id_proto").attr("value")+"&search="+$("#iTaxon").attr("value"),
		dataType: "text",
		success: function(xmlresp) {
			var xmlDoc=$.parseXML(xmlresp),
			$xml=$(xmlDoc),
			$taxons=$xml.find("taxon");
			$taxons.each(function(){
				$('<option value=\"'+$(this).text()+'\">').appendTo('#lTaxon');
			});
			$taxons=$xml.find("taxons");
			if($taxons.attr('havetaxon')=="yes")
				$("#iTaxon").removeAttr("disabled");
			else
				$("#iTaxon").attr("disabled","disabled");
		}
	});
}
app.utils.getUpdateParams = function(){
	var params = {};
	params.id_proto = $("#id_proto").attr("value");
	params.place = $("#place").attr("value");
	params.region= $("#region").attr("value");
	params.idate = $('#idate').text();
	params.taxonsearch = $("#iTaxon").attr("value") ; 
	
	return params;
}
app.utils.updateLayer = function(mapView){
	//$("#allDataMapDataInfos").html("<p>Loading data  <img src='images/ajax-loader-linear.gif'/></p>");
	//get params
	var params = {
		id_proto : $("#id_proto").attr("value"),
		place:$("#place").attr("value"),
		region : $("#region").attr("value"),
		idate : $('#idate').text(),
		//cluster:$("#select_cluster option:selected").attr('value'),
		cluster : $('.cluster:checked').val(),
		taxonsearch:$("#iTaxon").attr("value")
	};

	/*var id_proto = $("#id_proto").attr("value");
	var	place = $("#place").attr("value");
	var	region = $("#region").attr("value");
	var	idate = $('#idate').text();
	var	cluster = $('.cluster:checked').val();
	var	taxonsearch = $("#iTaxon").attr("value");*/

	// check if layer exists
	var exists = false;

	for(var i = 0; i < mapView.map.layers.length; i++ ){
		if((mapView.map.layers[i].name) == "Observations" ) {
			mapView.clearLayer(mapView.map.layers[i]);
			exists = true;
			break;
		}
	}
	if (!exists){
		var serverUrl = localStorage.getItem("serverUrl");
		var url = serverUrl + "/proto/station_get?format=geojson";
		//  ajax call to get features
		/*
		$.ajax({
			url: url,
			dataType: "json",
			data : 'id_proto='+ id_proto +'&place='+ place + '&region=' + region + '&idate=' + idate + '&cluster=' + cluster + '&taxonsearch=' + taxonsearch ,
			xhrFields: {
			 withCredentials: true
			},
			success: function(data) {
				var featuresDetails = data;
				var featuresList = featuresDetails.features;
				var len = featuresList.length;
				if ( len > 0 )
				{
					var listStations = new NS.UI.PointsList();
				
					for(var i=0; i<len;i++){
						var lat = featuresList[i].geometry.coordinates[1];
						var lon = featuresList[i].geometry.coordinates[0];
						var id = featuresList[i].properties.id ; 
						var year = featuresList[i].properties.year ; 
						console.log ("lat :" + lat +" lon : " + lon);
						var  point = new NS.UI.Point({ latitude : lat, longitude: lon, label:"", id:id , year:year, popup:true});
						listStations.add(point);
					}
					mapView.addLayer({collection : listStations , layerName : "observations", popup : false, cluster : cluster  });  //,style:style 
					//var wsTableUrl =  url + "?id_taxon=" + idTaxa;
				}
			}, error  : function(data) {

			}
	    });
		*/


		var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["BBOX"], params:params, cluster:true, popup : false});
		mapView.addLayer({protocol : protocol , layerName : "Observations", }); 
	} 
	else {
		// update layer
		mapView.updateLayer("Observations", params);
	}
	$("#allDataMapDataInfos").html("");
}
app.utils.getThemesList = function(){
	$('#export-themes').empty();
	$('<option value=""></option>').appendTo("#export-themes");
	//$('#export-themes').css({"display": "inline-block","height": "40px","width": "300px"});
	var serverUrl = localStorage.getItem("serverUrl");
	$.ajax({
		url: serverUrl + "/views/themes_list",
		dataType: "json",
		success: function(data) {
			var len = data.length;
			for (var i=0; i<len; i++){
				var label = data[i].MapSelectionManager.Caption;
				var value = data[i].MapSelectionManager.TProt_PK_ID;
				$('<option value=\"'+ value +'\">'+ label + "</option>").appendTo('#export-themes');
			}
		},
		error: function() {
			alert("error loading themes, please check your webservice");
		}
	});

}
app.utils.getViewsList  = function(id){
	$('#export-views').empty();
	if (id!=""){
		var serverUrl = localStorage.getItem("serverUrl");
		var viewsUrl = serverUrl + "/views/views_list?id_theme="+ id ;
		$.ajax({
			url: viewsUrl,
			dataType: "json",
			success: function(data) {
				var len = data.length;
				for (var i=0; i<len; i++){
					var value = data[i].MapSelectionManager.TSMan_sp_name;
					var label = data[i].MapSelectionManager.TSMan_Layer_Name;
					$('<li class="exportViewsList" value=\"'+ value +'\">'+ label + "</li>").appendTo('#export-views');
				}
				/*$('.exportViewsList').css({"width":"450px","height": "35px","background": "grey","padding-top": "10px",
				                          "margin-top": "2px","margin-bottom": "2px","padding-left": "10px","font-size": "18px","color": "white"});*/

			},error: function() {
				alert("error loading views, please check your webservice");
			}
		});
	}
}
app.utils.generateFilter  = function(viewName){
	// count nb rows
	var serverUrl = localStorage.getItem("serverUrl");
	var viewUrl = serverUrl + "/views/get/" + viewName + "/count" ;
	app.xhr = "";
	app.xhr = $.ajax({
			url: viewUrl,
			dataType: "json",
			success: function(data) {
				var count = data[0].count;
				count += " records";
				$("#countViewRows").text(count);
				getFieldsListForSelectedView(viewName);
			},
			error: function() {
				$("#countViewRows").text("error !");
			}
	});

}
getFieldsListForSelectedView = function(viewName){
	var serverUrl = localStorage.getItem("serverUrl");
	var viewUrl = serverUrl + "/views/detail/" + viewName ;  
	app.xhr = "";
	app.xhr = $.ajax({
			url: viewUrl,
			dataType: "json",
			success: function(data) {
				var fieldsList = [];
				app.utils.exportFieldsList = [];
				for (var prop in data){
					var optionItem = "<option type='"+ data[prop].type +"'>" + prop + "</option>"
					//fieldsList.push(field);
					$("#export-view-fields").append(optionItem);
					app.utils.exportFieldsList.push(prop);
				}
				$("#filter-btn").removeClass("masqued");
			}
	});

}
app.utils.getFiltredResult = function(query, view){
	$("#filter-query-result").html();
	$("#filter-query-result").html('<img src="images/ajax-loader-linear.gif" />');
	var serverUrl = localStorage.getItem("serverUrl");
	var viewUrl = serverUrl + "/views/get/" + view + "/count?filter=" + query ;
	$.ajax({
			url: viewUrl,
			dataType: "json",
			success: function(data) {
				var count = data[0].count;
				$("#filter-query-result").html(' <br/><p>filtred count:<span><b> ' + count + ' </b>records</span></p>');
			},
			error : function(){
				$("#filter-query-result").html(' <h4>error</h4>');
			}
	});

}
app.utils.getResultForGeoFilter= function(query, view){
	$("#geo-query-result").html();
	$("#geo-query-result").html('<img src="images/ajax-loader-linear.gif" />');
	var serverUrl = localStorage.getItem("serverUrl");
	var viewUrl = serverUrl + "/views/get/" + view + "/count?" + query ;
	$.ajax({
		url: viewUrl,
		dataType: "json",
		success: function(data) {
			var count = data[0].count;
			$("#geo-query-result").html(' <br/><h4 class="blackText">filtred count : ' + count + '</h4>');
		},
		error : function(){
			$("#geo-query-result").html(' <h4>error</h4>');
		}
	});

}
app.utils.getExportList = function(view, filter, bbox, BBview){
	var serverUrl = localStorage.getItem("serverUrl");
	var displayedColumns = app.utils.exportSelectedFieldsList;
	var url = serverUrl +  "/views/get/" + view + "?filter=" + filter + "&bbox=" + bbox + "&columns=" + displayedColumns ; 
	BBview.url = url;

	app.utils.getDataForGrid(url,function(collection){
		var rowsNumber = collection.length ;
		app.utils.initGridServer(collection, rowsNumber,url);
		// TODO   generate gpx  a faire ?
		$("#export-getGpx").removeAttr("disabled");
		$("#spanGeneratingGpx").html("");
	});

	/*
	app.xhr = "";
	app.xhr = $.ajax({
		url: url,
		dataType: "json",
		success: function(data) {
			// create schema model and dynamic fields for the grid
			var firstRow  = data[0].MapSelectionManager;
			var schema = {};
			for(key in firstRow){
			  	var colName = key;
			  	var colValue = firstRow[key];
			  //	gridModel.set(colName,colValue);	
			 // 	gridModel.set(colName,colValue);	
			  	schema[colName] =  {'title': colName, type: 'Text', sortable: true};
			  }
			 // app.models.ExportGridModel.constructor.schema = schema;
			  //var gridCollection = new app.collections.ExportGridCollection();
			  app.models.ExportGridModel = Backbone.Model.extend({

					}, {
						// Declare schema and verbose name at model level
						schema: schema,
						verboseName: 'Observation'
				});
				app.collections.ExportGridCollection = Backbone.Collection.extend({
				  model:  app.models.ExportGridModel
				});
				app.collections.VisibleListInGrid = Backbone.Collection.extend({
				  model:  app.models.ExportGridModel
				});

				 var gridCollection = new app.collections.ExportGridCollection();

			for(key in data) {
			  var rowVal = data[key].MapSelectionManager;
			  var gridModel = new app.models.ExportGridModel();
			  
			 // gridModel.set("schema",{});
			  for(key in rowVal){
			  	var colName = key;
			  	var colValue = rowVal[key];
			  	gridModel.set(colName,colValue);	
			  	gridModel.set(colName,colValue);	
			  	schema[colName] =  {'title': colName, type: 'Text', sortable: true};
			  }
			  //gridModel.constructor.schema = schema;
			  
			  gridCollection.add(gridModel);
			}
			// add grid
			app.utils.initGrid (gridCollection, app.collections.VisibleListInGrid);
			//app.router.navigate(fileUrl, {trigger: true});
			$("#export-getGpx").removeAttr("disabled");
			$("#spanGeneratingGpx").html("");
		},
		error : function(){
			//alert("error in gpx generation");
		}
	});
	
	*/

	

		/*app.utils.fnShowHide(0);
		app.utils.fnShowHide(2);
		app.utils.fnShowHide(4);
		app.utils.fnShowHide(6);
		app.utils.fnShowHide(7);*/
}

/*
JSON.stringify = JSON.stringify || function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"'+obj+'"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof(v);
            if (t == "string") v = '"'+v+'"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
	};	

*/
app.utils.getDataForGrid = function (url,callback){
	app.xhr = "";
	app.xhr = $.ajax({
		url: url,
		dataType: "json",
		success: function(data) {
			// create schema model and dynamic fields for the grid
			var rowsNumber = data.count;
			var dataValues = data.values;
			var firstRow = dataValues[0];
			var listColumns = [];
			var schema = {};
			for (key in firstRow){
				var type;
				var colName = key;
				if (colName.toUpperCase() == "DATE"){
					type ="Date";
				} else {
					type ="Text";
				}
				schema[colName] =  {'title': colName, type: type, sortable: true};
			}

			  app.models.ExportGridModel = Backbone.Model.extend({
					}, {
						// Declare schema and verbose name at model level
						schema: schema,
						verboseName: 'Data'
				});
				
				app.collections.AllDataCollection = Backbone.Collection.extend({
				  model:  app.models.ExportGridModel
				});
				app.collections.VisibleListInGrid = Backbone.Collection.extend({
				  model:  app.models.ExportGridModel
				});

				 var gridCollection = new app.collections.AllDataCollection();

			var ln = dataValues.length;
			for (var i=0;i<ln;i++){
				rowValue = dataValues[i];
				var gridModel = new app.models.ExportGridModel();
				for(key in rowValue){
				  	var colName = key;
				  	var colValue ;
				  	if (colName.toUpperCase() =="DATE")	{
				  		var colVal = rowValue[key];	
				  		colValue = changeDateFormat(colVal);
				  	} else {
				  		colValue = rowValue[key];	
				  	}
				  	gridModel.set(colName,colValue);		
			    }
				//listColumns
				gridCollection.add(gridModel);
			}
			callback (gridCollection, rowsNumber);
		},
		error : function(){
		}
	});
}
app.utils.initGrid = function(list, VisibleList, columns){
	var visibleList = new VisibleList;
  // initier la grid
	var grid = new NS.UI.Grid({
		collection: visibleList,
		pageSize: 10,
		pageSizes: [5,10, 20, 50],
		page: 1,
		pagerPosition: 'top'
	});
	//show a first page
	grid.size = list.length;
    visibleList.reset(list.slice(0, grid.pageSize));
    //  Specify how to handle grid events
	function reloadGrid() {
		var data;
		if (! _.isEmpty(grid.filters)){
			data = list.filter(function(item) {
				var k, v, testDate,
					res = true;
				for (k in this) {
					v = this[k];
					testDate = new Date(v);
					if (isFinite(testDate)) {
						res = res && (item.get(k).toString() === v);
					} else {
						res = res && (item.get(k).toLowerCase().indexOf(v.toLowerCase()) >= 0);
					}
				}
				return res;
			}, grid.filters);
		} else{
			data = list.models;
		}
		if (grid.sortColumn) {
			data = _.sortBy(data, function(m) {return m.get(grid.sortColumn);});
			if (grid.sortOrder == 'desc')
				data.reverse();
		}
		grid.size = data.length;
		visibleList.reset(data.slice((grid.page - 1) * grid.pageSize, grid.page * grid.pageSize));
		if (typeof(col) != "undefined"){
			masquerColonne(col);
		}
	}
	grid.on('selected', function (model) {console.log(model);});
	grid.on('sort', function (fieldId, order) {
		grid.sortColumn = fieldId;
		grid.sortOrder = order;
		reloadGrid();
	});
	grid.on('unsort', function () {
		delete grid.sortColumn;
		delete grid.sortOrder;
		reloadGrid();
	});
	grid.on('filter', function (fieldId, value) {
		grid.filters[fieldId] = value;
		grid.page = 1; // Page count will change, keeping current page will be meaning-less
		reloadGrid();
	});
	grid.on('unfilter', function (fieldId) {
		delete grid.filters[fieldId];
		grid.page = 1; // Page count will change, keeping current page will be meaning-less
		reloadGrid();
	});
	grid.on('page', function (target) {
		grid.page = target;
		reloadGrid();
	});
	grid.on('pagesize', function (size) {
		grid.pageSize = size;
		reloadGrid();
	});

    // 5) render the grid (empty at the moment) and bind it to the DOM tree
   $('div#grid').html("");
   grid.render().$el.appendTo('div#grid');
	if (typeof(columns) != "undefined"){
		var ln = columns.length;
		for (var i=0;i<ln;i++){
			masquerColonne(columns[i]);
		}
	}
	function masquerColonne(num){
		if (num){
			$("table>thead").find("tr").each(function(){
				 var nom = $(this).get(num - 1).firstChild;
				 $(nom).addClass("masqued");
			});
			$("table>tbody").find("tr").each(function(){
				 var nom = $(this).get(num - 1).firstChild;
				 $(nom).addClass("masqued");
			});
		}
	}
}
app.utils.initGridServer = function (gridCollection, count,url, columns){
	//var visibleList = new VisibleList;
  // initier la grid
	var grid = new NS.UI.Grid({
		collection: gridCollection,
		pageSize: 10,
		pageSizes: [5,10, 20, 50],
		page: 1,
		pagerPosition: 'top'
	});
	//show a first page
	grid.size = count;
    gridCollection.reset(gridCollection.slice(0, grid.pageSize));
    //  Specify how to handle grid events
	function reloadGrid() {
		var data;
		/*if (! _.isEmpty(grid.filters)){
			data = gridCollection.filter(function(item) {
				var k, v, testDate,
					res = true;
				for (k in this) {
					v = this[k];
					testDate = new Date(v);
					if (isFinite(testDate)) {
						res = res && (item.get(k).toString() === v);
					} else {
						res = res && (item.get(k).toLowerCase().indexOf(v.toLowerCase()) >= 0);
					}
				}
				return res;
			}, grid.filters);
		} else{*/
			//data = gridCollection.models;
			var params = "&limit=" + grid.pageSize + "&skip=" +  (grid.page - 1) * grid.pageSize;
			
			if (grid.sortColumn) {
				params += "&sortColumn=" + grid.sortColumn + "&sortOrder=" + grid.sortOrder ;
			}
			if (! _.isEmpty(grid.filters)){
				for (k in grid.filters) {
						var v = grid.filters[k];
						if (k.toUpperCase() == "DATE"){
							var dt = new Date(v);
							var vYear = dt.getFullYear();	
							var vMounth = dt.getMonth() + 1;
							if (vMounth < 10){vMounth = "0" + vMounth;}
							var vDay = dt.getDate();
							if (vDay < 10){vDay = "0" + vDay;}

							v = vYear + "-" + vMounth + "-" + vDay ;
						}
						params += "&filters[]=" + k + ":"+ v;
				}
				//params += "&" + grid.filters ;
			}

			var urlGrid = url + params;
			app.utils.getDataForGrid(urlGrid,function(coll,rowsNumber){

				data = coll;
				grid.size = rowsNumber;
				gridCollection.reset(data.slice(0, grid.pageSize));
				//grid.size = data.length;
				//gridCollection.reset(data.slice((grid.page - 1) * grid.pageSize, grid.page * grid.pageSize));
				if (typeof(columns) != "undefined"){
					var ln = columns.length;
					for (var i=0;i<ln;i++){
						masquerColonne(columns[i]);
					}
				}
			});
		//}
		/*if (grid.sortColumn) {
			data = _.sortBy(data, function(m) {return m.get(grid.sortColumn);});
			if (grid.sortOrder == 'desc')
				data.reverse();
		}
		grid.size = data.length;
		gridCollection.reset(data.slice((grid.page - 1) * grid.pageSize, grid.page * grid.pageSize));
		if (typeof(col) != "undefined"){
			masquerColonne(col);
		}*/
	}
	grid.on('selected', function (model) {
		app.models.selectedModel = model;
		//console.log(model);
		}
	);
	grid.on('sort', function (fieldId, order) {
		grid.sortColumn = fieldId;
		grid.sortOrder = order;
		reloadGrid();
	});
	grid.on('unsort', function () {
		delete grid.sortColumn;
		delete grid.sortOrder;
		reloadGrid();
	});
	grid.on('filter', function (fieldId, value) {
		grid.filters[fieldId] = value;
		grid.page = 1; // Page count will change, keeping current page will be meaning-less
		reloadGrid();
	});
	grid.on('unfilter', function (fieldId) {
		delete grid.filters[fieldId];
		grid.page = 1; // Page count will change, keeping current page will be meaning-less
		reloadGrid();
	});
	grid.on('page', function (target) {
		grid.page = target;
		reloadGrid();
	});
	grid.on('pagesize', function (size) {
		grid.pageSize = size;
		reloadGrid();
	});

    // 5) render the grid (empty at the moment) and bind it to the DOM tree
   $('div#grid').html("");
   grid.render().$el.appendTo('div#grid');
	if (typeof(columns) != "undefined"){
		var ln = columns.length;
		for (var i=0;i<ln;i++){
			masquerColonne(columns[i]);
		}
	}
	function masquerColonne(num){
		if (num){
			$("table>thead").find("tr").each(function(){
				/* var nom = $(this).get(num - 1);
				 var nom2 = $(this).childNodes();
				 //var tm = nom.firstChild;
				 $(nom2).addClass("masqued");*/
				 $(this.childNodes[num - 1]).addClass("masqued");
			});
			$("table>tbody").find("tr").each(function(){
				/* var nom = $(this).get(num - 1).firstChild;
				 $(nom).addClass("masqued");*/

				  $(this.childNodes[num - 1]).addClass("masqued");
			});
		}
	}
}




 return app;
 

 
 
})(ecoReleveData);