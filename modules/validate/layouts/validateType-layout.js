define([
	'jquery',
	'underscore',
	'marionette',
	'radio',
	'config',
	'sweetAlert',
	'text!modules2/validate/templates/tpl-validateType.html',
	'jqueryui'
], function($, _, Marionette, Radio, config,Swal, template) {

	'use strict';

	return Marionette.LayoutView.extend({
		className: 'full-height',
		template: template,

		events: {
			'click table.backgrid tbody tr :not(.btn)': 'showDetail',
			'change #freq' : 'updateSimpleFrequency'
		},

		initialize: function(options) {
			// default sample frequency value (mn)
			

			this.type=options.type;
			var self = this;

			switch(this.type){
				case 'gsm':
					this.selectedFrequency = '60';
					this.type_url = config.coreUrl+'dataGsm/';
					break;
				case 'argos':
				   this.selectedFrequency = 'all';
					this.type_url = config.sensorUrl+'argos/';
					break;
				default:
					console.warn('type error');
					break;
			};


			 var Data = Backbone.Collection.extend({
						url: this.type_url + 'unchecked/list',
					});

			this.datas = new Data();
			this.datas.on('remove',function(){
				console.log('REMOVR')
				console.log(self.datas.length)

				if (self.datas.length == 0) {
					console.log('length 000000')
					Radio.channel('route').command('validate:type', self.type);

				}
			});
			var ModelRow = Backgrid.Row.extend({
			  render: function() {
				ModelRow.__super__.render.apply(this, arguments);
				this.$el.data('model', this.model);
				if (this.model.attributes.ind_id == null) {
					this.el.classList.add('red-row');
				}
				return this;
			  }
			});

			var _this = this ;
			var ImportCell = Backgrid.Cell.extend({
				template: _.template('<div style="text-align:center;"><button class="btn"><span class="msgBtnValidateOne">Validate, 1/60 mn</span></button></div>'),
				frequency : self.selectedFrequency,
				events: {
				  'click': 'importRow'
				},

				importRow: function (e) {
					e.preventDefault();
				  //self.auto_valide(e);
					var ctx = this;
					var ind_id=this.model.attributes.ind_id;
					var ptt=this.model.attributes.platform_;

					$.when(this.auto_valide(ptt,ind_id, _this.selectedFrequency)).then(function(data) {
						ctx.import_success(e,data)
					},function(data){
						ctx.import_error(e,data);
					});

				},
				auto_valide: function (ptt, ind_id,frequency) {

					return $.ajax({
						url: self.type_url + ptt + '/unchecked/'+ind_id+'/import/auto',
						contentType: 'application/json',
						type: 'POST',
						data : JSON.stringify({'frequency': frequency})
					});

				},
				deleteRow: function (e) {
					e.preventDefault();
					this.model.collection.remove(this.model);
				},
				import_error: function(e,data) {
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

				},

				import_success: function(e,data) {

					var ctx = this;
					new Swal({
						title: "Success",
						text: data,
						type: 'success',
						showCancelButton: false,
						confirmButtonColor: 'green',
						confirmButtonText: "Ok",
						closeOnConfirm: true,
						},
						function(isConfirm) {
							try {
								ctx.deleteRow(e);
							}catch(e){
							Radio.channel('route').command('validate:type', ctx.type);

							}
						}
					);
					return false;
				},
				render: function () {
				  this.$el.html(this.template());
				  this.delegateEvents();
				  return this;
				}
			});

			var ImportAllCell = Backgrid.HeaderCell.extend({
				template: _.template('<button class="btn btn-success"><span class="msgBtnValidateAll">Validate all, 1/60 mn</span></button>'),
				frequency : self.selectedFrequency,
				events: {
				  'click': 'importAllRow'
				},
				importAllRow: function (e) {
				  e.preventDefault();
				  var ctx = this;
				  //self.auto_valide_ALL(e);
				  Swal({
						title: "Warning !",
						text: 'this proccess might take a long time',
						type: 'warning',
						showCancelButton: true,
						confirmButtonColor: 'green',
						confirmButtonText: "Ok",
						cancelButtonText: "Cancel",
						closeOnConfirm: false,
						closeOnCancell: true
						},
						function(isConfirm) {
							ctx.auto_valide_ALL(e);
						}
					);
				},
				auto_valide_ALL: function (e) {
					var ctx = this;
					var ajax_call = $.ajax({
						url:self.type_url +'unchecked/importAll/auto',
						contentType: 'application/json',
						type: 'POST',   
						data : JSON.stringify({'frequency' : _this.selectedFrequency}),        
					});

					$.when(ajax_call).then(function(data) {
						ctx.import_success(e,data)
					},function(data){
						ctx.import_error(e,data);
					});

				},
				import_error: function(e,data) {

					Swal({
						title: "Error",
						text: data,
						type: 'error',
						showCancelButton: false,
						confirmButtonColor: 'rgb(147, 14, 14)',
						confirmButtonText: "OK",
						closeOnConfirm: true,
						}
					);

				},
				import_success: function(e,data) {
					
					var ctx = this;
					Swal({
						title: "Success",
						text: data,
						type: 'success',
						showCancelButton: false,
						confirmButtonColor: 'green',
						confirmButtonText: "OK",
						closeOnConfirm: false,
						},
						function(isConfirm) {
							/*self.datas.fetch({reset: true,
								success : function(data){
									if (data.length == 0) {
										self.allValidatedData();
									}
								}
							});*/
						Radio.channel('route').command('validate:type', self.type);


						}
					);
				},
				render: function () {
				  this.$el.html(this.template());
				  this.delegateEvents();
				  return this;
				}
			});

			var columns = [{
				name: 'platform_',
				label: 'Transmitter',
				editable: false,
				cell: Backgrid.IntegerCell.extend({
					orderSeparator: ''
				}),
				
			},{
				name: 'ind_id',
				label: 'Individual ID',
				editable: false,
				formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
					fromRaw: function (rawValue, model) {
							if (rawValue==null) {
								rawValue='WARNING ==> No Individual attached !';
							}
						 return rawValue;
					  }
				}),
				cell: 'string',
				
			}, {
				name: 'nb',
				label: 'Number of unchecked locations',
				editable: false,
				cell: Backgrid.IntegerCell.extend({
					orderSeparator: ''
				}),
			  
			}, {
				name: 'begin_date',
				label: 'Begin date',
				editable: false,
				cell: 'String',
				formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
					fromRaw: function (rawValue, model) {
							if (rawValue==null) {
								rawValue='Row data between : '+model.attributes.min_date; ;
							}
						 return rawValue;
					  }
				}),
			  
			}, {
				name: 'end_date',
				label: 'End date',
				editable: false,
				cell: 'String',
				formatter: _.extend({}, Backgrid.CellFormatter.prototype, {
					fromRaw: function (rawValue, model) {
							if (model.attributes.begin_date==null) {
								rawValue='to '+model.attributes.max_date; ;
							}
						 return rawValue;
					  }
				}),
			  
			}, {
				name: 'Import',
				label: 'Import',
				editable: false,
				cell: ImportCell,
				headerCell: ImportAllCell
			}];

			// Initialize a new Grid instance
			this.grid = new Backgrid.Grid({
				columns: columns,
				collection: this.datas,
				row:ModelRow
			});

			this.datas.fetch({reset: true,
				success : function(data){
					self.updateSimpleFrequency();
					if (data.length == 0) {
						self.allValidatedData();
					}
				}});
		},

		onShow: function(){
			// set default frequency value
			$('#freq').val(this.selectedFrequency);
		},

		onRender: function () {
			this.$el.find('#list').append(this.grid.render().el);
			
		},
		updateSimpleFrequency : function () {

			this.selectedFrequency = $( "#freq" ).val();
			if (this.selectedFrequency != 'all'){
				// update btn displayed smg
				$( ".msgBtnValidateAll").text('Validate all, 1/' + this.selectedFrequency + ' mn');
				$( ".msgBtnValidateOne").text('Validate, 1/' + this.selectedFrequency + ' mn');
				
			}
			else {
				$( ".msgBtnValidateAll").text('Validate all');
				$( ".msgBtnValidateOne").text('Validate');
			}

		},
		onDestroy: function() {
			$('#main-region').removeClass('obscur');
		},
		showDetail: function(evt) {
			if ($(evt.target).is('span')) {
				return
			}
			var model = $(evt.target).parent().data('model'); 
			var ind_id=model.attributes.ind_id;
			var ptt=model.attributes.platform_;
			var collection = this.datas;
			Radio.channel('route').command('validate_type_id', this.type, ptt, ind_id, collection, this.selectedFrequency);
		},

		auto_valide: function (evt) {
			var model = $(evt.target).parent().parent().parent().data('model'); 
			var ind_id=model.attributes.ind_id;
			var ptt=model.attributes.platform_;

			$.ajax({
				url: this.type_url + ptt + '/unchecked/'+ind_id+'/import/auto',
				contentType: 'application/json',
				type: 'POST',
				context : this,
				data : {frequency : this.selectedFrequency},
				success: function (data) {
					return true;
				}
				
			});

		},

		allValidatedData : function() {
			console.log('in allValidatedData');
			new Swal({
				title: "Info",
				text: "No data to validate",
				type: 'info',
				showCancelButton: true,
				confirmButtonColor: 'green',
				confirmButtonText: "Ok",
				cancelButtonColor: 'grey',
				cancelButtonText: "Go to import",
				closeOnConfirm: true,
				closeOnCancel: true,
				},
				function(isConfirm){
					if (isConfirm){
						Radio.channel('route').command('home');
					}
					else {
						Radio.trigger('route').command('import',{});
					}
				}
			);
		}




	});
});
