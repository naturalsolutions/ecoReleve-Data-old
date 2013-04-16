var ecoReleveData = (function(app) {
    "use strict";

app.Views.ProtocolChoiceView = Backbone.View.extend({
  initialize : function() {
	this.template = _.template($('#msgBox-protocols-choice-template').html());
  },
  render : function() {
	var renderedContent = this.template();
	$(this.el).html(renderedContent);
	$(this.el).hide();
  },
  close: function(){
			this.remove();
			this.unbind();
	}, 
	onShow: function(){
			$(this.el).show(100);
	},
	events : {
            'click button' : 'msgAlert'
        },
	msgAlert : function(e){ 
		 e.preventDefault();
		 alert($(e.target).attr("idProt"));
		// var idSelectedProto = this.$('button').attr('id');
		//alert ("click ! : " + idSelectedProto);
	}
});
 return app;
})(ecoReleveData);
