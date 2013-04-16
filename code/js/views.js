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
	//templateLoader: app.utils.templateLoader,
	//el : $('#content'),
        manage: true,
		initialize : function() {
           this.template = _.template($('#sation-position-template').html());
			//this.template = _.template(this.templateLoader.get('sation-position'));
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
	/*
	initialize : function(model) {
		this.template = _.template($('#data-entry-protocol').html());
		//this.template = _.template(this.templateLoader.get('msgbox'));
	},
	*/
	  serialize: function() {
		return this.model.toJSON();
	},
	events : {
            'click a.submit' : 'commit'
        },
	commit : function(e){ 
		debugger;
		//app.form.commit();
		// create a model to storage form values
		var errors = app.form.validate();
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
		}
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
View mydata :gridView  
******************************************************/

app.Views.MyDataGridView = Backbone.View.extend({
	
	manage: true,
	initialize : function(options) {
		var htmlToRender ="";
		debugger;
		// get list of protocols Id
		/*var protoIdList  = this.collections.map(function(model){
			  return model.get('protoId');
		});*/
		// uniq values
		//protoIdList = _.uniq(protoIdList);
		// generate a table model and a table instance for each collection => protocol
		var protList = this.options.protoIdList;
		for ( var j=0; j < protList.length; j++){
			var mycollection = this.options.collection;
			var collectionForProtocolType = new app.Collections.Protocols();
			mycollection.each(function(model) {
					debugger;
				  if(model.attributes.protoId == protList[j]) {
					 debugger;
					 collectionForProtocolType.add(model);
				  }
			});

			debugger;
			
			// this new collection contains all observations corresponding to a protocol type
			// generate a table 
			// each collection " " contains a list of models (observations) of a same protocol: we create a table for this collection
			
			
			
			//collectionForProtocolType.each(function(model) {
				var template = _.template('<th class="ftColr-white"><%= name %></th>');
				var templateData = _.template('<td class="ftColr-white"><%= value %></td>');
				debugger;
				var protocolName = collectionForProtocolType.at(0).attributes.protoName;
				
				var html = '<div class="row"><div class="span6">';
				html += '<h2>'+ protocolName + '</h2><table class="bordered hovered"><thead><tr>';
				// insert table litles from first collection = first observation
				//var newCollection = collectionForProtocolType[j];
				var attr = collectionForProtocolType.at(0).attributes;
				for (var prop in attr) {
					if (( prop !="id" ) && (prop !="protoId")){
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
						if (( prop !="id" ) && (prop !="protoId")){
							var fieldName = new app.TableField({value: attr[prop]});
							html += templateData(fieldName.toJSON());
						}
					}
					html += "</tr>";
				}
					html += "</tbody></table></div></div><br/>";
					htmlToRender += html ;
			//});
		
			$(this.el).html(htmlToRender);
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
		//initalizers.push(app.utils.loadProtocols("ressources/XML_ProtocolDef2.xml"));
		initalizers.push(app.utils.loadProtocols("http://82.96.149.133/html/ecoReleve/ecoReleve-data/ressources/XML_ProtocolDef2.xml"));
		$.when.apply($, initalizers).done(function() {
			alert ("xml chargé !");
		
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

 return app;
})(ecoReleveData);
