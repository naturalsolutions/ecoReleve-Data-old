var ecoReleveData = (function(app) {
    "use strict";
app.Views.StationInfosView = Backbone.View.extend({
	templateLoader: app.utils.templateLoader,
	initialize : function() {
		this.template = _.template($('#sation-infos-template').html());
		//this.template = _.template(this.templateLoader.get('sation-infos'));
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
	}
});
 return app;
})(ecoReleveData);