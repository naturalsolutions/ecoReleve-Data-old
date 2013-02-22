
app.Views.HomeView = Backbone.View.extend({
	
	//el : $('#content'),
        initialize : function() {
            this.template = _.template($('#home-template').html());
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
           // return this;
		   $(this.el).hide();
        },
		
		close: function(){
			this.remove();
			this.unbind();
		},
		 
		onShow: function(){
			$(this.el).show();
		}
	
	/*initialize: function() {
		
		this.template = _.template($('#home-template').html());  //  template associé à cette vue pour la representer
	},
	events : {
	 //"click " : "show"
	},
	render: function() {
		var container = this.options.viewContainer,
			template = this.template ;  
			
		container.html($(this.el));
		container.trigger('create');
		return this;
	}*/
});

/*
MyView = Backbone.View.extend({
	render: function(){
	$(this.el).html("some html contents");
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

RegionManager.show(new MyView());*/