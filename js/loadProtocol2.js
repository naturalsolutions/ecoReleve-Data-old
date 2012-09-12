var i = 0;
function generateProtocolPage(){
	$(document).ready(function()
 {
   $.ajax( {
            type: "GET",
            url: "XML_ProtocolDef.xml",
            dataType: "xml",
                       success: function(xml) 
                     {

	$('#divform').html('<ul id="listform" data-role="listview" data-inset="true" data-filter="true" data-split-icon="gear" data-split-theme="d"></ul>');
	$("#listform").listview();
	//$("#protocolName").text() = localStorage.protoName;
	
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
	 }
        });
		
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
								spn = spn + '<option>' + valListe[2] + '</option>'
							}
						spn = spn + '</select><br/></li>';
						
						 $('#listform').append(spn);
						 $("#listform").listview('refresh');  
		}
						
function generateTextField(node){
						
                        var label = $(node).find('display_label').text();
						var spn = "<li data-role='fieldcontain'><span>" + label + " </span>";
						spn = spn + '<br/><input type=text name=' + label +' /><br/></li>';
						$('#listform').append(spn);
						$("#listform").listview('refresh');  
		}
						
						
function generateNumericField(node){

                    var label = $(node).find('display_label').text();	
					/*var spn = "<li data-role='fieldcontain'><span>" + label + " </span>";
					spn = spn + '<br/><input onchange="changeFieldNum(this, this.name)" type=range min=0 max=200 name="'+ label +'" /><span id="'+label+'" class="ui-li-count ui-btn-up-c ui-btn-corner-all">100</span><br/></li>';
					 */
					 var spn = "<div data-role='fieldcontain'>";
				         spn = spn + "<label for='slider'>Curseur :</label>";
						spn = spn + "<input type='range' name='' id='' value='50' min='0' max='100' data-highlight='true'  />";
						spn = spn +'</div>';
					//  spn = spn + '<br/> <input type="range" name="slider" id="slider-0" value="0" min="0" max="100" /><br/></li>';
							//
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


/*$().ready(function() {		
		$("#champ1").after('<span class="ui-li-count ui-btn-up-c ui-btn-corner-all"></span>');
		$("#champ1").live('change', function(){
		var valof = $(this).val();
		$('span').text(valof);
		});
}); */

function changeFieldNum(field, name){
		var valof = $(field).val();
		document.getElementById(name).innerHTML = valof;		
}
  