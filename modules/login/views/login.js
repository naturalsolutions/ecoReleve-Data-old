define([
	'jquery',
	'underscore',
	'backbone',
	'config',
	'marionette',
	'radio',
	'sha1',
	'text!modules2/login/templates/login.html'
], function($, _, Backbone, config, Marionette, Radio, sha1, template) {

	'use strict';

	return Marionette.ItemView.extend( {
		collection: new Backbone.Collection(),
		template: template,

		events: {
			'submit': 'login',
			'change #username': 'checkUsername',
			'focus input': 'clear'
		},

		// Cache Jquery selector.
		ui: {
			err: '#help-password',
			pwd: '#pwd-group'
		},


		clear: function(evt) {
			var group = $(evt.target).parent();
			group.removeClass('has-error');
			group.find(".help-block").text('');
		},


		initialize: function() {

		},


		onShow: function(){
			var ctx = this;
			this.collection.url = config.coreUrl + 'user';
			this.collection.fetch({
				success: function(data){
					ctx.users = [];
					data.each(function(m){
						ctx.users.push(m.get('fullname'));
					});
					$( "#username" ).autocomplete({
						source: function( request, response ) {
							var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
							response( $.grep( ctx.users, function( item ){
								return matcher.test( item );
							}) );
						}
					});
				}
			});

		},

		onRender: function() {
			$('#username').trigger('focus');
			$('body').addClass('login-page');

/*            jQuery.ajax({
				url: '//freegeoip.net/json/', 
				type: 'POST', 
				dataType: 'jsonp',
				success: function(location) {
						$('body').addClass(location.country_code);
				}
			});*/
		},

		checkUsername: function() {
			var user = this.collection.findWhere({fullname: $('#username').val()});
			if (!user) {
				this.fail('#login-group', 'Invalid username');
			}
		},

		login: function(elt) {
			elt.preventDefault();
			elt.stopPropagation();
			var user = this.collection.findWhere({fullname: $('#username').val()});
			var url = config.coreUrl + 'security/login';
			if (user) {
				$.ajax({
					context: this,
					type: 'POST',
					url: url,
					data:{
						user_id: user.get('PK_id'),
						password: sha1.hash($('#password').val())
					}
				}).done( function() {


					$('.login-form').addClass('rotate3d');
					setTimeout(function() {
						Radio.channel('route').trigger('login:success');
					},500);
					
				}).fail( function () {
					this.fail('#pwd-group', 'Invalid password');
					this.shake();
				});
			}   
			else {
				this.fail('#login-group', 'Invalid username');
				this.shake();
			}
		},

		onDestroy: function(){
			$('body').removeClass('login-page');
		},

		fail: function(elt, text) {
			$(elt).addClass('has-error');
			$(elt + ' .help-block').text(text);
		},


		shake: function(){
			$('.login-form').addClass('animated shake');
			setTimeout(function() {
				$('.login-form').removeClass('animated shake');
			},1000);
		}
	});
});
