var ecoReleveData = (function(app) {
    "use strict";
app.Views.AlertView = Backbone.View.extend({
	initialize : function() {
		this.template = _.template($('#msgBox-template').html());
		//this.template = _.template(this.templateLoader.get('msgbox'));
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
		$(this.el).show(100);
	}
});
 return app;
})(ecoReleveData);