
app.Views.DataEntryView = Backbone.View.extend({
	//model: app.Models.Station,
	initialize : function(model) {
		this.template = _.template($('#data-entry-template').html());
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