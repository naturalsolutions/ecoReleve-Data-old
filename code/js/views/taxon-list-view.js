
app.Views.TaxonListView = Backbone.View.extend({
	tagName: 'ul',  // la vue c'est une liste ( elle pourrait être une ligne (li) ou autre
	
	initialize: function() {
		// changement de liste : binding
		this.collection.bind('add', this.add, this);
		//this.collection.bind('click', this.show, this);
		
		this.template = _.template($('#taxon-list-item-template').html());  //  template associé à cette vue pour la representer
	},
	events : {
	 //"click " : "show"
	},
	render: function() {
		var container = this.options.viewContainer,
			taxons = this.collection,
			template = this.template ,
		   listView = $(this.el);  
			
		$(this.el).empty();
		taxons.each(function(taxon){
		listView.append(template(taxon.toJSON())); 			
		});
		container.html($(this.el));
		container.trigger('create');
		return this;
	},
	
	add: function(item) {
		var taxonsList = $('#taxons-list'),
			template = this.template;
			
		taxonsList.append(template(item.toJSON()));
		//taxonsList.listview('refresh');
	},
	
	/*show : function() {
		//alert(item.toJSON());
	}*/
});