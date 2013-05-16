var ecoReleveData = (function(app) {
    "use strict";
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
		//stocker le nombre d'observateurs
		nbObs:1
		},
		form:{}
	};
	
	
	$(document).ready(function(){
		app.init();
	});
	/*
	if(window.PhoneGap){
		document.addEventListener("deviceready",onDeviceReady,false);
	}else{
	  $(document).ready(function(){
		onDeviceReady();
	  });
	}
	
	
	function onDeviceReady() {
		app.init();
	}
	*/

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
			initalizers.push(app.utils.loadProtocols("ressources/XML_ProtocolDef2.xml"));
			//initalizers.push(app.utils.loadProtocols("http://82.96.149.133/html/ecoReleve/ecoReleve-data/ressources/XML_ProtocolDef2.xml"));
		} 
		// check if "schema" object exists to genegate form UI
		app.collections.protocolsList.each(function(protocol) {
			protocol.schema = protocol.attributes.schema ;
		});
		// Load stored stations
		app.collections.stations = new app.Collections.Stations();
		initalizers.push(app.collections.stations.fetch({async: false}));
		
		// Load stored observations
		app.collections.observations = new app.Collections.Observations();
		initalizers.push(app.collections.observations.fetch({async: false}));
		
		// load stored users
		app.collections.users = new app.Collections.Users();
		initalizers.push(app.collections.users.fetch({async: false}));
		$.when.apply($, initalizers).done(function() {
		
			app.router = new app.Router();
				// On précise à Backbone JS de commencer à écouter les changement de l'url afin d’appeler notre routeur
			Backbone.history.start();
			/*Backbone.LayoutManager.configure({
			  manage: true
			});	*/
			Backbone.Form.setTemplates(templates);
			// personnaliser le message d'erreur de forms
			Backbone.Form.validators.errMessages.required = 'Please enter a value for this field.';
			/*var user = new app.Models.User();
			user.name = "khaled";*/
			
			
			//app.collections.users.reset();
			//app.collections.users.each(function(model) { model.destroy(); } )
			/*app.collections.users.add(user);
			user.save();
			user = new app.Models.User();
			user.name = "Olivier";
			app.collections.users.add(user);
			user.save();*/
			
			// photo capture
			/*app.global.pictureSource = navigator.camera.PictureSourceType;
			app.global.destinationType = navigator.camera.DestinationType;*/
        });
  };
  
	


 return app;
})(ecoReleveData);