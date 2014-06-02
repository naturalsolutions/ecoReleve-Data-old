var ecoReleveData = (function(app) {
"use strict";
// Creating the application namespace
app = {
	config: {
	// Find pathname portion of the URL and clean it (remove trailing slash if any)
	root: window.location.pathname.replace(/\/(?:index.html)?$/, '')
	},
	dao: {},
	models: {},
	views: {},
	utils: {},
	collections :{},
	roles: {
		admin: 'admin',
		superuser: 'superuser',
		user: 'user'
		},
	instances: {}
};
// ----------------------------------------------- The Application initialisation ------------------------------------------ //
$().ready(function() {
  init();
}) ;

function init(){
	 // Spinner management (visual feedback for ongoing requests)
	$(document).ajaxStart(function () { $('body').addClass('loading'); });
	$(document).ajaxStop(function () { $('body').removeClass('loading'); });
   window.deferreds = [];
    // Customize Underscore templates behaviour: 'with' statement is prohibited in JS strict mode
     _.templateSettings.variable = 'data';


  	app.instances.mainNav = new app.views.Navigation({model: app.router});
   // Bread crumbs
	app.instances.breadCrumbs = new app.views.BreadCrumbs({model: app.router});
	// Current user
	app.instances.userView = new app.views.CurrentUser();
	app.instances.userView.$el.appendTo('.navbar .navbar-inner');
			
  $.when.apply(null, deferreds).done(function() {
	app.instances.mainNav.render();
	app.instances.mainNav.$el.appendTo('#main-nav');
	app.instances.breadCrumbs.$el.insertBefore('#static-menu');
	app.instances.breadCrumbs.render();
	app.instances.userView.render();
    Backbone.history.start();
    window.mapAjaxCall = false;
  	window.mapAjaxCall.xhr = false;
	// Main navigation
	//localStorage.setItem("serverUrl", "http://ns24422.ovh.net/ecoReleve-core");
	localStorage.setItem("serverUrl", "http://192.168.1.199/ecoReleve-core");
	//localStorage.setItem("serverUrl", "http://192.168.1.199/ECWP_ecoReleve-core");
	//localStorage.setItem("serverUrl", "http://localhost:82/ecoreleve-core");
	// load mapping scripts
	   /* app.utils.importScript('js/libs/OpenLayers.debug.js');
	       setTimeout(function() {
            app.utils.importScript('js/libs/openlayersBbox.js');
            app.utils.importScript('js/libs/AnimatedCluster.js');
            app.utils.importScript('js/libs/NS-UI-map.js');
        }, 2000);*/

  	// get users list if not exists
  	app.collections.users = new app.collections.Users();
  	// get fieldActivity
	app.collections.users.fetch().then(function () {
		if (app.collections.users.length === 0){
			app.utils.getUsersListForStrorage("/user/fieldworkers");
		}
	});
	// get field activity list
	app.collections.fieldActivityList = new app.collections.FieldActivities();
	app.collections.fieldActivityList.fetch().then(function () {
		if (app.collections.fieldActivityList.length === 0){
			app.utils.getFieldActivityListForStrorage("/view/theme/list?import=yes");
		}
	});
	// get station list
	app.collections.stations = new app.collections.Stations();
	app.collections.stations.fetch().then(function() {
		console.log("stations loaded ! ");
	});
	// load stored protocols
	app.collections.protocolsList = new app.collections.Protocols();
	app.collections.protocolsList.fetch().then(function(){
		if (app.collections.protocolsList.length === 0){
			app.utils.loadProtocols("ressources/XML_ProtocolDef_eReleve.xml");
		}
	});
	// load observations
	app.collections.observations = new app.collections.Observations();
	app.collections.observations.fetch().then(function() {
		console.log("observations loaded ! ");
		// number of stored observations
		var ln = app.collections.observations.length;
		$("#homeNbObs").text(ln);
	});
	// load obs collection for mydata grid
	app.collections.obsListForMyData = new app.collections.StationsProtocols();
	app.collections.obsListForMyData.fetch().then(function() {
		console.log("obs loaded !");
	});
	// get id of last stored station & last stored obs
	var idLastStation = parseInt(localStorage.getItem("idLastStation"));
	if (idLastStation){
		app.utils.idLastStation = idLastStation;
	} else {
		app.utils.idLastStation = 0;
	}
	var idLastObs = parseInt(localStorage.getItem("idLastObs"));
	if (idLastObs){
		app.utils.idLastObs = idLastObs;
	} else {
		app.utils.idLastObs = 0;
	}

	// loading mapping scripts
	/*head.load("js/libs/OpenLayers-2-14.js", function () {
		 //called when script have been loaded
		head.load("js/libs/openlayersBbox.js", "js/libs/AnimatedCluster.js","js/libs/NS-UI-map.js" );
    });*/
	head.js("js/libs/OpenLayers-2-14.js","js/libs/openlayersBbox.js", "js/libs/AnimatedCluster.js","js/libs/NS-UI-map.js" );
	//loadScript("js/libs/OpenLayers-2-14.js");
	

  });
}
	function loadScript(src) {
    	var scriptElement = document.createElement('script');
        scriptElement.src = src;
   		document.body.appendChild(scriptElement);
	}

return app;
})(ecoReleveData);