var app = {
  Collections: {},
  Models: {},
  Views: {},
  // Instances
  collections: {},
  views: {},
  models: {},
  markers:{},
  //utils:{},
  init: function () {
    // Initialisation de la collection Stations
    this.collections.stations = new this.Collections.Stations();
    // Initialisation du router, c'est lui qui va instancier notre vue
    this.router = new app.Router();
    // On précise à Backbone JS de commencer à écouter les changement de l'url afin d’appeler notre routeur
    Backbone.history.start();
	this.point = new OpenLayers.LonLat(5.37,43.29);
	//initMap();
	//myPositionOnMap();
  }
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