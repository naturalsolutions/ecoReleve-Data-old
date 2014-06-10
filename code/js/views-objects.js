var ecoReleveData = (function(app) {
"use strict";
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
				//var serverUrl = localStorage.getItem("serverUrl");
				var serverUrl = app.config.serverUrl;
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
					case "objectsField_cameraGrid":
						this.objectUrl = serverUrl + "/TViewCameraTrap/" + id;
						this.objectType = "camera";
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
					var getObjectUrl, getObjectDetailsType;
					if (ObjectType == "Individual") {
						getObjectDetailsType = "individual";
						getObjectUrl = url + "/TViewIndividual/" + idObj;
					} else if (ObjectType == "Trx-radio") {
						getObjectDetailsType = "radio";
						getObjectUrl = url + "/TViewTrx_Radio/" + idObj;
					} else if (ObjectType == "Trx_sat") {
						getObjectDetailsType = "sat";
						getObjectUrl = url + "/TViewTrx_Sat/" + idObj;
					} else if (ObjectType == "Field_sensor") {
						getObjectDetailsType = "fieldsensor";
						getObjectUrl = url + "/TViewFieldsensor/" + idObj;
					}
					 else if (ObjectType == "rfid") {
						getObjectDetailsType = "rfid";
						getObjectUrl = url + "/TViewRFID/" + idObj;
					} else if (ObjectType == "camera") {
						getObjectDetailsType = "camera";
						getObjectUrl = url + "/TViewCameraTrap/" + idObj;
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
			idcarac = idcarac.substring(1, idcarac.length);
			var tpl = '<div class="modal-dialog"><div class="modal-content"> <div class="modal-header"> <h3 class="modal-title"><img src="images/import_.png" class="modal-title-picto">Edit characteristic</h3></div><div class="modal-body modal-body-perso"><b>' + name + '</b><div class="row-fluid" ><div class="span6"><form id="editformobject" enctype="multipart/form-data" method="post" action="' + url + '/characteristic/edit"> <input name="object_type" type="hidden" value="' + typeobject + '"/> <input name="object_id" type="hidden" value="' + idObj + '"/> <input name="id_carac" type="hidden" value="' + idcarac + '"/>';
			var currentmodal = this;

			//for client update
			var getObjectUrl, getObjectDetailsType;
			if (typeobject == "Individual") {
				getObjectDetailsType = "individual";
				getObjectUrl = url + "/TViewIndividual/" + idObj;
			} else if (typeobject == "Trx-radio") {
				getObjectDetailsType = "radio";
				getObjectUrl = url + "/TViewTrx_Radio/" + idObj;
			} else if (typeobject == "Trx_sat") {
				getObjectDetailsType = "sat";
				getObjectUrl = url + "/TViewTrx_Sat/" + idObj;
			} else if (typeobject == "Field_sensor") {
				getObjectDetailsType = "fieldsensor";
				getObjectUrl = url + "/TViewFieldsensor/" + idObj;
			} else if (typeobject == "rfid") {
				getObjectDetailsType = "rfid";
				getObjectUrl = url + "/TViewRFID/" + idObj; 
			} else if (typeobject == "camera") {
				getObjectDetailsType = "camera";
				getObjectUrl = url + "/TViewCameraTrap/" + idObj; 
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
				tpl += 'Value: <input name="value" type="text"/> <input name="carac_type" type="hidden" value="v"/>';

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
			//var serverUrl = localStorage.getItem("serverUrl");
			var serverUrl = app.config.serverUrl;
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
					var characteristic, id,company, shape,model,fieldsensortype, comments;
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
						shape = characteristic.Shape || "";
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
						fieldsensortype = characteristic.Field_sensor_type || "";
					} else if (objectType == "rfid") {
						objectView = "TViewRFID";
						characteristic = data[0][0].TViewRFID;
						id = characteristic.Id || "";
						company = characteristic.Company || "";
						model = characteristic.Model || "";
						comments = characteristic.Comments || "";
						fieldsensortype = characteristic.Field_sensor_type || "";
					} else if (objectType == "camera") {
						objectView = "TViewCameraTrap";
						characteristic = data[0][0].TViewCamera_trap;
						id = characteristic.Id || "";
						company = characteristic.Company || "";
						model = characteristic.Model || "";
						comments = characteristic.Comments || "";
						fieldsensortype = characteristic.Field_sensor_type || "";
					}
					var historyItems = new app.collections.HistoryItems();

					for (var k in data[0]) {
						var item = data[0][k];
						for (var j in item) {
							if (j != objectView) {
								var elem = item[j];
								var element = elem[0];
								if (element){
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
					}
					// sort collection by begin date 
					historyItems.sort();
					// init grid
					app.utils.initGrid(historyItems, app.collections.HistoryItems);
					$("#objModal").css("max-height", "500px");
				},
				error: function(){

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
	



	return app;
})(ecoReleveData);