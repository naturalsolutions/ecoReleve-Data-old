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
            { alert ("error in loading file !");}
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
						alert ("protocol '" + protName + "' successfully updated.");
						
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
	var exists = localStorage.getItem("xmlWaypointsIsloaded");
	if ( exists != "true"){
		app.collections.waypointsList = new app.Collections.Waypoints(); 
	}
	var len = app.collections.waypointsList.length;
	if (len > 0 ) {
		app.utils.clearCollection(app.collections.waypointsList); 
	}
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
		app.collections.waypointsList.add(app.models.waypoint);
		// save the collection of protocols in the localstorage
		app.models.waypoint.save();	

	}); 
	if (id!=0){
		localStorage.setItem("xmlWaypointsIsloaded","true");
		// update tile displayed date
		var d = new Date();  
		var newDate = d.defaultView();
		localStorage.setItem("gpxLastImportDate",newDate);
		alert("Gpx file is successfully loaded! You have " + id + " waypoints");
	} else {
		alert("Please check gpx file structure. There is not stored waypoints !");
	
	}
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
app.utils.filldatable = function(params, bbox){
	//debugger;
	$("#allDataInfosPanel").hide();
	var serverUrl = localStorage.getItem("serverUrl");
	var cluster = $("#select_cluster option:selected").attr('value');
	var ajaxSource
	if (bbox){
		ajaxSource = serverUrl + '/proto/station_get?' + params + '&' + bbox;
	}else{
		ajaxSource = serverUrl + '/proto/station_get?' + params;

	}
	
	$('#allDataBoxList').dataTable( {
		"bServerSide": true,
		"bProcessing": true,
		"bDestroy" : true,
		"iDisplayLength": 10,
		"fnServerData": function ( sSource, aoData, fnCallback ) {
			/* Add some extra data to the sender */
			aoData.push( { "name": "more_data", "value": "my_value" } );
			$.getJSON( sSource, aoData, function (json) { 
				
				fnCallback(json);
			} );
		},
		"sAjaxSource": ajaxSource
		,"fnDrawCallback": fnStyleTable
	}
	);
	/*	app.utils.fnShowHide(0);
		app.utils.fnShowHide(2);
		app.utils.fnShowHide(4);
		app.utils.fnShowHide(6);
		app.utils.fnShowHide(7);*/
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
		cluster:$("#select_cluster option:selected").attr('value'),
		taxonsearch:$("#iTaxon").attr("value") 
	};
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
		var url = serverUrl + "/carto/station_get?";
		var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["BBOX"], params:params, cluster:true, popup : false});
		mapView.addLayer({protocol : protocol , layerName : "Observations", });
	} 
	else {
		// update layer
		mapView.updateLayer("Observations", params);
	}
	//$("#allDataMapDataInfos").html("");
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


 return app;
 

 
 
})(ecoReleveData);