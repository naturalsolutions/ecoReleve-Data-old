var ecoReleveData = (function(app) {
    "use strict";
/*****************************************************
HomeView
******************************************************/	
app.Views.HomeView = Backbone.View.extend({
	//templateLoader: app.utils.templateLoader,
         manage: true ,
		initialize : function() {
            this.template = _.template($('#home-template').html());
		   //this.template = _.template(this.templateLoader.get('home'));
        }
});
/*****************************************************
StationPositionView --> route "entryStation"
******************************************************/	
app.Views.StationPositionView = Backbone.View.extend({
    manage: true,
		initialize : function(options) {
           this.template = _.template($('#sation-position-template').html());
		   this.usersList = options.usersTab ; 
			//this.template = _.template(this.templateLoader.get('sation-position'));
    },	
	events: {
			"click a#locationSubmit": "commitForm"
	},
	commitForm :  function(){
		var errors = app.locationForm.validate();
		if ( errors === null){
			app.locationForm.commit();
			// create a station model
			app.models.station = new app.Models.Station();
					
			// set the schema of Station model
			debugger;
			var schema = {
					station_name:  { type: 'Text', title:'Station name'},  //,validators: ['required']
					field_activity: { type: 'Text', title:'Field activity'}, //,validators: ['required']
					date_day: { type: 'Text', title:'Date'},
					time_now: { type: 'Text', title:'Time'},
					//Observer: { type: 'Select' , title:'Observer', options: ['Observer 1', 'Observer 2', 'Observer 3','Observer 4', 'Observer 5'] },
					Observer: { type: 'Select' , title:'Observer', options: this.usersList }			
			}
			app.models.station.schema = schema ;

			// set station id
			var nbStoredStations = app.collections.stations.length;
			// identifiant de la station 
			var idStation = nbStoredStations + 1 ; 
			app.models.station.set("id",idStation );
			app.global.selectedStationId = idStation;
			app.router.navigate('stationInfos', {trigger: true});
		}
	}	
		
});
/*****************************************************
StationInfosView --> route "stationInfos"
******************************************************/	
app.Views.StationInfosView = Backbone.View.extend({
	//templateLoader: app.utils.templateLoader,
	manage: true ,
	initialize : function() {
		this.template = _.template($('#sation-infos-template').html());
		//this.template = _.template(this.templateLoader.get('sation-infos'));
	},
	events: {
			"click a#stationInfoSubmit": "commitForm"
	},
	commitForm :  function(){
		var errors = app.stationForm.validate();
		if ( errors === null){
			debugger;
			app.stationForm.commit();
			// set latitude & longitude fields
			app.models.station.set("latitude", app.models.location.get("latitude"));
			app.models.station.set("longitude", app.models.location.get("longitude"));
			app.collections.stations.add(app.models.station);
			app.models.station.save();
			app.router.navigate('proto-choice', {trigger: true});
		}
	}
});

/*****************************************************
MapStationsView --> route "map-stations"
******************************************************/
app.Views.MapStationsView = Backbone.View.extend({
        manage: true ,
		initialize : function() {
           this.template = _.template($('#map-stations-template').html());
			//this.template = _.template(this.templateLoader.get('map-stations'));
        }
		,
		events: {
			"click a#plus": "zoomIn",
			"click a#minus": "zoomOut",
		},
		zoomIn: function(e){
			app.map.zoomIn();
		},
		zoomOut: function(e){
			app.map.zoomOut();
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
		//app.form.commit();
		// create a model to storage form values
		var errors = app.form.validate();
		// check value for protocol "photo"
		//var photo_url = app.form.fields.photo_url.setValue();
		var photo = app.form.fields.photo_url;
		var photo_url;
		if (typeof photo != 'undefined'){
			photo_url = app.form.fields.photo_url.getValue();
		}
		if ( errors === null){
			var myObs =  new app.Models.Observation();
			var data = app.form.getValue();
			
			for (var prop in data) {
				//  alert(prop + " = " + data[prop]);
				  myObs.attributes[prop] = data[prop];
			}
			// save the protocol id
			myObs.attributes.protoId = app.global.selectedProtocolId;
			myObs.attributes.protoName = app.global.selectedProtocolName;
			// set date
			var today = new Date(); 
			myObs.attributes.date = today.defaultView();
			// save the station id
			myObs.attributes.stationId = app.global.selectedStationId;
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
				app.router.navigate('##mydata', {trigger: true});
			}

			var tplmsgBox = _.template($('#data-entry-end-template').html());
			//$("#obsStoredAlertBox").css({"background-color":"#FFF;"});
			//$(".obsStoredAlertBox").css({"background-color":"#FFF;"});
			app.views.dataEntryLayout.setView(".obsStoredAlertBox", new app.Views.DataEntryEndView({template: tplmsgBox }));
			app.views.dataEntryLayout.render();	
			$("#dataEntryRow").addClass("masqued");
			//$(".obsStoredAlertBox").css("background-color","#FFFFFF;");
			$("#data-entry-end-proto-name").html(app.global.selectedProtocolName) ;
			//$(".obsStoredAlertBox").addClass("message-dialog border-color-red");
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
		this.collection.each(function(mymodel){

			var li = '<li> <a id="btn" class="btnChoice" idProt=' + mymodel.get('id') + '><span  idProt=' + mymodel.get('id') +'>' + mymodel.get('name') + '</span></a></li>';
			listView.append(li);

		});
	},
	events : {
            'click #btn' : 'navigation'
        },
	navigation : function(e){ 

		e.preventDefault();
		debugger;
		 //alert($(e.target).attr("idProt"));
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
		var selectedProtocol = app.global.selectedProtocolId;
		app.form = new Backbone.Form({
						model: app.collections.protocolsList.get(selectedProtocol)
		}).render();

		$('#frm').append(app.form.el);
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

		var htmlToRender = "<div><span><h2>Date</h2></span><input type='text' name='date_day' class='datepicker'/> <a class='btn primary icon go'>Go</a></div><br/>";
			htmlToRender += "<div class=obsContainer>";
			
		htmlToRender += "</div>";
		
		$(this.el).html(htmlToRender);
	
	},
	events : {
            'click .go' : 'filterDate',
			'click .tabControl' : 'displayTab',
			'click .accordion-toggle': 'elementVisibility',
			'click tr' : 'selectTableElement',
			'click .delObservation' : 'deleteObservation',
			'click .editObservation' : 'editObservation'
    },
	filterDate : function(){ 
		// initialize view
		$(".obsContainer").html("<div id='myDataDelObs' class='masqued btn-group'><a class='btn primary icon delObservation' style='float:left;'>Delete</a><a class='btn primary icon editObservation'>Edit</a></div><br/><br/><ul class='nav nav-tabs'><li class='active'><a class='tabControl'>table</a><div class='obsList content tabElement'></div></li><li><a class='tabControl'>map</a><div id='map' class='masqued tabElement'></div></li></ul></div>");	
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
		//var html = '<div class="accordion"> ';
		
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
			// this new collection contains all observations corresponding to a protocol type
			// generate a table 
			// each collection " " contains a list of models (observations) of a same protocol: we create a table for this collection
			
			//collectionForProtocolType.each(function(model) {
				//var template = _.template('<th class="ftColr-white"><%= name %></th>');
				//var templateData = _.template('<td class="ftColr-white"><%= value %></td>');
				debugger;
				var protocolName = collectionForProtocolType.at(0).attributes.protoName;
				var protocolid = collectionForProtocolType.at(0).attributes.protoId;
				elementId = "accordionElement" + protocolid ;
				html += '<div class="accordion-group">' + '<div class="accordion-heading"><span class="accordion-toggle collapsed protocolTitle">'+ protocolName + '</span></div><div class="accordion-body collapse"  id="'+ elementId + '">';
				//******html += '<table class="bordered hovered"><thead><tr>';
				
				// insert table litles from first collection = first observation
				//var newCollection = collectionForProtocolType[j];
				var attr = collectionForProtocolType.at(0).attributes;
				for (var prop in attr) {
					if ( (prop !="protoId") && (prop !="protoName") && (prop !="date") && (prop !="Photo")){
						var field = {};
						field.sTitle = prop;
						var fieldName = new app.TableField({name: prop});
						//fieldName.name = prop ;
						//********html += template(fieldName.toJSON());
						// hide id field
						
						if (prop =="id"){
							field.bVisible = false ;
						}
						
						columns.push(field);
					}
				}
				debugger;
				//********html += "</tr></thead><tbody>";
				// insert data from each collection (each observation) in a new line of the table
				var len = collectionForProtocolType.length ; 
				for (var i=0; i < len ; i++){
				//this.collection.each(function(model) {	
					//*********html += "<tr>";
					var attr = collectionForProtocolType.at(i).attributes;
					var listVals = new Array();
					for (var prop in attr) {
						if ((prop !="protoId") && (prop !="protoName") && (prop !="date") && (prop !="Photo")){
							var fieldName = new app.TableField({value: attr[prop]});
							//*********html += templateData(fieldName.toJSON());
							var field = {};
							listVals.push (attr[prop]);
						}
					}
					data.push(listVals);
					//*********html += "</tr>";
				}
				// create dataTable for the protocol
				/*
				var tableId = elementId + "DataTable";
				$(elementId).html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="' + tableId + '"></table>');	
				$(tableId).dataTable( {
					"aaData":data,
					"aoColumns": columns
				});			
				*/	
					
				//********html += "</tbody></table>";
				html += "</div></div>";
				$(".accordion").append(html);
			debugger;
			// create dataTable for the protocol	
			var tableId = elementId + "DataTable";
			//$(elementId).html('');
			$("#" + elementId).html('<table cellpadding="0" cellspacing="0" border="0" class="display" id="' + tableId + '"></table>');	
			//$("#" + tableId).dataTable();
			var oTable;
			
			$("#" + tableId).dataTable( {
				"aaData":data,
				"aoColumns": columns
			});
			// activate row selection
			/*
			$("#" + tableId  + "tbody tr").click( function( e ) {
				if ( $(this).hasClass('row_selected') ) {
					$(this).removeClass('row_selected');
				}
				else {
					oTable.$('tr.row_selected').removeClass('row_selected');
					$(this).addClass('row_selected');
				}
			});
			*/
			oTable = $("#" + tableId).dataTable();
			
			}
			
				
					
		}
		// init map div
		$('#map').html();
		app.point = new OpenLayers.LonLat(5.37,43.29);

	},
	displayTab : function(e){ 

		var targetElement = $(e.target).parent();
		var classAttrs  = $(e.target).parent().attr("class");
		var elementTab = $(targetElement).find('a').eq(0).html();

		if (elementTab == "map") {
			// check if the map is initialized
			var content = $('#map').html();
			if (content ==""){
			$('#map').css('width', '800px');
			$('#map').css('height', '600px');

			debugger;
			var collection = this.filtredCollection ;
			var len = collection.length ;
			if (len > 0){
					app.utils.initMap();
					app.utils.myObservationsOnMap(collection);
				} else {
					$("#map").html("No data to display");
				}
			}
		}
		
		if ((typeof classAttrs == 'undefined') || (classAttrs =="")){
			debugger;
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
			debugger;
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
update layout : main view  
******************************************************/
app.Views.UpdateDataView= Backbone.View.extend({
	 manage: true,
	 events : {
          'click .updateProtos' : 'updateProtocols'
     },
	 updateProtocols : function(e){ 
		//alert("MAJ protos");
		
		var tplAlert = _.template($('#update-data-alert-template').html()); 
		app.views.dataUpdateLayout.setView(".updateDataAlert", new app.Views.UpdateDataAlertView({template: tplAlert , collection:app.collections.protocolsList }));
		app.views.dataUpdateLayout.render();	
		$(".updateDataAlert").addClass("message-dialog border-color-red");
		$("#updateDataGridView").addClass("masqued");
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

		// hide alert
		this.remove();
		$(".updateDataAlert").removeClass("message-dialog border-color-red");
		$(".updateDataAlert").css({"background-color" : ""});
		$("#updateDataGridView").removeClass("masqued");
		// delete stored data
		// protocols
		//app.collections.protocolsList.reset();
		app.collections.protocolsList.each(function(model) { model.destroy(); } );
		//stations
		app.collections.stations.each(function(model) { model.destroy(); } );
		//observations
		//app.collections.observations.reset();
		app.collections.observations.each(function(model) { model.destroy(); } );
		// load data
		var initalizers = [];
		initalizers.push(app.utils.loadProtocols("ressources/XML_ProtocolDef2.xml"));
		//initalizers.push(app.utils.loadProtocols("http://82.96.149.133/html/ecoReleve/ecoReleve-data/ressources/XML_ProtocolDef2.xml"));
		$.when.apply($, initalizers).done(function() {
			alert ("Protocols loaded !");
		});
	},
	cancel : function(){ 
	
		this.remove();
		$(".updateDataAlert").removeClass("message-dialog border-color-red");
		$(".updateDataAlert").css({"background-color" : ""});
		$("#updateDataGridView").removeClass("masqued");
	}

});
/**********************************************************
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
			var li = '<li class="active"><a id="btn"><span>' + mymodel.get('name') + '</span></a></li>';
			listView.append(li);
		});
		
	}
	
});
/**********************************************************
 config Layout, config list view 
**********************************************************/
app.Views.ConfigListView = Backbone.View.extend({
	manage: true,
	events : {
            'click .users' : 'showUsersList'
    },
	showUsersList :function(){ 
		var tplview = _.template($('#users-template').html()); 
		app.views.configdataLayout.setView(".configDetails", new app.Views.Users({ template : tplview, collection: app.collections.users }));
		app.views.configdataLayout.render();
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
			debugger;
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
		debugger;
		var view = new app.views.User({model: model});
		//$("#users").append(view.render().$el);
		var callback = $.proxy(function() {
			debugger;
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
		//$(".configNewUserAlertBox").addClass("message-dialog border-color-red");
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
	debugger;
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











 return app;
})(ecoReleveData);
