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
	  //utils:{},
	 /* init: function () {
		app.utils.templateLoader.load(['home','sation-position','sation-infos','data-entry','map-stations'],
		function() {
			app.collections.stations = new app.Collections.Stations();
			app.collections.stations.fetch({async: false}); 
			// charger le fichier protocoles
			loadProtocols();
			// Initialisation du router, c'est lui qui va instancier notre vue
			app.router = new app.Router();
			// On précise à Backbone JS de commencer à écouter les changement de l'url afin d’appeler notre routeur
			Backbone.history.start();
			app.point = new OpenLayers.LonLat(5.37,43.29);
			//initMap();
			//myPositionOnMap();
		});
		// Initialisation de la collection Stations

	  }*/
	};
	
	$(document).ready(function () {
  // On lance l'application une fois que notre HTML est chargé
	  app.init();
	}) ;
/*
app.utils.templateLoader = {
    templates: {},

    load: function(names, callback) {

        var deferreds = [],
            self = this;

        $.each(names, function(index, name) {
            deferreds.push($.get('tpl/' + name + '.html', function(data) {
                self.templates[name] = data;
            }));
        });

        $.when.apply(null, deferreds).done(callback);
    },

    // Get template by name from hash of preloaded templates
    get: function(name) {
        return this.templates[name];
    }

};
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
		
		
		
		// Load stored stations
		app.collections.stations = new app.Collections.Stations();
		initalizers.push(app.collections.stations.fetch({async: false}));
		// Load stored observations
		app.collections.observations = new app.Collections.Observations();
		initalizers.push(app.collections.observations.fetch({async: false}));
		
		
		//load protocols file
		initalizers.push(app.utils.loadProtocols("ressources/XML_ProtocolDef2.xml"));
		//initalizers.push(app.utils.loadProtocols("http://82.96.149.133/html/ecoReleve/ecoReleve-data/ressources/XML_ProtocolDef2.xml"));
		
		
		$.when.apply($, initalizers).done(function() {
            /*    
			app.utils.RegionManager = (function (Backbone, $) {
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
			})(Backbone, jQuery);*/
		
			app.router = new app.Router();
				// On précise à Backbone JS de commencer à écouter les changement de l'url afin d’appeler notre routeur
			Backbone.history.start();
			/*Backbone.LayoutManager.configure({
			  manage: true
			});	*/
			Backbone.Form.setTemplates(templates);
			// personnaliser le message d'erreur de forms
			Backbone.Form.validators.errMessages.required = 'Please enter a value for this field.';
        });

		// Initialisation du router, c'est lui qui va instancier notre vue
		//*******app.router = new app.Router();
		// On précise à Backbone JS de commencer à écouter les changement de l'url afin d’appeler notre routeur
		//***********Backbone.history.start();
		//app.point = new OpenLayers.LonLat(5.37,43.29);
		//initMap();
		//myPositionOnMap();
		//loadProtocols();
		//app.utils.loadProtocols() ; 
		// templates form


		//Set the templates
		
		//	});
		// Initialisation de la collection Stations

  };
  





 return app;
})(ecoReleveData);