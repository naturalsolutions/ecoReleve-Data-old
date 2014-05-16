var ecoReleveData = (function(app) {
	"use strict";
	/*
	 * Base view: customize Backbone.Layout for remote template loading
	 */
	app.views.BaseView = Backbone.View.extend({
		initialize: function() {
			this._views = {};
			this._dfd = $.Deferred();
			this._dfd.resolve(this);
		},
		// Template management
		prefix: app.config.root + '/tpl/',
		template: '',
		getTemplate: function() {
			var path = this.prefix + this.template + '.html',
				dfd = $.Deferred();
			app.templates = app.templates || {};

			if (app.templates[path]) {
				dfd.resolve(app.templates[path]);
			} else {
				$.get(path, function(data) {
					app.templates[path] = _.template(data);
					dfd.resolve(app.templates[path]);
				}, "text");
			}
			return dfd.promise();
		},
		//Sub-view management
		getViews: function(selector) {
			if (selector in this._views) {
				return this._views[selector];
			}
			return [];
		},
		insertView: function(selector, view) {
			if (!view) {
				view = selector;
				selector = '';
			}
			// Keep a reference to this selector/view pair
			if (!(selector in this._views)) {
				this._views[selector] = [];
			}
			this._views[selector].push(view);
			// Forget this subview when it gets removed
			view.once('remove', function(view) {
				var i, found = false;
				for (i = 0; i < this.length; i++) {
					if (this[i].cid === view.cid) {
						found = true;
						break;
					}
				}
				if (found) {
					this.splice(i, 1);
				}
			}, this._views[selector]);
		},
		removeViews: function(selector) {
			if (selector in this._views) {
				while (this._views[selector].length) {
					this._views[selector][0].remove();
				}
			}
		},

		// Take care of sub-views before removing
		remove: function() {
			_.each(this._views, function(viewList, selector) {
				_.each(viewList, function(view) {
					view.remove();
				});
			});
			this.trigger('remove', this);
			Backbone.View.prototype.remove.apply(this, arguments);
		},
		//Rendering process
		serialize: function() {
			if (this.model) {
				return this.model.toJSON();
			}
		},
		// Can be overridden by child classes
		beforeRender: function() {},
		afterRender: function() {},
		render: function() {
			// Reset promise
			this._dfd = $.Deferred();

			// Give a chance to child classes to do something before render
			this.beforeRender();

			this.getTemplate().done(_.bind(function(tpl) {

				var data = this.serialize(),
					rawHtml = tpl(data),
					rendered;

				// Re-use nice "noel" trick from LayoutManager
				rendered = this.$el.html(rawHtml).children();
				this.$el.replaceWith(rendered);
				this.setElement(rendered);

				// Add sub-views
				_.each(this._views, function(viewList, selector) {
					var base = selector ? this.$el.find(selector) : this.$el;
					_.each(viewList, function(view) {
						view.render().$el.appendTo(this);
					}, base);
				}, this);

				// Give a chance to child classes to do something after render
				try {
					this.afterRender();
					this._dfd.resolve(this);
				} catch (e) {
					if (console && console.error) {
						console.error(e);
					}
					this._dfd.reject(this);
				}

			}, this));

			return this;
		},
		promise: function() {
			return this._dfd.promise();
		}
	});
	/*****************************************************
HomeView
******************************************************/
	app.views.HomeView = app.views.BaseView.extend({
		template: 'home',
		initialize: function() {

			app.views.BaseView.prototype.initialize.apply(this, arguments);
			this._dfds = {};
			window.addEventListener('online', this.updateOnlineStatus);
			window.addEventListener('offline', this.updateOnlineStatus);

			/* var body_width = $(window).width(); 
	        if (body_width < 1300 ){
	            $("canvas").attr("width", "350px");
	        }*/
		},
		afterRender: function() {
			$('#supersized').html('');
			$.supersized({
				slides: [{
					//image: 'images/home_outarde_paysage.jpg'
					image: 'images/home_fond.jpg'
				}]
			});
			this.serverUrl = localStorage.getItem('serverUrl');
			this.loadStats();
			var d = (new Date() + '').split(' ');
			// ["Mon", "Feb", "1", "2014"....
			d[1] = this.convertMonth(d[1]);
			var date = [d[1], d[2], d[3]].join(' ');
			// Feb 1  2014 ...
			$("#date").html(date);

			$("div.modal-backdrop").removeClass("modal-backdrop");

			$(window).on('hashchange', function(e) {
				// abroad ajax calls
				if (window.mapAjaxCall.xhr) {
					window.mapAjaxCall.xhr.abort();
				}
			});
			// set site name in home page
			$("#homeSiteName").text("Missour. Morocco");
			// number of stored observations
			var ln = app.collections.observations.length;
			$("#homeNbObs").text(ln);
		},
		events: {
			'click #alldata': 'alldata'
		},

		alldata: function(e) {
			if (navigator.onLine === true) {
				//var serverUrl = localStorage.getItem( "serverUrl");
				if ((this.serverUrl === undefined) || (this.serverUrl === null)) {
					alert("Please configurate the server url ");
				} else {
					app.router.navigate('#allData', {
						trigger: true
					});
				}
			} else {
				alert("you are not connected ! Please check your connexion ");
			}
		},
		updateOnlineStatus: function(event) {
			var condition = navigator.onLine ? "online" : "offline";
			//alert(condition);
			if (condition == "offline") {
				$(".connected").each(function() {
					$(this).addClass("tile-grey");
				});
			} else {
				$(".connected").each(function() {
					$(this).removeClass("tile-grey");
				});
			}
		},
		resizeImage: function() {
			var $image = $('img#superbg'),
				image_width = $image.width(),
				image_height = $image.height(),
				over = image_width / image_height,
				under = image_height / image_width,
				body_width = $(window).width(),
				body_height = $(window).height();

			if (body_width / body_height >= over) {
				$image.css({
					'width': body_width + 'px',
					'height': Math.ceil(under * body_width) + 'px',
					'left': '0px',
					'top': Math.abs((under * body_width) - body_height) / -2 + 'px'
				});
			} else {
				$image.css({
					'width': Math.ceil(over * body_height) + 'px',
					'height': body_height + 'px',
					'top': '0px',
					'left': Math.abs((over * body_height) - body_width) / -2 + 'px'
				});
			}
		},
		loadStats: function() {
			/* var dataGraph = localStorage.getItem("ecoreleveChart");
			// get current month and compare it with stored month
			var d = (new Date() + '').split(' ');
			// ["Mon", "Feb", "1", "2014"....
			var month = d[1];
			var storedMonth = localStorage.getItem("ecoreleveChartMonth");
			if (dataGraph && (month == storedMonth)) {
				var gData = JSON.parse(dataGraph);
				//var myPie = new Chart(document.getElementById("graph").getContext("2d")).Bar(gData,null);
				var myChart = new Chart(document.getElementById("graph").getContext("2d")).Line(gData, null);
				$("#homeGraphLegend").html("<h3>number of observations</h3>");
			} else {*/
				var url = this.serverUrl + "/station/count/month";
				$.ajax({
					url: url,
					dataType: "json",
					success: function(data) {
						var stat = data[0][0];
						var pieData = [];
						var labels = [];
						var barData = [];
						var colors = ["#F38630", "#E0E4CC", "#69D2E7", "#3F9F3F", "#A4A81E", "#F0F70C", "#0CF7C4", "#92D6C7", "#2385b8", "#E0C8DD", "#F38630", "#E0E4CC"];
						var legend = "<div id='graphLegend' style='text-align: left;'><b>stations number per month</b><br/>";
						var i = 0;
						for (var key in stat) {
							var dataObj = {};
							var month = key;
							var value = stat[key] || 0;
							/* dataObj.value = parseInt(value);
	                        dataObj.label = month;
	                        dataObj.color = colors[i];
	                        legend += "<p><a style='background:" + dataObj.color  + "; width:20px;height:20px;'>&nbsp;&nbsp;&nbsp;</a>&nbsp;" + month + "</p>";
	                        pieData.push(dataObj);
	                        i +=1;*/
							// bar graph
							labels.push(month);
							barData.push(parseInt(value));
						}
						labels = labels.reverse();
						barData = barData.reverse();
						var gData = {
							labels: labels,
							datasets: [{
								fillColor: "rgba(100,100,100,0.7)",
								strokeColor: "rgba(220,220,220,1)",
								data: barData
							}]
						};
						var strData = JSON.stringify(gData);
						// store data in localstorage
						localStorage.setItem("ecoreleveChart", strData);
						// store month in localstrorage to update data every month
						var d = (new Date() + '').split(' ');
						// ["Mon", "Feb", "1", "2014"....
						var month_ = d[1];
						localStorage.setItem("ecoreleveChartMonth", month_);
						//var myPie = new Chart(document.getElementById("graph").getContext("2d")).Bar(gData,null);
						var myChart = new Chart(document.getElementById("graph").getContext("2d")).Line(gData, null);
						$("#homeGraphLegend").html("<h3>stations number per month</h3>");
						/*
	                    var len = data.length;
	                    for (var i=0; i<len; i++){
	                        var dataObj = {};
	                        var value = data[i].value;
	                        var family = data[i].FAMILY;
	                        if (family ==""){ family = "non renseign&eacute;"};
	                        dataObj.value = parseInt(value);
	                        dataObj.label = family;
	                        dataObj.color = colors[i];

	                        legend += "<p><a style='background:" + dataObj.color  + "; width:20px;height:20px;'>&nbsp;&nbsp;&nbsp;</a>&nbsp;" + family + "</p>";
	                        pieData.push(dataObj);*/


						/*
	                   legend += "</div>";
	                   $("#legend").append(legend);
	                   var myPie = new Chart(document.getElementById("graph").getContext("2d")).Doughnut(pieData,null);*/
					},
					error: function(data) {
						$("#homeGraphLegend").html("error in loading data ");
					}
				});
			//}
			// update individuals number
			var indivUrl = this.serverUrl + "/TViewIndividual/list/count";
			$.ajax({
				url: indivUrl,
				dataType: "json",
				success: function(data) {
					var stat = data[0].count;
					$("#infos span").text(stat);
				}
			});

		},
		convertMonth: function(month) {
			var monthUpper = month.toUpperCase();
			switch (monthUpper) {
				case "JAN":
					return "January";
				case "FEB":
					return "February";
				case "MAR":
					return "March";
				case "APR":
					return "April";
				case "MAY":
					return "May";
				case "JUN":
					return "June";
				case "JUL":
					return "July";
				case "AUG":
					return "August";
				case "SEP":
					return "September";
				case "OCT":
					return "October";
				case "NOV":
					return "November";
				case "DEC":
					return "December";
			}
		}

	});

	return app;
})(ecoReleveData);