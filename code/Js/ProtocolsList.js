function genererListProto(){
   $.ajax( {
            type: "GET",
            url: "ressources/XML_ProtocolDef.xml",
            dataType: "xml",
            success: function(xml) 
            {
				xmlNode = $(xml);
				var ln = '<li data-role="list-divider">Protocols</li>';
				$('#listProt').append(ln);
				 $("#listProt").listview('refresh');  	
			   $(xml).find('protocol').each(   
				function()
				{
					var protName = $(this).find('display_label:first').text();
					var protId = $(this).attr('id');
					// pour chaque protocole, rajouter 1 ligne à la listeview
					var ligne = '<li idPr=' + protId + ' class="protList" ><a href="#"><span id="prName"> '+ protName + '</span><span id="info-' + protId + '" class="ui-li-count ui-btn-up-c ui-btn-corner-all"></span></a></li>';
					$('#listProt').append(ligne);
					$("#listProt").listview('refresh');  
					var oSerializer = new XMLSerializer(); 
					var xmlString = oSerializer.serializeToString(this);
					localStorage.setItem("protocol-id-" + protId, xmlString); 
				});  
            }
        });
}
 
 $(".protList").live ("click", function ()
    {
		var idProtocol = this.getAttribute('idPr');
		//var idProtocol = this.attr('idPr');
		//var nomProtocol = $(this).children('span').textContent;
		var nomProtocol = $(this).find('span:first').text();
		//var nomProtocol = this.getAttribute('prName');
		localStorage.protId = idProtocol;
		localStorage.setItem("protoName", nomProtocol);
	//	alert(this.getAttribute('idPr'));
		$("#titre").html("Protocol : <strong>" + nomProtocol+"</strong>");
		$(this).parent('ul').children('li').removeClass('active');
        $(this).addClass('active');
		
		generateProtocolPage(idProtocol);
		// initialiser et masquer le texte
		$("#data-entry-infos").attr("style","display:none;");
		$("#data-entry-infos").text("");
		window.entryMode = "newObs";
    });
