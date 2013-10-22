var ecoReleveData = (function(app) {
   // "use strict";
/*****************************************************
HomeView
******************************************************/	
app.Views.HomeView = Backbone.View.extend({
    manage: true ,
	initialize : function() {
            this.template = _.template($('#home-template').html());
    },
	events : {
		'click #alldata' : 'alldata'
	},
	
	alldata: function(e){
		if (navigator.onLine == true){
			var serverUrl = localStorage.getItem( "serverUrl");
			if ((serverUrl === undefined) || (serverUrl ==null)){
					alert ("Please configurate the server url ");
			}
			else {
				app.router.navigate('#allData', {trigger: true});
			}
		} else {
			alert("you are not connected ! Please check your connexion ");
		}
	}
});

/*****************************************************
StationTypeView --> route "stationType"
******************************************************/	
app.Views.StationTypeView = Backbone.View.extend({
	manage: true ,
	initialize : function() {
		this.template = _.template($('#sation-type-template').html());
	}
});
/*****************************************************
StationFromFile --> route "stationFromGpx"
******************************************************/	
app.Views.StationFromFile = Backbone.View.extend({
	manage: true ,
	initialize : function() {
		this.template = _.template($('#sation-file-template').html());
		waypointsCollection = this.options.collection;
		this.usersList = this.options.usersTab;
	},
	afterRender: function (){
		var columns = new Array();
		var data = new Array();
		var attr = waypointsCollection.at(0).attributes;
		for (var prop in attr) {
			if ( prop != "used") {
				var field = {};
				field.sTitle = prop;
				columns.push(field);
			}
		}
		
		var len = waypointsCollection.length ; 
		for (var i=0; i < len ; i++){
			var attr = waypointsCollection.at(i).attributes;
			var listVals = new Array();
			for (var prop in attr) {
				if (( attr["used"]!= true ) && ( prop != "used" )){
					listVals.push (attr[prop]);
				}
			}
			if (listVals.length > 0){
				data.push(listVals);
			}
		}
		var oTable;
		$("#waypointsDataTable").dataTable( {
				"aaData":data,
				"aoColumns": columns,
				 "bFilter": true
		});

		oTable = $("#waypointsDataTable").dataTable();
		$("#waypointsDataTable").attr("style","");
		
	},
	events : {
		'click tr' : 'selectTableElement',
		'click #locationSubmit' : 'nextStep',
		"click a#displayTracks" : 'displayTracks',
		"click a#StationFromFile" : 'selectStation'
	},	
	selectTableElement : function(e){
		var ele  = $(e.target).get(0).nodeName;
		if (ele =="TD"){
			// find table id
			var table = $(e.target).parent().parent().parent().get(0).attributes["id"].nodeValue;
			// initialize datatable
			app.utils.oTable = $('#waypointsDataTable');
			var oTab = $('#waypointsDataTable').dataTable();
			// selected tr element
			var trElement = $(e.target).parent().get(0);
			//var ele2  = $(trElement).nodeName;
			if ( $(trElement).hasClass('row_selected')) {
				$(trElement).removeClass('row_selected');
				$("#locationSubmit").attr("style","display:none ;");
			}
			else {
				oTab.$('tr.row_selected').removeClass('row_selected');
				$(trElement).addClass('row_selected');
				$("#locationSubmit").attr("style","display: ;");
			}
			// get coordinates for selected station
			var anSelected = app.utils.fnGetSelected( oTab );
            if (anSelected.length !== 0) {
				var data = oTab.fnGetData(anSelected[0]);
				var pointName  = data[1];
				var wptLatitude = data[2];
				var wptLongitude = data[3];
				// pan to selected point on map
				var selectedWpt = new OpenLayers.LonLat(wptLongitude, wptLatitude);
				app.mapView.panTo(selectedWpt);	
				// if marker of selected position is not displayed, we need to add it
				var markerLayer = "null";	
				var selectedWaypoint = new NS.UI.Point({ latitude : wptLatitude, longitude: wptLongitude, label:pointName});
				app.mapView.addLayer({point : selectedWaypoint , layerName : "selected point", marker : 'img/marker2.png'});	
			}

		}
	},
	nextStep : function(e){
		var oTable = $('#waypointsDataTable').dataTable();
		//var ele  = $(e.target).get(0).nodeName;
		 var anSelected = app.utils.fnGetSelected( oTable );

        if (anSelected.length !== 0) {

			var data = oTable.fnGetData(anSelected[0]);
			var idwpt = data[0];
			var wptName = data[1];
			var wptLatitude = data[2];
			var wptLongitude = data[3];
			var wptTime = data[4];
			
			app.models.station = new app.Models.Station();
			var schema = {
				station_name:  { type: 'Text', title:'Station name'},  
				field_activity: { type: 'Text', title:'Field activity'}, 
				date_day: { type: 'Text', title:'Date'},
				time_now: { type: 'Text', title:'Time'},
				Observer_1: { type: 'Select' , title:'Observer 1', options: this.usersList, required : true },
				Observer_2: { type: 'Select' , title:'Observer 2', options: this.usersList, validators: [] },
				Observer_3: { type: 'Select' , title:'Observer 3', options: this.usersList },
				Observer_4: { type: 'Select' , title:'Observer 4', options: this.usersList },
				Observer_5: { type: 'Select' , title:'Observer 5', options: this.usersList }
			} ;
			app.models.station.constructor.schema = schema ;
			app.models.station.schema = schema ;
			app.models.station.set("station_name",wptName);
			app.models.station.set("id",idwpt);
			var nbStoredStations = app.collections.stations.length;
			// store coordinates in location model
			app.models.location = new app.Models.Location();
			app.models.location.id ="2";
			app.models.location.constructor.schema = app.models.location.schema;
			app.models.location.set("latitude",wptLatitude);
			app.models.location.set("longitude",wptLongitude);
			var waypointModel = app.collections.waypointsList.get(idwpt);
			waypointModel.set("used", true);
			waypointModel.save();
			
			
			app.global.selectedStationId = idwpt;
			app.router.navigate('stationInfos', {trigger: true});
		}
	},
	displayTracks : function(e){
		if (app.global.traksLoaded != true){
			
			app.utils.addTracks("ressources/tracks.kml", "tracks");
		}
		else {
			var layerToremove;
			for(var i = 0; i < app.mapView.map.layers.length; i++ ){
				if((app.mapView.map.layers[i].name) == "tracks" ) {
					layerToremove = app.mapView.map.layers[i];
					break;
			}
			}
			app.mapView.removeLayer(layerToremove); 
			$('a#displayTracks').text('show tracks');
			app.global.traksLoaded = false ; 
		}
	},
	selectStation : function(e){
		alert ("selection station !");
	}
});
/*****************************************************
StationPositionView --> route "entryStation"
******************************************************/	
app.Views.StationPositionView = Backbone.View.extend({
    manage: true,
		initialize : function(options) {
           this.template = _.template($('#sation-position-template').html());
    }
});
/*****************************************************
StationInfosView --> route "stationInfos"
******************************************************/	
app.Views.StationInfosView = Backbone.View.extend({
	manage: true ,
	initialize : function() {
		this.template = _.template($('#sation-infos-template').html());
	}
});

/*****************************************************
MapStationsView --> route "map-stations"
******************************************************/
app.Views.MapStationsView = Backbone.View.extend({
	manage: true ,
	initialize : function() {
	   this.template = _.template($('#map-stations-template').html());
	}
});
/*****************************************************
AlertView --> route "msgBox"
******************************************************/
app.Views.AlertView = Backbone.View.extend({
	 manage: true ,
	initialize : function() {
		this.template = _.template($('#msgBox-template').html());
		//this.template = _.template(this.templateLoader.get('msgbox'));
	}
});

/*****************************************************
View station :DataEntryLayout  --> route "data-entry"
******************************************************/

app.Views.DataEntryStationView = Backbone.View.extend({
	manage: true,
	serialize: function() {
    return this.model.toJSON();
  }

});

/*****************************************************
View protocole :DataEntryLayout  --> route "data-entry"
******************************************************/

app.Views.DataEntryProtocolView = Backbone.View.extend({
	 manage: true,
	
	initialize : function(options) {
		this.obsId = this.options.obsId ; 
	},
 
	serialize: function() {
		return this.model.toJSON();
		// set default values for fields
		
	},
	events : {
            'click a.submit' : 'commit',
			'click a#capture' : 'savePhoto'	
        },
	commit : function(e){ 
		var errors = app.form.validate();
		var photo = app.form.fields.photo_url;
		var photo_url;
		if (typeof photo != 'undefined'){
			photo_url = app.form.fields.photo_url.getValue();
		}
		if ( errors === null){
			var myObs =  new app.Models.Observation();
			var data = app.form.getValue();		
			for (var prop in data) {
				  myObs.attributes[prop] = data[prop];
			}
			// save the protocol id
			myObs.attributes.protoId = app.global.selectedProtocolId;
			myObs.attributes.protoName = app.global.selectedProtocolName;
			// set date
			var today = new Date(); 
			myObs.attributes.date = today.defaultView();
			// save the station id
			var idSelectedStation = app.global.selectedStationId ;
			var selectedStation = app.collections.stations.get(idSelectedStation);
			
			myObs.attributes.stationId = idSelectedStation;
			myObs.attributes.stationName = selectedStation.get("station_name");
			myObs.attributes.latitude = selectedStation.get("latitude");
			myObs.attributes.longitude = selectedStation.get("longitude");
			myObs.attributes.observer_1 = selectedStation.get("Observer_1");
			// add the model to observations collection
			app.collections.observations.add(myObs);
			// save the model in local storage
			//var attr = myObs.attributes;
			
						// if we modify an obs we need to delete it and generate a new obs model (new id)
			var editObsId = this.obsId;
			if (typeof  editObsId != 'undefined'){
				
				
				var obsToEdit = app.collections.observations.get(editObsId);
				//myObs.attributes.protoId = obsToEdit.get("protoId");
				//myObs.attributes.protoName = app.global.selectedProtocolName;
				myObs.attributes.stationId = obsToEdit.get("stationId");
				myObs.attributes.date = obsToEdit.get("date");
				obsToEdit.destroy();
			}
			myObs.save();
			if (typeof  editObsId != 'undefined'){
				var actualProtocol = app.global.selectedProtocolId;
				app.utils.reloadProtocols();
				app.router.navigate('##mydata', {trigger: true});
			}
			var tplmsgBox = _.template($('#data-entry-end-template').html());
			app.views.dataEntryLayout.setView(".obsStoredAlertBox", new app.Views.DataEntryEndView({template: tplmsgBox }));
			app.views.dataEntryLayout.render();	
			$("#dataEntryRow").addClass("masqued");
			$("#data-entry-end-proto-name").html(app.global.selectedProtocolName) ;
			$("#obsStoredAlertBox").parent().addClass('alertRow');
			
		} else if (typeof photo != 'undefined'){
			 if (photo_url =="" ){ alert ('Please take a photo before submitting');}
		}
	},
	savePhoto : function(){ 
			/*navigator.camera.getPicture(app.utils.onPhotoDataSuccess, app.utils.onFail, { quality: 50,
			destinationType: app.global.destinationType.DATA_URL });*/
		var destination = this.options.destinationType.FILE_URI;
		navigator.camera.getPicture(app.utils.onPhotoFileSuccess, app.utils.onFail, { quality: 50, destinationType: destination });
	}
});

app.Views.ListView = Backbone.View.extend({
	manage: true,
	tagName: "ul",
	className: "nav nav-pills nav-stacked" ,
  // Insert all subViews prior to rendering the View.
	beforeRender: function() {
    // Iterate over the passed collection and create a view for each item.
		var listView = $(this.el);  
		// tab to storage keywors (id of protocol / name)
		var keywordsTab = new Array();
		this.collection.each(function(mymodel){

			var li = '<li> <a id="btn" class="btnChoice" idProt=' + mymodel.get('id') + '><span  idProt=' + mymodel.get('id') +'>' + mymodel.get('name') + '</span></a></li>';
			listView.append(li);
			var option = {};
			option.val = mymodel.get('id');
			option.label = mymodel.get('name');
			keywordsTab.push(option);
		});
	},
	events : {
            'click #btn' : 'navigation'
        },
	navigation : function(e){ 
		e.preventDefault();
		var idSelectedProto = $(e.target).attr("idProt");
		var route = "data-entry/" + idSelectedProto ;
		app.router.navigate(route, {trigger: true});
		app.global.selectedProtocolId = idSelectedProto;
		app.global.selectedProtocolName = $(e.target).html();
	}
});

/*****************************************************
View obs saved :DataEntryLayout  
******************************************************/

app.Views.DataEntryEndView = Backbone.View.extend({
	 manage: true,
	 events : {
            'click .btnSameProt' : 'reloadForm'
        },
	reloadForm : function(){
		/*
		
		app.form = new Backbone.Form({
						model: app.collections.protocolsList.get(selectedProtocol)
		}).render();

		$('#steps').append(app.form.el);
		$('.obsStoredAlertBox').html('');
		$("#dataEntryRow").removeClass("masqued");*/
			// formulaire de saisie
		
		var selectedProtocol = app.global.selectedProtocolId;
		var currentModel = app.collections.protocolsList.get(selectedProtocol);
		currentModel.constructor.schema = currentModel.schema;
		currentModel.constructor.verboseName  = currentModel.attributes.name;
		var myView = new app.Views.ProtocolFormView({initialData:currentModel});
		app.views.dataEntryLayout.setView(".protocol",myView );
		app.views.dataEntryLayout.render();
			
		$("#protocolSubmit").on("click", $.proxy(myView.onSubmit, myView));
		$("div .form-actions").css("display","none"); 
		
		var currentModelName = currentModel.attributes.name ;
		$('#data-entry-protocol').html('<a>Station > data entry > ' + currentModelName + '</a>');
		$('.obsStoredAlertBox').html('');
		$("#dataEntryRow").removeClass("masqued");
	}
});

/*****************************************************
View mydata :layout   
******************************************************/
app.Views.MyDataFilterView= new Backbone.View.extend({
	manage: true,
	initialize : function() {
		this.template = _.template($('#my-data-filter-template').html());
	}
});

app.views.myDataLayout = new Backbone.Layout({
	template: "#my-data-layout"
});
/*****************************************************
View mydata :gridView  
******************************************************/
app.Views.MyDataGridView = Backbone.View.extend({
	mycollection : "",
	filtredCollection:"",
	manage: true,
	initialize : function(options) {
	},
	events : {
		'click .go' : 'filterDate',
		'click .prevDate': 'prevDate',
		'click .nextDate':'nextDate',
		'click .tabControl' : 'displayTab',
		'click .accordion-toggle': 'elementVisibility',
		'click tr' : 'selectTableElement',
		'click .delObservation' : 'deleteObservation',
		'click .editObservation' : 'editObservation'
    },
	filterDate : function(){ 
		// initialize view
		/*var tplTabControlView = _.template($('#my-data-tabControl-template').html()); 
		app.views.myDataLayout.setView(".obsContainer", new app.Views.TabControlView({template :tplTabControlView, collection: app.collections.observations, protoIdList : protoIdList}));
		app.views.myDataLayout.render();*/
		$(".obsContainer").html("<div id='myDataDelObs' class='masqued btn-group'><a class='btn primary icon delObservation' style='float:left;'>Delete</a><a class='btn primary icon editObservation'>Edit</a></div><br/><br/><ul class='nav nav-tabs'><li class='active'><a class='tabControl'>list</a><div class='obsList content tabElement'></div></li>"
								+" <li><a class='tabControl'>map</a>"
								+ "<div id='map' class='masqued tabElement'></div></li></ul></div>");	
		var obsCollection = this.options.collection;
		var selectedDate = $(".datepicker").val();
		// filter observations collection with selected data
		var filteredCollection = new app.Collections.Observations();
		obsCollection.each(function(model) {
			if(model.attributes.date == selectedDate) {
				filteredCollection.add(model);
			}
		});
		this.filtredCollection = filteredCollection ;
		var protocolsList = this.options.protoIdList;
		
		$(".obsList").html('<div class="accordion"></div>' );

		// get stations number for selected date
		var tabStationsList = new Array();
		var distinctStationsId = new Array();
		filteredCollection.each(function(model) {
			var stationId = model.attributes.stationId;
			tabStationsList.push(stationId);
		});
		distinctStationsId = tabStationsList.distinct();
		var nbStations = distinctStationsId.length;
		// display number of stations 
		$("#mydataNbStations").html(nbStations);
		for ( var j=0; j < protocolsList.length; j++){
			//$('.dataTable').dataTable();
			var html ="";
			var columns = new Array();
			var data = new Array();
			var elementId ;
			var collectionForProtocolType = new app.Collections.Protocols();
			filteredCollection.each(function(model) {
				  if(model.attributes.protoId == protocolsList[j]) {
				
					 collectionForProtocolType.add(model);
				  }
			});
			var nbmodels = collectionForProtocolType.length ; 
			if (nbmodels > 0 ){
			
				var protocolName = collectionForProtocolType.at(0).attributes.protoName;
				var protocolid = collectionForProtocolType.at(0).attributes.protoId;
				elementId = "accordionElement" + protocolid ;
				html += '<div class="accordion-group">' + '<div class="accordion-heading"><span class="accordion-toggle collapsed protocolTitle">'+ protocolName + '</span></div><div class="accordion-body collapse"  id="'+ elementId + '">';
				var attr = collectionForProtocolType.at(0).attributes;
				for (var prop in attr) {	
					if ( (prop !="data.multispecies") && (prop !="name") && (prop !="protoId") && (prop !="protoName")  && (prop !="Photo") && (prop !="schema") && (prop !="id") && (prop !="keywords")){
						var field = {};
						field.sTitle = prop;
						columns.push(field);
					}
				}
				// id column in the last position
				var field2 = {};
				field2.bVisible = false ;
				field2.sTitle = "id";
				columns.push(field2);
		   
				var len = collectionForProtocolType.length ; 
				var listVals = new Array();
				for (var i=0; i < len ; i++){
					var attr = collectionForProtocolType.at(i).attributes;
					listVals = new Array();
					// parcourir la table des noms de colonnes et pour chaque champ chercher la valeur de l'enregistrement 
					var nbChamps = columns.length;
					for (var k=0; k< nbChamps; k++){
						var fieldName = columns[k].sTitle;
						// parcourir le model d'observation et chercher la propriete qui correspond à celle selectionnée
						for (var prop in attr) {
							if ( prop ==fieldName){
								var value = attr[prop];
								//if (value == 'undefined'){value ='null';}
								listVals.push(value);
							}
						}	
					}
					if (listVals.length > 0){
						data.push(listVals);
					}
				}

				html += "</div></div>";
				$(".accordion").append(html);

				// create dataTable for the protocol	
				var tableId = elementId + "DataTable";
				//$(elementId).html('');
				$("#" + elementId).html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="' + tableId + '"></table>');	
				//$("#" + tableId).dataTable();
				var oTable;
				
				$("#" + tableId).dataTable( {
					"aaData":data,
					"aoColumns": columns,
					"bAutoWidth": false,
				});

				oTable = $("#" + tableId).dataTable();
				$("#" + tableId).attr("style","");
			}
		}
		// init map div
		$('#map').html();
		app.point = new OpenLayers.LonLat(5.37,43.29);
	},
	prevDate : function(e){ 
		var selectedDate = $('input[name*="date_day"]').val();
		var tabDate = selectedDate.split('/');
		var d = new Date(); 
		var d2 = new Date(); 
		var MM = parseInt(tabDate[0],10);    
		var DD = parseInt(tabDate[1], 10);
		var YYYY = parseInt(tabDate[2], 10);	
		// set MM/DD/YYYY   MM ( january -> 0)
		d.setMonth(MM - 1);
		d.setDate(DD);
		d.setFullYear(YYYY);
		var j = d.getDate(); 
		d = d.setDate(j- 1);  
		d = new Date(d);     
		// reformat date in MM/DD/YYYY
		var newDate = d.defaultView();
		$('input[name*="date_day"]').val(newDate);	
		$('a.nextDate').attr('style','display:;');
	},
	nextDate : function(e){ 

		var selectedDate = $('input[name*="date_day"]').val();
		var tabDate = selectedDate.split('/');
		var d = new Date();  
		var d2 = new Date(); 
		var MM = parseInt(tabDate[0],10);
		var DD = parseInt(tabDate[1],10);
		var YYYY = parseInt(tabDate[2]);	
		// set MM/DD/YYYY   MM ( january -> 0)
		d.setMonth(MM - 1);
		d.setDate(DD);
		d.setFullYear(YYYY);
		var j = d.getDate(); 
		d = d.setDate(j + 1);  
		d = new Date(d);     
		// reformat date in MM/DD/YYYY
		var newDate = d.defaultView();
		$('input[name*="date_day"]').val(newDate);	
		// deable button if new date = date now
		var dateNow = d2.defaultView();
		if (dateNow == newDate ){
			$('a.nextDate').attr('style','display:none;');
		}
	},
	displayTab : function(e){ 

		var targetElement = $(e.target).parent();
		var classAttrs  = $(e.target).parent().attr("class");
		var elementTab = $(targetElement).find('a').eq(0).html();
		var collection = this.filtredCollection ;
		var len = collection.length ;
			
		if (elementTab == "map") {
			// check if the map is initialized
			var content = $('#map').html();
			if (content ==""){
				$('#map').css('width', '800px');
				$('#map').css('height', '600px');
				$('#navigation').removeClass("masqued");

				if (len > 0){
					app.mapView = app.utils.initMap();
					// add waypoints layer based on the waypoints collection 
					app.mapView.addLayer({collection : collection , layerName : "Observations"});	
				} else {
						$("#map").html("<br/>No data to display");
				}
			}
		}
		else {
			$('#navigation').addClass("masqued");
			if (len == 0){
				$(".obsList").html("<br/>No data to display");
			}
			
		}
		
		if ((typeof classAttrs == 'undefined') || (classAttrs =="")){

			$(targetElement).addClass("active");
			$(targetElement).next().removeClass("active");
			$(targetElement).prev().removeClass("active");

			$(targetElement).find('div').eq(0).addClass("visible");
			$(targetElement).find('div').eq(0).removeClass("masqued");
			$(targetElement).next().find('div').eq(0).addClass("masqued");
			$(targetElement).next().find('div').eq(0).removeClass("visible");
			$(targetElement).prev().find('div').eq(0).addClass("masqued");
			$(targetElement).prev().find('div').eq(0).removeClass("visible");
			
		}
		else if (typeof classAttrs != 'undefined'){
			// activ element

			$(targetElement).next().removeClass("active");
			$(targetElement).prev().removeClass("active");
			$(targetElement).find('div').eq(0).addClass("visible");
			$(targetElement).find('div').eq(0).removeClass("masqued");
			$(targetElement).next().find('div').eq(0).addClass("masqued");
			$(targetElement).prev().find('div').eq(0).addClass("masqued");
			
		}
	},
	elementVisibility : function(e){ 
		// find the div witch contains details to show it
		var targetElement = $(e.target).parent().parent().children('div').eq(1);
		var classAttrs = $(targetElement).attr("class");
		if (typeof classAttrs != 'undefined'){
			var str = classAttrs.split(" ");
			var collaspeVal = str[1];
			//$(elem).css('display', 'block');
			//alert (collaspeVal);
			switch (collaspeVal)
			{
			case "collapse":
				$(targetElement).removeClass("collapse");
				$(targetElement).addClass("collapsed");
			break;
			case "collapsed": 
				$(targetElement).removeClass("collapsed");
				$(targetElement).addClass("collapse");	
			break;
			}
		}
	},
	selectTableElement : function(e){ 
		var ele  = $(e.target).get(0).nodeName;
		//alert (ele);
		if (ele =="TD"){
			// find table id
			var table = $(e.target).parent().parent().parent().get(0).attributes["id"].nodeValue;
			// initialize datatable
			app.utils.oTable = $('#' + table);
			var oTab = $('#' + table).dataTable();
			// selected tr element
			var trElement = $(e.target).parent().get(0);
			//var ele2  = $(trElement).nodeName;
			if ( $(trElement).hasClass('row_selected')) {
				$(trElement).removeClass('row_selected');
				$('#myDataDelObs').addClass("masqued");
			}
			else {
				oTab.$('tr.row_selected').removeClass('row_selected');
				$(trElement).addClass('row_selected');
				$('#myDataDelObs').removeClass("masqued");
            //$(this).addClass('row_selected');
			}
		}
	},
	deleteObservation : function(e){ 
		var r=confirm("Are you sure you want to delete this observation ?");
		if (r==true) {
			var oTable = $(app.utils.oTable).dataTable();
			var ele  = $(e.target).get(0).nodeName;
			 var anSelected = app.utils.fnGetSelected( oTable );
			if ( anSelected.length !== 0 ) {
				var data = oTable.fnGetData( anSelected[0] );
				var idObservation = data[data.length - 1];
				oTable.fnDeleteRow( anSelected[0] );
				//var myCollection = app.collections.observations ;
				//myCollection.remove(myCollection.get(idObservation));
				var myObsModel = new app.Models.Observation();
				myObsModel = app.collections.observations.get(idObservation);
				myObsModel.destroy();
				$('#myDataDelObs').addClass("masqued");
			}
		}
	},
	editObservation : function(e){
		var oTable = $(app.utils.oTable).dataTable();
		var ele  = $(e.target).get(0).nodeName;
		 var anSelected = app.utils.fnGetSelected( oTable );
        if ( anSelected.length !== 0 ) {
			var data = oTable.fnGetData( anSelected[0] );
			var idObservation = data[data.length - 1];
			$('#myDataDelObs').addClass("masqued");
			var route = '#dataEdit/' + idObservation ;
			app.router.navigate(route, {trigger: true});
		}
	}
});
/*****************************************************
View mydata :TabControlView  
******************************************************/
/*
app.Views.TabControlView = Backbone.View.extend({
	manage: true
	}
});

*/
/*****************************************************
update layout : main view  
******************************************************/
app.Views.UpdateDataView= Backbone.View.extend({
	manage: true,
	events : {
			'click .gpxLoading' : 'gpxLoading',
			'click .updateProtos' : 'updateProtocols',
			'click .updateProtosFromFile' : 'updateProtocolsFromFile',
			'click #btnFileSelection' : 'gpxFileSelection'
    },
	updateProtocols : function(e){ 
		var tplAlert = _.template($('#update-data-alert-template').html()); 
		app.views.dataUpdateLayout.setView(".updateDataAlert", new app.Views.UpdateDataAlertView({template: tplAlert , collection:app.collections.protocolsList, source:"server" }));
		app.views.dataUpdateLayout.render();	
		$(".updateDataAlert").addClass("message-dialog border-color-red");
		$("#updateDataGridView").addClass("masqued");
	},
	updateProtocolsFromFile : function(){ 
		var tplAlert = _.template($('#update-data-alert-template').html()); 
		app.views.dataUpdateLayout.setView(".updateDataAlert", new app.Views.UpdateDataAlertView({template: tplAlert , collection:app.collections.protocolsList, source:"file", fileSystem : app.global.fileSystem }));
		app.views.dataUpdateLayout.render();	
		$(".updateDataAlert").addClass("message-dialog border-color-red");
		$("#updateDataGridView").addClass("masqued");
	},
	gpxLoading : function(){ 
		$("#btnSelection").attr("style","display:none;");
		$("#btnFileSelection").attr("style","display: ;");
	},
	gpxFileSelection  : function(){ 

		var selected_file = document.querySelector('#file');
		//var selected_file = $('#file').get(0).files[0];
		selected_file.onchange = function() {
			try{
				var reader = new FileReader();
				var xml;
				var fileName = this.files[0].name;
				var tab = fileName.split(".");
				var fileType = tab[1];
				fileType = fileType.toUpperCase();
				if (fileType != "GPX"){
					alert ("File type is not supported. Please select a 'gpx' file" );
				}
				else {
						var lastUpdate = this.files[0].lastModifiedDate ;
						var gpxFileName = localStorage.getItem("gpxFileName"); 
						var gpxLastModif = localStorage.getItem("gpxLastModif"); 

						if ((gpxFileName != "null") && (gpxFileName == fileName) && (gpxLastModif == lastUpdate )){
						 alert ("this file correspond to last loaded version !");
						}						
						else if (gpxLastModif != lastUpdate ){							
							reader.onload = function(e, fileName) {
								xml = e.target.result;
								app.utils.loadWaypointsFromFile(xml);
							};
							localStorage.setItem("gpxFileName", fileName);
							localStorage.setItem("gpxLastModif",lastUpdate);
						}
					}
				reader.readAsText(selected_file.files[0]);
				
			} catch (e) {
				alert ("File API is not supported by this version of browser. Please update your browser and check again, or use another browser"); 
			}
		}
	} 
});
/*****************************************************
update layout : alert view  
******************************************************/	 
	 
app.Views.UpdateDataAlertView = Backbone.View.extend({
	 manage: true,
	 initialize: function(options){
		var protocolsCollection = this.options.collection ; 
		var listview = new app.Views.ProtosListView({collection:protocolsCollection});
		this.setView(".listviewProtocols", listview);
	 },

	events : {
            'click .validate' : 'validate', 
			'click .cancel' : 'cancel'
    },
	validate :function(){ 
		var source = this.options.source;
		// hide alert
		this.remove();
		$(".updateDataAlert").removeClass("message-dialog border-color-red");
		$(".updateDataAlert").css({"background-color" : ""});
		$("#updateDataGridView").removeClass("masqued");
		// delete stored data
		app.utils.clearCollection(app.collections.protocolsList);
		app.utils.clearCollection(app.collections.stations);
		app.utils.clearCollection(app.collections.observations);
		if (source =="server"){
			// load data
			var initalizers = [];
			initalizers.push(app.utils.loadProtocols("ressources/XML_ProtocolDef_eReleve.xml"));
			//initalizers.push(app.utils.loadProtocols("http://82.96.149.133/html/ecoReleve/ecoReleve-data/ressources/XML_ProtocolDef2.xml"));
			$.when.apply($, initalizers).done(function() {
				alert ("Protocols updated !");
			});
		} else {
			var fileSystem = this.options.fileSystem;
			fileSystem.root.getFile("XML_ProtocolDef_eReleve.xml", null, app.utils.gotFileEntry, app.utils.onError);
		}
	},
	cancel : function(){ 
	
		this.remove();
		$(".updateDataAlert").removeClass("message-dialog border-color-red");
		$(".updateDataAlert").css({"background-color" : ""});
		$("#updateDataGridView").removeClass("masqued");
	}

});
/*****************************************************
 update view, listview of Protocols in alert message
**********************************************************/
app.Views.ProtosListView = Backbone.View.extend({
	manage: true,
	tagName: "ul",
	className: "nav nav-pills nav-stacked" ,
  // Insert all subViews prior to rendering the View.
	beforeRender: function() {
    // Iterate over the passed collection and create a view for each item.
		var listView = $(this.el);  
		this.collection.each(function(mymodel){
			var li = '<li><a id="btn"><span>' + mymodel.get('name') + '</span></a></li>';
			listView.append(li);
		});
		
	}
	
});
/**************************************************
 config Layout, config list view 
**********************************************************/
app.Views.ConfigListView = Backbone.View.extend({
	manage: true,
	events : {
            'click .users' : 'showUsersList',
			'click #configUsers' : 'configUsers',
			'click #serverUrl' : 'displayServerUrl',
			'click #configProtos' : 'configProtos'
			//'click #editServerUrl': 'editServerUrl',
			
    },
	showUsersList :function(){ 
		var tplview = _.template($('#users-template').html()); 
		app.views.configdataLayout.setView(".configDetails", new app.Views.Users({ template : tplview, collection: app.collections.users }));
		app.views.configdataLayout.render();
	},
	configUsers :function(){
		// check internet connexion
		if (navigator.onLine == true){
			// check if server url is configurated
			var serverUrl = localStorage.getItem( "serverUrl");
			if ((serverUrl === undefined) || (serverUrl ==null)){
				alert ("Please configurate the server url");
			} else {
				var r=confirm("Are you sure you want to update users?");
				if (r==true) {
						$("#configInfos").text("Checking server access ...");
						// call WS users
						var serverUrl = localStorage.getItem("serverUrl");
						var link = serverUrl + "/user/listv";
						alert(link);
						$.ajax({
							type: "GET",
							url: link,
							dataType: "text",
							success: function(data) { 
								var myObject = JSON.parse(data);
								// init users collection
								app.utils.clearCollection(app.collections.users);
								for (var i=0; i < myObject.length ; i++){
									var name = myObject[i].Nom ; 
									var firstName = myObject[i].Prenom ; 
									name = name + ' ' + firstName ;
									var newUser = new app.Models.User();
									newUser.name = name;
									newUser.attributes.name = name;
									app.collections.users.add(newUser);
									newUser.save();	
								}
								alert (" users list is updated !");
								$("#configInfos").text("");
							}, error : function (xhr, ajaxOptions, thrownError) {
								alert ("Server is not accessible !");
								$("#configInfos").text("");
								//alert(xhr.status);
								//alert(thrownError);
						  }
						}); 
				} else {
					//x="You pressed Cancel!";
					$("#configInfos").text("");
				} 
			}
		} else {
		alert("you are not connected ! Please check your connexion ");
		}
	},
	displayServerUrl :function(){
		$(".tilesGrid").addClass("masqued");
		$(".popup").removeClass("masqued");
		var serverUrl = localStorage.getItem("serverUrl");
		if ( serverUrl =="null" ){
			$("#spanServerUrl").text("nothing");
		} else {
			$("#spanServerUrl").text(serverUrl);
		}
	},
	configProtos :function(){
		var r=confirm("Are you sure you want to update protocols?");
		if (r==true) {
			app.router.navigate('#configProtos', {trigger: true});
		} 
	}
});
/****************************************************
	config Layout, config protocols 
******************************************************/
app.Views.ConfigProtocols = Backbone.View.extend({
	manage: true
});
/*****************************************************
upload data   
******************************************************/
app.Views.ConfigUrlView = Backbone.View.extend({
	manage: true,
}); 
app.Views.UploadDataView= Backbone.View.extend({
	manage: true,
	events : {
		'click .saveInLocalFile' : 'doAppendFile'
    },
	doAppendFile : function(e){
	
		var protocolsList = this.options.protoIdList;
		var obsCollection = this.options.collection;
		var stations = this.options.stations;
		var ln = protocolsList.length;
		var fileSystem = this.options.fileSystem;
		// export observations to file
		for ( var j=0; j < ln; j++){
			var collectionForProtocolType = new app.Collections.Protocols();
			obsCollection.each(function(model) {

				  if(model.attributes.protoId == protocolsList[j]) {
						collectionForProtocolType.add(model);
				  }
			});
			var nbmodels = collectionForProtocolType.length; 
			if (nbmodels > 0 ){

				var protocolName = collectionForProtocolType.at(0).attributes.protoName;
				var protocolid = collectionForProtocolType.at(0).attributes.protoId;
				// create a file per protocol
				
				//app.global.dataToSave = data;
				//fileSystem.root.getFile(protocolName + ".csv", {create:true}, app.utils.appendFile, app.utils.onError);
				var textToWrite ="";
				//var newCollection = collectionForProtocolType[j];
				var attr = collectionForProtocolType.at(0).attributes;
				for (var prop in attr) {
					if (prop !="Photo"){
						textToWrite += prop;
						textToWrite += ";";
					}
				}
				textToWrite += "\n";
				// insert data from each collection (each observation) in a new line of the file
				var len = collectionForProtocolType.length ; 
				for (var i=0; i < len ; i++){
					var attr = collectionForProtocolType.at(i).attributes;
					for (var prop in attr) {
						if (prop !="Photo"){
							textToWrite += attr[prop];
							textToWrite += ";";
						}
					}
					textToWrite += "\n";
				}
				// text to put in file
				app.utils.appendFile.textToWrite = textToWrite;
				// create the file
				fileSystem.root.getFile(protocolName + ".csv", {create:true}, app.utils.appendFile, app.utils.onError);
			}
		}
		// export stations to file
		var lnStations = stations.length;
		for ( var j=0; j < lnStations; j++){
			var textToWrite ="";
				// generate header of file (columns names)
				var attr = stations.at(0).attributes;
				for (var prop in attr) {
					textToWrite += prop;
					textToWrite += ";";
				}
				textToWrite += "\n";
				// insert data from each station  in a new line of the file
				for (var i=0; i < lnStations ; i++){
					var attr = stations.at(i).attributes;
					for (var prop in attr) {
							textToWrite += attr[prop];
							textToWrite += ";";
					}
					textToWrite += "\n";
				}
				// text to put in file
				app.utils.appendFile.textToWrite = textToWrite;
				// create the file
				fileSystem.root.getFile("stations.csv", {create:true}, app.utils.appendFile, app.utils.onError);
		}
	}

}); 
/** users view    ***************/
app.Views.Users = Backbone.View.extend({
	manage: true,
	initialize: function(options){
		//this.model.bind('remove', this.remove, this);
		this.collection.on('change', this.afterRender, this);
	},
	events : {
		'click .add' : 'newUser'
    },
	afterRender: function(options) { 
		var users = this.options.collection.models,
    		model;
		if (users && users.length > 0) {
			$("#users").html("");
			for (var i = users.length - 1; i >= 0; i--) {
				model = users[i];
				this.addUser(model);
				/*var div = $('<div>').appendTo($('#users', this.el));
				new app.Views.UserEntry({ el : div, model: model, parentView: this }).render();
			*/}
		} else if (users && users.length === 0) {
			var html = '<div style="margin-top:10px;" class="ftColr-white">There are no users currently.</div>';
			$("#users").append(html);
		}
		return false;
	},
	addUser: function(model) {
		var view = new app.views.User({model: model});
		//$("#users").append(view.render().$el);
		var callback = $.proxy(function() {
			$("#users").append(this.el);
		}, view);0
		view.render().done(callback);
	},
	newUser : function() {
		var tplmsgBox = _.template($('#data-config-newUser-template').html());
		app.views.configdataLayout.setView(".configNewUserAlertBox", new app.views.NewUser({template: tplmsgBox }));
		app.views.configdataLayout.render();
		$("#configConfigList").addClass("masqued");
		$("#configConfigDetails").addClass("masqued");
		return false;
	}
});
/**  user view ****************/
app.views.User = Backbone.View.extend({
	manage: true,
	template: "#viewUser-template",
	initialize: function(options){
		//this.model.bind('remove', this.remove, this);
		this.model.on('destroy', this.remove, this);
	},
    serialize: function() {
		var name = this.model.attributes.name;
		var cid = this.model.cid;
		return { name :name, cid :cid };
    },
	events : {
            'click .edit' : 'destroy'
    },
	destroy : function () {
		this.model.destroy();
	},
	remove : function () {
		$(this.el).remove();
	}
});
app.views.NewUser = Backbone.View.extend({
	manage: true,
	events : {
            'click .cancel' :  'cancel',
			'click .submit' :  'addNewUser',
			'click #userName' :  'clearField'
	},
	cancel : function () {

		app.views.configdataLayout.removeView(".configNewUserAlertBox");
		$("#configConfigList").removeClass("masqued");
		$("#configConfigDetails").removeClass("masqued");
	},
	addNewUser : function () {
		var userName = $('#userName').val();
		
		if (( userName !== "") && ( userName !== "Please put new user !")){
			var newUser = new app.Models.User();
			newUser.name = userName;
			newUser.attributes.name = userName;
			app.collections.users.add(newUser);
			newUser.save();
			app.views.configdataLayout.removeView(".configNewUserAlertBox");
			$("#configConfigList").removeClass("masqued");
			$("#configConfigDetails").removeClass("masqued");
		} else {
			$('#userName').val("Please put new user !");
		
		}
	},
	clearField : function () {
		$('#userName').val("");
	}

});
/**  individus view ****************/
app.Views.Individus = Backbone.View.extend({
	manage: true,
	afterRender: function(options){
		var dataTable = this.options.data;
		var columns = new Array();
		var data = new Array();
		// read columns names
		var attr = dataTable[0];
		var columnList ="";
		var j=0;
		for (var prop in attr) {
			var field = {};
				field.sTitle = prop;
				j+=1;
				//field.bVisible = false ;
			if (j>5) {
				field.bVisible = false ;
			}	
				
				//var fieldName = new app.TableField({name: prop});
				//fieldName.name = prop ;
				//********html += template(fieldName.toJSON());
				// hide id field
				
				columns.push(field);
		}
		this.columns = columns;
		// buid an array for columns labels
		
		var colLabel = new Array();
		var len = columns.length;
		for (var i=0; i<len; i++){
			var label = columns[i].sTitle;
			colLabel.push(label);
		
		}
		// content of table
		var len = dataTable.length ; 
		for (var i=0; i < len ; i++){
		//this.collection.each(function(model) {	
			//*********html += "<tr>";
			var attr = dataTable[i];
			var listVals = new Array();
			for (var prop in attr) {
				var fieldName = new app.TableField({value: attr[prop]});
				//*********html += templateData(fieldName.toJSON());
				var field = {};
				listVals.push (attr[prop]);
			}
			if (listVals.length > 0){
				data.push(listVals);
			}
		}
		this.data = data;
		// generate a "dataTable" to display loaded data in a table
		var oTable;	

			//$("#indivDataTable").dataTable({"bRetrieve":"true"});
			$("#indivDataTable").dataTable( {
				"aaData":data,
				"aoColumns": columns,
				"bDestroy": true
			});

			oTable = $("#indivDataTable").dataTable();
	},
	events : {
			'click tr' : 'selectTableElement',
			'click .submit' : 'filterColumns'
	},
	selectTableElement : function(e){ 
	var ele  = $(e.target).get(0).nodeName;
		if (ele =="TD"){
			// find table id
			var table = $(e.target).parent().parent().parent().get(0).attributes["id"].nodeValue;
			// initialize datatable
			app.utils.oTable = $('#indivDataTable');
			var oTab = $('#indivDataTable').dataTable();
			// selected tr element
			var trElement = $(e.target).parent().get(0);
			//var ele2  = $(trElement).nodeName;
			if ( $(trElement).hasClass('row_selected')) {
				$(trElement).removeClass('row_selected');
			}
			else {
				oTab.$('tr.row_selected').removeClass('row_selected');
				$(trElement).addClass('row_selected');
			}
		}
	},
	filterColumns: function(e){ 
		$('#dataTableRow').hide();
		$('#dataFilterRow').html('');
		$('#msgColumnsModif').attr('style','display:none;');
		// get view columns to make the form (1 field checkbox)
		var columns = this.columns;
		var listColumns = new Array();
		var len = this.columns.length ;
		for (var j=0; j < len ; j++){	
			var attr = this.columns[j];
			listColumns.push(attr.sTitle);
		}
		// Make the form UI

		var formModel = new app.Models.IndivColumnsModel();
		var schema = {
				Columns:{ type: 'CheckBox', title:'Columns', options : listColumns } 
		};
		formModel.schema = schema ;
		formModel.constructor.schema = formModel.schema;
		formModel.constructor.verboseName  = "Columns";			
		var myView = new app.Views.IndivListColForm({initialData:formModel, columns : columns});
		app.views.indivLayout.setView("#dataFilterRow",myView );
		//$('#dataFilterRow').append(myView.el);
		app.views.indivLayout.render();
		$('#submitForm').attr("style", "display:''");
		$('.form-actions').hide();
		$("#submitForm").on("click", $.proxy(myView.onSubmit, myView));
		
	},
	
});
app.Views.AllData = Backbone.View.extend({
	manage: true,
	afterRender: function(options){	
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
                    var xmlDoc=$.parseXML(xmlresp),
                    $xml=$(xmlDoc),
					$protocoles=$xml.find("protocole");
					// init select control with empty val
					$('<option id= 0 ></option>').appendTo('#select_id_proto');
					$protocoles.each(function(){
						$('<option id=\"'+$(this).attr('id')+'\" value=\"'+$(this).text()+'\">'+$(this).text()+'</option>').appendTo('#select_id_proto');
					});
					$("#select_id_proto option[id='0']").attr('selected','selected');
            }
		});
		
		var myDataTable = $("#myDataTable")[0];
		var widthmyDataTable = myDataTable.clientWidth;
		var widthallDataContent = widthmyDataTable - 260 ; 
			
		$('#allDataMap').css('width', (widthallDataContent * 0.98) +'px'); //$('#map').css('width', '700px');
		$('#map').css('width', (widthallDataContent * 0.97) +'px'); //$('#map').css('width', '700px');

		$(window).bind('resize', function () { 
			myDataTable = $("#myDataTable")[0];
			widthmyDataTable = myDataTable.clientWidth;
			widthallDataContent = widthmyDataTable - 260 ; 
			$('#allDataContent').css('width', widthallDataContent + 'px');
			
			// check if datatable is not hided and resize map if window is resized
			var displayed = $("#allDataList").is(":visible");
			if (displayed){			
				$('#map').css('width', (widthallDataContent * 0.63) +'px'); //$('#map').css('width', '700px');
				//console.log ("widthallDataContent : " + widthallDataContent );
				$('#allDataMap').css('width', (widthallDataContent * 0.65) +'px'); //$('#map').css('width', '700px');
				$('#allDataList').css('width', (widthallDataContent * 0.3) +'px'); //$('#map').css('width', '700px');
			} 

		});

		$("#allDataList").hide();

		var  point = new NS.UI.Point({ latitude : 0, longitude: 0, label:""});
		this.map_view = app.utils.initMap(point, 3);

		$( "label, input,button, select " ).css( "font-size", "15px" );
		//datalist of taxons
		app.utils.fillTaxaList();

	},events : {
		'change #select_id_proto' : 'updateTable',
		'click #btnY-1' :'updateDate1an',
		'click #btnReset' : 'resetdate',
		'click #btnY-2' : 'updateDate2ans',
		'click #btnD-1' : 'updateDateHier',
		'keyup #datedep' : 'updateDateDep',
		'keyup #datearr' : 'updateDateArr',
		'click #searchBtn ' : 'search',
		'click tr' : 'selectTableElement',
		'click #allDataInfosPanelClose' : 'closeInfosPanel',
		//'change input#updateSelection' : 'updateTableForSelecedFeatures'
		'click #refreshTable' : 'updateTableForSelecedFeatures'
	},
	updateTable: function(){
		//this.updateControls();
		$("#id_proto").attr("value",($("#select_id_proto option:selected").attr('id')));
	},
	updateDate1an : function(){
		$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
		$("#btnY-1").css({"background-color" : "rgb(150,150,150)"});
		$('#idate').text("1ans");	
	},
	updateDate2ans : function(){
		$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
		$("#btnY-2").css({"background-color" : "rgb(150,150,150)"});
		$('#idate').text("2ans");	
	},
	resetdate : function(){
		$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
		$("#btnReset").css({"background-color" : "rgb(150,150,150)"});
		$('#idate').text("");
	},
	updateDateHier : function(){
		$(".allData-criteriaBtn").css({"background-color" : "#CDCDCD"});
		$("#btnD-1").css({"background-color" : "rgb(150,150,150)"});
		$('#idate').text("hier");
	},
	updateDateDep : function(){
		var regex = new RegExp("^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$");
		var regex2 = new RegExp("^[0-9]{4}$");
		var regex3 = new RegExp("^[0-9]{4}-(0[1-9]|1[012])$");
		var datedep=$("#datedep").attr('value');
		var datearr=$("#datearr").attr('value');
		
		if(((regex.test(datedep) && regex.test(datearr)) || (regex2.test(datedep) && regex2.test(datearr)) || (regex3.test(datedep) && regex3.test(datearr)) ) && datedep<=datearr)
			$("#dateinter").removeAttr("disabled");
		else
			$("#dateinter").attr("disabled","disabled");
	},
	updateDateArr : function(){
		var regex = new RegExp("^[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$");
		var regex2 = new RegExp("^[0-9]{4}$");
		var regex3 = new RegExp("^[0-9]{4}-(0[1-9]|1[012])$");
		var datedep=$("#datedep").attr('value');
		var datearr=$("#datearr").attr('value');
		
		if(((regex.test(datedep) && regex.test(datearr)) || (regex2.test(datedep) && regex2.test(datearr)) || (regex3.test(datedep) && regex3.test(datearr)) ) && datedep<=datearr)
			$("#dateinter").removeAttr("disabled");
		else
			$("#dateinter").attr("disabled","disabled");
	},
	search : function(){
		this.updateControls();
		var datedep=$("#datedep").attr('value');
		var datearr=$("#datearr").attr('value');
		$('#idate').text(datedep+";"+ datearr);
		app.utils.updateLayer(this.map_view);
		var params = 'id_proto='+$("#id_proto").attr("value")+"&place="+$("#place").attr("value")+"&region="+$("#region").attr("value")+"&idate="+$('#idate').text()+"&taxonsearch="+$("#iTaxon").attr("value");
		app.utils.filldatable(params);
		
	},
	updateZoom : function(){ 
		app.utils.updateLayer(this.map_view);
	},
	updateData : function(e){ 
		var name = e.target.value;
		if(e.keyCode==13){
			app.utils.updateLayer(this.map_view);
			app.utils.filldatable();
		}
	},
	updateControls : function (){
		$("#allDataList").removeAttr('style');
		$('#allDataCluster').removeAttr('style');
		var myDataTable = $("#myDataTable")[0];
		var widthmyDataTable = myDataTable.clientWidth;
		var	widthallDataContent = widthmyDataTable - 260 ; 
		if (widthallDataContent < 850 ){widthallDataContent = widthallDataContent - 20 ;} 
		$('#map').css('width', (widthallDataContent * 0.60) +'px'); //$('#map').css('width', '700px');
		//console.log ("widthallDataContent : " + widthallDataContent );
		$('#allDataMap').css('width', (widthallDataContent * 0.62) +'px'); //$('#map').css('width', '700px');
		$('#allDataList').css('width', (widthallDataContent * 0.3) +'px'); //$('#map').css('width', '700px');
	},	
	selectTableElement : function(e){
		var ele  = $(e.target).get(0).nodeName;
		if (ele =="TD"){
			// find table id
			var table = $(e.target).parent().parent().parent().get(0).attributes["id"].nodeValue;
			// initialize datatable
			app.utils.oTable = $('#allDataBoxList');
			var oTab = $('#allDataBoxList').dataTable();
			// selected tr element
			var trElement = $(e.target).parent().get(0);
			if ( $(trElement).hasClass('row_selected')) {
				$(trElement).removeClass('row_selected');
				$("#locationSubmit").attr("style","display:none ;");
			}
			else {
				oTab.$('tr.row_selected').removeClass('row_selected');
				$(trElement).addClass('row_selected');
				$("#locationSubmit").attr("style","display: ;");
			}
			// get coordinates for selected station
			var anSelected = app.utils.fnGetSelected( oTab );
            
			if (anSelected.length !== 0) {
				$("#allDataInfosPanel").css({"display":"block"});
				var data = oTab.fnGetData(anSelected[0]);
				var content ="<h3>details</h3>";
				content += " <p class='allDataInfosTitles'> id <br/><span>" + data[0] + "</span></p>";
				content += "<p class='allDataInfosTitles'> activity<br/><span>" + data[1] + "</span></p>";
				content += "<p class='allDataInfosTitles'> name  <br/><span>" + data[2] + "</span></p>";
				content += "<p class='allDataInfosTitles'> date <br/><span>" + data[3] + "</span></p>";
				content += "<p class='allDataInfosTitles'> region <br/><span>" + data[4] + "</span></p>";
				content += "<p class='allDataInfosTitles'> place <br/><span>" + data[5] + "</span></p>";
				content += "<p class='allDataInfosTitles'> latitude <br/><span>" + data[6] + "</span></p>";
				content += "<p class='allDataInfosTitles'> longitude <br/><span>" + data[7] + "</span></p>";
				$("#allDataInfosPanelContent").html(content);
			} else {
				$("#allDataInfosPanel").hide();
			}
			
		}
	}
	, closeInfosPanel : function(){
		$('#allDataInfosPanel').hide();
	},
	updateTableForSelecedFeatures : function(evt){
		//debugger;
		var bbox = "bbox=" + $("#updateSelection").val();
		var params = 'id_proto='+$("#id_proto").attr("value")+"&place="+$("#place").attr("value")+"&region="+$("#region").attr("value")+"&idate="+$('#idate').text()+"&taxonsearch="+$("#iTaxon").attr("value");
		app.utils.filldatable(params, bbox);
	}
});
app.Views.LocationFormView = NS.UI.Form.extend({
    initialize: function(options) {
		this.usersList = options.usersTab ; 
		NS.UI.Form.prototype.initialize.apply(this, arguments);
		this.on('submit:valid', function(instance) {

			app.models.station = new app.Models.Station();
			var schema = {
				station_name:  { type: 'Text', title:'Station name'},  //,validators: ['required']
				field_activity: { type: 'Text', title:'Field activity'}, //,validators: ['required']
				date_day: { type: 'Text', title:'Date'},
				time_now: { type: 'Text', title:'Time'},

				Observer_1: { type: 'Select' , title:'Observer 1', options: this.usersList, required : true },
				Observer_2: { type: 'Select' , title:'Observer 2', options: this.usersList, validators: [] },
				Observer_3: { type: 'Select' , title:'Observer 3', options: this.usersList },
				Observer_4: { type: 'Select' , title:'Observer 4', options: this.usersList },
				Observer_5: { type: 'Select' , title:'Observer 5', options: this.usersList }

				} ;
				app.models.station.constructor.schema = schema ;
				app.models.station.schema = schema ;
				var nbStoredStations = app.collections.stations.length;
				// identifiant de la station 
				var idStation = nbStoredStations + 1 ; 
				app.models.station.set("id",idStation );
				app.global.selectedStationId = idStation;
				app.router.navigate('stationInfos', {trigger: true});
		});
    },

	afterRender: function () {
		$('h3', this.$el).attr('style', 'display:none');
	}

});
app.Views.StationFormView = NS.UI.Form.extend({
	
    initialize: function(options) {
		//this.usersList = options.usersTab ; 
		NS.UI.Form.prototype.initialize.apply(this, arguments);
		this.on('submit:valid', function(instance) {
			var attr = instance.attributes;
			for (var prop in attr) {
				app.models.station.set(prop, attr[prop]);
			}
			
			app.models.station.set("latitude", app.models.location.get("latitude"));
			app.models.station.set("longitude", app.models.location.get("longitude"));
			
			app.collections.stations.add(app.models.station);
			app.models.station.save();
			app.router.navigate('proto-choice', {trigger: true});	
		});
    },

	afterRender: function () {
		$('h3', this.$el).attr('style', 'display:none');
	}

});
app.Views.ServerFormView = NS.UI.Form.extend({	
    initialize: function(options) {
		NS.UI.Form.prototype.initialize.apply(this, arguments);
		this.on('submit:valid', function(instance) {
			var attr = instance.attributes;
			
			if (app.utils.checkURL) {
				// check server access
				app.utils.checkServer(attr.url);
			} else {
				alert("Please input a validate url");
			}
 
		});
    },
	afterRender: function () {
		$('h3', this.$el).attr('style', 'display:none');
	}
});
app.Views.ProtocolFormView = NS.UI.Form.extend({
    initialize: function(options) {
		NS.UI.Form.prototype.initialize.apply(this, arguments);
		this.on('submit:valid', function(instance) {
			var attr = instance.attributes;
			var myObs =  new app.Models.Observation();
			for (var prop in attr) {
				myObs.attributes[prop] = attr[prop];	
			}
			// save the protocol id
			myObs.attributes.protoId = app.global.selectedProtocolId;
			myObs.attributes.protoName = app.global.selectedProtocolName;
			// set date
			var today = new Date(); 
			myObs.attributes.date = today.defaultView();
			// save the station id
			var idSelectedStation = app.global.selectedStationId ;
			var selectedStation = app.collections.stations.get(idSelectedStation);
			
			myObs.attributes.stationId = idSelectedStation;
			myObs.attributes.stationName = selectedStation.get("station_name");
			myObs.attributes.latitude = selectedStation.get("latitude");
			myObs.attributes.longitude = selectedStation.get("longitude");
			myObs.attributes.observer_1 = selectedStation.get("Observer_1");
			myObs.attributes.observer_2 = selectedStation.get("Observer_2");
			myObs.attributes.observer_3 = selectedStation.get("Observer_3");
			myObs.attributes.observer_4 = selectedStation.get("Observer_4");
			myObs.attributes.observer_5 = selectedStation.get("Observer_5");
			// add the model to observations collection
			app.collections.observations.add(myObs);
			// save the model in local storage
			// if we modify an obs we need to delete it and generate a new obs model (new id)
			var editObsId = this.options.obsId;
			if (typeof  editObsId != 'undefined'){
				var obsToEdit = app.collections.observations.get(editObsId);
				myObs.attributes.stationId = obsToEdit.get("stationId");
				myObs.attributes.date = obsToEdit.get("date");
				obsToEdit.destroy();
			}
			myObs.save();
			if (typeof  editObsId != 'undefined'){
				var actualProtocol = app.global.selectedProtocolId;
				app.utils.reloadProtocols();
				app.router.navigate('##mydata', {trigger: true});
			}
			var tplmsgBox = _.template($('#data-entry-end-template').html());
			app.views.dataEntryLayout.setView(".obsStoredAlertBox", new app.Views.DataEntryEndView({template: tplmsgBox }));
			app.views.dataEntryLayout.render();	
			$("#dataEntryRow").addClass("masqued");
			//$(".obsStoredAlertBox").css("background-color","#FFFFFF;");
			$("#data-entry-end-proto-name").html(app.global.selectedProtocolName) ;
			//$(".obsStoredAlertBox").addClass("message-dialog border-color-red");
			$("#obsStoredAlertBox").parent().addClass('alertRow');
		});
    },

	afterRender: function () {
		$('h3', this.$el).attr('style', 'display:none');
	}
});
app.Views.ProtocolsUpdateFormView = NS.UI.Form.extend({
    initialize: function(options) {
		//this.protocolsList = options.protocols ; 
		NS.UI.Form.prototype.initialize.apply(this, arguments);
		this.on('submit:valid', function(instance) {
			var attr = instance.attributes;
			var valForm  = attr.Protocols;
			var len = valForm.length;
			for (var i=0; i<len; i++){
				var protocolId = parseInt( valForm[i], 10 );
				app.utils.getProtocolDetails(protocolId);
			}
		});
    }
});		
		
