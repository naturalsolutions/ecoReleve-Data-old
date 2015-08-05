define([
	'jquery',
	'underscore',
	'backbone',
	'marionette',
	'config',
	'radio',
	'bbForms',

	'grid/model-grid',
	'backgrid',

], function($, _, Backbone , Marionette, config, Radio,
	BbForms, NSGrid, Backgrid ){

	'use strict';

	return Marionette.ItemView.extend({
		events: {

		},
		initialize: function() {
			this.display();
		},

		display: function(){
			var myCell = Backgrid.NumberCell.extend({
				decimals: 3,
				orderSeparator: ' '
			});

			this.cols = [{
				editable: false,
				name: 'id',
				label: 'id',
				cell: 'string',
				renderable: false,
			},{
				editable: false,
				name: 'Name',
				label: 'Name',
				cell: 'string',
			},{
				editable: false,
				name: 'LAT',
				label: 'LAT',
				cell: 'string',
			},{
				editable: false,
				name: 'LON',
				label: 'LON',
				cell: 'string',
			},{
				editable: false,
				name: 'date',
				label: 'DATE',
				cell: 'string',
			},{
				editable: false,
				name: 'FieldActivity_Name',
				label: 'FieldActivity_Name',
				cell: 'string',
			},{
				editable: false,
				name: 'Region',
				label: 'Region',
				cell: 'string',
			},{
				editable: false,
				name: 'Place',
				label: 'Place',
				cell: 'string',
			},{
				editable: false,
				name: 'nbFieldWorker',
				label: 'nbFieldWorker',
				cell: 'integer',
			}
			];

			this.grid= new NSGrid({
				columns: this.cols,
				channel: 'modules',
				url: config.coreUrl + 'station/',
				pageSize : 24,
				pagingServerSide : true,
			});
			
			$('#grid').html(this.grid.displayGrid());
			$('#paginator').append(this.grid.displayPaginator());

		},

		getGrid: function(){
			return this.grid;
		},



	});
});