//var i = 0;
function generateProtocolPage(idProtocol){
   $.ajax( {
            type: "GET",
            url: "ressources/XML_ProtocolDef.xml",
            dataType: "xml",
            success: function(xml) 
            {
				$('#listform').empty();
				$("#data-entry-info-position").attr("style","");
				$("#data-entry-new-pos-form").attr("style","display:none;");
				$("#data-entry-form-protos").attr("style","");
				$("#btnsubmitProto").attr("style","");
				$("#listform-Info-Pos").attr("style","");
				//var nodeProt = $(xml).find('protocol[id=' + localStorage.protId +']');
				var nodeProt = $(xml).find('protocol[id=' + idProtocol +']');
				// si protocole multitaxa, rajouter champ selection taxon
				var taxaList = $(nodeProt).find('multispecies').text();
				taxaList = taxaList.toUpperCase();
				if (taxaList =="TRUE"){
					$('#data-entry-select-taxa-div').attr("style","");					
					var spn = "<li data-role='fieldcontain'><span>Taxa</span>";
					spn = spn + '<br/><input type=text name="' + idProtocol + '-0-taxa" id="data-entry-select-taxa-input"  /><br/></li>';
					$('#listform').append(spn);
					$("#listform").listview('refresh'); 
				}
				else{
					$('#data-entry-select-taxa-div').attr("style","display:none;");	
				}
				//rajouter champ caché pour avoir le nom de la station
				var spn = "<li data-role='fieldcontain' style='display:none;' >";
				spn = spn + '<input type=text name="' + idProtocol + '-0-station" id="data-entry-select-position-input"/></li>';
				$('#listform').append(spn);
				$("#listform").listview('refresh'); 
				// stocker le nom de la station en cours dans le champ input du formulaire
				var stationName = $("#stat-name").text();
				$("#data-entry-select-position-input").val(stationName);
				$(nodeProt).find('fields').children().each(function()
				{			 
					var node = $(this);
					var fieldtype = $(this).get(0).nodeName;		 
					switch (fieldtype)
					{	
						case ("field_list"):
							generateListField(node, idProtocol);
							break;
						case ("field_numeric"):	 
							generateNumericField(node,idProtocol);
							break;
						case ("field_text"):
							generateTextField(node, idProtocol);
							break;
						case ("field_boolean"):	
							generateBooleanField(node);
							break;			
					}				 						
				});
				$("#protocolFormValidation").attr("style","");
				localStorage.setItem("fildsLoded" ,"true");
			}
        });
}
function generateFormFromXml(xml,taxa,station){
	$('#listform').empty();
	$("#data-entry-info-position").attr("style","");
	$("#data-entry-new-pos-form").attr("style","display:none;");
	$("#data-entry-form-protos").attr("style","");
	$("#btnsubmitProto").attr("style","");
	//var nodeProt = $(xml).find('protocol[id=' + localStorage.protId +']');
	//var nodeProt = $(xml).find('protocol[id=' + idProtocol +']');
	// si protocole multitaxa, rajouter champ selection taxon
	var idProtocol = $(xml).find('protocol').attr('id');
	var taxaList = $(xml).find('multispecies').text();
	taxaList = taxaList.toUpperCase();
	if (taxaList =="TRUE"){
		$('#data-entry-select-taxa-div').attr("style","");					
		var spn = "<li data-role='fieldcontain'><span>Taxa</span>";
		spn = spn + '<br/><input type=text name="'+ idProtocol + '-0-taxa" id="data-entry-select-taxa-input"  /><br/></li>';
		$('#listform').append(spn);
		$("#listform").listview('refresh'); 
		$('#data-entry-select-taxa-input').val(taxa);	
	}
	else{
		$('#data-entry-select-taxa-div').attr("style","display:none;");	
	}
	//rajouter champ caché pour avoir le nom de la station
	var spn = "<li data-role='fieldcontain' style='display:none;' >";
	spn = spn + '<input type=text name="' + idProtocol +'-0-station" id="data-entry-select-position-input"/></li>';
	$('#listform').append(spn);
	$("#listform").listview('refresh'); 
	$('#data-entry-select-position-input').val(station);	
	// stocker le nom de la station en cours dans le champ input du formulaire
	/*var stationName = $("#stat-name").text();
	$("#data-entry-select-position-input").val(stationName);*/
	$(xml).find('fields').children().each(function()
	{			 
		var node = $(this);
		var fieldtype = $(this).get(0).nodeName;		 
		switch (fieldtype)
		{	
			case ("field_list"):
				generateListField(node, idProtocol);
				break;
			case ("field_numeric"):	 
				generateNumericField(node, idProtocol);
				break;
			case ("field_text"):
				generateTextField(node, idProtocol);
				break;
			case ("field_boolean"):	
				generateBooleanField(node);
				break;			
		}				 						
	});
	$("#protocolFormValidation").attr("style","");
	localStorage.setItem("fildsLoded" ,"true");
} 

function generateListField(node,idProtocol){					 
	var fieldId = $(node).attr("id");
	var label = $(node).find('display_label').text();
	var itemlist = $(node).find('itemlist').text();
	var defaultValueId = $(node).find('default_value').attr("id");
	var defaultValue = $(node).find('default_value').text();
	label = trim(label);
	var labelId = label.replace(" ","-");
	var idElement = idProtocol + "-" + fieldId + "-" + labelId;
	//label = trim(label);
	var spn = "<li data-role='fieldcontain'><span>" + label + " </span>";
	spn = spn + '<br/><select data-native-menu=false name=' + idElement +'>';
	var listVal = itemlist.split('|');
	//rajouter default Value en premier dans la liste
	var spnList ="";
	for (var i=0; i< listVal.length; i++)
	{	
		var valItem = listVal[i];
		var valListe = valItem.split(';');
		// cas ou pas de modif d'observation
		if (defaultValue == ""){
			if (valListe[0]!=defaultValueId){
				spnList = spnList + '<option>' + valListe[2] + '</option>';
			}
			else {
				spnList = '<option>' + valListe[2] + '</option>'+ spnList;
			}
		}
		// cas modif obs: la valeur est sockée dans "default-value
		else{
			if (valListe[2]!=defaultValue){
					spnList = spnList + '<option>' + valListe[2] + '</option>';
			}
			else{
					spnList = '<option>' + valListe[2] + '</option>'+ spnList;
			}
		}
	}
	spn = spn + spnList + '</select><br/></li>';
	$('#listform').append(spn);
	$("#listform").listview('refresh');  
}
						
