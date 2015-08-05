define([
	'jquery',
	'underscore',
	'backbone',
	'backbone.paginator',
	'backgrid',
	'backgrid.paginator',
	'marionette',
	'moment',
	'radio',
	'utils/datalist',
	'config',
	'text!modules2/validate/gsm/templates/gsm-grid.html',
	'backgridSelect_all',
	'sweetAlert',
], function($, _, Backbone, PageableCollection, Backgrid, Paginator, Marionette, moment, Radio, datalist, config, template, backgridSelect_all,Swal) {

	'use strict';

	return Marionette.ItemView.extend({
		template: template,
		className:'full-height',

		events: {
			'click .backgrid-container tbody tr': 'focusOnMap',
			'click td input[type=checkbox]':'updateMap',
			'click #1pH-btn': 'perhour',
			'click #selectAll-btn': 'selectOrUnselectAll',
			'click #clearAll-btn': 'unselectAll',
			'click #import-btn' : 'importChecked',
			'change #freq' : 'updateFrequency'
		},

		initialize: function(options) {
			this.type=options.type;
			
			
			if(this.type == 'gsm'){

				var defaultFrequency = 0
			}else{
				var url = this.type_url +this.gsmID+ '/unchecked/'+options.id_ind+'/json?format=json';
			};
			this.ind_id = options.id_ind;
			this.parent = options.parent;

			switch(this.type){
				case 'gsm':
					this.type_url = config.coreUrl+'dataGsm/';
					this.showTypeCol = false;
					defaultFrequency = 60;
					break;
				case 'argos':
					this.type_url = config.sensorUrl+'argos/';
					this.showTypeCol = true;
					// TODO ADD ALL
					defaultFrequency = 'all';
					break;

				default:
					console.warn('type error');
					this.showTypeCol = true;
					break;

			};
			this.selectedFrequency = options.frequency || defaultFrequency;
			Radio.channel('gsm-detail').comply('import',this.importChecked,this);
			Backgrid.Extension.SelectRowCell.prototype.initialize = function(options){
					this.column = options.column;
					if (!(this.column instanceof Backgrid.Column)) {

						this.column = new Backgrid.Column(this.column);
					}

					var column = this.column, model = this.model, $el = this.$el;
					this.listenTo(column, "change:renderable", function (column, renderable) {

						$el.toggleClass("renderable", renderable);
					});

					if (Backgrid.callByNeed(column.renderable(), column, model)) $el.addClass("renderable");

					this.listenTo(model, "backgrid:select", function (model, selected) {
						this.$el.find("input[type=checkbox]").prop("checked", selected).change();

					});

					this.listenTo(model, "backgrid:focus", function (model, focus) {
						if(focus){
							this.$el.parent().addClass('focus');
						}else{
							this.$el.parent().removeClass('focus');
						};
					});
				};




			if(options.com){

				this.com = options.com;
				this.com.addModule(this);
			}

			/*
			this.radio = Radio.channel('gsm-detail');
			this.radio.comply('updateGrid', this.updateGrid, this);
			this.radio.comply('import', this.importChecked, this);
			*/

			this.gsmID = options.gsmID;
			this.pageSize = 25;

			if(this.type == 'gsm'){

				var url = this.type_url + this.gsmID + '/unchecked/'+options.id_ind+'?format=json';
			}else{
				var url = this.type_url +this.gsmID+ '/unchecked/'+options.id_ind+'/json?format=json';
			};
			var Locations = PageableCollection.extend({
				url: url,
				mode: 'client',
				state:{
					pageSize: 25
				},
			});

			this.locations = new Locations();

			var myCell = Backgrid.NumberCell.extend({
				decimals: 5,
				orderSeparator: ' ',
			});

			var columns = [{
				name: 'id',
				label: 'ID',
				editable: false,
				renderable: false,
				cell: 'string',
			}, {
				name: 'date',
				label: 'DATE',
				editable: false,
				cell: 'string'
			}, {
				editable: false,
				name: 'lat',
				label: 'LAT',
				cell: myCell,
			}, {
				editable: false,
				name: 'lon',
				label: 'LON',
				cell: myCell,
			}, {
				editable: false,
				name: 'ele',
				label: 'ELE (m)',
				cell: Backgrid.IntegerCell.extend({
					orderSeparator: ''
				}),
			}, {
				editable: false,
				name: 'dist',
				label: 'DIST (km)',
				cell: myCell,
			}, {
				editable: false,
				name: 'speed',
				label: 'SPEED (km/h)',
				cell: myCell,
				formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
					fromRaw: function (rawValue, model) {
							if (rawValue=='NaN') {
								rawValue=0;
							}
						 return rawValue;

					}

				}),
			},{
				name: 'type_',
				label: 'Type',
				renderable : this.showTypeCol,
				editable: false,
				formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
					fromRaw: function (rawValue, model) {
							if (rawValue=='arg') {
								rawValue='Argos';
							}
							else {
								rawValue = 'GPS'
							}
						 return rawValue;

					}

				}),
				cell: 'string'
			}, {
				editable: true,
				name: 'import',
				label: 'IMPORT',
				cell: 'select-row',
				headerCell: 'select-all'

			}];

			// Initialize a new Grid instance
			this.grid = new Backgrid.Grid({
				columns: columns,
				collection: this.locations
			});

			// Initialize a new Paginator instance
			this.paginator = new Backgrid.Extension.Paginator({
				collection: this.locations,
			});

			var ctx = this;
			this.locations.fetch({reset: true, success : function(){
				ctx.clone();
				ctx.perhour();
			}});

		},

		/*=======================================
		=            Strat Demo Code            =
		=======================================*/

		action: function(action, id){
			switch(action){
			case 'focus':
				break;
			case 'selection':
				this.selectOne(id);
				break;
			case 'selectionMultiple':
				this.selectMultiple(id);
				break;
			case 'resetAll':
				this._resetAll();
				break;
			case 'selectAll':
				this._selectAll();
				break;
			default:
				console.warn('verify the action name');
				break;
			}
		},

		interaction: function(action, id){
			if(this.com){
			this.com.action(action, id);
			}else{
			this.action(action, id);
			}
		},

		/*-----	End of En Demo Code	------*/

		onShow: function() {
			this.$el.find('#locations').append(this.grid.render().el);
			this.$el.find('#paginator').append(this.paginator.render().el);

			this.$el.find('.select-all-header-cell>input').css('display','none');
			// set selected frequency
			$('#freq').val(this.selectedFrequency);
		},

		onRender: function() {
			
		},

		clone: function(){

			this.origin	= this.grid.collection.fullCollection.clone();

		},
		selectOrUnselectAll: function(e){
			this.interaction('selectAll');
		},
		unselectAll : function(){
			this.interaction('resetAll');
		},
		_resetAll: function(){
			var collection = this.grid.collection;
			collection.each(function (model) {

				model.trigger("backgrid:select", model, false);
			});
			
			collection.fullCollection.each(function (model) {
				if (!collection.get(model.cid)) {
				model.trigger("backgrid:selected", model, false);
				}
			});
		},


		_selectAll: function(){
			var collection = this.grid.collection;
			collection.each(function (model) {
				model.set('checked',true);
				model.trigger("backgrid:select", model, true);
			});
			
			collection.fullCollection.each(function (model) {
				if (!collection.get(model.cid)) {
					model.set('checked',true);
					model.trigger("backgrid:selected", model, true);
				}

			});
		},

		updateFrequency : function(e){
			this.selectedFrequency = $(e.target).val();
			this.perhour();
		},
		perhour: function() {
			this.interaction('resetAll');
			var self=this;
			if (self.selectedFrequency !='all'){
				var curFrequency = parseInt(self.selectedFrequency) ;
				var col0=this.origin.at(0);
				var date=new moment(col0.get('date'));

				var ids =[];
				var i =0;
				this.origin.each(function (model,i) {
					i++;
					var currentDate=new moment(model.get('date'));
					var diff=(date-currentDate)/(1000*60*self.selectedFrequency);
					if (i==0) diff=2;
					if (!self.grid.collection.get(model.id)) {
						if(diff>1) {
							date=currentDate;
							ids.push(model.id);
						}
					}
					else {
						if(diff>1) {
							date=currentDate;
							ids.push(model.id);
						}
					}
				});

				this.interaction('selectionMultiple', ids);

				} else {
					// select all
					this._selectAll();
				}
		},

		selectMultiple: function(ids){
			var model_ids = ids, self = this, mod;

			for (var i = 0; i < model_ids.length; i++) {
				mod = this.grid.collection.fullCollection.findWhere({id : model_ids[i]});
				mod.set('checked', true);
				mod.trigger("backgrid:select", mod, true);
				mod.trigger("backgrid:selected", mod, true);
			};
		},


		selectOne: function(id){
			var model_id = id;
			var coll = new Backbone.Collection();
			coll.reset(this.grid.collection.fullCollection.models);
			model_id = parseInt(model_id);
			var mod = coll.findWhere({id : model_id});

			this.grid.collection.fullCollection.trigger("backgrid:select-all", this.grid.collection.fullCollection, true );

			if(mod.get('checked')){
				mod.set('checked',false);
				mod.trigger("backgrid:select", mod, false);
				mod.trigger("backgrid:selected", mod, false);
			}else{
				mod.set('checked',true);
				mod.trigger("backgrid:select", mod, true);
				mod.trigger("backgrid:selected", mod, true);
			}

			var position = coll.indexOf(mod);

			var page=Math.ceil(position/25);
			this.locations.getPage(page);


			mod.trigger("backgrid:focus", mod, true);
			if(this.lastFocused && this.lastFocused!=mod)
			this.lastFocused.trigger("backgrid:focus", this.lastFocused, false);

			this.lastFocused = mod;

		},


		updateGrid: function(marker) {

			var self=this;
			var checked=marker['checked'];

			var feature = marker.feature;
			var model_id=feature['id'];
			var models=[];
			var i=0, position=1;


			this.grid.collection.fullCollection.each(function(model){
				i++;

				if (model.id==model_id) {
					model.trigger("backgrid:select", model, checked);
					position=i;
				 }
				 if (!self.grid.collection.get(model.id)) {
						if (model.id == model_id)
						model.trigger("backgrid:selected", model, checked);
				}
			});

			var page=Math.ceil(position/25);
			self.locations.getPage(page);
		},

		updateMap: function(e){
				var tr = $(e.target).parent().parent();
				var id = tr.find('td').first().text();
				this.interaction('selection', id);
		},

		focusOnMap: function(e) {
			if($(e.target).is('td')) {
				var tr = $(e.target).parent();
				var id = tr.find('td').first().text();
				id = parseInt(id);

				this.interaction('focus', id);

				var mod = this.grid.collection.fullCollection.findWhere({id : id});

				mod.trigger("backgrid:focus", mod, true);
				if(this.lastFocused && this.lastFocused!=mod)
				this.lastFocused.trigger("backgrid:focus", this.lastFocused, false);

				this.lastFocused = mod;
			}
		},

		importChecked : function() {
			var self = this;
			var checkedLocations=this.grid.getSelectedModels();
			// if no selected data
			if(checkedLocations.length == 0){
				Swal ({
				title: "You're going to validate datas",
				text: "Your are checked "+checkedLocations.length+" locations. Are you sure to validate them ?",
				type: 'warning',
				showCancelButton: true,
				confirmButtonColor: 'green',
				confirmButtonText: "I agree",
				cancelButtonColor: 'red',
				cancelButtonText: "Cancel",
				closeOnConfirm: true,
				closeOnCancel: true,
				},
				function(isConfirm) {
					if(isConfirm){
						self.validateChecked();
					}
					else {
					}
			    });
			} else {
				self.validateChecked();	
			}

			

		},
		validateChecked : function() {
			var self = this;
			var importList = [];
			var checkedLocations=this.grid.getSelectedModels();
			var i;
			var url = this.type_url + this.gsmID + '/unchecked/'+this.ind_id+'/import';

			for (i in checkedLocations){
				var model=checkedLocations[i];
				var location= model.get('id');
				importList.push(location);
			};

			var navigated = false;
			$.ajax({
				url : url,
				contentType: 'application/json',
				type: 'POST',
				data:JSON.stringify({data:importList}),
				success : function(data) {
					Swal({
						title: "Success",
						text: data,
						type: 'success',
						//showCancelButton: true,
						confirmButtonColor: 'green',
						confirmButtonText: "Next individual",
						timer: 2000,
						//cancelButtonColor: 'grey',
						//cancelButtonText: "Return to Validate",
						closeOnConfirm: true,
						//closeOnCancel: true,
						},
						function(isConfirm) {
							if(isConfirm){
								self.parent.changeTransmitter();
								navigated = true;

							}
							/*else {
								Backbone.history.history.back();
							}*/
						}
						
					);
					// auto navigation to next individual
					if(! navigated){
						self.parent.changeTransmitter();
					}


				},
				error : function(data) {
					
					Swal({
						title: "Error",
						text: data.responseText,
						type: 'error',
						showCancelButton: false,
						confirmButtonColor: 'rgb(147, 14, 14)',
						confirmButtonText: "Ok",
						closeOnConfirm: true,
						}
					);
				}
			});
		},

		onDestroy: function() {
			this.grid.remove();
			this.grid.stopListening();
			this.grid.collection.reset();
			this.grid.columns.reset();
			delete this.grid.collection;
			delete this.grid.columns;
			delete this.grid;
		},

	});
});
