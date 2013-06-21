var ecoReleveData = (function(app) {
   // "use strict";
	app = {
		Collections: {},
		Models: {},
		Views: {},
		// Instances
		collections: {},
		views: {},
		models: {},
		markers:{},
		utils: {},
		global:{
			lastView:"",
			fileSystem :"",
			dataToSave:"",
			//stocker le nombre d'observateurs
			nbObs:1
		},
		form:{}
	};
	
	
	/** only mobile version **/
	if ( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/Android/i) ) ) {
			if(window.PhoneGap){
				document.addEventListener("deviceready",onDeviceReady,false);
			}else {
			  $(document).ready(function(){
				onDeviceReady();
			  });
			}
			function onDeviceReady() {
				app.init();
			}
	} else {
	/** only desktop version **/
		$(document).ready(function(){
			app.init();
		});
	}

	/*************************/
	app.init = function () {

		var initalizers = [];
		
		var templates = {
		//field is the default template used
		field: '\
		<li class="ftColr-white bbf-field field-{{key}}">\
		<label for="{{id}}">{{title}}</label>\
		<div class="bbf-editor">{{editor}}</div>\
		<div class="bbf-help">{{help}}</div>\
		<div class="bbf-error">{{error}}</div>\
		</li>\
		'
		};
		//initalizers.push($("#templates").load("templates.html"));
		initalizers.push(
			$.ajax({
				url: 'templates.html',
				dataType: 'text'//,
				//context: {key: key}
			}).done(function(contents) {
				$("#templates").append(contents);
			})
        );
		debugger;
		// load stored protocols
		app.collections.protocolsList = new app.Collections.Protocols();
		initalizers.push(app.collections.protocolsList.fetch({async: false}));

		if (app.collections.protocolsList.length == 0 ){
			//load protocols file
			initalizers.push(app.utils.loadProtocols("ressources/XML_ProtocolDef_eReleve.xml"));
			//initalizers.push(app.utils.loadProtocols("http://82.96.149.133/html/ecoReleve/ecoReleve-data/ressources/XML_ProtocolDef2.xml"));
		} 

		// Load stored stations
		app.collections.stations = new app.Collections.Stations();
		initalizers.push(app.collections.stations.fetch({async: false}));
		
		// Load stored observations
		app.collections.observations = new app.Collections.Observations();
		initalizers.push(app.collections.observations.fetch({async: false}));
		
		// load stored users
		app.collections.users = new app.Collections.Users();
		initalizers.push(app.collections.users.fetch({async: false}));
		// init database	
		 initDB();
		
		
		$.when.apply($, initalizers).done(function() {

			app.router = new app.Router();
			Backbone.history.start();
			Backbone.Form.setTemplates(templates);
			// personnaliser le message d'erreur de forms
			Backbone.Form.validators.errMessages.required = 'Please enter a value for this field.';
			// init dataTables in mydata
			//$('.dataTable').dataTable();
			// check if "schema" object exists to genegate form UI
			app.collections.protocolsList.each(function(protocol) {
				protocol.schema = protocol.attributes.schema ;
			});

			/** only mobile version **/
			if ( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/Android/i) ) ) {
				// photo capture
				app.global.pictureSource = navigator.camera.PictureSourceType;
				app.global.destinationType = navigator.camera.DestinationType;
				/** olocal file access **/
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, app.utils.onFSSuccess, app.utils.onError);
			
			}
        });
  };
  
  function initDB(){
	  window.deferreds = [];
	  // Initialisation des données 
	  app.global.db = openDatabase("ecoReleve-data", "1.0", "db ecoreleve", 20*1024*1024);// espace accordé à la BD: 20 MO
	  app.utils.initializeDB(app.global.db);
	  var dfd = $.Deferred();
	  deferreds.push(dfd);
	  //Test si les données existes
	  //Si oui alors => pas de chargement des données en base
	  $.when(app.utils.runQuery("SELECT * FROM TIndividus" , [])).done(function (dta) {
		var arr = [];
		if (dta.rows.length == 0 ) {
		  arr.push(app.utils.loadFileIndiv(app.global.db));
		}
	   $.when.apply(this, arr).then(function () {
		  return  dfd.resolve();
		});
	  }).fail(function (err) {
		  return dfd.resolve();
	  });
	}
	


 return app;
})(ecoReleveData);