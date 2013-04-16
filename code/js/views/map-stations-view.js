var ecoReleveData = (function(app) {
    "use strict";

app.Views.MapStationsView = Backbone.View.extend({
	templateLoader: app.utils.templateLoader,
	//el : $('#content'),
        initialize : function() {
           this.template = _.template($('#map-stations-template').html());
			//this.template = _.template(this.templateLoader.get('map-stations'));
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
          //  return this;
		     $(this.el).hide();
        },
		close: function(){
			this.remove();
			this.unbind();
		},
		 
		onShow: function(){
			$(this.el).show(500);
		},
				events: {
			"click a#plus": "zoomIn",
			"click a#minus": "zoomOut",
		},
		zoomIn: function(e){
			app.map.zoomIn();
		},
		zoomOut: function(e){
			app.map.zoomOut();
		}
		
		
});
 return app;
})(ecoReleveData);