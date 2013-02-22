
app.Views.StationInfosView = Backbone.View.extend({

	initialize : function() {
		this.template = _.template($('#sation-infos-template').html());
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