app.Views.IndivListColForm = NS.UI.Form.extend({
    initialize: function(options) {
		this.columns = options.columns;
		//this.protocolsList = options.protocols ; 
		NS.UI.Form.prototype.initialize.apply(this, arguments);
		this.on('submit:valid', function(instance) {
			$('#dataFilterRow').html('');
			$('#msgColumnsModif').attr('style','display:"";');
			$('#submitForm').attr('style','display:none;');
			var selectedFieldsList = new Array();
			var attr = instance.attributes;
			var selectedFieldsList  = attr.Columns;
			var len = selectedFieldsList.length;
			var len = this.columns.length ; 
			for (var j=0; j < len ; j++){
				var attr = this.columns[j];
				for (var prop in attr) {
					attr["bVisible"] = false ;
				} 
			}
			// selected fields -> display: yes
			for (var k=0; k< len; k++){
			
				var colName = selectedFieldsList[k];
				
				for (var j=0; j < len ; j++){
					var attr = this.columns[j];
					for (var prop in attr) {
						if ( attr[prop] == colName ){
							attr["bVisible"] = true ;
						}
					}
				}
			}
			var oTable;	
			
			$("#indivDataTable").dataTable( {
				"aaData":this.data,
				"aoColumns": this.columns,
				"bDestroy": true
			});

			oTable = $("#indivDataTable").dataTable();
				
			});
    }
});			
 return app;
})(ecoReleveData);
