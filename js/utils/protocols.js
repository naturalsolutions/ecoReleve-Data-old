/*define([
    'jquery'
], function($) {
    'use strict';
    return {
        load: function() {
	        try {
	
				var content ; 
				$.getJSON('./modules/input/data/protocols.json', function(data) {
						content = data;
				}).then(
					function() {
					return content;
					}
				);
					
				} catch (e) {
					alert("error loading gpx file");
					//waypointList.reset();
					return 0;
				}
        },
    };
});

*/	


// Filename: collections/protocols
define([
  'jquery',
  'underscore',
  'backbone'
], function($, _, Backbone){
	/*$.getJSON('./modules/input/data/protocols.json', function(data) {
		var Protocol = Backbone.Model.extend({
			schema : data.schema,
			name : data.name
		});
		return Protocol;
	});*/
	$.ajax({
		  url: "./modules/input/data/",
		  success: function(data){
		     var tm = data;
		  }
	});
});


