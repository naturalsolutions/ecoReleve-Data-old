
app.Views.AlertView = Backbone.View.extend({
	
	//el : $('#content'),
        initialize : function() {
            this.template = _.template($('#msgBox-template').html());
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