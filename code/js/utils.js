var ecoReleveData = (function(app) {
	"use strict";
	/*********************************************  Protocols  ************************************************/
	app.utils.loadProtocols = function(url) {
		$.ajax({
			type: "GET",
			url: url,
			dataType: "xml",
			success: function(xml) {
				app.utils.generateProtocolFromXml(xml);
			},
			error: function(xml) {
				alert("error in loading xml file !");
			}
		});
	};
	app.utils.generateProtocolFromXml = function(xml) {
		$(xml).find('protocol').each(
			function() {
				// créer le modèle protocol
				app.models.protocol = new app.models.Protocol();
				var id = $(this).attr('id');
				var protName = $(this).find('display_label:first').text();

				app.models.protocol.set("id", id);
				app.models.protocol.set("name", protName);
				// key words
				var keywords = [];
				$(this).find('keyword').each(
					function() {
						var keyword = $(this).text();
						keyword = app.utils.trim(keyword);
						keywords.push(keyword);
					});
				app.models.protocol.set("keywords", keywords);
				//créer le schema du modele à partir des champs
				var schema = {};
				var nbFields = 0;
				$(this).find('fields').children().each(function() {
					var myFieldSet = $(this);
					var fieldsetName = $(this).attr("name");

					$(this).children().each(function() {
						var node = $(this);
						var fieldtype = $(this).get(0).nodeName;
						switch (fieldtype) {
							case ("field_list"):
								generateListField(node, function(field) {
									var name = field.get("name");
									// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type liste) et le rajouter au schema du protocole
									schema[name] = {};
									schema[name].type = "Select";
									schema[name].title = field.get("display_label");
									schema[name].options = field.get("items");
									schema[name].value = field.get("defaultValue");
									schema[name].fieldset = fieldsetName;
									schema[name].required = true;
									nbFields += 1;
								});
								break;
							case ("field_numeric"):
								generateNumericField(node, function(field) {
									var name = field.get("name");
									// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type numerique) et le rajouter au schema du protocole
									schema[name] = {};
									schema[name].type = "Number";
									schema[name].title = field.get("display_label");
									schema[name].initialData = field.get("defaultValue");
									schema[name].fieldset = fieldsetName;
									var minBound = field.get("min_bound");
									var maxBound = field.get("max_bound");
									// validator for min value & max value
									var validatorslist = [];

									if (minBound !== "") {
										var min = {};
										min.type = "minval";
										min.minval = parseInt(minBound);
										validatorslist.push(min);
									}

									if (maxBound !== "") {
										var max = {};
										max.type = "maxval";
										max.maxval = parseInt(maxBound);
										validatorslist.push(max);
									}
									schema[name].validators = validatorslist;
									nbFields += 1;
								});
								break;
							case ("field_text"):
								// appeler la méthode qui va générer un modele de type texte et utiliser son callback pour rajouter 1 champ de meme type au modele "protocole"
								generateTextField(node, function(field) {
									var name = field.get("name");
									// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type texte) et le rajouter au schema du protocole
									schema[name] = {};
									schema[name].type = "Text";
									schema[name].title = field.get("display_label");
									schema[name].value = field.get("defaultValue");
									schema[name].fieldset = fieldsetName;
									// validation
									if (field.get("required") == "true") {
										schema[name].validators = ['required'];
									}
									nbFields += 1;
									//schema[label].model = field ;
								});
								break;
							case ("field_boolean"):
								generateBooleanField(node, function(field) {
									var name = field.get("name");
									// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type texte) et le rajouter au schema du protocole
									schema[name] = {};
									schema[name].type = "Text";
									schema[name].title = field.get("display_label");
									schema[name].fieldset = fieldsetName;
									nbFields += 1;
									// validation
									/*if (field.get("required") =="true" ){
											schema[name].validators = "['required']";
										}*/
									//schema[name].model = field ;
								});
								break;

							case ("field_photo"):
								generatePhotoField(node, function(field) {
									var name = field.get("name");
									// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type texte) et le rajouter au schema du protocole
									schema[name] = {};
									schema[name].type = "Photo";
									schema[name].name = name;
									schema[name].title = field.get("display_label");
									schema[name].template = "photo";
									schema[name].fieldset = fieldsetName;
									// add hidden field to store file url
									schema["photo_url"] = {};
									schema["photo_url"].title = "photo file path";
									schema["photo_url"].type = "Hidden";
									schema["photo_url"].validators = ['required'];
									nbFields += 1;

								});
								break;
						}
					});
				});


				app.models.protocol.schema = schema;
				// for localstorage => toJson
				app.models.protocol.attributes.schema = schema;
				// update protocol if exists
				if (nbFields > 0) {
					var prot = app.collections.protocolsList.get(id);
					if (prot === undefined) {
						app.collections.protocolsList.add(app.models.protocol);
						app.models.protocol.save();
					} else {
						prot.destroy();
						app.collections.protocolsList.add(app.models.protocol);
						app.models.protocol.save();
					}
					//alert ("protocol '" + protName + "' successfully updated.");

				} else {
					alert("Protocol '" + protName + "' non updated ! check fields list and type.");
				}

			});
		localStorage.setItem("xmlProtocolsIsloaded", "true");
	};
	app.utils.getProtocolsFromServer = function(url) {
		// call WS protocols
		$.ajax({
			type: "GET",
			url: url,
			dataType: "xml",
			success: function(xml) {
				var procolsList = [];
				var listColumns = [];
				$(xml).find('protocole').each(function() {
					var protocol = {};
					protocol.val = $(this).attr('id');
					protocol.label = $(this).text();
					// delete spaces in the begin and the end of string
					protocol.protName = app.utils.trim(protocol.label);
					procolsList.push(protocol);
					listColumns.push(protocol.label);
				});


				$('body').css({
					'background-image': ''
				});
				app.views.configdataLayout = new Backbone.Layout({
					template: "#config-data-layout"
				});
				$("#content").empty().append(app.views.configdataLayout.el);
				var tplview = _.template($('#config-protos-template').html());
				app.views.configdataLayout.setView(".container", new app.Views.ConfigProtocols({
					template: tplview
				}));
				app.views.configdataLayout.render();



				var formModel = new app.models.ProtoModel();
				var schema = {
					Protocols: {
						type: 'CheckBox',
						title: 'Protocols',
						options: procolsList /*, inline : 'true'*/
					} //,validators: ['required']
				};
				formModel.schema = schema;
				formModel.constructor.schema = formModel.schema;
				formModel.constructor.verboseName = "protocols";
				//var myView = new app.Views.LocationFormView({initialData:formModel});


				//var myView = new app.Views.ProtocolsUpdateFormView({initialData:app.models.location, protocols : app.global.usersTab});
				var myView = new app.Views.ProtocolsUpdateFormView({
					initialData: formModel
				});

				app.views.configdataLayout.setView("#configProtocolsForm", myView);

				//app.views.configdataLayout.render();


				app.views.configdataLayout.render();
				$("div.form-actions").hide();
				$("#configChooseProtocols").on("click", $.proxy(myView.onSubmit, myView));
				$('.navbar-inner').css({
					'background-image': '#2E8BCC'
				});
				$('.navbar-inner').css({
					'background': '#2E8BCC'
				});
				$("#configInfos").text("");
			},
			error: function(xhr, ajaxOptions, thrownError) {
				alert("Server is not accessible !");
				$("#configInfos").text("");
				app.router.navigate('#config', {
					trigger: true
				});
			}
		});
	};
	app.utils.loadWaypoints = function(url) {
		$.ajax({
			type: "GET",
			url: url,
			dataType: "xml",
			success: function(xml) {
				//xmlNode = $(xml);	
				// creer la collection de Waypoints
				app.collections.waypointsList = new app.collections.Waypoints();
				// id waypoint
				var id = 0;
				$(xml).find('wpt').each(
					function() {
						// créer le modèle protocol
						app.models.waypoint = new app.Models.Waypoint();
						var latitude = $(this).attr('lat');
						var longitude = $(this).attr('lon');
						var waypointName = $(this).find('name').text();
						var waypointTime = $(this).find('time').text();

						// renseigner les métadonnées du modèle
						id += 1;
						var idwpt = "wpt" + id;
						app.models.waypoint.set("id", idwpt);
						app.models.waypoint.set("name", waypointName);
						app.models.waypoint.set("latitude", latitude);
						app.models.waypoint.set("longitude", longitude);
						app.models.waypoint.set("waypointTime", waypointTime);
						app.models.waypoint.set("used", false);

						//create schema model from fields 
						var schema = {};
						app.collections.waypointsList.add(app.models.waypoint);
						// save the collection of protocols in the localstorage
						app.models.waypoint.save();
					});
				//localStorage.setItem("xmlWaypointsIsloaded", "true");
				//xml = null;
			},
			error: function(xml) {
				alert("error in loading file !");
			}
		});
	};
	app.utils.loadWaypointsFromFile = function(xml) {
		// test if collection of waypoints exists and clean it
		try {
			/*var exists = localStorage.getItem("xmlWaypointsIsloaded");
		if ( exists != "true"){*/
			app.collections.waypointsList = new app.collections.Waypoints();
			app.collections.tableSelectedWaypoints = new app.collections.Waypoints();
			/*}
		var len = app.collections.waypointsList.length;
		if (len > 0 ) {
			app.utils.clearCollection(app.collections.waypointsList); 
		}*/
			// id waypoint
			var id = 0;
			$("#spanGeneratingGpx").removeClass("masqued");
			$(xml).find('wpt').each(
				function() {
					// créer le modèle protocol
					app.models.waypoint = new app.models.Waypoint();
					var latitude = $(this).attr('lat');
					var longitude = $(this).attr('lon');
					// convert lat & long to number and round to 5 decimals
					latitude = parseFloat(latitude).toFixed(5);
					longitude = parseFloat(longitude).toFixed(5);
					var waypointName = $(this).find('name').text();
					var waypointTime = moment($(this).find('time').text());
					
					// renseigner les métadonnées du modèle
					id += 1;
					var idwpt = "wpt" + id;
					app.models.waypoint.set("id", idwpt);
					app.models.waypoint.set("name", waypointName);
					app.models.waypoint.set("latitude", latitude);
					app.models.waypoint.set("longitude", longitude);
					app.models.waypoint.set("waypointTime", waypointTime);
					app.models.waypoint.set("fieldActivity", '');
					//app.models.waypoint.set("used", false);
					app.collections.waypointsList.add(app.models.waypoint);
					// save the collection of protocols in the localstorage
					//app.models.waypoint.save();	

				});
			// selected waypoints 
			/*var tmp = new app.collections.Waypoints();
			tmp.fetch().then(function() {
				tmp.destroy();
				//app.collections.selectedWaypoints.save();
			});*/
			app.collections.selectedWaypoints = app.collections.waypointsList;

			if (id !== 0) {
				//localStorage.setItem("xmlWaypointsIsloaded","true");
				// update tile displayed date
				var d = new Date();
				var newDate = d.defaultView();
				localStorage.setItem("gpxLastImportDate", newDate);
				var fileName = localStorage.getItem("gpxFileName");
				$("#spanGeneratingGpx").html("<i>Gpx file '" + fileName + "' is successfully loaded! You have <span id='exportWptNumber'>" + id + "</span> waypoints &nbsp;&nbsp;</i>");
				$("#importLoadNext").removeAttr("disabled");
			} else {
				$("#spanGeneratingGpx").html("");
				alert("Please check gpx file structure. There is not stored waypoints !");

			}
		} catch (e) {
			localStorage.setItem("xmlWaypointsIsloaded", "false");
			alert("error loading gpx file");
		}
	};

	function changeDateFormat(dateObs, format) {
		var dateSplit, date, formatDate, YYYY, MM, DD;
		if (typeof(format) === "undefined") {
			dateSplit = dateObs.split(" ");
			date = dateSplit[0];
			formatDate = date.split("-");
			YYYY = formatDate[0];
			MM = formatDate[1];
			DD = formatDate[2];
			MM -= 1;
		} else {
			dateSplit = dateObs.split("T");
			date = dateSplit[0];
			formatDate = date.split("-");
			YYYY = formatDate[0];
			MM = formatDate[1];
			DD = formatDate[2];
			MM -= 1;
		}
		var dateEN = new Date(2013, 1 - 1, 26);
		dateEN.setHours(0, 0, 0, 0);
		dateEN.setDate(DD);
		dateEN.setMonth(MM);
		dateEN.setFullYear(YYYY);
		return dateEN;
	}

	function generateListField(node, callback) {

		var fieldId = $(node).attr("id");
		var name = $(node).find('label').text();
		var label = $(node).find('display_label').text();
		var itemlist = $(node).find('itemlist').text();
		//var defaultValueId = $(node).find('default_value').attr("id");
		var defaultValueId = $(node).find('default_value').attr('id');


		var defaultvalueposition;

		var listVal = itemlist.split('|');
		var options = [];

		for (var i = 0; i < listVal.length; i++) {
			var valItem = listVal[i];
			var valListe = valItem.split(';');
			options.push(valListe[2]);
			if (defaultValueId == valListe[0]) {
				defaultvalueposition = i;
			}
		}
		// placer la valeur par défaut en premier de la liste
		var defval = options[defaultvalueposition];
		var firstval = options[0];

		options[0] = (defval === null) ? "" : defval;
		options[defaultvalueposition] = firstval;
		// creer 1 modele champ de type liste
		var listField = new app.models.ListField({
			id: fieldId,
			name: name,
			display_label: label,
			items: options
		});
		callback(listField);
		// mettre la valeur par défaut en première position de la table
	}

	function generateTextField(node, callback) {

		var fieldId = $(node).attr("id");
		var name = $(node).find('label').text();
		var label = $(node).find('display_label').text();
		var defaultValue = $(node).find('default_value').text();
		var required = $(node).find('required').text();
		var multiline = $(node).find('multiline').text();
		// creer le modele champ de type texte

		var textField = new app.models.TextField({
			id: fieldId,
			name: name,
			display_label: label,
			multiline: multiline,
			defaultValue: defaultValue,
			required: required
		});

		callback(textField);
	}

	function generateNumericField(node, callback) {
		var fieldId = $(node).attr("id");
		var name = $(node).find('label:first').text();
		var label = $(node).find('display_label').text();
		var defaultVal = $(node).find('default_value').text();
		var unit = $(node).find('unit').text();
		var minBound = $(node).find('min_bound').text();
		var maxBound = $(node).find('max_bound').text();
		var precision = $(node).find('precision').text();
		// creer le modele champ numerique
		var numField = new app.models.NumericField({
			id: fieldId,
			name: name,
			display_label: label,
			unit: unit,
			max_bound: maxBound,
			min_bound: minBound,
			precision: precision,
			defaultValue: defaultVal
		});
		callback(numField);
	}

	function generateBooleanField(node, callback) {
		var fieldId = $(node).attr("id");
		var name = $(node).find('label').text();
		var label = $(node).find('display_label').text();
		var defaultVal = $(node).find('default_value').text();
		var required = $(node).find('required').text();
		// creer le modele champ boolean
		var boolField = new app.models.BooleanField({
			id: fieldId,
			name: name,
			display_label: label,
			defaultValue: defaultVal,
			required: required
		});
		callback(boolField);
	}

	function generatePhotoField(node, callback) {
		var fieldId = $(node).attr("id");
		var name = $(node).find('label').text();
		var label = $(node).find('display_label').text();

		var photoField = new app.models.PhotoField({
			id: fieldId,
			name: name,
			display_label: label
		});
		callback(photoField);
	}
	/************************************************** GPS ***********************************************************/
	app.utils.getPosition = function() {
		var latitude, longitude;
		var myPosition = {};
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				localStorage.setItem("latitude", latitude);
				localStorage.setItem("longitude", longitude);
				//myPosition.longitude = longitude;
				//return myPosition;
			}, erreurPosition, {
				timeout: 10000
			});
		}
	};
	app.utils.myPositionOnMap = function(callback) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				app.point = {};
				var latitude = position.coords.latitude;
				var longitude = position.coords.longitude;
				app.point.latitude = latitude;
				app.point.longitude = longitude;
				$('input[name*="latitude"]').val(latitude);
				$('input[name*="longitude"]').val(longitude);
				callback();
			}, erreurPosition, {
				timeout: 10000
			});
		}
	};

	function erreurPosition(error) {
		var info = "Erreur lors de la geolocalisation : ";
		switch (error.code) {
			case error.TIMEOUT:
				info += "Timeout !";
				break;
			case error.PERMISSION_DENIED:
				info += "Vous n’avez pas donne la permission";
				break;
			case error.POSITION_UNAVAILABLE:
				info += "La position n’a pu etre determinee, verifiez l'etat du GPS";
				break;
			case error.UNKNOWN_ERROR:
				info += "Erreur inconnue";
				break;
		}
		localStorage.setItem("latitude", "");
		localStorage.setItem("longitude", "");
	}

	app.utils.initMap = function(point, zoom) {
		var initPoint = point || (new NS.UI.Point({
			latitude: 43.29,
			longitude: 5.37,
			label: "bureau"
		}));
		var mapZoom = zoom || 12;
		var map_view = new NS.UI.MapView({
			el: $("#map"),
			center: initPoint,
			zoom: mapZoom
		});
		return map_view;
	};

	app.utils.addTracks = function(urlFile, layerName) {
		var protocol = new NS.UI.Protocol({
			url: urlFile,
			format: "KML",
			strategies: ["Fixed"],
			popup: true
		});
		app.mapView.addLayer({
			protocol: protocol,
			layerName: layerName
		});
		app.global.traksLoaded = true;
		$("#waitLoadingTracks").html(" <img src='images/loader.gif'/>");
		$('a#displayTracks').text('Hide tracks');
		setTimeout(hideWaitLoadingTrack, 5000);
	};

	function hideWaitLoadingTrack() {
		$("#waitLoadingTracks").html("");
	}
	/****************************************************************** *********************************************/
	app.utils.getTime = function(fieldName) {
		var currentDate = new Date();
		var Heure = currentDate.getHours();
		var Min = currentDate.getMinutes();
		if (Min < 10) {
			Min = "0" + Min;
		}
		$('input[name*="' + fieldName + '"]').val(Heure + ":" + Min);
	};
	app.utils.validateFields = function() {
		var valRetour = 1;
		$("input").each(function() {
			var valInput = $(this).val();
			if (valInput === "") {
				valRetour = 0;
				return false;
			}
		});
		return valRetour;
	};
	// get the date format in MM/DD/YYYY
	Date.prototype.defaultView = function(format) {
		var dd = this.getDate();
		if (dd < 10) dd = '0' + dd;
		var mm = this.getMonth() + 1;
		if (mm < 10) mm = '0' + mm;
		var yyyy = this.getFullYear();
		if (format == "MM/DD/YYYY") {
			return String(dd + "\/" + mm + "\/" + yyyy);
		} else {
			return String(yyyy + "\/" + mm + "\/" + dd);
		}

	};
	// get distinct values from an array
	Array.prototype.distinct = function() {
		var map = {}, out = [];
		for (var i = 0, l = this.length; i < l; i++) {
			if (map[this[i]]) {
				continue;
			}

			out.push(this[i]);
			map[this[i]] = 1;
		}
		return out;
	};
	/******************************************************* photo capture *****************************************/
	app.utils.onPhotoDataSuccess = function(imageData) {
	};
	app.utils.onPhotoFileSuccess = function(imageData) {
		app.form.fields.photo_url.setValue(imageData);
		$("#image").attr("src", imageData);
		$("#image").attr("height", "200");
		$("#image").attr("width", "200");
	};
	app.utils.onFail = function(message) {
		alert('Failed because: ' + message);
	};
	/********************************************************plugin jquery Datatables *****************************************/
	/*app.utils.fnGetSelected = function(oTableLocal) {
		return oTableLocal.$('tr.row_selected');
	};*/
	app.utils.reloadProtocols = function(oTableLocal) {
		app.collections.protocolsList = new app.Collections.Protocols();
		app.collections.protocolsList.fetch({
			async: false
		});

		if (app.collections.protocolsList.length === 0) {
			//load protocols file
			initalizers.push(app.utils.loadProtocols("ressources/XML_ProtocolDef_eReleve.xml"));
			//initalizers.push(app.utils.loadProtocols("http://82.96.149.133/html/ecoReleve/ecoReleve-data/ressources/XML_ProtocolDef2.xml"));
		}
		// check if "schema" object exists to genegate form UI
		app.collections.protocolsList.each(function(protocol) {
			protocol.schema = protocol.attributes.schema;
		});
	};

	app.utils.getProtocolDetails = function(protocolName) {
		// check internet connexion
		if (navigator.onLine === true) {
			// check if server url is configurated
			//var serverUrl = localStorage.getItem("serverUrl");
			var serverUrl = app.config.serverUrl;
			if ((serverUrl === undefined) || (serverUrl === null)) {
				alert("Please configurate the server url");
			} else {
				// call WS protocols
				
				//var link = serverUrl + "cake/proto/proto_get?proto_name=TProtocol_" + protocolName;
				var link = serverUrl + "/proto/proto_get?id_proto=" + protocolName;
				$.ajax({
					type: "GET",
					url: link,
					dataType: "xml",
					success: function(xml) {
						app.utils.generateProtocolFromXml(xml);
					},
					error: function(xhr, ajaxOptions, thrownError) {
						alert(xhr.status);
						alert(thrownError);
					}
				});
			}
		} else {
			alert("you are not connected ! Please check your connexion ");
		}
	};
	/***********************************************************  Phonegap File API *************************************************/
	app.utils.onFSSuccess = function(fs) {
		app.global.fileSystem = fs;
	};
	app.utils.onError = function(e) {
		var HTML = "<h2>Error</h2>" + e.toString();
		alert(HTML);
	};
	app.utils.appendFile = function(f) {
		f.createWriter(function(writerOb) {
			writerOb.onwrite = function() {};
			//go to the end of the file...
			// writerOb.seek(writerOb.length);
			writerOb.write(app.utils.appendFile.textToWrite);
		});
	};
	app.utils.gotFileEntry = function(fileEntry) {
		var fileUrl = fileEntry.fullPath;
		// load xml protocols file
		app.utils.loadProtocols(fileUrl);
	};
	app.utils.clearCollection = function(collection) {
		collection.each(function(model) {
			model.destroy();
		});
		var len = collection.length;
		while (len > 0) {
			collection.each(function(model) {
				model.destroy();
			});
			len = collection.length;
		}
	};
	/*
app.utils.gotFile = function (file){
        //readDataUrl(file);
        app.utils.readAsText(file);
}
app.utils.readAsText = function (file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
            alert("Read as text");
            //alert(evt.target.result);
        };
        reader.readAsText(file);
		//app.utils.loadProtocols("file:///XML_ProtocolDef_eReleve.xml");
}
*/
	// ----------------------------------------------- Database Initialisation ------------------------------------------ //
	/*
app.utils.initializeDB = function(db){
  try {
    if (db) {
      // creer la table TIndividus
      		var query = 'CREATE TABLE IF NOT EXISTS TIndividus(Tind_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Tind_FieldWorker1 VARCHAR,'
			+'Tind_FieldWorker2 VARCHAR, Tind_FieldActivity_Name VARCHAR, Tind_Name VARCHAR, Tind_Region VARCHAR, Tind_Place VARCHAR, Tind_DATE VARCHAR,'
			+'Tind_LAT VARCHAR, Tind_LON VARCHAR, Tind_Site_name VARCHAR,Tind_MonitoredSite_type VARCHAR, Tind_label VARCHAR, Tind_Sex VARCHAR,'
			+'Tind_Origin VARCHAR, Tind_Species VARCHAR, Tind_Status VARCHAR, Tind_Tr_Shape VARCHAR, Tind_Tr_Model VARCHAR, Tind_Tr_Number VARCHAR,' 
			+ 'Tind_NumBagBre VARCHAR, Tind_Chip VARCHAR, Tind_TCaracThes_Mark_Color_1_Precision VARCHAR, Tind_PTT VARCHAR, Tind_Frequency VARCHAR,'
			+'Tind_NumBagRel VARCHAR, Tind_Fk_TInd_ID VARCHAR, Tind_FreqOpti VARCHAR)';
      deferreds.push(app.utils.runQuery(query , []));

    }
  } 
  catch (err) { 
   console.log(err);
  }
}
*/
	// ----------------------------------------------- Utilitaire de requêtes------------------------------------------ //
	app.utils.runQuery = function(query, param) {
		return $.Deferred(function(d) {
			app.global.db.transaction(function(tx) {
				tx.executeSql(query, param,
					successWrapper(d), failureWrapper(d));
			});
		});
	};

	function successWrapper(d) {
		return (function(tx, data) {
			d.resolve(data);
		});
	}

	function failureWrapper(d) {
		return (function(tx, error) {
			console.log('failureWrapper');
			console.log(error);
			d.reject(error);
		});
	}
	app.utils.findAll = function(callback) {
		app.global.db.transaction(
			function(tx) {
				var sql = "SELECT * FROM TIndividus LIMIT 50";

				tx.executeSql(sql, [], function(tx, results) {
					var len = results.rows.length,
						listIndiv = [],
						i = 0;
					for (; i < len; i = i + 1) {
						listIndiv[i] = results.rows.item(i);
					}
					callback(listIndiv);
				});
			},
			function(tx, error) {
				console.log(tx);
			}
		);
	};
	app.utils.checkURL = function(value) {
		var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
		if (urlregex.test(value)) {
			return (true);
		}
		return (false);
	};

	app.utils.checkServer = function(url) {
		$("#serverUrlInfo").text("Please wait, Checking server state ... ");
		$.ajax({
			type: "GET",
			dataType: "text",
			url: url,
			success: function(data) {
				alert("access to the server is ok ! ");
				$("#serverUrlInfo").text(" ");
				localStorage.setItem("serverUrl", url);
				app.router.navigate('#config', {
					trigger: true
				});
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alert("error, check the server access ! ");
				$("#serverUrlInfo").text(" ");

			}
		});
	};
	app.utils.trim = function(myString) {
		return myString.replace(/^\s+/g, '').replace(/\s+$/g, '');
	};
	app.utils.filldatable = function(params, paramsMap) {
		//debugger;	
		$("#allDataInfosPanel").hide();
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		//var cluster = $("#select_cluster option:selected").attr('value');
		var cluster = $('.cluster:checked').val();
		var ajaxSource;
		if (paramsMap) {
			ajaxSource = serverUrl + '/station/get?' + params + '&' + paramsMap;
		} else {
			ajaxSource = serverUrl + '/station/get?' + params;
		}

		app.utils.getDataForGrid(ajaxSource, function(collection, rowsNumber) {
			//var rowsNumber = collection.length ;
			app.utils.initGridServer(collection, rowsNumber, ajaxSource, {
				pageSize: 15,
				columns: [2, 6, 7, 8]
			});
		});
	};

	app.utils.fillTaxaList = function() {
		$('#lTaxon').empty();
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		$.ajax({
			url: serverUrl + "/proto/proto_taxon_get?id_proto=" + $("#id_proto").attr("value"), //+"&search="+$("#iTaxon").attr("value")
			dataType: "text",
			success: function(xmlresp) {
				var xmlDoc = $.parseXML(xmlresp),
					$xml = $(xmlDoc),
					$taxons = $xml.find("taxon");
				$taxons.each(function() {
					$('<option value=\"' + $(this).text() + '\">').appendTo('#lTaxon');
				});
				$taxons = $xml.find("taxons");
				if ($taxons.attr('havetaxon') == "yes")
					$("#iTaxon").removeAttr("disabled");
				else
					$("#iTaxon").attr("disabled", "disabled");
			}
		});
	};
	app.utils.getUpdateParams = function() {
		var params = {};
		params.id_proto = $("#id_proto").attr("value");
		params.place = $("#place").attr("value");
		params.region = $("#region").attr("value");
		params.idate = $('#idate').text();
		params.taxonsearch = $("#iTaxon").attr("value");
		return params;
	};
	app.utils.updateLayer = function(mapView) {
		// delete selected feature layer if exists
		for (var i = 0; i < mapView.map.layers.length; i++) {
			if ((mapView.map.layers[i].name) == "Selected feature") {
				mapView.map.removeLayer(mapView.map.layers[i]);
			}
		}
		var params = {
			id_proto: $("#id_proto").attr("value"),
			place: $("#place").attr("value"),
			region: $("#region").attr("value"),
			idate: $('#idate').text(),
			//cluster : $('.cluster:checked').val(),
			taxonsearch: $("#iTaxon").attr("value"),
			//zoom: 3
		};
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		var url = serverUrl + "/station/list?format=geojson&limit=0";
		var urlCount = serverUrl + "/station/list/count?" + "id_proto=" + params.id_proto + "&place=" + params.place + "&region=" + params.region + "&idate=" + params.idate + "&taxonsearch=" + params.taxonsearch;
		//get count

		app.xhr = $.ajax({
			url: urlCount,
			dataType: "json",
			success: function(data) {
				var featuresNumber = data[0].count;
				if (featuresNumber === 0) {
					// delete features
					for (var i = 0; i < mapView.map.layers.length; i++) {
						if ((mapView.map.layers[i].name) == "Observations") {
							mapView.clearLayer(mapView.map.layers[i]);
							exists = true;
							break;
						}
					}
					$("#waitControl").remove();
				} else if (featuresNumber < 5000) {
					// check if layer exists
					var exists = false;
					for (var i = 0; i < mapView.map.layers.length; i++) {
						if ((mapView.map.layers[i].name) == "Observations") {
							mapView.clearLayer(mapView.map.layers[i]);
							exists = true;
							break;
						}
					}
					// center the map
					var center = {};
					center.latitude = 22;
					center.longitude = 75;

					if (!exists) {
						//var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["BBOX", "REFRESH"], params:params, cluster:true, popup : false});
						//mapView.addLayer({protocol : protocol , layerName : "Observations", center: center, zoom:3 }); 
						var ajaxCall = {
							url: url,
							format: "GEOJSON",
							params: params,
							cluster: true
						};
						mapView.addLayer({
							ajaxCall: ajaxCall,
							layerName: "Observations",
							center: center,
							zoom: 4
						});
					} else {
						// update layer
						mapView.updateLayer("Observations", url, params);
					}
					$("#allDataMapDataInfos").html("");
				} else if (featuresNumber > 20000) {
					// delete features
					for (var i = 0; i < mapView.map.layers.length; i++) {
						if ((mapView.map.layers[i].name) == "Observations") {
							mapView.clearLayer(mapView.map.layers[i]);
							exists = true;
							break;
						}
					}
					// add alert view
					$(".modal-backdrop").remove();
					$("body").modal({
						backdrop: "static"
					});
					var alertView = new app.views.AlertMapBox({
						cancel: true,
						featuresNumber: featuresNumber
					});
					$("#allDataMapAlert").empty();
					$("#allDataMapAlert").append(alertView.render().$el);
					$("#allDataMapAlert").addClass("dialogBoxAlert");
					$("div.in").addClass("modal-backdrop");

					$("#waitControl").remove();
				} else {
					// delete features
					for (var i = 0; i < mapView.map.layers.length; i++) {
						if ((mapView.map.layers[i].name) == "Observations") {
							mapView.clearLayer(mapView.map.layers[i]);
							exists = true;
							break;
						}
					}
					// add alert view
					$(".modal-backdrop").remove();
					$("body").modal({
						backdrop: "static"
					});
					var alertView = new app.views.AlertMapBox({
						featuresNumber: featuresNumber,
						cancel: false
					});
					$("#allDataMapAlert").empty();
					$("#allDataMapAlert").append(alertView.render().$el);
					$("#allDataMapAlert").addClass("dialogBoxAlert");
					$("div.in").addClass("modal-backdrop");

					//$("#alldataAlert").removeClass("masqued");
				}
			}
		});
	};
	app.utils.continueUpdateLayer = function(mapView) {
		var params = {
			id_proto: $("#id_proto").attr("value"),
			place: $("#place").attr("value"),
			region: $("#region").attr("value"),
			idate: $('#idate').text(),
			//cluster : $('.cluster:checked').val(),
			taxonsearch: $("#iTaxon").attr("value"),
			zoom: 3
		};
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		var url = serverUrl + "/station/list?format=geojson&limit=0";
		var exists = false;
		for (var i = 0; i < mapView.map.layers.length; i++) {
			if ((mapView.map.layers[i].name) == "Observations") {
				mapView.clearLayer(mapView.map.layers[i]);
				exists = true;
				break;
			}
		}
		// center the map
		var center = {};
		center.latitude = 22;
		center.longitude = 75;
		if (!exists) {

			var ajaxCall = {
				url: url,
				format: "GEOJSON",
				params: params,
				cluster: true
			};
			mapView.addLayer({
				ajaxCall: ajaxCall,
				layerName: "Observations",
				center: center,
				zoom: 3
			});

			/*var protocol = new NS.UI.Protocol({ url : url, format: "GEOJSON", strategies:["BBOX"], params:params, cluster:true, popup : false});
		mapView.addLayer({protocol : protocol , layerName : "Observations", center: center, zoom:3 }); */
		} else {
			// update layer
			mapView.updateLayer("Observations", url, params, center);
		}
		$("#allDataMapDataInfos").html("");
	};
	app.utils.getTrackFromPoints = function(url, mapView) {
		var featurecollection;
		var coordinates = [];
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var features = data.features;
				var ln = features.length;
				for (var i = 0; i < ln; i++) {
					var pointCoordinates = [];
					var pointLongitude = features[i].geometry.coordinates[0];
					var pointLatitude = features[i].geometry.coordinates[1];
					pointCoordinates.push(pointLongitude);
					pointCoordinates.push(pointLatitude);
					coordinates.push(pointCoordinates);
				}
				featurecollection = {
					"type": "Feature",
					"properties": {},
					"geometry": {
						"type": "LineString",
						"coordinates": coordinates
					}
				};
				var tn = 0;
				var geojson_format = new OpenLayers.Format.GeoJSON({
					'internalProjection': mapView.map.baseLayer.projection,
					'externalProjection': new OpenLayers.Projection("EPSG:4326")
				});
				var vector_layer = new OpenLayers.Layer.Vector("Line", {
					style: {
						strokeWidth: 1,
						strokeColor: "#ff0000",
						strokeOpacity: 1
					}
				});
				mapView.map.addLayer(vector_layer);
				featurecollection = eval(featurecollection);
				vector_layer.addFeatures(geojson_format.read(featurecollection));
			},
			error: function() {
				alert("error loading data, please check connexion to webservice");
			}
		});

	};
	app.utils.animatedLayer = function(url, mapView) {
		var featurecollection;
		var coordinates = [];
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var features = data.features;
				var ln = features.length;
				data = eval(data);
				var startDate = features[0].properties.date;
				var endDate = features[ln - 1].properties.date;
				//var spanEl = $("#intervalOfTime");
				// var interval = parseInt(spanEl.val(), 10) * 86400;
				var interval = 30 * 86400;
				var endDate2 = startDate + interval;
				app.utils.AnimStartDate = startDate;
				app.utils.AnimEndDate = endDate;

				var geojson_format = new OpenLayers.Format.GeoJSON({
					'internalProjection': mapView.map.baseLayer.projection,
					'externalProjection': new OpenLayers.Projection("EPSG:4326")
				});
				var filter = new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: "date",
					lowerBoundary: startDate,
					upperBoundary: endDate2 //new Date(startDate.getTime() + (0))  // convert days number in milliseconds
				});
				app.utils.AnimFilter = filter;
				var filterStrategy = new OpenLayers.Strategy.Filter({
					filter: filter
				});
				app.utils.AnimfilterStrategy = filterStrategy;
				var vector_layer = new OpenLayers.Layer.Vector("animation", {
					strategies: [filterStrategy],
					styleMap: new OpenLayers.StyleMap({
						"default": new OpenLayers.Style({
							/*
					            graphicName: "circle",
					            pointRadius: 4,
					            fillOpacity: 0.7,
					            fillColor: "#E8154A",  // 1A6921  -> red
					            strokeColor: "#E8154A",
					            strokeWidth: 1
					            */
							externalGraphic: "images/positionMarker3.png",
							graphicWidth: 15,
							graphicHeight: 20,
							graphicYOffset: -37,
							graphicOpacity: 1
						})
					})
				});

				mapView.map.addLayer(vector_layer);
				vector_layer.addFeatures(geojson_format.read(data));

			},
			error: function() {
				alert("error loading data, please check connexion to webservice");
			}
		});

	};
	app.utils.timlineLayer = function(url, mapView, callback) {
		var featurecollection;
		var coordinates = [];
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var features = data.features;
				var ln = features.length;
				data = eval(data);
				var startDate = features[0].properties.date;
				var endDate = features[ln - 1].properties.date;

				app.utils.timelineStartDate = startDate;
				app.utils.timelineEndDate = endDate;

				var geojson_format = new OpenLayers.Format.GeoJSON({
					'internalProjection': mapView.map.baseLayer.projection,
					'externalProjection': new OpenLayers.Projection("EPSG:4326")
				});
				var filter = new OpenLayers.Filter.Comparison({
					type: OpenLayers.Filter.Comparison.BETWEEN,
					property: "date",
					lowerBoundary: startDate,
					upperBoundary: endDate //new Date(startDate.getTime() + (0))  // convert days number in milliseconds
				});
				app.utils.timelineFilter = filter;
				var filterStrategy = new OpenLayers.Strategy.Filter({
					filter: filter
				});
				app.utils.timelinefilterStrategy = filterStrategy;
				var vector_layer = new OpenLayers.Layer.Vector("positions", {
					strategies: [filterStrategy],
					styleMap: new OpenLayers.StyleMap({
						"default": new OpenLayers.Style({
							graphicName: "circle",
							pointRadius: 4,
							fillOpacity: 0.7,
							fillColor: "#E8154A", // 1A6921  -> red
							strokeColor: "#E8154A",
							strokeWidth: 1
						})
					})
				});

				mapView.map.addLayer(vector_layer);
				vector_layer.addFeatures(geojson_format.read(data));
				mapView.map.zoomToExtent(vector_layer.getDataExtent());
				var zoomLevel = mapView.map.zoom;
				if (zoomLevel > 11){
					mapView.zoomTo(11);
				}
				$("#waitControl").remove(); 
				// init date values
				var stDate = new Date(startDate * 1000);
				// convert date format
				stDate = stDate.defaultView('YYYY/MM/DD');
				$("#objectsIndivMapSliderStartDate").text(stDate);
				var enDate = new Date(endDate * 1000);
				// convert date format
				enDate = enDate.defaultView('YYYY/MM/DD');
				$("#objectsIndivMapSliderEndDate").text(enDate);

				if (stDate != enDate) {
					$("#dateSlider").slider({});
					$("#sliderwait").addClass("masqued");
					$("#dateSlider").data('slider').min = startDate;
					$("#dateSlider").data('slider').max = endDate;
					$("#dateSlider").data('slider').step = 86400;
				} else {
					$("#sliderContent").addClass("masqued");
					$("#sliderMessage").removeClass("masqued");
				}
				callback();
			},
			error: function() {
				alert("error loading data, please check connexion to webservice");
			}
		});

	};
	app.utils.updateLocation = function(mapView, point) {
		var exists = false;
		var vector_layer = null;
		for (var i = 0; i < mapView.map.layers.length; i++) {
			if ((mapView.map.layers[i].name) == "Selected feature") {
				mapView.clearLayer(mapView.map.layers[i]);
				vector_layer = mapView.map.layers[i];
				exists = true;
				break;
			}
		}
		if (!exists) {
			var pt = new NS.UI.Point({
				latitude: point.latitude,
				longitude: point.longitude,
				label: "",
			});
			var style = new OpenLayers.Style({
				pointRadius: 8,
				strokeWidth: 1,
				fillColor: '#F00C27',
				strokeColor: 'black',
				cursor: 'pointer'
			});
			mapView.addLayer({
				point: pt,
				layerName: "Selected feature",
				style: style,
				noSelect: true
			});
			var location = new OpenLayers.LonLat(point.longitude, point.latitude);
			mapView.setCenter(location);
			mapView.map.panTo(location);
		} else {
			vector_layer.removeAllFeatures();
			var lonlat = new OpenLayers.LonLat(point.longitude, point.latitude);
			lonlat.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:3857"));
			var f = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat));
			vector_layer.addFeatures(f);
			mapView.map.setCenter(lonlat);
		}
	};
	app.utils.getItemsList = function(element, url, isDatalist) {
		$(element).empty();
		$('<option value=""></option>').appendTo(element);
		//$('#export-themes').css({"display": "inline-block","height": "40px","width": "300px"});
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		url = serverUrl + url;
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var len = data.length;
				for (var i = 0; i < len; i++) {
					var label = data[i].MapSelectionManager.Caption;
					var value = data[i].MapSelectionManager.TProt_PK_ID;
					if (isDatalist) {
						$('<option value=\"' + label + '\">' + "</option>").appendTo(element);
					} else {
						$('<option value=\"' + value + '\">' + label + "</option>").appendTo(element);
					}
				}
			},
			error: function() {
				alert("error loading items, please check connexion to webservice");
			}
		});

	};
	app.utils.getUsersList = function(element, url, isDatalist) {
		$(element).empty();
		$('<option value=""></option>').appendTo(element);
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		url = serverUrl + url;
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var len = data.length;
				for (var i = 0; i < len; i++) {
					var user = data[i];
					var label = user[0].Nom;
					var id = user[0].ID;
					if (isDatalist) {
						$('<option value=\"' + label + '\">' + "</option>").appendTo(element);
					} else {
						$('<option value=\"' + id + '\">' + label + "</option>").appendTo(element);
					}
				}
			},
			error: function() {
				alert("error loading items, please check connexion to webservice");
			}
		});
	};
	app.utils.getUsersListForStrorage = function(url) {
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;

		url = serverUrl + url;
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var len = data.length;
				for (var i = 0; i < len; i++) {
					var user = data[i];
					var label = user[0].Nom;
					var id = user[0].ID;
					app.collections.users.add({
						"idUser": id,
						"label": label
					});
				}
				app.collections.users.save();
			},
			error: function() {
				alert("error loading items, please check connexion to webservice");
			}
		});
	};
	app.utils.getFieldActivityListForStrorage = function(url) {
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl =app.config.serverUrl;
		url = serverUrl + url;
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var len = data.length;
				for (var i = 0; i < len; i++) {
					var label = data[i].MapSelectionManager.Caption;
					var value = data[i].MapSelectionManager.TProt_PK_ID;
					app.collections.fieldActivityList.add({
						"idActivity": value,
						"label": label
					});
				}
				app.collections.fieldActivityList.save();
			},
			error: function() {
				alert("error loading items, please check connexion to webservice");
			}
		});
	};
	app.utils.addDatalistControl = function(controlId, collection, idAttr) {
		var element = document.createElement('datalist');
		$(element).attr('id', controlId + "List"); //  .appendTo('body');    
		// get itemList
		collection.each(function(model) {
			var item = model.attributes.label;
			var listItem; 
			if(idAttr){
				var idElement =  model.attributes[idAttr];
				listItem  = "<option value='" + item + "'>"+ idElement +"</option>";
			}else{
				listItem  = "<option value='" + item + "'></option>";
			}
			$(element).append(listItem);
		});
		// insert datalist in form element
		$("form").append(element);
	};

	app.utils.getViewsList = function(id) {
		$('#export-views').empty();
		if (id !== "") {
			//var serverUrl = localStorage.getItem("serverUrl");
			var serverUrl = app.config.serverUrl;
			var viewsUrl = serverUrl + "/views/views_list?id_theme=" + id;
			$.ajax({
				url: viewsUrl,
				dataType: "json",
				success: function(data) {
					var len = data.length;
					for (var i = 0; i < len; i++) {
						var value = data[i].MapSelectionManager.TSMan_sp_name;
						var label = data[i].MapSelectionManager.TSMan_Description;
						$('<li class="exportViewsList" value=\"' + value + '\">' + label + "</li>").appendTo('#export-views');
					}
				},
				error: function() {
					alert("error loading views, please check connexion to webservice");
				}
			});
		}
	};
	app.utils.getAreaList = function(element, url, isDatalist) {
		$(element).empty();
		$('<option value=""></option>').appendTo(element);
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		url = serverUrl + url;
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var len = data.length;
				for (var i = 0; i < len; i++) {
					var area = data[i].TStationsJoin.Area;
					if (isDatalist) {
						$('<option value=\"' + area + '\">' + "</option>").appendTo(element);
					} else {
						$('<option value=\"' + area + '\">' + area + "</option>").appendTo(element);
					}
				}
			},
			error: function() {
				alert("error loading items, please check connexion to webservice");
			}
		});

	};
	app.utils.fillDataListFromArray = function(array, elementId){
		var ln = array.length;
		for (var i=0; i<ln;i++ ){
			var option = "<option value='" + array[i] + "'></option>";
			$(elementId).append(option);
		}
	};
	app.utils.getLocalityList = function(element, url, isDatalist) {
		$(element).empty();
		$('<option value=""></option>').appendTo(element);
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		url = serverUrl + url;
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var len = data.length;
				for (var i = 0; i < len; i++) {
					var area = data[i].TStationsJoin.Locality;
					if (isDatalist) {
						$('<option value=\"' + area + '\">' + "</option>").appendTo(element);
					} else {
						$('<option value=\"' + area + '\">' + area + "</option>").appendTo(element);
					}
				}
			},
			error: function() {
				alert("error loading items, please check connexion to webservice");
			}
		});

	};
	app.utils.generateFilter = function(viewName) {
		// count nb rows
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		var viewUrl = serverUrl + "/views/get/" + viewName + "/count";
		app.xhr = "";
		$.ajax({
			url: viewUrl,
			dataType: "json",
			success: function(data) {
				var count = data[0].count;
				count += " records";
				$("#countViewRows").text(count);
				getFieldsListForSelectedView(viewName);
			},
			error: function() {
				$("#countViewRows").text("error !");
			}
		});
	};
	var getFieldsListForSelectedView = function(viewName) {
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		var viewUrl = serverUrl + "/views/detail/" + viewName;
		app.xhr = "";
		$.ajax({
			url: viewUrl,
			dataType: "json",
			success: function(data) {
				var fieldsList = [];
				app.utils.exportFieldsList = [];
				for (var prop in data) {
					var optionItem = "<option type='" + data[prop].type + "'>" + prop + "</option>";
					$("#export-view-fields").append(optionItem);
					app.utils.exportFieldsList.push(prop);
				}
				$("#filter-btn").removeClass("masqued");
			}
		});
	};
	app.utils.getFiltredResult = function(element, query, view) {
		$("#" + element + "").html();
		$("#" + element + "").html('<img src="images/ajax-loader-linear.gif" />');
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		var viewUrl = serverUrl + "/views/get/" + view + "/count?filter=" + query;
		$.ajax({
			url: viewUrl,
			dataType: "json",
			success: function(data) {
				var count = data[0].count;
				$("#filter-query-result").html(' <br/><p>filtred count:<span> ' + count + ' records</span></p>');
			},
			error: function() {
				$("#filter-query-result").html(' <h4>error</h4>');
			}
		});
	};
	app.utils.getResultForGeoFilter = function(query, view) {
		$("#geo-query-result").html();
		$("#geo-query-result").html('<img src="images/ajax-loader-linear.gif" />');
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		var viewUrl = serverUrl + "/views/get/" + view + "/count?" + query;
		$.ajax({
			url: viewUrl,
			dataType: "json",
			success: function(data) {
				var count = data[0].count;
				$("#geo-query-result").html(' <br/><br/>filtred count : ' + count + '');
			},
			error: function() {
				$("#geo-query-result").html(' error');
			}
		});
	};
	app.utils.getExportList = function(view, filter, bbox, BBview) {
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		var displayedColumns = app.utils.exportSelectedFieldsList;
		var url = serverUrl + "/views/get/" + view + "?filter=" + filter + "&bbox=" + bbox + "&columns=" + displayedColumns;
		BBview.url = url;
		app.utils.getDataForGrid(url, function(collection, rowsNumber) {
			//var rowsNumber = collection.length ;
			app.utils.initGridServer(collection, rowsNumber, url, {
				pageSize: 10
			});
			// TODO   generate gpx  a faire ?
			//$("#export-getGpx").removeAttr("disabled");
			$("#spanGeneratingGpx").html("");
		});
		// generate files "pdf" and "gpx"
		var urlFile = serverUrl + "/views/get/" + view + "/export" + "?filter=" + filter + "&bbox=" + bbox + "&columns=" + displayedColumns;
		$.ajax({
			url: urlFile,
			//dataType: "json",
			success: function() {
				$("#export-getGpx").removeAttr("disabled");
				$('#export-getPdf').removeAttr("disabled");
				$('#export-getCsv').removeAttr("disabled");
			},
			error: function() {
				alert("error in generating gpx file!");
			}
		});
	};
	app.utils.getdataListForBirdFilter = function(element, url){
		$(element).empty();
		var ajaxCall = $.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				var len = data.length;
				for (var i = 0; i < len; i++) {
					var valueObj = data[i].Value;
					var value = valueObj[Object.keys(valueObj)[0]]; // get value of first element
					$('<option value=\"' + value + '\"></option>').appendTo(element);
				}
			},
			error: function() {
				alert("error loading items, please check connexion to webservice");
				ajaxCall.abort();
			}
		});

	};
	app.utils.getDataForGrid = function(url, callback) {
		/*if(app.xhr){ 
        app.xhr.abort();
    }*/
		$.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				// create schema model and dynamic fields for the grid
				var rowsNumber = data.count;
				var dataValues = data.values;
				var firstRow = dataValues[0];
				var listColumns = [];
				var schema = {};
				for (var key in firstRow) {
					var type;
					var colName = key;
					if (colName.toUpperCase() == "DATE") {
						type = "Date";
					} else {
						type = "Text";
					}
					schema[colName] = {
						'title': colName,
						type: type,
						sortable: true
					};
				}
				app.models.ExportGridModel = Backbone.Model.extend({}, {
					// Declare schema and verbose name at model level
					schema: schema,
					verboseName: 'Data'
				});
				app.collections.AllDataCollection = Backbone.Collection.extend({
					model: app.models.ExportGridModel
				});
				app.collections.VisibleListInGrid = Backbone.Collection.extend({
					model: app.models.ExportGridModel
				});
				var gridCollection = new app.collections.AllDataCollection();
				var ln = dataValues.length;
				for (var i = 0; i < ln; i++) {
					var rowValue = dataValues[i];
					var gridModel = new app.models.ExportGridModel();
					for (key in rowValue) {
						var colNam = key;
						var colValue;
						if (colNam.toUpperCase() == "DATE") {
							var colVal = rowValue[key];
							colValue = changeDateFormat(colVal);
						} else {
							colValue = rowValue[key];
						}
						gridModel.set(colNam, colValue);
					}
					//listColumns
					gridCollection.add(gridModel);
				}
				callback(gridCollection, rowsNumber);
			},
			error: function() {
				console.log("error loading birds list");
			}
		});
	};
	app.utils.initGrid = function(list, VisibleList, columns, options) {
		var visibleList = new VisibleList;
		// initier la grid
		var pageSize = 10;
		var pagerPosition = 'top';
		if (options){
			pageSize = options.pageSize || 10;
			pagerPosition = options.pagerPosition || 'top';
		}
		var grid = new NS.UI.Grid({
			collection: visibleList,
			pageSize: pageSize,
			pageSizes: [5, 10, 20, 50],
			page: 1,
			pagerPosition: pagerPosition //,
			//	dateFormat: 'yyyy/mm/dd',
		});
		//show a first page
		grid.size = list.length;
		visibleList.reset(list.slice(0, grid.pageSize));
		//  Specify how to handle grid events
		function reloadGrid() {
			var data;
			//if (grid.filters.length>0) {
			if (!(isEmptyObject(grid.filters))) {
				data = list.filter(function(item) {
					var k, v, testDate,
						res = true;
					for (k in this) {
						v = this[k];
						// for date and text, v=condition:value  -> get condition & value
						var ConditionValue = v.split(":");

						var condition = "",
							val = null,
							dateMin, dateMax;
						if (ConditionValue.length == 2) {
							condition = ConditionValue[0];
							val = ConditionValue[1];
							// condition between v = "before:2013-05-30&filters[]=DATE:after:2013-05-21"	
						} else if (ConditionValue.length == 4) {
							condition = "between";
							var dtMax = ConditionValue[1]; // 2013-05-30&filters[]=DATE
							dateMax = dtMax.split("&")[0];
							dateMin = ConditionValue[3];
							val = dateMin; // or dateMax, just to enter to next condition
						}

						testDate = new Date(val || v); // val if exists 
						testDate.setHours(0, 0, 0, 0);
						if (isFinite(testDate)) {
							//res = res && (item.get(k).toString() === v);
							switch (condition) {
								case "before":
									res = res && (item.get(k) < testDate);
									break;
								case "after":
									res = res && (item.get(k) > testDate);
									break;
								case "":
									res = res && (item.get(k).toString() === testDate.toString());
									break;
								case "between":
									dateMax = new Date(dateMax);
									dateMax.setHours(0, 0, 0, 0);
									dateMin = new Date(dateMin);
									dateMin.setHours(0, 0, 0, 0);
									res = res && (item.get(k) < dateMax) && (item.get(k) > dateMin);
							}

							//res = res && (item.get(k).toString() === testDate.toString());
						} else {
							switch (condition) {
								case "exact":
									res = res && (item.get(k).toLowerCase() === val.toLowerCase());
									break;
								case "begin":
									res = res && (item.get(k).toLowerCase().indexOf(val.toLowerCase()) === 0);
									break;
								case "end":
									var str = val.toLowerCase();
									res = res && (item.get(k).length >= str.length && item.get(k).toLowerCase().lastIndexOf(str) + str.length == item.get(k).length);
									//res = res && (item.get(k).toLowerCase().indexOf(v.toLowerCase()) >= 0);
									break;
								case "":
									res = res && (item.get(k).toLowerCase().indexOf(v.toLowerCase()) >= 0);
									break;
								default:
									res = res && (item.get(k).toLowerCase().indexOf(v.toLowerCase()) >= 0);
									break;
							}
							//res = res && (item.get(k).toLowerCase().indexOf(v.toLowerCase()) >= 0);
						}
					}
					return res;
				}, grid.filters);
			} else {
				data = list.models;
			}
			if (grid.sortColumn) {
				data = _.sortBy(data, function(m) {
					return m.get(grid.sortColumn);
				});
				if (grid.sortOrder == 'desc')
					data.reverse();
			}
			grid.size = data.length;
			visibleList.reset(data.slice((grid.page - 1) * grid.pageSize, grid.page * grid.pageSize));
			if (columns && (typeof(columns) != "undefined") ) {
				var ln = columns.length;
				for (var i = 0; i < ln; i++) {
					masquerColonne(columns[i]);
				}
		  }
		}
		grid.on('selected', function(model) {
			//console.log(model);
			app.models.selectedModel = model;
		});
		grid.on('sort', function(fieldId, order) {
			grid.sortColumn = fieldId;
			grid.sortOrder = order;
			reloadGrid();
		});
		grid.on('unsort', function() {
			delete grid.sortColumn;
			delete grid.sortOrder;
			reloadGrid();
		});
		grid.on('filter', function(fieldId, value) {
			grid.filters[fieldId] = value;
			grid.page = 1; // Page count will change, keeping current page will be meaning-less
			reloadGrid();
		});
		grid.on('unfilter', function(fieldId) {
			if (fieldId) {
				delete grid.filters[fieldId];
			} else {
				grid.filters = {};
			}
			grid.page = 1; // Page count will change, keeping current page will be meaning-less
			reloadGrid();
		});
		grid.on('page', function(target) {
			grid.page = target;
			reloadGrid();
			if (options.editable === true){
				var tdFieldactivity = $("div#grid").find("td.fieldActivity");
				for(var i = 0; i < tdFieldactivity.length; i++ )
				{
					if ($(tdFieldactivity[i]).text() === "") {
						tdFieldactivity[i].innerHTML = '<input list="import-activity" type="text" id="importActivity">';
					}
				}
				var trSelected = $("div#grid").find("tr.selected");
			}	
		});
		grid.on('pagesize', function(size) {
			grid.pageSize = size;
			reloadGrid();
		});

		// 5) render the grid (empty at the moment) and bind it to the DOM tree
		$('div#grid').html("");
		grid.render().$el.appendTo('div#grid');
		if (columns && (typeof(columns) != "undefined") ) {
			var ln = columns.length;
			for (var i = 0; i < ln; i++) {
				masquerColonne(columns[i]);
			}
		}

		if (options && options.editable ){
			var tdFieldactivity = $("div#grid").find("td.fieldActivity");
			for(var i = 0; i < tdFieldactivity.length; i++ )
			{
				if ($(tdFieldactivity[i]).text() === "") {
					tdFieldactivity[i].innerHTML = '<input list="import-activity" type="text" id="importActivity">';
				}
			}
		}
		function masquerColonne(num) {
			if (num) {
				$("table>thead").find("tr").each(function() {
					/*var nom = $(this).get(num - 1).firstChild;
					$(nom).addClass("masqued");
					*/
					$(this.childNodes[num - 1]).addClass("masqued");
				});
				$("table>tbody").find("tr").each(function() {
					/*	var nom = $(this).get(num - 1).firstChild;
					$(nom).addClass("masqued");*/
					$(this.childNodes[num - 1]).addClass("masqued");
				});
			}
		}
		return grid;
	};
	app.utils.initGridServer = function(gridCollection, count, url, options) {
		//var visibleList = new VisibleList;
		// initier la grid
		var grid = new NS.UI.Grid({
			collection: gridCollection,
			pageSize: options.pageSize || 10,
			pageSizes: [5, 10, 20, 50],
			page: 1,
			pagerPosition: 'top'
		});
		//show a first page
		grid.size = count;
		gridCollection.reset(gridCollection.slice(0, grid.pageSize));
		//  Specify how to handle grid events
		function reloadGrid() {
			var data;
			//data = gridCollection.models;
			var params = "&limit=" + grid.pageSize + "&skip=" + (grid.page - 1) * grid.pageSize;

			if (grid.sortColumn) {
				params += "&sortColumn=" + grid.sortColumn + "&sortOrder=" + grid.sortOrder;
			}
			if (!(isEmptyObject(grid.filters))) {
				for (var k in grid.filters) {
					var v = grid.filters[k];
					params += "&filters[]=" + k + ":" + v;
				}
				//params += "&" + grid.filters ;
			}

			var urlGrid = url + params;
			app.utils.getDataForGrid(urlGrid, function(coll, rowsNumber) {

				data = coll;
				grid.size = rowsNumber;
				gridCollection.reset(data.slice(0, grid.pageSize));
				//grid.size = data.length;
				//gridCollection.reset(data.slice((grid.page - 1) * grid.pageSize, grid.page * grid.pageSize));
				if (typeof(options.columns) != "undefined") {
					var ln = options.columns.length;
					for (var i = 0; i < ln; i++) {
						masquerColonne(options.columns[i]);
					}
				}
			});
			//}
		}
		grid.on('selected', function(model) {
			app.models.selectedModel = model;
			//console.log(model);
		});
		grid.on('sort', function(fieldId, order) {
			grid.sortColumn = fieldId;
			grid.sortOrder = order;
			reloadGrid();
		});
		grid.on('unsort', function() {
			delete grid.sortColumn;
			delete grid.sortOrder;
			reloadGrid();
		});
		grid.on('filter', function(fieldId, value, condition) {
			grid.filters[fieldId] = value;
			grid.page = 1; // Page count will change, keeping current page will be meaning-less
			reloadGrid();
		});
		grid.on('unfilter', function(fieldId) {
			if (fieldId) {
				delete grid.filters[fieldId];
			} else {
				grid.filters = {};
			}
			grid.page = 1; // Page count will change, keeping current page will be meaning-less
			reloadGrid();
		});
		grid.on('page', function(target) {
			grid.page = target;
			reloadGrid();
		});
		grid.on('pagesize', function(size) {
			grid.pageSize = size;
			reloadGrid();
		});
		var container = options.container || 'div#grid';
		// 5) render the grid (empty at the moment) and bind it to the DOM tree
		$(container).html("");
		grid.render().$el.appendTo(container);
		if (typeof(options.columns) != "undefined") {
			var ln = options.columns.length;
			for (var i = 0; i < ln; i++) {
				masquerColonne(options.columns[i]);
			}
		}

		function masquerColonne(num) {
			if (num) {
				$("table>thead").find("tr").each(function() {
					/* var nom = $(this).get(num - 1);
				 var nom2 = $(this).childNodes();
				 //var tm = nom.firstChild;
				 $(nom2).addClass("masqued");*/
					$(this.childNodes[num - 1]).addClass("masqued");
				});
				$("table>tbody").find("tr").each(function() {
					/* var nom = $(this).get(num - 1).firstChild;
				 $(nom).addClass("masqued");*/

					$(this.childNodes[num - 1]).addClass("masqued");
				});
			}
		}
	};
	app.utils.fillObjectsTable = function() {
		//var serverUrl = localStorage.getItem("serverUrl");
		var serverUrl = app.config.serverUrl;
		// load data for radio transmitter
		var radioUrl = serverUrl + '/TViewTrx_Radio/list?sortColumn=ID&sortOrder=desc';
		app.utils.getDataForGrid(radioUrl, function(collection, rowsNumber) {
			//var rowsNumber = collection.length ;
			app.utils.initGridServer(collection, rowsNumber, radioUrl, {
				pageSize: 15,
				//columns: [2, 6, 7, 8],
				container: "#objectsRadioGrid"
			});
		});
		// load data for sat transmitter
		var satUrl = serverUrl + '/TViewTrx_Sat/list?sortColumn=ID&sortOrder=desc';
		app.utils.getDataForGrid(satUrl, function(collection, rowsNumber) {
			//var rowsNumber = collection.length ;
			app.utils.initGridServer(collection, rowsNumber, satUrl, {
				pageSize: 15,
				columns: [3], //[2, 6, 7, 8],
				container: "#objectsSatGrid"
			});
		});
		// load data for sensor field sensor
		/*var rfidUrl = serverUrl + '/TViewFieldsensor/list?sortColumn=ID&sortOrder=desc';
		app.utils.getDataForGrid(rfidUrl, function(collection, rowsNumber) {
			//var rowsNumber = collection.length ;
			app.utils.initGridServer(collection, rowsNumber, rfidUrl, {
				pageSize: 15,
				columns: [2, 6, 7, 8],
				container: "#objectsField_sensorGrid"
			});
		});*/
		//load data for sensor RFID
		var rfidUrl = serverUrl + '/TViewRFID/list?sortColumn=ID&sortOrder=desc';
		app.utils.getDataForGrid(rfidUrl, function(collection, rowsNumber) {
			//var rowsNumber = collection.length ;
			app.utils.initGridServer(collection, rowsNumber, rfidUrl, {
				pageSize: 15,
				//columns: [2, 6, 7, 8],
				container: "#objectsField_rfidGrid"
			});
		});
		//load data for camera trap
		var cameraUrl = serverUrl + '/TViewCameraTrap/list?sortColumn=ID&sortOrder=desc';
		app.utils.getDataForGrid(cameraUrl, function(collection, rowsNumber) {
			//var rowsNumber = collection.length ;
			app.utils.initGridServer(collection, rowsNumber, cameraUrl, {
				pageSize: 15,
				//columns: [2, 6, 7, 8],
				container: "#objectsField_cameraGrid"
			});
		});
	};
	app.utils.getObjectDetails = function(backboneView, objectType, url, idObj) {
		if (app.xhr) {
			app.xhr.abort();
		}
		app.xhr = $.ajax({
			url: url,
			dataType: "json",
			success: function(data) {
				$("#objectDetailsPanel").html("");
				$("#objectDetailsPanelContent").html("");
				var i = 0;
				for (var k in data) {
					// activate first element of panel
					$("#objectDetailsPanel").append("<li><a href='#d" + i + "' data-toggle='tab'>" + k + "</a></li>");
					var objectContent = data[k];
					var ct = "";
					for (var v in objectContent) {
						if ((String(objectContent[v]) != "[object Object]")) {
							var editable = objectContent[v][1]['edit'];
							var idbtn = objectContent[v][1]['typeandid'];
							var order = objectContent[v][1]['order'];
							var importance = objectContent[v][1]['importance'];
							var classimportance = "";
							if (importance != 3) {
								if (importance == 2) {
									classimportance = "class='objectcaractype2'";
								}
								if (importance == 1) {
									classimportance = "class='objectcaractype1'";
								}
							}
							var bouton = "";
							if (editable == 1) {
								bouton = "<span name='" + v + "' class='editCaracBtn' id=" + idbtn + ">Edit</span>";
							}
							ct += "<p  " + classimportance + ">" + v + " : " + objectContent[v][0] + bouton + "</p>";
						} else {
							var objDetail = objectContent[v];
							//ct += "<h2><i>" + v + "</i></h2>";
							for (var z in objDetail) {
								var editable = objDetail[z][1]['edit'];
								var idbtn = objDetail[z][1]['typeandid'];
								var order = objDetail[z][1]['order'];
								var importance = objDetail[z][1]['importance'];
								var classimportance = "";
								if (importance != 3) {
									if (importance == 2) {
										classimportance = "class='objectcaractype2'";
									}
									if (importance == 1) {
										classimportance = "class='objectcaractype1'";
									}
								}
								var bouton = "";
								if (editable == 1) {
									bouton = "<span name='" + z + "' class='editCaracBtn' id=" + idbtn + ">Edit</span>";
								}
								ct += "<p " + classimportance + " >" + z + " : " + objDetail[z][0] + bouton + "</p>";
							}
						}
					}
					$("#objectDetailsPanelContent").append("<div class='tab-pane fade' id='d" + i + "'>" + ct + "</div>");
					// k is the name of tab
					i += 1;
				}
				$("#objectDetailsPanel").append("<li id='objectSuccessEdit' style='display: none;'><img SRC='img/success.jpg' width='40px' height='40px'/></li><li id='objectErrorEdit' style='display: none;'><img SRC='img/error.jpg' width='40px' height='40px'/></li>");
				$("#objectDetailsPanel").append("<li id='objectNew' style='display: none;'>NEW</li>");
				$("#d0").prepend("<a class='btn' objId='" + idObj + "' id='objDelete'>delete</a><br/>");
				$("#objectDetailsPanel:first-child a[href='#d0']").trigger("click");
				// mask unsed tabs for Radio and sat
				if (objectType != "individual") {
					$("a[href='#d1']").parent().addClass("masqued");
				}
				if (objectType == "radio") {
					$("a[href='#d0']").text("radio transmitter");
				}
				if (objectType == "sat") {
					$("a[href='#d0']").text("sat transmitter");
				}
				if (objectType == "fieldsensor") {
					$("a[href='#d0']").text("fieldsensor");
				}
				if (objectType == "rfid") {
					$("a[href='#d0']").text("RFID ");
				}
				if (objectType == "camera") {
					$("a[href='#d0']").text("camera ");
				}
			}
		});

	}
	app.utils.displayObjectPositions = function(view, objectUrl, idIndiv) {
		/*$(".modal-backdrop").remove();
    $("body").modal({
        backdrop: "static"
    });*/
		var alertView = new app.views.ObjectMapBox({
			view: view,
			url: objectUrl,
			id: idIndiv
		});
		$("#objMapDiv").append(alertView.render().$el);
	}
	app.utils.displayObjectHistory = function(view, objectType, url, idIndiv) {
		var alertView = new app.views.ObjectHistoryBox({
			view: view,
			objectType: objectType,
			url: url,
			id: idIndiv
		});
		$("#objectsInfosPanelHistory").empty();
		$("#objectsInfosPanelHistory").append('<h3>history</h3>');
		$("#objectsInfosPanelHistory").append(alertView.render().$el);
	};
	app.utils.displayObjectDetails = function(view, objectType, url, idIndiv) {
		$(".modal-backdrop").remove();
		$("body").modal({
			backdrop: "static"
		});
		var alertView = new app.views.ObjectDetails({
			view: view,
			objectType: objectType,
			url: url,
			id: idIndiv
		});
		$("#objectsMapContainer").empty();
		$("#objectsMapContainer").append(alertView.render().$el);
		$("#objectsMapContainer").addClass("dialogBoxAlert");
		$("div.in").addClass("modal-backdrop");
	};
	app.utils.convertToInt = function(array) {
		var tab = [];
		for (var i = 0; i < array.length; i++) {
			var value = array[i];
			tab.push(parseInt(value));
		}
		return tab;
	};
	app.utils.MaxArray = function(array) {
		var max = 0;
		for (var i = 0; i < array.length; i++) {
			var value = (array[i]);
			if (value > max) {
				max = value;
			}
		}
		return max;
	};
	app.utils.GraphJsMaxY = function(max) {
		var maxY;
		if (max < 500) {
			maxY = 500;
		} else if (max < 1000) {
			maxY = 1000;
		} else if (max < 1500) {
			maxY = 1500;
		} else if (max < 2000) {
			maxY = 2000;
		} else if (max < 2500) {
			maxY = 2500;
		} else if (max < 3000) {
			maxY = 3000;
		} else if (max < 4000) {
			maxY = 4000;
		} else if (max < 5000) {
			maxY = 5000;
		} else if (max < 10000) {
			maxY = 10000;
		} else if (max < 15000) {
			maxY = 15000;
		} else if (max < 20000) {
			maxY = 20000;
		} else if (max < 50000) {
			maxY = 50000;
		} else if (max < 100000) {
			maxY = 100000;
		}
		return maxY;
	};
app.utils.displayWaitControl = function (element){
	var width =  ((screen.width)/2 -200);
	var height = ((screen.height)/2 - 200);
	var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/PleaseWait.gif' /></div>" ; 
	var st = $("#waitControl").html("");
	if ($("#waitControl").length === 0) {
		$(element).append(ele);
	}
};
	function isEmptyObject(obj) {
		var name;
		for (name in obj) {
			return false;
		}
		return true;
	}

app.utils.array_unique =  function (arr) {
  return arr.reduce(function (p, c) {
    if (p.indexOf(c) < 0) p.push(c);
    return p;
  }, []);
}
app.utils.isEmptyObject = function (obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}




	return app;
})(ecoReleveData);