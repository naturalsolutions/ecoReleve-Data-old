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
		template: 'home2',
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
		},
		events: {
			'click #alldata': 'alldata'
		},

		alldata: function(e) {
			if (navigator.onLine === true) {
				//var serverUrl = localStorage.getItem( "serverUrl");
				if ((this.serverUrl === undefined) || (this.serverUrl == null)) {
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
	/*****************************************************
//$input    input (new data)
******************************************************/

	app.views.StationTypeView = app.views.BaseView.extend({
		template: 'input',
		initialize: function() {},
		afterRender: function() {
			// remove backgrouyd image
			$.supersized({
				slides: [{
					image: ''
				}]
			});
		},
		events: {
			'click #station': 'getStation'
		},
		getStation: function() {
			var stationType = $('input[name=stationtype]:checked').val();
			switch (stationType) {
				case "newStation":
					app.utils.stationType = "newStation";
					app.router.navigate('#newStation', {
						trigger: true
					});
					break;
				case "importedStation":
					app.utils.stationType = "importedStation";
					app.collections.importedStations = new app.collections.Waypoints();
					app.collections.importedStations.fetch().then(function() {
						if (app.collections.importedStations.length > 0) {
							app.router.navigate('#importedStation', {
								trigger: true
							});
						} else {
							alert('there is not imported stations');
						}
					});
					break;
			}
		}
	});
	app.views.NewStation = app.views.BaseView.extend({
		template: 'inputStationDetails',
		initialize: function() {
			var station = new app.models.Station();
			this.formView = new app.views.StationFormView({
				initialData: station
			});
			this.formView.render();
		},
		afterRender: function() {

			$('#stationForm').append(this.formView.el);
			$(".form-actions").addClass("masqued");
			var frmView = this.formView;
			$("#inputStationAdd").on("click", $.proxy(frmView.onSubmit, frmView));
			//field date default value
			var inputDate = $('input[name*="Date_"]');
			$(inputDate).datepicker();
			$(inputDate).css('clip', 'auto');
			var currentDate = new Date();
			$(inputDate).datepicker("setDate", currentDate);
			// add datalist control for fieldActivity & users

			// get control id
			var controlId = $("[name='FieldActivity_Name']").attr("id");
			$("[name='FieldActivity_Name']").attr("list", controlId + "List");
			app.utils.addDatalistControl(controlId, app.collections.fieldActivityList);
			//users inputs needs only 1 datalist control
			var user1ControlId = $("[name='FieldWorker1']").attr("id");
			$("[name='FieldWorker1']").attr("list", user1ControlId + "List");
			app.utils.addDatalistControl(user1ControlId, app.collections.users,"idUser");
			var user2ControlId = $("[name='FieldWorker2']").attr("id");
			$("[name='FieldWorker2']").attr("list", user1ControlId + "List");
			var user3ControlId = $("[name='FieldWorker3']").attr("id");
			$("[name='FieldWorker3']").attr("list", user1ControlId + "List");
			var user4ControlId = $("[name='FieldWorker4']").attr("id");
			$("[name='FieldWorker4']").attr("list", user1ControlId + "List");
			var user5ControlId = $("[name='FieldWorker5']").attr("id");
			$("[name='FieldWorker5']").attr("list", user1ControlId + "List");
		}
	});
	app.views.StationFormView = NS.UI.Form.extend({
		initialize: function(options) {
			//this.usersList = options.usersTab ; 
			NS.UI.Form.prototype.initialize.apply(this, arguments);
			this.on('submit:valid', function(instance) {
				//var tm = instance;
				// add date time
				var dateNow = new Date();
				var dd = dateNow.getDate();
				var mm = dateNow.getMonth()+1;
				var yyyy = dateNow.getFullYear();
				var hrs = dateNow.getHours();
				var mins =dateNow.getMinutes();
				var myDateTimeString = yyyy +"-"+mm+"-"+ dd +" "+hrs+ ":" +mins + ":00.00";
				instance.attributes.Date_ = myDateTimeString;
				// add station id
				var idLastStation = app.utils.idLastStation;
				instance.attributes.stationId = idLastStation + 1;
				// autoincrement last station id
				app.utils.idLastStation += 1;
				// store value
				localStorage.setItem("idLastStation", app.utils.idLastStation);
				// replace field workers name by id
				var fieldWorker1 = instance.attributes.FieldWorker1;
				// get users dalist id
				var user1ControlId = $("[name='FieldWorker1']").attr("id");
				var idList = "#" + user1ControlId + "List";
				// replace fieldWorker1 name by fieldworker id
				var userId;
				if (instance.attributes.FieldWorker1){
					userId = this.getUserId(idList,"FieldWorker1");
					instance.attributes.FieldWorker1 = userId;
				}
				if (instance.attributes.FieldWorker2){
					userId = this.getUserId(idList,"FieldWorker2");
					instance.attributes.FieldWorker2 = userId;
				}
				if (instance.attributes.FieldWorker3){
					userId = this.getUserId(idList,"FieldWorker3");
					instance.attributes.FieldWorker3 = userId;
				}
				if (instance.attributes.FieldWorker4){
					userId = this.getUserId(idList,"FieldWorker4");
					instance.attributes.FieldWorker4 = userId;
				}
				if (instance.attributes.FieldWorker5){
					userId = this.getUserId(idList,"FieldWorker5");
					instance.attributes.FieldWorker5 = userId;
				}
				app.collections.stations.add(instance);
				app.collections.stations.save();
				app.router.navigate('#proto-choice', {
					trigger: true
				});
			});
		},
		getUserId : function(idList, inputName){
            var x = $("[name='" + inputName + "']").val();
            var z = $(idList);
            var val = $(z).find('option[value="' + x + '"]').text();
            return val;
        }
	});
	//imported station
	app.views.ImportedStation = app.views.BaseView.extend({
		template: 'inputStationDetails',
		initialize: function() {
			this.selectedStation = null;
		},
		afterRender: function() {
			// load imported stations
			//app.collections.importedStations = new app.collections.Waypoints();
			//app.collections.importedStations.fetch().then(function() {
			app.utils.initGrid(app.collections.importedStations, app.collections.Waypoints);
			//});
		},
		events: {
			'click #inputStationAdd': 'nextStep',
			'click tr': 'selectTableElement'
		},
		nextStep: function() {
			if (this.selectedStation !== null) {
				app.router.navigate("#proto-choice", {
					trigger: true
				});
				//app.collections.stations.add(instance);
				//app.collections.stations.save();

			} else {
				alert("please select a station");
			}

		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode;
			var eleName = e.target.parentNode.nodeName;
			if (eleName == "TR") {
				this.selectedStation = app.models.selectedModel;
				$(eleName).css("background-color","rgba(255, 255, 255,0)");
				$(ele).css("background-color","rgb(180, 180, 180)");
			}
		}
	});
	// protcol choice
	app.views.InputProtocolChoice = app.views.BaseView.extend({
		template: 'inputProtocolChoice',
		afterRender: function() {
			var listView = document.createElement('ul');
			$(listView).addClass('unstyled');
			// tab to storage keywors (id of protocol / name)
			var keywordsTab = [];
			var protocols = app.collections.protocolsList;
			protocols.each(function(mymodel) {
				var li = '<li class="protocolViewsList" idProt=' + mymodel.get('id') + '>' + mymodel.get('name') + '</li>';
				$(listView).append(li);
				var option = {};
				option.val = mymodel.get('id');
				option.label = mymodel.get('name');
				keywordsTab.push(option);
			});
			/*
	        var listview = new app.views.ProtocolListView({collection:app.collections.protocolsList});
	        listview.render();*/
			$('.listview').append(listView);
		},
		events: {
			'click li.protocolViewsList': 'navigation',
			'click #backStation': 'backToStation'
		},
		navigation: function(e) {
			e.preventDefault();
			var idSelectedProto = $(e.target).attr("idProt");
			var route = "data-entry/" + idSelectedProto;
			app.router.navigate(route, {
				trigger: true
			});
			/*app.global.selectedProtocolId = idSelectedProto;
	        app.global.selectedProtocolName = $(e.target).html();*/
		},
		backToStation: function() {
			if (app.utils.stationType === "newStation") {
				app.router.navigate('#newStation', {
					trigger: true
				});
			} else {
				app.router.navigate('#importedStation', {
					trigger: true
				});
			}
		}
	});
	app.views.ProtocolListView = Backbone.View.extend({
		tagName: "ul",
		className: "nav nav-pills nav-stacked",
		// Insert all subViews prior to rendering the View.
		beforeRender: function() {
			// Iterate over the passed collection and create a view for each item.
			var listView = $(this.el);
			// tab to storage keywors (id of protocol / name)
			var keywordsTab = [];
			this.collection.each(function(mymodel) {

				var li = '<li> <a id="btn" class="btnChoice" idProt=' + mymodel.get('id') + '><span  idProt=' + mymodel.get('id') + '>' + mymodel.get('name') + '</span></a></li>';
				listView.append(li);
				var option = {};
				option.val = mymodel.get('id');
				option.label = mymodel.get('name');
				keywordsTab.push(option);
			});
		},
		events: {
			'click #btn': 'navigation'
		},
		navigation: function(e) {
			e.preventDefault();
			var idSelectedProto = $(e.target).attr("idProt");
			var route = "data-entry/" + idSelectedProto;
			app.router.navigate(route, {
				trigger: true
			});
			app.global.selectedProtocolId = idSelectedProto;
			app.global.selectedProtocolName = $(e.target).html();
		}
	});
	app.views.ProtocolEntry = app.views.BaseView.extend({
		template: 'inputProtocolEntry',
		initialize: function(options) {
			this.selectedProtocolId = options.id;
			var currentModel = new app.models.Observation();
			var currentProtocol = app.collections.protocolsList.get(this.selectedProtocolId);
			/* for (var prop in currentProtocol) {
				if (prop!="id" &&(prop!="cid")){
					currentModel.attributes[prop] = currentProtocol[prop];
				}	
			}*/
			currentModel.constructor.schema = {};
			for (var propr in currentProtocol.attributes.schema) {
				if (propr != "id" && (propr != "cid")) {
					currentModel.constructor.schema[propr] = currentProtocol.attributes.schema[propr];
				}
			}
			//currentModel.constructor.schema = currentProtocol.attributes.schema;
			currentModel.constructor.verboseName = currentProtocol.attributes.name;
			this.formView = new app.views.ProtocolFormView({
				initialData: currentModel
			});
			this.formView.render();
			this.currentModelName = currentProtocol.attributes.name;
		},
		afterRender: function() {
			$(".protocol").append(this.formView.el);
			// add hidden input to the form to store protocol name and id
			var inputProtocolName = "<input type='hidden'  name='protocolName'  value='" + this.currentModelName + "''>";
			var inputProtocolId = "<input type='hidden'  name='protocolId'  value=" + this.selectedProtocolId + ">";
			$("form").append(inputProtocolName);
			$("form").append(inputProtocolId);
			$(".form-actions").addClass("masqued");
			var frmView = this.formView;
			$("#inputProtocolAdd").on("click", $.proxy(frmView.onSubmit, frmView));
			// display current protocol name
			$("#selectedProtocolName").text(this.currentModelName);
		}
	});
	app.views.ProtocolFormView = NS.UI.Form.extend({
		initialize: function(options) {
			//this.usersList = options.usersTab ; 
			NS.UI.Form.prototype.initialize.apply(this, arguments);
			this.on('submit:valid', function(instance) {
				instance.attributes.idStation = app.utils.idLastStation;
				instance.attributes.protocolName = $("input[name='protocolName']").val();
				instance.attributes.protocolId = $("input[name='protocolId']").val();
				app.collections.observations.add(instance);
				app.collections.observations.save();
				app.router.navigate("#data-entryEnd", {
					trigger: true
				});
			});
		}
	});
	app.views.InputEnd = app.views.BaseView.extend({
		template: 'inputEnd',
		initialize: function(options) {},
		events: {
			'click li.inputEnd': 'navigation',
			'click #backStation': 'backToStation'
		},
		navigation: function(e) {
			e.preventDefault();
			var route = $(e.target).attr("href");
			if (route) {
				app.router.navigate(route, {
					trigger: true
				});
			}

		},
		backToStation: function() {
			if (app.utils.stationType === "newStation") {
				app.router.navigate('#newStation', {
					trigger: true
				});
			} else {
				app.router.navigate('#importedStation', {
					trigger: true
				});
			}
		}
	});
	app.views.CurrentUser = app.views.BaseView.extend({
		template: 'current-user',
		serialize: function() {
			return {
				//name: app.instances.currentUser.fullName()
				name: "Olivier Rovellotti"
			};
		}
	});
	/*********************************************************
            Export
**********************************************************/
	app.views.ExportView = app.views.BaseView.extend({
		template: 'export',
		afterRender: function() {
			$.supersized({
				slides: [{
					image: ''
				}]
			});

			app.utils.getItemsList("#export-themes", "/views/themes_list");
		},
		events: {
			'change #export-themes': 'updateViewsList',
			'click .exportViewsList': 'selectCurrentView',
			'click button.close': 'exitExp'
		},
		updateViewsList: function(e) {
			var viewID = $("#export-themes option:selected").attr('value');
			app.utils.getViewsList(viewID);
		},
		selectCurrentView: function(e) {
			var viewName = $(e.target).get(0).attributes["value"].nodeValue;
			// this.setView(new app.views.ExportFilterView({viewName: viewName}));
			var route = "#export/" + viewName;
			app.router.navigate(route, {
				trigger: true
			});
		},
		exitExp: function(e) {
			app.router.navigate('#', {
				trigger: true
			});
		}
	});
	app.views.ExportFilterView = app.views.BaseView.extend({
		template: 'export-filter',
		initialize: function(options) {
			this.viewName = options.viewName;
			this.selectedFields = [];
			Array.prototype.remove = function(x) {
				for (var i in this) {
					if (this[i].toString() == x.toString()) {
						this.splice(i, 1);
					}
				}
			};
		},
		afterRender: function() {

			$("#filterViewName").text(this.viewName);
			//  $(".modal-content").css({"min-width": "600px","max-width": "1000px", "min-height": "500px","margin": "5%"});
			app.utils.generateFilter(this.viewName);
		},
		events: {
			'click #exportPrevBtn': 'exportview',
			//'click #export-add-filter' : 'addFilter',
			'click #export-field-select-btn': 'selectField',
			'click .btnDelFilterField': 'deleteFilterItem',
			'click #filter-query-btn': 'filterQuery',
			'click #exportMap': 'selectExtend',
			'click button.close': 'exitExp',
			'change #export-view-fields': 'selectField',
			'change .filter-select-operator': 'updateInputInfo',
			'click #msdnLink': 'msdnDetails'

		},
		exportview: function() {
			app.router.navigate("#export", {
				trigger: true
			});
		},
		/*addFilter : function(){
	        $("#export-field-selection").removeClass("masqued");
	        $("#filter-btn").addClass("masqued");
	       // $('#export-view-fields').css({"display": "inline-block","height": "40px","width": "350px"});
	    },*/
		selectField: function() {
			var fieldName = $("#export-view-fields option:selected").text();
			var fieldId = fieldName.replace("@", "-");
			// check if field is already selected
			var ln = this.selectedFields.length;
			var isSelected = false;
			if (fieldName === "") {
				isSelected = true;
			} else {
				if (ln > 0) {
					for (var i = 0; i < ln; i++) {
						if (this.selectedFields[i] == fieldId) {
							isSelected = true;
							break;
						}
					}
				}
			}

			if (isSelected === false) {
				var fieldType = $("#export-view-fields option:selected").attr('type');
				var fieldIdattr = fieldName.replace("@", "-");
				// generate operator
				var operatorDiv = this.generateOperator(fieldType);
				var inputDiv = this.generateInputField(fieldType);
				var fieldFilterElement = "<div class ='row-fluid filterElement' id='div-" + fieldIdattr + "'><div class='span4 name' >" + fieldName + "</div><div class='span1 operator'>" + operatorDiv + "</div><div class='span3'>";
				fieldFilterElement += inputDiv + "</div><div class='span3'><span id='filterInfoInput'></span></div><div class='span1'><a cible='div-" + fieldIdattr + "' class='btnDelFilterField'><img src='img/Cancel.png'/></a></div></div>";
				$("#export-filter-list").append(fieldFilterElement);
				$("#export-filter-list").removeClass("masqued");
				$('#filter-query').removeClass("masqued");
				this.selectedFields.push(fieldIdattr);
			}
		},
		updateInputInfo: function() {
			$(".filterElement").each(function() {
				var operator = $(this).find("select.filter-select-operator option:selected").text();
				if (operator == "LIKE") {
					$("#filterInfoInput").html("sql wildcard is allowed: <a id='msdnLink'>more details</a>");
				} else if (operator == "IN") {
					$("#filterInfoInput").text(" for multi-seletion, separator is ';' ");
				} else {
					$("#filterInfoInput").text("");
				}
			});
		},
		deleteFilterItem: function(e) {
			var elementId = $(e.target).parent().get(0).attributes["cible"].nodeValue;
			var fieldName = elementId.substring(4, elementId.length);
			elementId = "#" + elementId;
			$(elementId).remove();
			this.selectedFields.remove(fieldName);
		},
		filterQuery: function() {
			var query = "";
			var self = this;
			$(".filterElement").each(function() {

				var fieldName = $(this).find("div.name").text();
				/*var operator = $(this).find("div.operator").text();
	            if (operator !="LIKE"){*/
				var operator = $(this).find("select.filter-select-operator option:selected").text();
				/*} else {
	                operator = " LIKE ";
	            }   */

				if (operator == "LIKE") {
					operator = " LIKE ";
				}
				if (operator == "IN") {
					operator = " IN ";
				}

				var condition = $(this).find("input.fieldval").val();
				query += fieldName + operator + condition + ",";
			});
			// delete last character "&"
			query = query.substring(0, query.length - 1);
			var selectedView = this.viewName;
			$("#filterForView").val(query);
			app.utils.getFiltredResult("filter-query-result", query, selectedView);
			this.query = query;
		},
		selectExtend: function() {
			var selectedView = this.viewName;
			var filterValue = $("#filterForView").val();
			if ((this.selectedFields.length > 0) && (!this.query)) {
				var getFilter = this.filterQuery();
				$.when(getFilter).then(function() {
					app.views.filterValue = $("#filterForView").val();
					var route = "#export/" + selectedView + "/filter";
					/* var filterValue = $("#filterForView").val();
	                var route = "#export/" + selectedView + "/" + filterValue;*/
					app.router.navigate(route, {
						trigger: true
					});
				});
			} else if (this.selectedFields.length === 0) {
				app.views.filterValue = "";
				var route = "#export/" + selectedView + "/";
				app.router.navigate(route, {
					trigger: true
				});
			} else {
				app.views.filterValue = filterValue;
				var rt = "#export/" + selectedView + "/filter";
				app.router.navigate(rt, {
					trigger: true
				});
			}
			/*
	             window.print();
	        */
		},
		generateOperator: function(type) {
			var operatorDiv;
			switch (type) {
				case "string":
					operatorDiv = "<select class='filter-select-operator'><option>=</option><option>LIKE</option><option>IN</option></select>"; //"LIKE";
					break;
				case "integer":
					operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option></select>";
					break;
					/*case "datetime":
	        operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option></select>";
	          break;*/
				case "text":
					operatorDiv = "<select class='filter-select-operator'><option>=</option><option>LIKE</option><option>IN</option></select>"; //"LIKE";
					break;
				default:
					operatorDiv = "<select class='filter-select-operator'><option>&gt;</option><option>&lt;</option><option>=</option><option>&lt;&gt;</option><option>&gt;=</option><option>&lt;=</option></select>";
			}
			return operatorDiv;
		},
		generateInputField: function(type) {
			var inputDiv = "";
			switch (type) {
				case "datetime":
					inputDiv = "<input type='date' placeholder='YYYY-MM-DD' class='fieldval'/>";
					break;
				default:
					inputDiv = "<input type='text' class='fieldval'/>";
			}
			return inputDiv;
		},
		exitExp: function(e) {
			if (app.xhr) {
				app.xhr.abort();
			}
			app.router.navigate('#', {
				trigger: true
			});
		},
		msdnDetails: function() {
			window.open('http://technet.microsoft.com/en-us/library/ms179859.aspx', '_blank');
		}
	});
	app.views.ExportMapView = app.views.BaseView.extend({
		template: "export-map",
		initialize: function(options) {
			this.currentView = options.view;
			//this.filterValue = options.filter;
			this.filterValue = app.views.filterValue;
			//$("input#updateSelection").trigger('change');
		},
		afterRender: function(options) {
			$("#filterViewName").text(this.currentView);
			$('#map').css({
				"width": "800px",
				"height": "400px"
			});
			//   $(".modal-body").css({"max-height":"600px"});
			var point = new NS.UI.Point({
				latitude: 31,
				longitude: 61,
				label: ""
			});
			this.map_view = app.utils.initMap(point, 3);
			/*var style = new OpenLayers.Style({
	              pointRadius:0.2,strokeWidth:0.2,fillColor:'#edb759',strokeColor:'white',cursor:'pointer'
	        });
	        this.map_view.addLayer({point : point , layerName : "", style : style, zoom : 3});*/
			//masquer certains controles
			/*
	         var controls = this.map_view.map.getControlsByClass("OpenLayers.Control.MousePosition");
	        this.map_view.map.removeControl(controls[0]);
	        controls = this.map_view.map.getControlsByClass("OpenLayers.Control.Panel");
	        this.map_view.map.removeControl(controls[0]);
	        // add zoom controls to map
	        this.addControlsToMap(); */
			//add bbox content
			NS.UI.bbox = new NS.UI.BBOXModel();
			// init bbox model
			NS.UI.bbox.set("minLatWGS", "");
			NS.UI.bbox.set("minLonWGS", "");
			NS.UI.bbox.set("maxLatWGS", "");
			NS.UI.bbox.set("maxLonWGS", "");
			var bboxView = new app.views.BboxMapView({
				model: NS.UI.bbox
			});
			bboxView.$el.appendTo("#bbox");
			bboxView.render();

			// add geodata to base layer
			this.displayWaitControl();
			var serverUrl = localStorage.getItem("serverUrl");
			var url = serverUrl + "/views/get/" + this.currentView + "?filter=" + this.filterValue + "&format=geojson&limit=0";

			/*
	        var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON" , strategies:["BBOX"], cluster:true, params:{round:"0"}});
	        this.map_view.addLayer({protocol : protocol , layerName : "Observations", noSelect : false});
	        */

			var ajaxCall = {
				url: url,
				format: "GEOJSON",
				params: {
					round: "0"
				},
				cluster: true,
				serverCluster: true
			};
			this.map_view.addLayer({
				ajaxCall: ajaxCall,
				layerName: "Observations",
				noSelect: false,
				zoom: 4,
				zoomToExtent: true
			});



			/*var controls = this.map_view.map.getControlsByClass("OpenLayers.Control.MousePosition");
	        this.map_view.map.removeControl(controls[0]);
	        controls = this.map_view.map.getControlsByClass("OpenLayers.Control.Panel");
	        this.map_view.map.removeControl(controls[0]);*/
			// add zoom controls to map
			// this.addControlsToMap(); 

			//this.addControlsToMap();



			/*
	       // calculate initial count
	        var filterVal = this.filterValue;
	        //var query = "filter=" + filterVal;
	        app.utils.getFiltredResult("countViewRows", filterVal,this.currentView);
	        */
		},
		events: {
			'click #export-back-filter': 'backToFilter',
			'click #geo-query': 'getqueryresult',
			'click #export-result': 'getResult',
			'click #export-first-step': 'backToFistStep',
			'click button.close': 'exitExp'
		},
		backToFilter: function() {
			window.clearInterval(this.timer);
			var route = "#export/" + this.currentView;
			app.router.navigate(route, {
				trigger: true
			});

			/* var currentView = this.currentView;
	        window.clearInterval(this.timer);
	        app.views.main.setView(".layoutContent", new app.Views.ExportFilterView({viewName: currentView}));
	        app.views.main.render();*/
		},
		addControlsToMap: function() {
			var panel = new OpenLayers.Control.Panel({
				displayClass: 'panel',
				allowDepress: false
			});
			var zoomBox = new OpenLayers.Control.ZoomBox();
			var navigation = new OpenLayers.Control.Navigation();
			var zoomBoxBtn = new OpenLayers.Control.Button({
				displayClass: 'olControlZoomBox',
				type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
					'activate': function() {
						zoomBox.activate();
						navigation.deactivate();
					},
					'deactivate': function() {
						zoomBox.deactivate()
					}
				}
			});
			var navigationBtn = new OpenLayers.Control.Button({
				displayClass: 'olControlNavigation',
				type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
					'activate': function() {
						navigation.activate();
						zoomBox.deactivate();
					},
					'deactivate': function() {
						navigation.deactivate()
					}
				}
			});
			panel.addControls([zoomBoxBtn, navigationBtn]);
			this.map_view.map.addControls([panel, zoomBox, navigation]);
		},
		getqueryresult: function() {
			var selectedview = this.currentView;
			var bboxVal = $("input#updateSelection").val();
			var filterVal = this.filterValue;
			var query = "filter=" + filterVal + "&bbox=" + bboxVal;
			app.utils.getResultForGeoFilter(query, selectedview);
		},
		getResult: function() {
			//window.clearInterval(this.timer);
			app.views.selectedview = this.currentView;
			app.views.bbox = $("input#updateSelection").val() || "";
			app.views.filterVal = this.filterValue;
			var route = "#export/" + this.currentView + "/fields";
			app.router.navigate(route, {
				trigger: true
			});
			/*this.remove();
	        var myview = new app.views.ExportColumnsSelection ({view: selectedview ,filter:filterVal, bbox: bboxVal});
	        myview.render();
	        myview.$el.appendTo("#main");*/
			/* app.views.main.setView(".layoutContent", new app.Views.ExportColumnsSelection({view: selectedview ,filter:filterVal, bbox: bboxVal}));
	        app.views.main.render();*/


		},
		backToFistStep: function() {
			//window.clearInterval(this.timer);
			app.router.navigate("#export", {
				trigger: true
			});
		},
		exitExp: function(e) {
			app.router.navigate('#', {
				trigger: true
			});
		},
		displayWaitControl: function() {
			var mapDiv = this.map_view.el;
			var width = ((screen.width) / 2 - 200);
			var height = ((screen.height) / 2 - 200);
			var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>";
			var st = $("#waitControl").html();
			if ($("#waitControl").length === 0) {
				$(mapDiv).append(ele);
			}
		}
	});

	app.views.BboxMapView = app.views.BaseView.extend({
		template: "map-bbox",
		initialize: function(options) {
			/*this.listenTo(this.model, 'change', this.update);
	        app.views.BaseView.prototype.initialize.apply(this, arguments);*/
			this.model.on('change', this.render, this);
		}
	});
	app.views.ExportColumnsSelection = app.views.BaseView.extend({
		template: "export-columns",
		initialize: function(options) {
			this.currentView = options.view;
			// this.filterValue = app.views.filterValue;
			//this.bbox = app.views.bbox;
		},
		afterRender: function(options) {
			// $(".modal-content").css({"height":"700px", "max-width": "900px"});
			//  $('#map').css({"width":"700px","height":"400px"});
			// $(".modal-body").css({"max-height":"600px"});
			$("#filterViewName").text(this.currentView);
			var fieldsList = app.utils.exportFieldsList;
			var fieldsListforFom = [];
			// parcourir la liste de champs, afficher celles qui ne correspondent pas aux champs a afficher par défaut (lat, lon, date, station ou site_name)
			var ln = fieldsList.length;
			// columns to display on grid
			//this.displayWaitControl();
			app.utils.exportSelectedFieldsList = [];
			for (var i = 0; i < ln; i++) {
				var field = fieldsList[i];
				var fieldUpper = field.toUpperCase();
				var stationAdded = false;
				if (fieldUpper == "STATION") {
					app.utils.exportSelectedFieldsList.push(field);
					stationAdded = true;
				} else if ((fieldUpper == "LAT") || (fieldUpper == "LON") || (fieldUpper == "DATE")) {
					app.utils.exportSelectedFieldsList.push(field);
				} else if (fieldUpper == "SITE_NAME") {
					// si champ station exite, il ne faut pas rajouter ce champ à la liste de champs a afficher
					if (stationAdded === false) {
						app.utils.exportSelectedFieldsList.push(field);
					} else {
						fieldsListforFom.push(field);
					}
				} else if (fieldUpper == "PTT") {
					app.utils.exportSelectedFieldsList.push(field);
				} else {
					fieldsListforFom.push(field);
				}
			}


			/*var ln = fieldsList.length;
	        //generate datatable structure
	        for (var i=0; i< ln ; i++){
	            var fieldName = fieldsList[i];
	            var fieldHtml = "<th>" + fieldName + "</th>";
	            $("#exportResultList-head").append(fieldHtml);
	            
	        }*/
			var columnsModel = new app.models.ProtoModel();
			var schema = {
				Columns: {
					type: 'CheckBox',
					title: '',
					options: fieldsListforFom /*, inline : 'true'*/
				} //,validators: ['required']
			};
			columnsModel.schema = schema;
			columnsModel.constructor.schema = columnsModel.schema;
			columnsModel.constructor.verboseName = "dataset";
			setTimeout(function() {
				var myView = new app.views.ExportColumnsListFormView({
					initialData: columnsModel
				});
				myView.render();
				$("#formcolumns").append(myView.el);
				$("#exportResult").on("click", $.proxy(myView.onSubmit, myView));
				$(".form-actions").addClass("masqued");
				// $("#waitControl").remove();
			}, 2000);


			// this.$el.append(myView.render().el);


		},
		events: {
			'click #exportPrevMapBtn': 'backToMap',
			'click #exportResult': 'getResult',
			'click #export-first-step': 'backToFistStep',
			'click button.close': 'exitExp'
		},
		backToMap: function() {
			//app.views.main.removeView("#formcolumns");
			var currentView = this.currentView;
			// var filterValue = this.filterValue;
			var route = "#export/" + currentView + "/filter";
			app.router.navigate(route, {
				trigger: true
			});
			/*app.views.main.setView(".layoutContent", new app.Views.ExportMapView({view : currentView, filter: filterValue}));
	        app.views.main.render();*/
		},
		getResult: function() {
			var displayedColumns = app.utils.exportSelectedFieldsList || [];
			if (displayedColumns.length > 0) {
				var selectedview = this.currentView;
				var router = "#export/" + selectedview + "/result";
				app.router.navigate(router, {
					trigger: true
				});
				/*app.views.main.setView(".layoutContent", new app.Views.ExportResult({view: selectedview ,filter:filterVal, bbox: bboxVal}));
	            app.views.main.render();*/
			} else {
				alert("please select columns to display");
			}

		},
		backToFistStep: function() {
			app.router.navigate("#export", {
				trigger: true
			});
		},
		exitExp: function(e) {
			app.router.navigate('#', {
				trigger: true
			});
		},
		displayWaitControl: function() {
			var mapDiv = this.map_view.el;
			var width = ((screen.width) / 2 - 200);
			var height = ((screen.height) / 2 - 200);
			var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>";
			var st = $("#waitControl").html();
			if ($("#waitControl").length === 0) {
				$("div.modal-body").append(ele);
			}
		}
	});
	app.views.ExportColumnsListFormView = NS.UI.Form.extend({
		initialize: function(options) {
			//this.protocolsList = options.protocols ; 
			NS.UI.Form.prototype.initialize.apply(this, arguments);
			this.on('submit:valid', function(instance) {
				var ln;
				var attr = instance.attributes.Columns;
				if (typeof attr !== "undefined") {
					ln = attr.length;
				} else {
					ln = 0;
				}
				if (ln > 5) {
					alert(" please select max 5 columns ");
				} else {
					// add all selected fields to displayed fields list
					for (var i = 0; i < ln; i++) {
						app.utils.exportSelectedFieldsList.push(attr[i]);
					}
				}
			});
		}
	});
	//$exportresult
	app.views.ExportResult = app.views.BaseView.extend({
		template: "export-result",
		initialize: function(options) {
			this.currentView = options.view;
			this.filterValue = app.views.filterValue;
			this.bbox = app.views.bbox;
		},
		afterRender: function(options) {
			var serverUrl = localStorage.getItem("serverUrl");
			var gpxFileUrl = serverUrl + "/gps/data.gpx";
			var pdfFileUrl = serverUrl + "/pdf/data.pdf";
			var csvFileUrl = serverUrl + "/csv/data.csv";
			$('#export-getGpx').attr("href", gpxFileUrl);
			$('#export-getPdf').attr("link", pdfFileUrl);
			$('#export-getCsv').attr("href", csvFileUrl);

			$("#filterViewName").text(this.currentView);
			var fieldsList = app.utils.exportSelectedFieldsList;
			if (app.utils.exportSelectedFieldsList[0] == "Id") {
				app.utils.exportSelectedFieldsList.shift();
			}
			var ln = fieldsList.length;
			//generate datatable structure
			for (var i = 0; i < ln; i++) {
				var fieldName = fieldsList[i];
				var fieldHtml = "<th>" + fieldName + "</th>";
				$("#exportResultList-head").append(fieldHtml);

			}
			app.utils.getExportList(this.currentView, this.filterValue, this.bbox, this);
			$("#exportResultList-head").css({
				"color": "black"
			});
			// map view
			this.displayedCols = app.utils.exportSelectedFieldsList;
			this.url = serverUrl + "/views/get/" + this.currentView + "?filter=" + this.filterValue + "&bbox=" + this.bbox + "&columns=" + this.displayedCols;
			//add id field to field list to display on the map
			this.displayedCols.unshift("Id");
			$('#map').css({
				"width": "900px",
				"height": "550px"
			});
			var point = new NS.UI.Point({
				latitude: 31,
				longitude: 61,
				label: ""
			});
			this.map_view = app.utils.initMap(point, 2);
			var url = this.url + "&format=geojson";
			var style = new OpenLayers.Style({
					pointRadius: 4,
					strokeWidth: 1,
					fillColor: '#edb759',
					strokeColor: 'black',
					cursor: 'pointer',
					label: "${getLabel}",
					labelXOffset: "50",
					labelYOffset: "-15"
				}, {
					context: {
						getLabel: function(feature) {
							if (feature.layer.map.getZoom() > 5) {
								//return feature.attributes.label;
								// return list of arributes (labels to display on the map)
								var labelsList = [];
								for (var k in feature.attributes) {

									if ((k != "Id") && (k != "count")) {
										labelsList.push(feature.attributes[k]);
									}
									labelsList.unshift(feature.attributes["Id"]);
									return labelsList;
								}
							} else {
								return "";
							}
						}
					}
				}


			);
			/*
	        var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["FIXED"], popup : false, style: style});
	        this.map_view.addLayer({protocol : protocol , layerName : "Observations", });
	        */
			var ajaxCall = {
				url: url,
				format: "GEOJSON",
				cluster: false,
				style: style
			};
			this.map_view.addLayer({
				ajaxCall: ajaxCall,
				layerName: "Observations",
				zoom: 3,
				zoomToExtent: true
			});

			//this.addControlsToMap();
			// load map vector fields list
			var len = this.displayedCols.length;
			for (var s = 0; s < len; s++) {
				var label = this.displayedCols[s];
				$("#map-field-selection").append("<option>" + label + "</option>");
			}


		},
		events: {
			'click #exportPrevBtn': 'backToMap',
			//'click #export-getGpx' : 'getGpx',
			'click #export-first-step': 'backToFistStep',
			'click #exportDataMap': 'dataOnMap',
			'click #export-getPdf': "getPdfFile",
			'click #export-getCsv': 'getCsvFile',
			'click button.close': 'exitExp',
			'change #map-field-selection': 'updateMap',
			'click #map-label-hposition-off': "moveHlabelOff",
			'click #map-label-hposition-in': "moveHlabelIn",
			'click #map-label-vposition-off': "moveVlabelOff",
			'click #map-label-vposition-in': "moveVlabelIn",
			'click #export-map-print': 'printMap'
		},
		backToMap: function() {
			if (app.xhr) {
				app.xhr.abort();
			}
			var currentView = this.currentView;
			//  var filterValue = this.filterValue;
			//  var bboxVal = this.bbox;
			var route = "#export/" + currentView + "/filter";
			app.router.navigate(route, {
				trigger: true
			});
			//app.views.main.setView(".layoutContent", new app.Views.ExportColumnsSelection({view: currentView ,filter:filterValue, bbox: bboxVal}));
			// app.views.main.render();
		},
		getPdfFile: function() {
			var url = $('#export-getPdf').attr("link");
			window.open(url, 'list export in pdf');
		},
		getCsvFile: function() {

		},
		backToFistStep: function() {
			if (app.xhr) {
				app.xhr.abort();
			}
			app.router.navigate("#export", {
				trigger: true
			});
		},
		dataOnMap: function() {
			var route = "#export/" + this.currentView + "/ResultOnMapView";
			app.router.navigate(route, {
				trigger: true
			});
		},
		exitExp: function(e) {
			if (app.xhr) {
				app.xhr.abort();
			}
			app.router.navigate('#', {
				trigger: true
			});
		},
		addControlsToMap: function() {
			var panel = new OpenLayers.Control.Panel({
				displayClass: 'panel',
				allowDepress: false
			});
			var zoomBox = new OpenLayers.Control.ZoomBox();
			var navigation = new OpenLayers.Control.Navigation();
			var zoomBoxBtn = new OpenLayers.Control.Button({
				displayClass: 'olControlZoomBox',
				type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
					'activate': function() {
						zoomBox.activate();
						navigation.deactivate();
					},
					'deactivate': function() {
						zoomBox.deactivate()
					}
				}
			});
			var navigationBtn = new OpenLayers.Control.Button({
				displayClass: 'olControlNavigation',
				type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
					'activate': function() {
						navigation.activate();
						zoomBox.deactivate();
					},
					'deactivate': function() {
						navigation.deactivate()
					}
				}
			});
			panel.addControls([zoomBoxBtn, navigationBtn]);
			this.map_view.map.addControls([panel, zoomBox, navigation]);
		},
		printMap: function() {
			window.print();
		},
		updateMap: function() {
			var selectedValue = $('#map-field-selection :selected').text();
			this.map_view.editLabel("Observations", selectedValue);
		},
		moveHlabelOff: function() {
			this.map_view.moveLabel("Observations", "h", "-2");
		},
		moveHlabelIn: function() {
			this.map_view.moveLabel("Observations", "h", "+2");
		},
		moveVlabelOff: function() {
			this.map_view.moveLabel("Observations", "v", "-2");
		},
		moveVlabelIn: function() {
			this.map_view.moveLabel("Observations", "v", "+2");
		}
	});
	app.views.GridView = app.views.BaseView.extend({
		initialize: function(options) {
			app.utilities.BaseView.prototype.initialize.apply(this, arguments);
			this.grid = new NS.UI.Grid(options);
			this.insertView(this.grid);
			// Relay grid events
			this.grid.on('selected', function(model) {
				this.trigger('selected', model);
			}, this);
			this.grid.on('sort', function(field, order) {
				this.trigger('sort', field, order);
			}, this);
			this.grid.on('unsort', function() {
				this.trigger('unsort');
			}, this);
			this.grid.on('filter', function(fieldId, value) {
				this.trigger('filter', fieldId, value);
			}, this);
			this.grid.on('unfilter', function(fieldId) {
				this.trigger('unfilter', fieldId);
			}, this);
			this.grid.on('page', function(target) {
				this.trigger('page', target);
			}, this);
			this.grid.on('pagesize', function(size) {
				this.trigger('pagesize', size);
			}, this);
			// Custom date picker
			this.grid.addDatePicker = function(element) {
				var $el = $(element),
					val = $el.val();
				$el.attr('type', 'text');
				$el.datepicker({
					format: app.config.dateFormat
				}) //  dd/mm/yyyy                
				.on('changeDate', $el, function(e) {
					if (e.viewMode == 'days') {
						e.data.trigger('input');
					}
				});
				$el.on('input', function(e) {
					$(this).datepicker('hide');
				});
				$el.on('keydown', function(e) {
					if (e.keyCode == 27 || e.keyCode == 9) $(this).datepicker('hide');
				});
				if (val) $el.datepicker('setValue', val);
			};
		}
	});
	// $alldata
	app.views.AllDataView = app.views.BaseView.extend({
		template: "allData",
		afterRender: function(options) {
			// try{
			// remove background image
			$.supersized({
				slides: [{
					image: ''
				}]
			});
			// masqued fields
			$('#id_proto').hide();
			$('#idate').hide();
			$('#allDataCluster').hide();
			var serverUrl = localStorage.getItem("serverUrl");
			//procole list for input select
			$.ajax({
				url: serverUrl + "/proto/proto_list",
				dataType: "text",
				success: function(xmlresp) {
					var xmlDoc = $.parseXML(xmlresp),
						$xml = $(xmlDoc),
						$protocoles = $xml.find("protocole");
					// init select control with empty val
					// $('<option id= 0 ></option>').appendTo('#select_id_proto');
					$protocoles.each(function() {
						$('<option id=\"' + $(this).attr('id') + '\" value=\"' + $(this).text() + '\">' + $(this).text() + '</option>').appendTo('#select_id_proto');
					});
					$("#select_id_proto option[id='12']").attr('selected', 'selected');
				}
			});
			var dataContainer = $("#main")[0]; //var myDataTable = $("#myDataTable")[0];
			var widthDataContainer = dataContainer.clientWidth;
			var widthallDataContent = widthDataContainer - 260;

			$('#allDataMap').css('width', (widthallDataContent * 0.98) + 'px'); //$('#map').css('width', '700px');
			$('#map').css('width', (widthallDataContent * 0.97) + 'px'); //$('#map').css('width', '700px');

			$(window).bind('resize', function() {
				dataContainer = $("#main")[0];
				widthDataContainer = dataContainer.clientWidth;
				widthallDataContent = widthDataContainer - 260;
				$('#allDataContent').css('width', widthallDataContent + 'px');

				// check if datatable is not hided and resize map if window is resized
				var displayed = $("#allDataList").is(":visible");
				if (displayed) {
					$('#map').css('width', (widthallDataContent * 0.63) + 'px'); //$('#map').css('width', '700px');
					//console.log ("widthallDataContent : " + widthallDataContent );
					$('#allDataMap').css('width', (widthallDataContent * 0.65) + 'px'); //$('#map').css('width', '700px');
					$('#allDataList').css('width', (widthallDataContent * 0.3) + 'px'); //$('#map').css('width', '700px');
				}

			});
			$("#allDataList").hide();
			var point = new NS.UI.Point({
				latitude: 34,
				longitude: 44,
				label: ""
			});
			this.map_view = app.utils.initMap(point, 3);
			this.map_view.addLayer({
				layerName: "tracks"
			});
			$("label, input,button, select ").css("font-size", "15px");
			//datalist of taxons
			app.utils.fillTaxaList();
			/* } catch (e) {
	            app.router.navigate('#', {trigger: true});
	        }*/
			// get area list 
			this.getAreaList();
		},
		events: {
			'change #select_id_proto': 'updateTable',
			//'change input.cluster' : 'updateMap',
			'click #btnReset': 'resetdate',
			'click #btnW': 'updateDateWeek',
			'click #btnM': 'updateDateMonth',
			'click #btnY': 'updateDateYear',
			'keyup #datedep': 'updateDateDep',
			'keyup #datearr': 'updateDateArr',
			'click #searchBtn ': 'search',
			'click tr': 'selectTableElement',
			'click #allDataInfosPanelClose': 'closeInfosPanel',
			//'change input#updateSelection' : 'updateTableForSelecedFeatures'
			// 'selectedFeatures:change' : 'updateTableForSelecedFeatures',
			'click #refreshTable': 'updateTableForSelecedFeatures',
			'click #featureOnTheMap': 'zoomMapToSelectedFeature',
			'click div.olControlSelectFeatureItemActive.olButton': "deletePositionLayer",
			'click #alldataAlertYes': 'continueGeoQuery',
			'click #alldataAlertNo': 'resetGeoQuery',
			'click #allDataLoadTrack': 'loadTrack'
		},
		getAreaList: function() {
			var idProtocol = $("#id_proto").attr("value");
			app.utils.getAreaList("#alldata-regionList", "/station/area?id_proto=" + idProtocol, true);
			app.utils.getLocalityList("#alldata-localityList", "/station/locality?id_proto=" + idProtocol, true);
		},
		updateTable: function() {
			//this.updateControls();
			$("#iTaxon").val("");
			$("#place").val("");
			$("#region").val("");
			$("#id_proto").attr("value", ($("#select_id_proto option:selected").attr('id')));
			app.utils.fillTaxaList();
			this.getAreaList();
		},
		updateDateWeek: function() {
			// $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
			$(".allData-criteriaBtn").removeClass("btnSelected");
			$(".allData-criteriaBtn").addClass("btnUnselected");
			// $("#btnW").css({"background-color" : "rgb(119, 117, 117)"});
			$("#btnW").removeClass("btnUnselected");
			$("#btnW").addClass("btnSelected");
			$('#idate').text("week");
			$("#datedep").attr('value', "");
			$("#datearr").attr('value', "");
		},
		updateDateMonth: function() {
			$(".allData-criteriaBtn").removeClass("btnSelected");
			$(".allData-criteriaBtn").addClass("btnUnselected");
			//$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
			//$("#btnM").css({"background-color" : "rgb(119, 117, 117)"});
			$("#btnM").removeClass("btnUnselected");
			$("#btnM").addClass("btnSelected");

			$('#idate').text("month");
			$("#datedep").attr('value', "");
			$("#datearr").attr('value', "");
		},
		updateDateYear: function() {
			$(".allData-criteriaBtn").removeClass("btnSelected");
			$(".allData-criteriaBtn").addClass("btnUnselected");
			//$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
			//$("#btnY").css({"background-color" : "rgb(119, 117, 117)"});
			$("#btnY").removeClass("btnUnselected");
			$("#btnY").addClass("btnSelected");

			$('#idate').text("year");
			$("#datedep").attr('value', "");
			$("#datearr").attr('value', "");
		},
		/* updateDate1an : function(){
	        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
	        $("#btnY-1").css({"background-color" : "rgb(150,150,150)"});
	        $('#idate').text("1ans");   
	        $("#datedep").attr('value',"");
	        $("#datearr").attr('value',"");
	    },
	    updateDate2ans : function(){
	        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
	        $("#btnY-2").css({"background-color" : "rgb(150,150,150)"});
	        $('#idate').text("2ans");
	        $("#datedep").attr('value',"");
	        $("#datearr").attr('value',"");   
	    },*/
		resetdate: function() {
			$(".allData-criteriaBtn").removeClass("btnSelected");
			$(".allData-criteriaBtn").addClass("btnUnselected");
			$("#btnReset").removeClass("btnUnselected");
			$("#btnReset").addClass("btnSelected");
			//$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
			//$("#btnReset").css({"background-color" : "rgb(150,150,150)"});

			$('#idate').text("");
			$("#datedep").attr('value', "");
			$("#datearr").attr('value', "");
		},
		/* updateDateHier : function(){
	        $(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
	        $("#btnD-1").css({"background-color" : "rgb(150,150,150)"});
	        $('#idate').text("hier");
	        $("#datedep").attr('value',"");
	        $("#datearr").attr('value',"");
	    },*/
		updateDateDep: function() {
			var regex = new RegExp("^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$");
			var regex2 = new RegExp("^[0-9]{4}$");
			var regex3 = new RegExp("^[0-9]{4}-(0[1-9]|1[012])$");
			var datedep = $("#datedep").attr('value');
			var datearr = $("#datearr").attr('value');
			if (((regex.test(datedep) && regex.test(datearr)) || (regex2.test(datedep) && regex2.test(datearr)) || (regex3.test(datedep) && regex3.test(datearr))) && datedep <= datearr)
				$("#dateinter").removeAttr("disabled");
			else
				$("#dateinter").attr("disabled", "disabled");
		},
		updateDateArr: function() {
			var regex = new RegExp("^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$");
			var regex2 = new RegExp("^[0-9]{4}$");
			var regex3 = new RegExp("^[0-9]{4}-(0[1-9]|1[012])$");
			var datedep = $("#datedep").attr('value');
			var datearr = $("#datearr").attr('value');
			if (((regex.test(datedep) && regex.test(datearr)) || (regex2.test(datedep) && regex2.test(datearr)) || (regex3.test(datedep) && regex3.test(datearr))) && datedep <= datearr)
				$("#dateinter").removeAttr("disabled");
			else
				$("#dateinter").attr("disabled", "disabled");
		},
		search: function() {
			this.displayWaitControl();
			// $("#map").css("height","795px");
			this.updateControls();
			var datedep = $("#datedep").attr('value');
			var datearr = $("#datearr").attr('value');
			if (datedep !== "" || datearr !== "") {
				$('#idate').text(datedep + ";" + datearr);
			}
			/*$('#idate').text(datedep+";"+ datearr);*/
			var params = 'id_proto=' + $("#id_proto").attr("value") + "&place=" + $("#place").attr("value") + "&region=" + $("#region").attr("value") + "&idate=" + $('#idate').text() + "&taxonsearch=" + $("#iTaxon").attr("value");
			app.utils.filldatable(params);
			app.utils.updateLayer(this.map_view);
			/*     $("img#mapunselectfeatures").css("position" , "absolute");
	                $("img#mapunselectfeatures").css("z-index","1008");
	                $("img#mapunselectfeatures").css("right", "85px");
	                $("img#mapunselectfeatures").css("top", "4px");*/
			// display button loading tracks
			$("#allDataLoadTrack").removeClass("masqued");
		},
		updateMap: function() {
			app.utils.updateLayer(this.map_view);
		},
		updateZoom: function() {
			app.utils.updateLayer(this.map_view);
		},
		updateData: function(e) {
			var name = e.target.value;
			if (e.keyCode == 13) {
				app.utils.updateLayer(this.map_view);
				app.utils.filldatable();
			}
		},
		updateControls: function() {
			$("#allDataList").removeAttr('style');
			$('#allDataCluster').removeAttr('style');

			var dataContainer = $("#main")[0]; //var myDataTable = $("#myDataTable")[0];
			var widthDataContainer = dataContainer.clientWidth;
			var widthallDataContent = widthDataContainer - 260;
			if (widthallDataContent < 850) {
				widthallDataContent = widthallDataContent - 20;
			}
			$('#map').css('width', (widthallDataContent * 0.60) + 'px'); //$('#map').css('width', '700px');
			//console.log ("widthallDataContent : " + widthallDataContent );
			$('#allDataMap').css('width', (widthallDataContent * 0.62) + 'px'); //$('#map').css('width', '700px');
			$('#allDataList').css('width', (widthallDataContent * 0.3) + 'px'); //$('#map').css('width', '700px');
			// redraw map
			this.map_view.map.baseLayer.redraw();
		},
		updateTableForSelecedFeatures: function(evt) {
			// check if you need to use selected features id ( else : use BBOX)
			var params = 'id_proto=' + $("#id_proto").attr("value") + "&place=" + $("#place").attr("value") + "&region=" + $("#region").attr("value") + "&idate=" + $('#idate').text() + "&taxonsearch=" + $("#iTaxon").attr("value");
			var paramsMap = "";
			var idSelected = $("#featuresId").val();
			if (idSelected === "") {
				paramsMap = "bbox=" + $("#updateSelection").val();
			} else if ((idSelected.split(",")[0]) === "") {
				// paramsMap = "id_stations=''";
				paramsMap = "bbox=" + $("#updateSelection").val();
			} else {
				// get all id station from string  (id1,id2 ...)
				paramsMap = "id_stations=" + idSelected;
			}
			app.utils.filldatable(params, paramsMap);
		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode.nodeName;
			// if (ele =="TD"){
			if (ele == "TR") {
				var selectedModel = app.models.selectedModel;
				$("#allDataInfosPanel").css({
					"display": "block"
				});
				var content = "<h3>details</h3>";
				var latitude, longitude;
				for (var k in selectedModel.attributes) {
					var v = selectedModel.attributes[k];
					if (k.toUpperCase() == "DATE") {
						var d = (new Date(v) + '').split(' ');
						v = [d[1], d[2], d[3]].join(' ');
					}
					if (k.toUpperCase() == "LAT") {
						latitude = v;
					}
					if (k.toUpperCase() == "LON") {
						longitude = v;
					}
					content += "<p class='allDataInfosTitles'> " + k + " <br/><span>" + v + "</span></p>";
				}
				content += "<p id='featureOnTheMap' longitude='" + longitude + "' latitude='" + latitude + "'><a><img src='images/Map-Location.png'/></a> <i>show it on the map</i></p>";
				$("#allDataInfosPanelContent").html(content);
			}
		},
		zoomMapToSelectedFeature: function() {
			var latitude = $("#featureOnTheMap").attr("latitude");
			var longitude = $("#featureOnTheMap").attr("longitude");
			var point = {};
			point.longitude = longitude;
			point.latitude = latitude;
			//this.map_view.setCenter(point);
			app.utils.updateLocation(this.map_view, point);
		},
		deletePositionLayer: function() {
			// delete selected feature layer if exists
			var mapView = this.map_view;
			for (var i = 0; i < mapView.map.layers.length; i++) {
				if ((mapView.map.layers[i].name) == "Selected feature") {
					mapView.map.removeLayer(mapView.map.layers[i]);
				}
			}
		},
		closeInfosPanel: function() {
			var mapView = this.map_view;
			$('#allDataInfosPanel').hide();
			for (var i = 0; i < mapView.map.layers.length; i++) {
				if ((mapView.map.layers[i].name) == "Selected feature") {
					mapView.map.removeLayer(mapView.map.layers[i]);
				}
			}
		},
		displayWaitControl: function() {
			var mapDiv = this.map_view.el;
			var width = ((screen.width) / 2 - 200);
			var height = ((screen.height) / 2 - 200);
			var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>";
			var st = $("#waitControl").html();
			if ($("#waitControl").length === 0) {
				$(mapDiv).append(ele);
			}
		},
		continueGeoQuery: function() {
			$("#allDataMapAlert").empty();
			$("#allDataMapAlert").removeClass("dialogBoxAlert");
			$("div.modal-backdrop").removeClass("modal-backdrop");
			//$("#alldataAlert").addClass("masqued");
			this.displayWaitControl();
			app.utils.continueUpdateLayer(this.map_view);
		},
		resetGeoQuery: function() {
			$("#allDataMapAlert").empty();
			$("#allDataMapAlert").removeClass("dialogBoxAlert");
			$("div.modal-backdrop").removeClass("modal-backdrop");

			// $("#alldataAlert").addClass("masqued");
			$("#waitControl").remove();
		},
		loadTrack: function() {
			var action = $('#allDataLoadTrack').text();
			if (action == "load tracks") {
				var url = "ressources/shp800.geojson";
				this.map_view.updateLayer("tracks", url);
				$('#allDataLoadTrack').text('remove tracks');
			} else {
				this.map_view.removeLayer("tracks");
				$('#allDataLoadTrack').text('load tracks');
			}
		}
	});
	app.views.AlertMapBox = app.views.BaseView.extend({
		template: "alertMapBox",
		initialize: function(options) {
			this.featuresNumber = options.featuresNumber;
			this.cancelLoading = options.cancel;
		},
		afterRender: function() {
			// display features number 
			var self = this;
			if (this.cancelLoading) {
				setTimeout(function() {
					$("#alerMapBoxLoad").addClass("masqued");
					$("#alerMapBoxCancelLoad").removeClass("masqued");
					$("#alerMapBoxNbFeaturesCancel").text(self.featuresNumber);
				}, 200);
			} else {
				setTimeout(function() {
					$("#alerMapBoxNbFeatures").text(self.featuresNumber);
				}, 200);
			}

		}
	});
	/*****************************************************************************
	//$import
	******************************************************************************/
	app.views.Import = app.views.BaseView.extend({
		template: "import",
		initialize: function(options) {
			// remove background image
			$.supersized({
				slides: [{
					image: ''
				}]
			});
		}
	});
	app.views.ImportLoad = app.views.BaseView.extend({
		template: "import-load",
		initialize: function(options) {},
		events: {
			'click #btnFileSelection': 'gpxFileSelection',
			'click #importLoadNext': 'importMap'
		},
		gpxFileSelection: function() {
			var selected_file = document.querySelector('#file');
			//var selected_file = $('#file').get(0).files[0];
			selected_file.onchange = function() {
				try {
					var reader = new FileReader();
					var xml;
					var fileName = this.files[0].name;
					var tab = fileName.split(".");
					var fileType = tab[1];
					fileType = fileType.toUpperCase();
					if (fileType != "GPX") {
						alert("File type is not supported. Please select a 'gpx' file");
					} else {
						var lastUpdate = this.files[0].lastModifiedDate;
						var gpxFileName = localStorage.getItem("gpxFileName");
						var gpxLastModif = localStorage.getItem("gpxLastModif");

						/* if ((gpxFileName != "null") && (gpxFileName == fileName) && (gpxLastModif == lastUpdate )){
	                     alert ("this file correspond to last loaded version !");
	                    }    */
						// else if (gpxLastModif != lastUpdate ){                          
						reader.onload = function(e, fileName) {
							xml = e.target.result;
							app.utils.loadWaypointsFromFile(xml);
						};
						localStorage.setItem("gpxFileName", fileName);
						localStorage.setItem("gpxLastModif", lastUpdate);
					}
					//}
					reader.readAsText(selected_file.files[0]);

				} catch (e) {
					alert("File API is not supported by this version of browser. Please update your browser and check again, or use another browser");
				}
			};
		},
		importMap: function() {
			var attrDisabled = $("#importLoadNext").attr("disabled");
			if (typeof attrDisabled === "undefined") {
				app.router.navigate('#import-map', {
					trigger: true
				});
			}
		}
	});
	app.views.ImportMap = app.views.BaseView.extend({
		template: "import-filter",
		afterRender: function(options) {
			//try{
			app.utils.initGrid(app.collections.selectedWaypoints, app.collections.Waypoints);
			var map_view = app.utils.initMap();
			map_view.addLayer({
				layerName: "tracks"
			});
			map_view.addLayer({
				collection: app.collections.waypointsList,
				layerName: "waypoints",
				zoomToExtent: true
			});

			this.mapView = map_view;
			$("div.modal-body").css({
				"min-height": "650px;"
			});
			/* } catch (e) {
	            app.router.navigate('#', {trigger: true});
	        }*/
		},
		events: {
			"selectedFeatures:change": "featuresChange",
			'click tr': 'selectTableElement',
			'click #importLoadTrack a': 'loadTrack',
			'click #importInitSelection': 'cancelSelection'
		},
		featuresChange: function(e) {
			var selectedFeatures = this.mapView.map.selectedFeatures;
			var ln = selectedFeatures.length;
			if (ln === 0) {
				// app.utils.initGrid (app.collections.waypointsList, app.collections.Waypoints);
				app.collections.selectedWaypoints = app.collections.waypointsList;
			} else {
				//var selectedFeaturesCollection = new app.collections.Waypoints();
				app.collections.selectedWaypoints = new app.collections.Waypoints();
				for (var i = 0; i < ln; i++) {
					var modelId = selectedFeatures[i];
					var selectedModel = app.collections.waypointsList.get(modelId);
					//selectedFeaturesCollection.add(selectedModel);
					app.collections.selectedWaypoints.add(selectedModel);
				}
				// app.utils.initGrid (selectedFeaturesCollection, app.collections.Waypoints);
			}
			app.utils.initGrid(app.collections.selectedWaypoints, app.collections.Waypoints);
			e.preventDefault();
		},
		cancelSelection: function() {
			app.utils.initGrid(app.collections.waypointsList, app.collections.Waypoints);
		},
		selectTableElement: function(e) {
			var eleName = e.target.parentNode.nodeName;
			var eleTr = e.target.parentNode;
			if (eleName == "TR") {
			// if (ele =="TD"){
				var selectedModel = app.models.selectedModel;
				$(eleName).css("background-color","rgba(255, 255, 255,0)");
				$(eleTr).css("background-color","rgb(180, 180, 180)");
				var latitude, longitude;
				for (var k in selectedModel.attributes) {
					var v = selectedModel.attributes[k];
					if (k.toUpperCase() == "LATITUDE") {
						latitude = v;
					}
					if (k.toUpperCase() == "LONGITUDE") {
						longitude = v;
					}
					// content += "<p class='allDataInfosTitles'> "+ k + " <br/><span>" + v + "</span></p>";
				}
				this.zoomMapToSelectedFeature(latitude, longitude);
				/* content +="<p id='featureOnTheMap' longitude='" + longitude +"' latitude='" + latitude +"'><a><img src='images/Map-Location.png'/></a> <i>show it on the map</i></p>";
	            $("#allDataInfosPanelContent").html(content);*/
			}
		},
		zoomMapToSelectedFeature: function(latitude, longitude) {
			var point = {};
			point.longitude = longitude;
			point.latitude = latitude;
			//this.map_view.setCenter(point);
			app.utils.updateLocation(this.mapView, point);
		},
		loadTrack: function() {
			var action = $('#importLoadTrack a').text();
			if (action == "load tracks") {
				//var ajaxCall = { url : "ressources/shp800.geojson", format: "GEOJSON"};
				//this.mapView.addLayer({ajaxCall : ajaxCall , layerName : "tracks"}); 
				var url = "ressources/shp800.geojson";
				this.mapView.updateLayer("tracks", url);
				$('#importLoadTrack a').text('remove tracks');
			} else {
				this.mapView.removeLayer("tracks");
				$('#importLoadTrack a').text('load tracks');
			}
		}
	});
	app.views.importMetaData = app.views.BaseView.extend({
		template: "import-metadata",
		afterRender: function(options) {
			app.utils.getItemsList("#import-activity", "/view/theme/list?import=yes", true);
			app.utils.getUsersList("#import-worker1", "/user/fieldworkers", true);
			app.utils.getUsersList("#import-worker2", "/user/fieldworkers", true);
			var nbWaypointsToImport = app.collections.selectedWaypoints.length;
			$('#importNbWaypoints').text(nbWaypointsToImport);
			this.selectedUser1 = "";
			this.selectedUser2 = "";
			this.selectedActivity = "";
		},
		events: {
			"change #importWorker1": "getSelectedUser1",
			"change #importWorker2": "getSelectedUser2",
			"change #importActivity": "getSelectedActivity",
			'click #importLastStep': "storeWaypoints"
		},
		getSelectedUser1: function() {
			var val = $('#importWorker1').val();
			var selectedValue = $('#import-worker1 option').filter(function() {
				return this.value == val;
			});
			if (selectedValue[0]) {
				this.selectedUser1 = selectedValue[0].value;
			} else {
				this.selectedUser1 = "";
				alert("please select a valid worker name");
				$('#importWorker1').val("");
			}
		},
		getSelectedUser2: function() {
			var val = $('#importWorker2').val();
			var selectedValue = $('#import-worker2 option').filter(function() {
				return this.value == val;
			});
			if (selectedValue[0]) {
				this.selectedUser2 = selectedValue[0].value;
			} else {
				this.selectedUser2 = "";
				alert("please select a valid worker name");
				$('#importWorker2').val("");
			}
		},
		getSelectedActivity: function() {
			var val = $('#importActivity').val();
			var selectedValue = $('#import-activity option').filter(function() {
				return this.value == val;
			});
			if (selectedValue[0]) {
				this.selectedActivity = selectedValue[0].value;
			} else {
				this.selectedActivity = "";
				alert("please select a valid activity");
				$('#importActivity').val("");
			}
		},
		storeWaypoints: function() {
			// add fieldActivity and fielduser to each model
			/*for(var i=0; i<app.collections.selectedWaypoints.length; i++) {
	             wptModel = app.collections.selectedWaypoints.models[i];
	            wptModel.set("fieldActivity",this.selectedActivity);
	            wptModel.set("fieldWorker1",this.selectedUser1);
	            wptModel.set("fieldWorker2",this.selectedUser2);
	        }*/
			var self = this;
			app.collections.selectedWaypoints.each(function(model) {
				model.set("fieldActivity", self.selectedActivity);
				model.set("fieldWorker1", self.selectedUser1);
				model.set("fieldWorker2", self.selectedUser2);
			});
			//clear stored models in waypoint list to update store
			//var tmp = new app.collections.Waypoints();
			//tmp.fetch().then(function() {
			//	tmp.destroy();
			app.collections.selectedWaypoints.save();
			//});
			app.collections.waypointsList = null;
			app.router.navigate('#import-end', {
				trigger: true
			});

		}
	});
	app.views.importEndStep = app.views.BaseView.extend({
		template: "import-endStep",
		afterRender: function(options) {
			app.collections.selectedWaypoints = null;
			//app.collections.waypointsList = null;
			app.collections.waypointsList.save();
		}
	});
	// $objects
	app.views.objects = app.views.BaseView.extend({
		template: "objects",
		afterRender: function(options) {
			// remove background image
			$.supersized({
				slides: [{
					image: ''
				}]
			});
			app.utils.fillObjectsTable();
			this.children = [];
			this.intervalAnimation = 0.3; //0.125; // for indiv animation on the map
			$("#objectImportButton").append('<div id="objectImportButtonContent"><img src="images/import_.png"><h4>Import csv</h4></div>');
			$("#objectAddButton").append('<div id="objectAddButtonContent"><img src="images/import_.png"><h4>Add</h4></div>');
		},
		removeAllChildren: function() {
			_.each(this.children, function(view) {
				view.remove();
			});
			this.children = [];
		},
		events: {
			'click .tab-pane tr': 'selectTableElement',
			'click #objectsInfosPanelClose': 'closeInfosPanel',
			//'click #objectsMap' : 'displayMap',
			'click #objectsReturn': 'maskBox',
			'click #objectMapClose': 'maskBox',
			'click #objectsDetails': 'objectDetails',
			'click a.objTab': 'closeInfosPanel',
			//'click #objectsHistory' : 'displayHistoy'
			/*'click #animationStart': 'startAnimation',
			'click #animationStop': 'stopAnimation',
			'click #animationInit': 'initAnimation',*/
			'click #objectAddButtonContent': 'AddObject',
			'click .editCaracBtn': 'showModalEdit',
			'click .objTab': 'activateSelectedTab',
			'click #objDelete': 'deleteObject'
		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode.nodeName;
			if (ele == "TR") {
				var selectedModel = app.models.selectedModel;
				var gridId = $(e.target).parents(".gridDiv").attr("id");
				var id = selectedModel.attributes["ID"];
				var serverUrl = localStorage.getItem("serverUrl");
				this.idSelectedIndiv = id;
				switch (gridId) {
					case "objectsIndivGrid":
						this.objectUrl = serverUrl + "/TViewIndividual/" + id;
						this.objectType = "individual";
						break;
					case "objectsRadioGrid":
						this.objectUrl = serverUrl + "/TViewTrx_Radio/" + id;
						this.objectType = "radio";
						break;
					case "objectsSatGrid":
						this.objectUrl = serverUrl + "/TViewTrx_Sat/" + id;
						this.objectType = "sat";
						break;
					case "objectsField_sensorGrid":
						this.objectUrl = serverUrl + "/TViewFieldsensor/" + id;
						this.objectType = "fieldsensor";
						break;
					case "objectsField_rfidGrid":
						this.objectUrl = serverUrl + "/TViewRFID/" + id;
						this.objectType = "rfid";
						break;

				}
				app.utils.getObjectDetails(this, this.objectType, this.objectUrl, id);
				var currentview = this;

				setTimeout(function() {
					var url = currentview.objectUrl + "/carac";
					app.utils.displayObjectHistory(currentview, currentview.objectType, url, currentview.idSelectedIndiv);
				}, 400);
				$("#objectsInfosPanel").css({
					"display": "block"
				});
			}
		},
		closeInfosPanel: function() {
			$('#objectsInfosPanel').hide();
		},
		displayMap: function() {
			// add map view
			app.utils.displayObjectPositions(this, this.objectUrl, this.idSelectedIndiv);
		},
		maskBox: function() {
			this.removeAllChildren();
			$("#objectsMapContainer").empty();
			$("#objectsMapContainer").removeClass("dialogBoxAlert");
			$("div.modal-backdrop").removeClass("modal-backdrop");
		},
		displayHistoy: function() {
			var url = this.objectUrl + "/carac";
			app.utils.displayObjectHistory(this, this.objectType, url, this.idSelectedIndiv);
		},
		objectDetails: function() {
			var url = this.objectUrl;
			app.utils.displayObjectDetails(this, this.objectType, url, this.idSelectedIndiv);
		},
		/*startAnimation: function() {
			$("#dateIntervalDisplay").removeClass("masqued");
			var startDate = app.utils.AnimStartDate;
			var endDate = app.utils.AnimEndDate;
			var spanEl = $("#intervalOfTime");
			var interval = parseInt(spanEl.val(), 10) * 86400;
			if (this.animationTimer) {
				this.stopAnimation(true);
			}
			if (!this.currentDate) {
				this.currentDate = startDate;
			}
			var filter = app.utils.AnimFilter;
			var filterStrategy = app.utils.AnimfilterStrategy;
			var self = this;
			var next = function() {
				if (self.currentDate < endDate) {
					filter.lowerBoundary = self.currentDate;
					filter.upperBoundary = self.currentDate + interval; // + interval
					filterStrategy.setFilter(filter);
					self.currentDate = self.currentDate + interval;
					var stDate = new Date(self.currentDate * 1000);
					$("#animationStartDate").text(stDate.defaultView('YYYY/MM/DD')); // convert date format from timestamp to YYYY/MM/DD
					var eDate = new Date((self.currentDate + interval) * 1000);
					$("#animationEndDate").text(eDate.defaultView('YYYY/MM/DD'));

				} else {
					self.stopAnimation(true);
				}
			};
			this.animationTimer = window.setInterval(next, this.intervalAnimation * 1000);
		},
		stopAnimation: function(reset) {
			window.clearInterval(this.animationTimer);
			this.animationTimer = null;
			if (reset === true) {
				this.currentDate = null;
			}
		},
		initAnimation: function() {
			this.currentDate = app.utils.AnimStartDate;
			window.clearInterval(this.animationTimer);
			this.animationTimer = null;
			$("#animationStartDate").text("");
			$("#animationEndDate").text("");
			$("#dateIntervalDisplay").addClass("masqued");
		},*/
		showModalEdit: function(e) {
			// Create the modal view
			var OEview = new app.views.ObjectEditView();
			//add some param for edit
			OEview.idObj = this.idSelectedIndiv;
			OEview.idcarac = e.target.id;
			OEview.name = e.target.previousSibling.data;

			OEview.render().showModal({
				x: event.pageX,
				y: event.pageY
			});
		},
		AddObject: function(e) {
			var url = localStorage.getItem("serverUrl");
			var ObjectType = $(".nav-tabs .active .objTab").text();
			if (app.xhr) {
				app.xhr.abort();
			}
			var currentview = this;
			app.xhr = $.ajax({
				url: url + "/object/add?object_type=" + ObjectType,
				dataType: "json",
				success: function(data) {
					var idObj = data.object_id;
					//for client update (show detail of new object)
					if (ObjectType == "Individual") {
						var getObjectDetailsType = "individual";
						var getObjectUrl = url + "/TViewIndividual/" + idObj;
					} else if (ObjectType == "Trx-radio") {
						var getObjectDetailsType = "radio";
						var getObjectUrl = url + "/TViewTrx_Radio/" + idObj;
					} else if (ObjectType == "Trx_sat") {
						var getObjectDetailsType = "sat";
						var getObjectUrl = url + "/TViewTrx_Sat/" + idObj;
					} else if (ObjectType == "Field_sensor") {
						var getObjectDetailsType = "fieldsensor";
						var getObjectUrl = url + "/TViewFieldsensor/" + idObj;
					}
					 else if (ObjectType == "rfid") {
						var getObjectDetailsType = "rfid";
						var getObjectUrl = url + "/TViewRFID/" + idObj;
					}
					currentview.idSelectedIndiv = idObj;
					currentview.objectUrl = getObjectUrl;
					currentview.objectType = getObjectDetailsType;
					app.utils.getObjectDetails(currentview, getObjectDetailsType, getObjectUrl);
					$("#objectsInfosPanel").css({
						"display": "block"
					});
					setTimeout(function() {
						$("#objectNew").fadeIn("slow");
					}, 600);
					app.utils.fillObjectsTable();
				}
			});
		},
		activateSelectedTab: function(e) {
			var idTab = $(e.target).attr("href");
			$(".tab-pane").removeClass("active");
			$("div" + idTab).addClass("active");
		},
		deleteObject: function(e) {
			var objId = $(e.target).attr("objId");
			if (objId == "undefined")
				objId = this.idSelectedIndiv;
			var delView = new app.views.ObjectDeleteView({
				objId: objId
			});
			delView.render().showModal({
				x: event.pageX,
				y: event.pageY
			});
		}
	});
	//Object Import View (Modal)
	app.views.ObjectEditView = Backbone.ModalView.extend({
		initialize: function() {

		},
		events: {
			'click #SubmitEditCarac': 'SubmitEditCarac',
			'click #CancelEditCarac': 'CancelEditCarac'
		},
		render: function() {
			var idcarac = this.idcarac;
			var name = this.name;
			var idObj = this.idObj;
			var typeobject = $(".nav-tabs .active .objTab").text();
			var url = localStorage.getItem("serverUrl");
			var typecarac = idcarac.substring(0, 1);
			var idcarac = idcarac.substring(1, idcarac.length);
			var tpl = '<div class="modal-dialog"><div class="modal-content"> <div class="modal-header"> <h3 class="modal-title"><img src="images/import_.png" class="modal-title-picto">Edit characteristic</h3></div><div class="modal-body modal-body-perso"><b>' + name + '</b><div class="row-fluid" ><div class="span6"><form id="editformobject" enctype="multipart/form-data" method="post" action="' + url + '/characteristic/edit"> <input name="object_type" type="hidden" value="' + typeobject + '"/> <input name="object_id" type="hidden" value="' + idObj + '"/> <input name="id_carac" type="hidden" value="' + idcarac + '"/>';
			var currentmodal = this;

			//for client update
			if (typeobject == "Individual") {
				var getObjectDetailsType = "individual";
				var getObjectUrl = url + "/TViewIndividual/" + idObj;
			} else if (typeobject == "Trx-radio") {
				var getObjectDetailsType = "radio";
				var getObjectUrl = url + "/TViewTrx_Radio/" + idObj;
			} else if (typeobject == "Trx_sat") {
				var getObjectDetailsType = "sat";
				var getObjectUrl = url + "/TViewTrx_Sat/" + idObj;
			} else if (typeobject == "Field_sensor") {
				var getObjectDetailsType = "fieldsensor";
				var getObjectUrl = url + "/TViewFieldsensor/" + idObj;
			}

			//hide 'new' if its new object (no longer a new object after edit)
			$('#objectNew').fadeOut("slow");

			//ajax form param   
			var options = {
				success: function(response) {
					console.log('success');
					console.log(response);
				},
				complete: function(response) {
					console.log('complete');
					//success edit
					if (response.statusText == "OK") {
						console.log('complete success');
						console.log(response.responseText);

						$('#objectSuccessEdit').fadeIn("slow", function() {
							// Animation complete                           
							$('#objectSuccessEdit').fadeOut(2000,
								function() {
									// Animation complete
									//update detail
									app.utils.getObjectDetails(this, getObjectDetailsType, getObjectUrl);
									//update table
									app.utils.fillObjectsTable();
									currentmodal.hideModal();
								}
							);
						});
						currentmodal.hideModal();
					}
					//error edit
					else {
						console.log('complete error');
						$('#objectErrorEdit').fadeIn("slow", function() {
							// Animation complete
							$('#objectErrorEdit').fadeOut(2000,
								function() {
									// Animation complete
									app.utils.getObjectDetails(this, getObjectDetailsType, getObjectUrl);
								}
							);
						});
					}
					currentmodal.hideModal();
				},
				error: function(e) {
					console.log('error');
					console.log(e);
				},
				xhrFields: {
					withCredentials: true
				},
				dataType: "json"
			};

			//get current day
			var date = new Date();
			var year = 1900 + date.getYear();
			var month = date.getMonth() + 1;
			if (month < 10)
				month = "0" + month;
			var day = date.getDate();
			if (day < 10)
				day = "0" + day;
			date = year + "-" + month + "-" + day;

			//therausus carac
			if (typecarac == "t") {
				tpl += 'Value : <input list="lThesa" type="text" name="value" /><datalist id="lThesa"/>  <input name="carac_type" type="hidden" value="t"/>';

				if (app.xhr) {
					app.xhr.abort();
				}

				//get thesaurus values
				setTimeout(function() {
					app.xhr = $.ajax({
						url: url + "/thesaurus/autocomplete/list?id_type=" + idcarac + "&object_type=" + typeobject,
						dataType: "json",
						success: function(data) {

							for (var t in data) {
								if (t != 'distinct')
									$("#lThesa").append("<option value='" + data[t]['Tthesaurus']['topic_en'] + " ; " + data[t]['Tthesaurus']['ID'] + "'/>");
							}

						}
					});
				}, 500);
			}
			//date carac
			else if (typecarac == "d") {
				tpl += 'Value: <input name="value" value="' + date + '"  type="date"/> <input name="carac_type" type="hidden" value="d"/>';
			}
			//string carac
			else
				tpl += 'Value: <input name="value" type="text"/> <input name="carac_type" type="hidden" value="v"/>'

				tpl += 'Begin date: <input name="begin_date" type="date" value="' + date + '" id="beginDate"/> End date:<input id="endDate" name="end_date" type="date"/> Comment: <input name="comments" type="text">';
			tpl += '<input type="submit" id="SubmitEditCarac" value="Save"><input type="button" id="CancelEditCarac" value="Cancel">';
			tpl += '</form><ul class="unstyled" id="export-views"></ul></div><div class="modal-footer"></div></div></div>';


			//ajax form 
			setTimeout(function() {
				$("#editformobject").ajaxForm(options);
			}, 200);
			_.bindAll(this, "render");
			this.template = _.template(tpl);
			$(this.el).html(this.template());
			// default date for begin date
			var now = new Date();
			var day = ("0" + now.getDate()).slice(-2);
			var month = ("0" + (now.getMonth() + 1)).slice(-2);
			var today = now.getFullYear() + "-" + (month) + "-" + (day);
			$("#beginDate").val(today);

			return this;
		},
		SubmitEditCarac: function() {
			//if uncomment submit will not work
			// this.hideModal();    
		},
		CancelEditCarac: function() {
			this.hideModal();
		}

	});
	app.views.ObjectDeleteView = Backbone.ModalView.extend({
		prefix: app.config.root + '/tpl/',
		template: "exportAlertDelObject",
		initialize: function(options) {
			this.objId = options.objId;
		},
		events: {
			'click #objDelYes': 'deleteObject',
			'click #objDelNo': 'reset'
		},
		deleteObject: function() {
			var serverUrl = localStorage.getItem("serverUrl");
			var url = serverUrl + "/object/delete/" + this.objId;
			app.xhr = $.ajax({
				url: url,
				dataType: "json",
				success: function(data) {
					app.utils.fillObjectsTable();
					alert("object deleted !");
					$('#objectsInfosPanel').hide();
				}
			});
			this.hideModal();
		},
		reset: function() {
			this.hideModal();
		}
	});
	app.views.ObjectMapBox = app.views.BaseView.extend({
		//template: "objectMapBox" ,
		template: "birdMap",  //template: "objectMap",
		initialize: function(options) {
			this.parentView = options.view;
			this.url = options.url;
			this.idSelectedIndiv = options.id;
		},
		afterRender: function() {
			// apply slider look
			$("#dateSlider").slider({});
			var self = this;
			setTimeout(function() {
				var url = self.url + "?format=geojson";
				var point = new NS.UI.Point({
					latitude: 34,
					longitude: 44,
					label: ""
				});
				var mapView = app.utils.initMap(point, 3);
				self.map_view = mapView;
				self.displayWaitControl();
				// layer with clustored data
				var ajaxCall = {
					url: url,
					format: "GEOJSON",
					cluster: true
				};
				mapView.addLayer({
					ajaxCall: ajaxCall,
					layerName: "positions",
					zoom: 3,
					zoomToExtent: true
				});
				
				//self.parentView.children.push(mapView);
				app.utils.timlineLayer(url, mapView, function() {
					app.utils.animatedLayer(url, mapView);
				});
				$("#dateSlider").slider().on('slideStop', function() {
					// get range of date and update layer
					var interval = $("#dateSlider").data('slider').getValue();
					self.updateTimeLineLayer(interval);
				});

			}, 500);
			var windowWidth = $(window).width(); 
	        if (windowWidth > 1599 ){
	            $("#map").css("width", "900px");
	        }
		},
		displayWaitControl: function() {
			var mapDiv = this.map_view.el;
			var width = ((screen.width) / 2 - 200);
			var height = ((screen.height) / 2 - 200);
			var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>";
			var st = $("#waitControl").html();
			if ($("#waitControl").length === 0) {
				$(mapDiv).append(ele);
			}
		},
		updateTimeLineLayer: function(interval) {
			var dateMin = interval[0];
			var datMax = interval[1];
			var filter = app.utils.timelineFilter;
			var filterStrategy = app.utils.timelinefilterStrategy;
			filter.lowerBoundary = dateMin;
			filter.upperBoundary = datMax;
			filterStrategy.setFilter(filter);
		}
	});
	app.views.ObjectHistoryBox = app.views.BaseView.extend({
		// template: "objectHistoryBox" ,
		template: "objectHistory",
		initialize: function(options) {
			this.parentView = options.view;
			this.url = options.url;
			this.idSelectedIndiv = options.id;
			this.objectType = options.objectType;
		},
		afterRender: function() {
			// load history
			var self = this;
			$.ajax({
				url: this.url,
				dataType: "json",
				success: function(data) {
					// check kind of object
					var objectType = self.objectType;
					var characteristic, id,company, shape,model,  comments;
					var objectView;
					if (objectType == "individual") {
						objectView = "TViewIndividual";
						characteristic = data[0][0].TViewIndividual;
						var sex = characteristic.Sex || "";
						var origin = characteristic.Origin || "";
						var species = characteristic.Species || "";
						var birthDate = characteristic.Birth_date || "";
						var deathDate = characteristic.Death_date || "";
						comments = characteristic.Comments || "";
					} else if (objectType == "radio") {
						objectView = "TViewTrxRadio";
						characteristic = data[0][0].TViewTrxRadio;
						id = characteristic.Id || "";
						company = characteristic.Company || "";
						var shape = characteristic.Shape || "";
						var weight = characteristic.Weight || "";
					} else if (objectType == "sat") {
						objectView = "TViewTrxSat";
						characteristic = data[0][0].TViewTrxSat;
						id = characteristic.Id || "";
						company = characteristic.Company || "";
						model = characteristic.Model || "";
						comments = characteristic.Comments || "";
					} else if (objectType == "fieldsensor") {
						objectView = "TViewFieldsensor";
						characteristic = data[0][0].TViewFieldsensor;
						id = characteristic.Id || "";
						company = characteristic.Company || "";
						model = characteristic.Model || "";
						comments = characteristic.Comments || "";
						var fieldsensortype = characteristic.Field_sensor_type || "";
					}
					var historyItems = new app.collections.HistoryItems();

					for (var k in data[0]) {
						var item = data[0][k];
						for (var j in item) {
							if (j != objectView) {
								var elem = item[j];
								var element = elem[0];
								var value = element["value_precision"] || element["value"];
								var begin_date = element["begin_date"] || "";
								var end_date = element["end_date"] || "";
								var historyItem = new app.models.HistoryItem();
								historyItem.set('characteristic', j);
								historyItem.set('value', value);
								historyItem.set('begin_date', begin_date);
								historyItem.set('end_date', end_date);
								historyItems.add(historyItem);
							}
						}
					}
					// sort collection by begin date 
					historyItems.sort();
					// init grid
					app.utils.initGrid(historyItems, app.collections.HistoryItems);
					$("#objModal").css("max-height", "500px");
				}
			});
			var self = this;
			setTimeout(function() {
				$("#ObjId").text(self.idSelectedIndiv);
			}, 500);
		}
	});
	app.views.ObjectDetails = app.views.BaseView.extend({
		template: "objectDetails",
		initialize: function(options) {
			this.parentView = options.view;
			this.url = options.url;
			this.idSelectedIndiv = options.id;
			this.objectType = options.objectType;

		},
		afterRender: function() {
			var self = this;
			setTimeout(function() {
				$("#objectDetailsType").text(self.objectType);
				// add map view for individuals
				if (self.objectType == "individual") {
					app.utils.displayObjectPositions(self.parentView, self.url, self.idSelectedIndiv);
				} else {
					// mask map control tab and activate history
					$("#objBoxDetailsMap").addClass("masqued");
					// $("#objBoxDetailsHistory").addClass("active");
					$("#objBoxDetailsHistory").trigger("click");
				}
				// history
				var url = self.url + "/carac";
				app.utils.displayObjectHistory(self.parentView, self.objectType, url, self.idSelectedIndiv);
			}, 500);
		}
	});
	app.views.Argos = app.views.BaseView.extend({
		template: "argos",
		afterRender: function(options) {
			// remove background image
			$.supersized({
				slides: [{
					image: ''
				}]
			});
			this.loadStats();
		},
		loadStats: function() {
			var serverUrl = localStorage.getItem("serverUrl");
			var url = serverUrl + "/sensor/stat?format=json";
			$.ajax({
				url: url,
				dataType: "json",
				success: function(data) {
					var labels = data["label"].reverse();
					var nbArgos = data["nbArgos"].reverse();
					var nbGps = data["nbGPS"].reverse();
					//var nbPtt = data["nbPTT"].reverse();
					// Sum of values in each table
					/*var sumArgos = 0;var sumGps = 0;var sumPtt = 0;
	                    $.each(nbArgos,function(){sumArgos+=parseFloat(this) || 0;});
	                    $.each(nbGps,function(){sumGps+=parseFloat(this) || 0;});
	                    $.each(nbPtt,function(){sumPtt+=parseFloat(this) || 0;}); */
					// convert values in Arrays to int
					nbArgos = app.utils.convertToInt(nbArgos);
					nbGps = app.utils.convertToInt(nbGps);
					//nbPtt = app.utils.convertToInt(nbPtt);
					var graphData = {
						labels: labels,
						datasets: [{
							fillColor: "rgba(220,220,220,0.5)",
							strokeColor: "rgba(220,220,220,1)",
							data: nbArgos
						}, {
							fillColor: "rgba(33, 122, 21,0.5)",
							strokeColor: "rgba(33, 122, 21,1)",
							data: nbGps
						}]
					};
					var maxValueArgos = app.utils.MaxArray(nbArgos);
					var maxValueGps = app.utils.MaxArray(nbGps);
					var maxValueInGraph = (maxValueArgos > maxValueGps) ? maxValueArgos : maxValueGps;
					maxValueInGraph = app.utils.GraphJsMaxY(maxValueInGraph);
					var steps = 5;
					/*new Chart(ctx).Bar(plotData, {
	                        scaleOverride: true,
	                        scaleSteps: steps,
	                        scaleStepWidth: Math.ceil(max / steps),
	                        scaleStartValue: 0
	                    });*/
					var argosChart = new Chart(document.getElementById("argosGraph").getContext("2d")).Bar(graphData, {
						scaleOverride: true,
						scaleSteps: steps,
						scaleStepWidth: Math.ceil(maxValueInGraph / steps),
						scaleStartValue: 0
					});
					/*$("#argosValues").text(sumArgos + sumGps );
	                    $("#argosPtt").text(sumPtt);*/
					// get last date
					var lastDate = labels[labels.length - 1];
					var lastArgosValue = nbArgos[nbArgos.length - 1];
					var lastGpsValue = nbGps[nbGps.length - 1];
					//var lastPttValue = nbPtt[nbPtt.length - 1];
					// data for last day
					$("#argosDate").text(lastDate);
					$("#argosValues").text(parseFloat(lastArgosValue) + parseFloat(lastGpsValue));
					//$("#argosPtt").text(lastPttValue);
				},
				error: function(data) {
					// $("#homeGraphLegend").html("error in loading data ");
					alert("error loading data. please check webservice.");
				}
			});
		}
	});
	/***************************************************************************
$bird 				birds
****************************************************************************/
	app.views.Birds = app.views.BaseView.extend({
		template: "birdFilter",
		afterRender: function() {
			var windowWidth = $(window).width();
			var windowHeigth = $(window).height();
			$.supersized({
				slides: [{
					image: ''
				}]
			});
			// load data
			var serverUrl = localStorage.getItem("serverUrl");
			var indivUrl = serverUrl + '/TViewIndividual/list?sortColumn=ID&sortOrder=desc';
			this.indivUrl = indivUrl;
			// load data for indiv grid
			app.utils.getDataForGrid(indivUrl, function(collection, rowsNumber) {
				app.utils.initGridServer(collection, rowsNumber, indivUrl, {
					pageSize: 50,
					//columns: [0,1,2, 3, 4, 9],
					container: "#objectsIndivGrid"
				});
				$("#objectsIndivGrid").css({"height":(windowHeigth - 200), "max-width" : windowWidth / 2 });
				$("#objectsIndivGrid").mCustomScrollbar({
					theme:"dark",
					 horizontalScroll:true
				});
			});

			// autocomplete for fields list
			var fieldUrl = serverUrl + '/list/autocomplete?table_name=TViewIndividual'+ '&column_name=' ;
			// field sex
			var fieldSexUrl = fieldUrl + 'id30%40TCaracThes_Sex_Precision'; 
			app.utils.getdataListForBirdFilter ("#birdSexList", fieldSexUrl);
			// field survey type
			var fieldSurveyUrl = fieldUrl + 'id61@TCaracThes_Survey_type_Precision';
			app.utils.getdataListForBirdFilter ("#birdSurveyList", fieldSurveyUrl);
			// field ptt
			var fieldPttUrl = fieldUrl + 'id19@TCarac_PTT';
			app.utils.getdataListForBirdFilter ("#birdPttList", fieldPttUrl);
			// frequency
			var fieldFrequencyUrl = fieldUrl + 'id5@TCarac_Transmitter_Frequency';
			app.utils.getdataListForBirdFilter ("#birdFrequencyList", fieldFrequencyUrl);
			// monitoring
			var fieldMonitoryUrl = fieldUrl + 'id60@TCaracThes_Monitoring_Status_Precision';
			app.utils.getdataListForBirdFilter ("#birdMonitoryList", fieldMonitoryUrl);
			// chip code
			var fieldChipCodeUrl = fieldUrl + 'id13@TCarac_Chip_Code';
			app.utils.getdataListForBirdFilter ("#birdChipCodeList", fieldChipCodeUrl);
			// release ring color
			var fieldReleaseRingColorUrl = fieldUrl + 'id8@TCaracThes_Release_Ring_Color_Precision';
			app.utils.getdataListForBirdFilter ("#birdReleaseRingColorList", fieldReleaseRingColorUrl);
			//color
			var fieldColorUrl = fieldUrl + 'id14@TCaracThes_Mark_Color_1_Precision' ;
			app.utils.getdataListForBirdFilter ("#birdMarkColorList", fieldColorUrl);
			// age
			var fieldAgeUrl = fieldUrl + 'id2@Thes_Age_Precision' ;
			app.utils.getdataListForBirdFilter ("#birdAgeList", fieldAgeUrl);
			// origin
			var fieldOriginUrl = fieldUrl + 'id33@Thes_Origin_Precision' ;
			app.utils.getdataListForBirdFilter ("#birdOriginList", fieldOriginUrl);
			// release ring
			var fieldReleaseRingUrl = fieldUrl + 'id9@TCarac_Release_Ring_Code' ;
			app.utils.getdataListForBirdFilter ("#birdReleaseRingList", fieldReleaseRingUrl);
			// breeding ring
			var fieldBreedingRingUrl = fieldUrl + 'id12@TCarac_Breeding_Ring_Code' ;
			app.utils.getdataListForBirdFilter ("#birdBreedingRingList", fieldBreedingRingUrl);
			


		},
		events :{
			'click #indivFilterSubmit' : 'getBirdsList',
			'click tr': 'selectTableElement',
			'click #indivFilterClear' : 'clearFields',




		},
		getBirdsList : function() {
			var windowWidth = $(window).width();
			var windowHeigth = $(window).height();
			var params = [] ;
			var id = $('input[name="ID"]').val().trim();
			var frequency = $('input[name="frequency"]').val().trim();
			var ptt = $('input[name="PTT"]').val().trim();
			var sex = $('input[name="sex"]').val().trim();
			var release = $('input[name="release"]').val().trim();
			var breeding = $('input[name="breeding"]').val().trim();
			var age = $('input[name="age"]').val().trim();
			var origin = $('input[name="origin"]').val().trim();
			var color = $('input[name="color"]').val().trim();
			

			if(id){
				params.push("filters[]=ID:exact:" + id);  
			}
			if (frequency){
				params.push("filters[]=frequency:" + frequency);
			}
			if(ptt){
				params.push("filters[]=PTT:" + ptt);
			}
			if(sex){
				params.push("filters[]=sex:" + sex);
			}
			if(release){
				params.push("filters[]=release ring:" + release);
			}
			if(breeding){
				params.push("filters[]=breeding ring:" + breeding);
			}
			if(age){
				params.push("filters[]=age:" + age);
			}
			if(origin){
				params.push("filters[]=origin:" + origin);
			}
			if(color){
				params.push("filters[]=mark_color:" + color);
			}
			var filterParams = params.join("&"); 
			// update data indiv grid
			var url = this.indivUrl + "&" + filterParams;
			app.utils.getDataForGrid(url, function(collection, rowsNumber) {
				app.utils.initGridServer(collection, rowsNumber, url, {
					pageSize: 50,
					//columns: [2, 6, 7, 8],
					container: "#objectsIndivGrid"
				});
				$("#objectsIndivGrid").css({"height":(windowHeigth - 200), "max-width" : windowWidth / 2 });
				$("#objectsIndivGrid").mCustomScrollbar({
					theme:"dark",
					 horizontalScroll:true
			});
			});
			
		},
		selectTableElement: function(e) {
			var ele = e.target.parentNode.nodeName;
			if (ele == "TR") {
				var selectedModel = app.models.selectedModel;
				
				var id = selectedModel.attributes["ID"];
				var route = '#bird/' + id;
				app.router.navigate(route, {trigger: true});
				
				/*
				this.objectUrl = serverUrl + "/TViewIndividual/" + id;
				this.objectType = "individual";
						
				app.utils.getObjectDetails(this, this.objectType, this.objectUrl, id);
			
				var url = currentview.objectUrl + "/carac";
				app.utils.displayObjectHistory(currentview, currentview.objectType, url, currentview.idSelectedIndiv);
				*/
			}
		},
		clearFields : function() {
			$("input").val("");
		}

	});
	app.views.Bird = app.views.BaseView.extend({
		template: "birdDetails",
		initialize : function(options) {
			this.birdId = options.id;
			this.intervalAnimation = 0.3; 
		},
		afterRender: function() {
			var windowHeigth = $(window).height();
			$("#birdDetails").css({"height": windowHeigth -50 });
			$("#birdId").text(this.birdId);
			var serverUrl = localStorage.getItem("serverUrl");
			var objectUrl = serverUrl + "/TViewIndividual/" + this.birdId;
			app.utils.displayObjectPositions(this, objectUrl, this.birdId);
			var url = objectUrl + "/carac";
			$.ajax({
				url: url,
				dataType: "json",
				success: function(data) {
					var characteristic = data[0][0].TViewIndividual;
					var sex = characteristic.Sex || "";
					var origin = characteristic.Origin || "";
					var species = characteristic.Species || "";
					var birthDate = characteristic.Birth_date || "";
					var deathDate = characteristic.Death_date || "";
					var comments = characteristic.Comments || "";
					$("#birdSpecies").text(species);
					$("#birdBirthDate").text(birthDate);
					$("#birdSexLabel").text(sex);
					$("#birdOriginLabel").text(origin);
					if(sex ==="male"){
						$("#birdSexPic").attr("src","images/sexe_m.png");
					} else {
						$("#birdSexPic").attr("src","images/sexe_f.png");
					}
					if (origin ==="wild"){
						$("#birdOriginPic").attr("src","images/origin_wild.png");
					} else {
						$("#birdOriginPic").attr("src","images/origin_release.png");
					}
					var age;

					var historyItems = new app.collections.HistoryItems();
					for (var k in data[0]) {
						var item = data[0][k];
						for (var j in item) {
							if (j != 'TViewIndividual') {
								var elem = item[j];
								var element = elem[0];
								var value = element["value_precision"] || element["value"];
								var begin_date = element["begin_date"] || "";
								var end_date = element["end_date"] || "";
								var historyItem = new app.models.HistoryItem();
								historyItem.set('characteristic', j);
								historyItem.set('value', value);
								historyItem.set('begin_date', begin_date);
								historyItem.set('end_date', end_date);
								historyItems.add(historyItem);
								if (j ==="Age"){ 
									 age = element["value_precision"];
								}
								if (j==="PTT"){
									var ptt= element["value"];
									$('#transmittersVal').html("<b>ptt: </b>" + ptt)	;
								}
							}
							$("#birdAgeLabel").text(age);
							$("#birdAgePic").attr("src","images/age_adult.png");
							var selectedModel = app.models.selectedModel;
							if (selectedModel){
								var atr = selectedModel.attributes;
								var lastObs = atr["last observation"];
								var surveyType = atr["survey type"];
								var transmitter = atr["transmitter"];
								var monitoringStatus = atr["monitoring status"];
								$("#birdLastObs").text(lastObs);
								$("#birdSurveyType").text(surveyType);
								if (monitoringStatus==="Lost"){
									$("#birdMonitStatus").html("<img src='images/status_lost.png'/><span>" + monitoringStatus +"</span>");
									
								}
								





							}
						}
					}
					// sort collection by begin date 
					historyItems.sort();
					// init grid
					app.utils.initGrid(historyItems, app.collections.HistoryItems, null, {pageSize: 50});
					$("#grid").css({"height":windowHeigth /2});

					$("#grid").mCustomScrollbar({
						theme:"dark"
					});
				}
			});
			
		},
		events : {
			'click #animationStart': 'startAnimation',
			'click #animationStop': 'stopAnimation',
			'click #animationInit': 'initAnimation'
		},
		startAnimation: function() {
			$("#dateIntervalDisplay").removeClass("masqued");
			var startDate = app.utils.AnimStartDate;
			var endDate = app.utils.AnimEndDate;
			/*var spanEl = $("#intervalOfTime");
			var interval = parseInt(spanEl.val(), 10) * 86400;*/
			var interval = 15 * 86400;
			if (this.animationTimer) {
				this.stopAnimation(true);
			}
			if (!this.currentDate) {
				this.currentDate = startDate;
			}
			var filter = app.utils.AnimFilter;
			var filterStrategy = app.utils.AnimfilterStrategy;
			var self = this;
			var next = function() {
				if (self.currentDate < endDate) {
					filter.lowerBoundary = self.currentDate;
					filter.upperBoundary = self.currentDate + interval; // + interval
					filterStrategy.setFilter(filter);
					self.currentDate = self.currentDate + interval;
					var stDate = new Date(self.currentDate * 1000);
					/*$("#animationStartDate").text(stDate.defaultView('YYYY/MM/DD')); // convert date format from timestamp to YYYY/MM/DD
					var eDate = new Date((self.currentDate + interval) * 1000);
					$("#animationEndDate").text(eDate.defaultView('YYYY/MM/DD'));*/

				} else {
					self.stopAnimation(true);
				}
			};
			this.animationTimer = window.setInterval(next, this.intervalAnimation * 1000);
		},
		stopAnimation: function(reset) {
			window.clearInterval(this.animationTimer);
			this.animationTimer = null;
			if (reset === true) {
				this.currentDate = null;
			}
		},
		initAnimation: function() {
			this.currentDate = app.utils.AnimStartDate;
			window.clearInterval(this.animationTimer);
			this.animationTimer = null;
			/*$("#animationStartDate").text("");
			$("#animationEndDate").text("");
			$("#dateIntervalDisplay").addClass("masqued");  */
		}
	});


	return app;
})(ecoReleveData);