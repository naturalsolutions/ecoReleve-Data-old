function genererListProto(){
   $.ajax( {
            type: "GET",
            url: "ressources/XML_ProtocolDef.xml",
            dataType: "xml",
                       success: function(xml) 
                     {
                       debugger;
					     	// initialiser la listView qui se charge d'afficher les protocoles 
							//$('#protocolList').html('<ul id="listProt" data-role="listview" data-inset="true" data-filter="true" data-split-icon="gear" data-split-theme="d"></ul>');
							//$("#listProt").listview();
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
						 var ligne = '<li idPr=' + protId + ' class="protList"><a href="#"> '+ protName + '</a></li>';
						 $('#listProt').append(ligne);
						 $("#listProt").listview('refresh');  			
                          });
						  
                      }
        });

 }
 
 $(".protList").live ("click", function ()
    {
		var idProtocol = this.getAttribute('idPr');
		//var idProtocol = this.attr('idPr');
		var nomProtocol = this.textContent;
		localStorage.protId = idProtocol;
		localStorage.protoName = nomProtocol;
	//	alert(this.getAttribute('idPr'));
		$("#titre").html("Protocol : " + nomProtocol);
		generateProtocolPage();
    });
//var i = 0;
function generateProtocolPage(){
   $.ajax( {
            type: "GET",
            url: "ressources/XML_ProtocolDef.xml",
            dataType: "xml",
             success: function(xml) 
               {
					$('#listform').empty();
					var nodeProt = $(xml).find('protocol[id=' + localStorage.protId +']');
					$(nodeProt).find('fields').children().each(function()
					{			 
						var node = $(this);
						var fieldtype = $(this).get(0).nodeName;		 
						switch (fieldtype)
						{	
							case ("field_list"):
								generateListField(node);
								break;
							case ("field_numeric"):	 
								generateNumericField(node);
								break;
							case ("field_text"):
								generateTextField(node);
								break;
							case ("field_boolean"):	
								generateBooleanField(node);
								break;			
						}				 						
					});
					$("#protocolFormValidation").attr("style","");
				}
        });
}
function generateListField(node){					 
	var label = $(node).find('display_label').text();
	var itemlist = $(node).find('itemlist').text();
	var spn = "<li data-role='fieldcontain'><span>" + label + " </span>";
	spn = spn + '<br/><select data-native-menu=false name=' + label +'>';
	var listVal = itemlist.split('|');
	for (var i=0; i< listVal.length; i++)
	{
		var valItem = listVal[i];
		var valListe = valItem.split(';');
		spn = spn + '<option>' + valListe[2] + '</option>';
	}
	spn = spn + '</select><br/></li>';
	$('#listform').append(spn);
	$("#listform").listview('refresh');  
}
						
function generateTextField(node){					
	var label = $(node).find('display_label').text();
	var spn = "<li data-role='fieldcontain'><span>" + label + " </span>";
	spn = spn + '<br/><input type=text name="' + label +'" /><br/></li>';
	$('#listform').append(spn);
	$("#listform").listview('refresh');  
}
											
function generateNumericField(node){
	var label = $(node).find('display_label').text();	
	var spn = '<li data-role="fieldcontain"><span>' + label + ' </span>';
	spn = spn + '<br/><input onchange="changeFieldNum(this, this.name)" type="range" min="0" max="200" name="'+ label +'" /><span id="'+label+'" class="ui-li-count ui-btn-up-c ui-btn-corner-all">100</span><br/></li>';
	//  spn = spn + '<br/> <input type="range" name="slider" id="slider-0" value="0" min="0" max="100" /><br/></li>';
	$('#listform').append(spn);
	$("#listform").listview('refresh');  
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
	document.getElementById(name).innerHTML = valof;		
}
  