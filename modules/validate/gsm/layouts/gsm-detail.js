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

			'click .arrow-right-indiv' :'changeTransmitter',
			'click .arrow-left-indiv' :'changeTransmitter'
		},

		initialize: function(options) {
			this.type=options.type;
			var self=this;
			this.radio = Radio.channel('gsm-detail');
			//this.radio.comply('validate', this.validate, this);
			this.gsmID = options.gsmID;
			this.id_ind=options.id_ind;
			this.selectedFrequency = options.frequency;
			this.coll = options.collection;

			if (!this.coll) {
				switch(this.type){
				case 'gsm':
					
					this.type_url = config.coreUrl+'dataGsm/';
					break;
				case 'argos':

					this.type_url = config.sensorUrl+'argos/';

					break;
				default:
					console.warn('type error');
					break;
				};
				var myColl = Backbone.Collection.extend({
						url: this.type_url + 'unchecked/list',
					});
				this.coll = new myColl();
				this.coll.fetch({
					success:function(){
						self.getIndex();
					}
				});
			}
			else {
				this.getIndex();
			}
			
		},

		getIndex: function() {
			var currentModel = this.coll.findWhere({ind_id : this.id_ind, platform_ : this.gsmID});
			this.currentIndex = this.coll.indexOf(currentModel);

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
				  parent: self,
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


			this.map.show(new Map({
				type: this.type,
				com: this.com,
				gsmID:this.gsmID,
				id_ind:self.id_ind
			}));

			this.grid.show(new Grid({
				type: this.type,
				frequency : this.selectedFrequency , 
				com: this.com,
				gsmID:this.gsmID,
				id_ind:self.id_ind,
				parent: this
			}));
		},

		back: function(){
			Radio.channel('route').command('validate:type', this.type);
		},


		changeTransmitter : function(e){

			if (e){
				var elem =$(e.target);
			}
			else {
				var currentModel = this.coll.at(this.currentIndex);
				this.coll.remove(currentModel);
			}
			if ((elem && elem.hasClass('glyphicon-chevron-right')) || !e){
				this.currentIndex++;
				if (this.currentIndex > this.coll.length-1) {
					this.currentIndex = 0;
				}
			}
			else {
				this.currentIndex--;
				if (this.currentIndex < 0) {
					this.currentIndex = this.coll.length-1;
				}
			}
			var currentModel = this.coll.at(this.currentIndex);
			this.id_ind = currentModel.get('ind_id');
			this.gsmID = currentModel.get('platform_');
			if (!this.id_ind) {
				this.changeTransmitter(e);
			}
			else {
				this.onShow();
			}
			
		}


	});
});
