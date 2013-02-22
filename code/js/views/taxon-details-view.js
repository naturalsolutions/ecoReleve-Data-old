app.Views.TaxonDetailsView = Backbone.View.extend({
   el: $('#taxon-details'),
   //model: Taxon,
	initialize: function() {
        this.template = _.template( $('#taxon-details-template').html() );
 
      //  this.model.bind( 'change', this.render, this);
    },
	setModel : function(model) {
            this.model = model;
            return this;
    },
 
    render: function() {
		var renderedContent = this.template(this.model.toJSON());
        $(this.el).html(renderedContent);
        return this;
       /* this.$el.html( this.template(this.model.toJSON()));
 
        return this.el;*/
    },
 
    events: {
      //  'click .save': 'saveWine',
      //  'click .delete': 'deleteWine',
    }
	/*
	,
 
    saveWine: function() {
        this.model.set({
            name: $('#name').val(),
            grapes: $('#grapes').val(),
            country: $('#country').val(),
            region: $('#region').val(),
            year: $('#year').val(),
            description: $('#description').val()
        });
 
        if ( this.model.isNew() ) {
            var self = this;
 
            app.wineList.create( this.model, {
                success: function() {
                    app.navigate( 'wines/' + self.model.id, false);
                }
            });
 
        } else {
            this.model.save();
        }
 
        return false;
    },
 
    deleteWine = function() {
        this.model.destroy({
            success: function() {
                alert('Wine was deleted successfully');
                window.history.back();
            }
        });
 
        return false;
    }
 */
});