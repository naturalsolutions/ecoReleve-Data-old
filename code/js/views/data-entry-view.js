var ecoReleveData = (function(app) {
    "use strict";

app.Views.DataEntryView = Backbone.View.extend({
	//templateLoader: app.utils.templateLoader,
	initialize : function(model) {
		this.template = _.template($('#data-entry-template').html());
		//this.template = _.template(this.templateLoader.get('data-entry'));
		//this.model = model;
	},

	render : function() {
		var renderedContent = this.template(this.model.toJSON());
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
/*
app.Views.DataEntryView = Backbone.LayoutView.extend({
  template: "#data-entry-template"
});

*/