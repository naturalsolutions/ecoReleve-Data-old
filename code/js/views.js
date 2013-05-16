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
			app.router.navigate('proto-choice', {trigger: true});
		}
	}
});

/*****************************************************
MapStationsView --> route "map-stations"
******************************************************/
app.Views.MapStationsView = Backbone.View.extend({
	//templateLoader: app.utils.templateLoader,
	//el : $('#content'),
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
DataEntryLayout --> route "data-entry"
******************************************************/
/*
app.Views.DataEntryLayout = new Backbone.Layout({
  //template: "#data-entry-layout",

  render : function() {
  debugger;
		this.template = _.template($('#data-entry-layout').html());
		var renderedContent = this.template();
		$(this.el).html(renderedContent);
	  //  return this;
		 $(this.el).hide();
	},
	close: function(){
		this.remove();
		this.unbind();
	},
	 
	onShow: function(){
		$(this.el).show(100);
	}
});
*/
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
	
	initialize : function(model) {
		//this.template = _.template($('#data-entry-protocol').html());
		//this.template = _.template(this.templateLoader.get('msgbox'));

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
			var attr = myObs.attributes;
			myObs.save();
			var tplmsgBox = _.template($('#data-entry-end-template').html());
			app.views.dataEntryLayout.setView(".obsStoredAlertBox", new app.Views.DataEntryEndView({template: tplmsgBox }));
			app.views.dataEntryLayout.render();	
			$("#data-entry-end-proto-name").html(app.global.selectedProtocolName) ;
			$(".obsStoredAlertBox").addClass("message-dialog border-color-red");
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
  // Insert all subViews prior to rendering the View.
	beforeRender: function() {
    // Iterate over the passed collection and create a view for each item.
		var listView = $(this.el);  
		this.collection.each(function(mymodel){
			var li = '<a> <button class="command-button  bg-color-red " idProt=' + mymodel.get('id') + '>'
					+ '<h2 class="ftColr-white" idProt=' + mymodel.get('id') +'>' + mymodel.get('name') + '</h2></button></a>';
			  //this.insertView(li);
			  listView.append(li);
			//	serialize:  this.model.toJSON
			//}));
		});
	},
	events : {
            'click button' : 'navigation'
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
		/*app.router.navigate(route);  /* , {
			trigger: true
		});*/
		// var idSelectedProto = this.$('button').attr('id');
		//alert ("click ! : " + idSelectedProto);
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
		$(".obsStoredAlertBox").removeClass("message-dialog border-color-red");
		$(".obsStoredAlertBox").css("background-color","");
	}

});

/*****************************************************
View mydata :layout   
******************************************************/
app.Views.MyDataFilterView= new Backbone.View.extend({
	manage: true,
	initialize : function() {
	debugger;
		this.template = _.template($('#my-data-filter-template').html());
	}
	/*events : {
            'click .go' : 'filterDate'
    },
	filterDate :function(){ 
		$(".gridview").html("filter data");	
	}*/
});


app.views.myDataLayout = new Backbone.Layout({
	template: "#my-data-layout"
});
/*****************************************************
View mydata :gridView  
******************************************************/

app.Views.MyDataGridView = Backbone.View.extend({
	mycollection : "",
	manage: true,
	initialize : function(options) {
		//var filterTemplate = _.template($('#my-data-filter-template').html());
		//var renderedContent = filterTemplate;
		var htmlToRender = "<div><span><h2>Date</h2></span><input type='text' name='date_day' class='datepicker'/> <a class='button big bg-color-blue fg-color-white go'>Go</a></div><div class='obsList'>";
	
		// generate a table model and a table instance for each collection => protocol
		var protList = this.options.protoIdList;
		for ( var j=0; j < protList.length; j++){
			var mycollection = this.options.collection;
			var collectionForProtocolType = new app.Collections.Protocols();
			mycollection.each(function(model) {

				  if(model.attributes.protoId == protList[j]) {
				
					 collectionForProtocolType.add(model);
				  }
			});


			
			// this new collection contains all observations corresponding to a protocol type
			// generate a table 
			// each collection " " contains a list of models (observations) of a same protocol: we create a table for this collection
			
			//collectionForProtocolType.each(function(model) {
				var template = _.template('<th class="ftColr-white"><%= name %></th>');
				var templateData = _.template('<td class="ftColr-white"><%= value %></td>');
			
				var protocolName = collectionForProtocolType.at(0).attributes.protoName;
				
				var html = '<div class="row"><div class="span6">';
				html += '<h2>'+ protocolName + '</h2><table class="bordered hovered"><thead><tr>';
				// insert table litles from first collection = first observation
				//var newCollection = collectionForProtocolType[j];
				var attr = collectionForProtocolType.at(0).attributes;
				for (var prop in attr) {
					if (( prop !="id" ) && (prop !="protoId") && (prop !="protoName") && (prop !="date") && (prop !="Photo")){
						var fieldName = new app.TableField({name: prop});
						//fieldName.name = prop ;
						html += template(fieldName.toJSON());
					}
				}
				html += "</tr></thead><tbody>";
				// insert data from each collection (each observation) in a new line of the table
				var len = collectionForProtocolType.length ; 
				for (var i=0; i < len ; i++){
				//this.collection.each(function(model) {	
					html += "<tr>";
					var attr = collectionForProtocolType.at(i).attributes;
					for (var prop in attr) {
						if (( prop !="id" ) && (prop !="protoId") && (prop !="protoName") && (prop !="date") && (prop !="Photo")){
							var fieldName = new app.TableField({value: attr[prop]});
							html += templateData(fieldName.toJSON());
						}
					}
					html += "</tr>";
				}
					html += "</tbody></table></div></div><br/>";
					htmlToRender += html ;
			//});
			
			//$(this.el).html(htmlToRender);
			//$(".observationslist").html(htmlToRender);
		}

		htmlToRender += "</div>";
		
		$(this.el).html(htmlToRender);
	},
	events : {
            'click .go' : 'filterDate',
			'click li' : 'elementvisibility'
    },
	filterDate :function(){ 
		debugger;
		// initialize view
		$(".obsList").html("");	
		var obsCollection = this.options.collection;
		var selectedDate = $(".datepicker").val();
		// filter observations collection with selected data
		var filteredCollection = new app.Collections.Observations();
		obsCollection.each(function(model) {
			if(model.attributes.date == selectedDate) {
				filteredCollection.add(model);
			}
		});
		debugger;
		var protocolsList = this.options.protoIdList;
		var html = '<ul class="accordion" data-role="accordion"> ';
		
		for ( var j=0; j < protocolsList.length; j++){
			
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
				var template = _.template('<th class="ftColr-white"><%= name %></th>');
				var templateData = _.template('<td class="ftColr-white"><%= value %></td>');
				
				var protocolName = collectionForProtocolType.at(0).attributes.protoName;
				debugger;
				
           
				html += '<li  class="active accordeonLi">' + '<a class="ftColr-black">'+ protocolName + '</a><div style="display: none; "><table class="bordered hovered"><thead><tr>';
			
				// insert table litles from first collection = first observation
				//var newCollection = collectionForProtocolType[j];
				var attr = collectionForProtocolType.at(0).attributes;
				for (var prop in attr) {
					if (( prop !="id" ) && (prop !="protoId") && (prop !="protoName") && (prop !="date") && (prop !="Photo")){
						var fieldName = new app.TableField({name: prop});
						//fieldName.name = prop ;
						html += template(fieldName.toJSON());
					}
				}
				html += "</tr></thead><tbody>";
				// insert data from each collection (each observation) in a new line of the table
				var len = collectionForProtocolType.length ; 
				for (var i=0; i < len ; i++){
				//this.collection.each(function(model) {	
					html += "<tr>";
					var attr = collectionForProtocolType.at(i).attributes;
					for (var prop in attr) {
						if (( prop !="id" ) && (prop !="protoId") && (prop !="protoName") && (prop !="date") && (prop !="Photo")){
							var fieldName = new app.TableField({value: attr[prop]});
							html += templateData(fieldName.toJSON());
						}
					}
					html += "</tr>";
				}
					html += "</tbody></table></div></li>";
					//renderContent += html ;
			}
		}
		html += "</ul><<br/>";
		
		$(".obsList").html(html);	
		return false;
	
	},
	elementvisibility : function(e){ 
		debugger;
		var ele  = $(e.target).parent().find('div');
		var style = $(ele).attr('style');
		//var display = $(".accordeonContent").css('display');
		if ( style == "display: none; "){
			//$(".accordeonContent").css('display', 'block');
			$(ele).css('display', 'block');
		}
		else {
			//$(".accordeonContent").css('display', 'none');
			$(ele).css('display', 'none');
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
	}
}); 
/*****************************************************
update layout : alert view  
******************************************************/	 
	 
app.Views.UpdateDataAlertView = Backbone.View.extend({
	 manage: true,
	 initialize: function(options){
	 debugger;
		var protocolsCollection = this.options.collection ; 
		var listview = new app.Views.ProtosListView({collection:protocolsCollection});
		this.setView(".listviewProtocols", listview);
					//protoSelectionLayout.render();
	 
	 
	 },
	 /* serialize: function() {
		return this.model.toJSON();
	},*/
	events : {
            'click .validate' : 'validate', 
			'click .cancel' : 'cancel'
    },
	validate :function(){ 
		// hide alert
		this.remove();
		$(".updateDataAlert").removeClass("message-dialog border-color-red");
		$(".updateDataAlert").css({"background-color" : ""});
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
	}

});
/**********************************************************
 update view, listview of Protocols in alert message
**********************************************************/
app.Views.ProtosListView = Backbone.View.extend({
	manage: true,
	tagName: "ul",
  // Insert all subViews prior to rendering the View.
	beforeRender: function() {
    // Iterate over the passed collection and create a view for each item.
		var listView = $(this.el);  
		this.collection.each(function(mymodel){
			var li = '<button class="command-button  bg-color-red " >'
					+ '<h2 class="ftColr-white">' + mymodel.get('name') + '</h2></button></a>';
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
		$(".configNewUserAlertBox").addClass("message-dialog border-color-red");
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
		debugger;
		/*$('.configNewUserAlertBox').html('');
		$(".configNewUserAlertBox").removeClass("message-dialog border-color-red");
		$(".configNewUserAlertBox").css("background-color","");*/
		app.views.configdataLayout.removeView(".configNewUserAlertBox");
		$(".configNewUserAlertBox").removeClass("message-dialog border-color-red");
		$(".configNewUserAlertBox").css("background-color","")
		//return false;
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
			$(".configNewUserAlertBox").removeClass("message-dialog border-color-red");
			$(".configNewUserAlertBox").css("background-color","");
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
