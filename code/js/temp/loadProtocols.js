var ecoReleveData = (function(app) {
    "use strict";

app.utils.loadProtocols = function (){
   $.ajax( {
            type: "GET",
            url: "ressources/XML_ProtocolDef2.xml",
            dataType: "xml",
            success: function(xml) 
            {
				//xmlNode = $(xml);	
				// creer la collection de protocoles
				app.collections.protocolsList = new app.Collections.Protocols();
			   $(xml).find('protocol').each(   
				function()
				{
					// créer le modèle protocol
					app.models.protocol = new app.Models.Protocol();
					var id = $(this).attr('id');
					var protName = $(this).find('display_label:first').text();
					var multispecies = $(this).find('multispecies:first').text();
					// renseigner les métadonnées du modèle
					
					app.models.protocol.set("id", id);
					app.models.protocol.set("name", protName);
					app.models.protocol.set("data.multispecies", multispecies);
					
					//créer le schema du modele à partir des champs
					var schema = {};
					
					$(this).find('fields').children().each(function()
					{			 
						var node = $(this);
						var fieldtype = $(this).get(0).nodeName;		 
						switch (fieldtype)
						{	
							case ("field_list"):
								generateListField(node, function(field) {
									var name = field.get("name");
									// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type liste) et le rajouter au schema du protocole
									schema[name] = {}; 
									schema[name].type = "Select";
									schema[name].title = field.get("display_label");
									schema[name].options = field.get("items");

								}); 
								break;
							case ("field_numeric"):	 
								generateNumericField(node,function(field) {
									var name = field.get("name");
									// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type numerique) et le rajouter au schema du protocole
									schema[name] = {}; 
									schema[name].type = "Number";
									schema[name].title = field.get("display_label");
									
								});  
								break;
							case ("field_text"):
								// appeler la méthode qui va générer un modele de type texte et utiliser son callback pour rajouter 1 champ de meme type au modele "protocole"
								generateTextField(node,function(field) { 
									var name = field.get("name");
									// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type texte) et le rajouter au schema du protocole
									schema[name] = {}; 
									schema[name].type = "Text";
									schema[name].title = field.get("display_label");
									// validation
									if (field.get("required") =="true" ){
										schema[name].validators = "['required']";
									}
								//schema[label].model = field ;
								});  
								break;
							case ("field_boolean"):	
								generateBooleanField(node,function(field) { 
									var name = field.get("name");
									// creer un champ dont le nom correspond au label et dont le type correspond au model "field" (champ de type texte) et le rajouter au schema du protocole
									schema[name] = {}; 
									schema[name].type = "Text";
									schema[name].title = field.get("display_label");
									// validation
									if (field.get("required") =="true" ){
										schema[name].validators = "['required']";
									}
								//schema[name].model = field ;
								});  
								break;			
						}				 						 
					});

					//app.Models[protName] = Backbone.Models.extend({schema: schema});
					//new app.Models['Hermann']()
					app.models.protocol.schema = schema;
					// rajouter le modele à la collection de protocoles
					app.collections.protocolsList.add(app.models.protocol);
				}); 
				
				/*
				app.form = new Backbone.Form({
					model: app.models.protocol
				}).render();

				$('#frm').append(app.form.el);
				*/
				
            }
        });
}
 
function generateListField(node, callback){				 
	 
	var fieldId = $(node).attr("id");
	var name = $(node).find('label').text();
	var label = $(node).find('display_label').text(); 
	var itemlist = $(node).find('itemlist').text();
	var defaultValueId = $(node).find('default_value').attr("id");
	

	var defaultvalueposition;
	
	var listVal = itemlist.split('|');
	var options = new Array();

	for (var i=0; i< listVal.length; i++)
	{	
		var valItem = listVal[i];
		var valListe = valItem.split(';');
		options.push(valListe[2]);
		if (defaultValueId == valListe[0]){
			defaultvalueposition = i;
		}
	}
	// placer la valeur par défaut en premier de la liste
	var defval = options[defaultvalueposition];
	var firstval = options[0];
	options[0] = defval;
  	options[defaultvalueposition] = firstval;
	// creer 1 modele champ de type liste
	var listField = new app.Models.ListField({
	id: fieldId,
	name : name,
	display_label:label,
	items : options
	});
	callback(listField);
	// mettre la valeur par défaut en première position de la table
}
						
function generateTextField(node, callback){	
		
	var fieldId = $(node).attr("id");
	var name = $(node).find('label').text();
	var label = $(node).find('display_label').text();
	var defaultValue = $(node).find('default_value').text();
	var required = $(node).find('required').text();
	var multiline = $(node).find('multiline').text();
	// creer le modele champ de type texte
	
	var textField = new app.Models.TextField({
			id: fieldId,
			name : name,
			display_label:label,
			multiline: multiline,
			defaultValue:defaultValue,
			required : required
    });

	callback(textField);			
}	

function generateNumericField(node, callback){
	var fieldId = $(node).attr("id");
	var name = $(node).find('label').text();
	var label = $(node).find('display_label').text();
	var defaultVal = $(node).find('default_value').text();
	var unit = $(node).find('unit').text();
	var minBound = $(node).find('min_bound').text();
	var maxBound = $(node).find('max_bound').text();
	var precision = $(node).find('precision').text();
	// creer le modele champ numerique
	var numField = new app.Models.NumericField({
		id: fieldId,
		name : name,
		display_label:label,
		unit:unit,
		max_bound :maxBound,
		min_bound: minBound,
		precision:precision,
		defaultValue:defaultVal
		});
	callback(numField);
}

function generateBooleanField(node, callback){
	var fieldId = $(node).attr("id");
	var name = $(node).find('label').text();
	var label = $(node).find('display_label').text();
	var defaultVal = $(node).find('default_value').text();
	var required = $(node).find('required').text();
	// creer le modele champ boolean
	var boolField = new app.Models.BooleanField({
		id: fieldId,
		name : name,
		display_label:label,
		defaultValue:defaultVal,
		required : required
		});
	callback(boolField);
}
 
 return app;
})(ecoReleveData);