function generateTextField(node, idProtocol){					
	var fieldId = $(node).attr("id");
	var label = $(node).find('display_label').text()
	var defaultValue = $(node).find('default_value').text();
	//nettoyer la chaine: enlever espaces
	label = trim(label);
	var labelId = label.replace(" ","-");
	var idElement = idProtocol + "-" + fieldId + "-" + labelId;
	//alert("label : " + label + " labelid : " + labelId  +" idElement : " + idElement);
	var spn = "<li data-role='fieldcontain'><span>" + label + " </span>";
	spn = spn + '<br/><input type=text name="' + idElement +'" id="'+ idElement + '" /><br/></li>';
	$('#listform').append(spn);
	$("#listform").listview('refresh'); 
	//alert ( label + " : id "+ idElement + " defval : " + defaultValue);
	$("#"+ idElement + "").val(defaultValue);
}										
function generateNumericField(node, idProtocol){
	var fieldId = $(node).attr("id");
	var label = $(node).find('display_label').text();
	label = trim(label);
	var labelId = label.replace(" ","+");
	var defaultValue = $(node).find('default_value').text();
	var maxValue = $(node).find('max_bound').text();
	var minValue = $(node).find('min_bound').text();
	var idElement = idProtocol + "-" + fieldId + "-" +  labelId;
	var spn = '<li data-role="fieldcontain">'
			+ '<label for="' + idElement + '">' + label + ' </label>'
			+ '<br/><input onchange="changeFieldNum(this, this.name)" type="range" min="'+ minValue + '" max="' + maxValue + '" name="'+ idElement +'" id="'+ idElement + '"/>'
			+ '<span id="spn-'+ idElement +'" class="ui-li-count ui-btn-up-c ui-btn-corner-all">0</span><br/></li>';
	//  spn = spn + '<br/> <input type="range" name="slider" id="slider-0" value="0" min="0" max="100" /><br/></li>';
	$('#listform').append(spn);
	//$('.slider-element').slider('refresh');
	$("#"+ idElement + "").slider();
	$("#listform").listview('refresh'); 
	$("#"+ idElement + "").val(defaultValue);	
	$("#"+ idElement + "").slider('refresh');
	// $('.sliderControl').slider();
}
		
function generateBooleanField(node){
	var label = $(node).find('display_label').text();
	var defValue = $(node).find('default_value').text();
	var spn = "<li data-role='fieldcontain'><span>" + label + " </span><br/>";
	switch (defValue)
	{
		case ("true"):
			spn = spn + '<select data-role="slider" name='+ label +'><option value=false> Non </option><option value=true selected=selected> Oui </option></select><br/></li>';
			//spn = spn + '<select data-role="slider" name="slider"><option value="off"> Non </option><option value="on" selected=selected> Oui </option></select><br/></li>';
			break;
		case ("false"):	 
			spn = spn + '<select data-role="slider" name='+ label +'><option value=false selected=selected> Non </option><option value=true> Oui </option></select><br/></li>';
		//	spn = spn + '<select data-role="slider" name="slider"><option value="off" selected=selected> Non </option><option value="on"> Oui </option></select><br/></li>';
			break;
	}
	 $('#listform').append(spn);
	 $("#listform").listview('refresh');  
}
function changeFieldNum(field, name){
	var valof = $(field).val();
	var idSpn = "spn-" + name ;
	document.getElementById(idSpn).innerHTML = valof;		
}