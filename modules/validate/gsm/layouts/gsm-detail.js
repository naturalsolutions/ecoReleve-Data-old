define([
	'marionette',
	'radio',
	'config',
	'backbone',
	'models/individual',
	'modules2/validate/gsm/views/gsm-grid',
	'modules2/validate/gsm/views/gsm-info',
	'modules2/validate/gsm/views/gsm-map2',
	'text!modules2/validate/gsm/templates/gsm.html',
	'sweetAlert',
	'ns_modules_com',
], function(Marionette, Radio, config,Backbone,Individual, Grid, Info,
	Map, template, Swal, Com) {

	'use strict';

	return Marionette.LayoutView.extend({
		className: 'container-fluid no-padding full-height',
		template: template,

		regions: {
			grid: '#grid-container',
			info: '#info-container',
			map: '#map-container',
		},

		events: {
			'click #back' : 'back',
		},

		initialize: function(options) {
			this.type=options.type;
			var self=this;
			this.radio = Radio.channel('gsm-detail');
			//this.radio.comply('validate', this.validate, this);
			this.gsmID = options.gsmID;
			this.id_ind=options.id_ind;
		},

		onBeforeDestroy: function() {
			this.radio.reset();
			$('#main-region').removeClass('grey-back').removeClass('no-scroll');
			$('body').removeClass('no-scroll');
			
		},

		onShow: function() {
			$('body').addClass('full-height').addClass('no-scroll');
			$('#main-region').addClass('full-height').addClass('grey-back').addClass('no-scroll');

			var self=this;
			this.info.show(new Info({
				model: new Individual({
				   ptt:self.gsmID,
				   id:self.id_ind,
				   last_observation: null,
				   duration: null,
				   indivNbObs:null,
				   breeding_ring: null,
				   release_ring : null,
				   begin_date: null,
				   end_date: null,
				   chip_code: null
				}),
				type: this.type,
			}));

			this.com = new Com();

			this.grid.show(new Grid({
				type: this.type,
				com: this.com,
				gsmID:this.gsmID,
				id_ind:self.id_ind,
			}));
			this.map.show(new Map({
				type: this.type,
				com: this.com,
				gsmID:this.gsmID,
				id_ind:self.id_ind
			}));
		},

		back: function(){
			Radio.channel('route').command('validate:type', this.type);
		},


	});
});
