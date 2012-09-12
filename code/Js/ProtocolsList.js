$(document).ready(function()
 {
   $.ajax( {
            type: "GET",
            url: "XML_ProtocolDef.xml",
            dataType: "xml",
                       success: function(xml) 
                     {
                       
					     	// initialiser la listView qui se charge d'afficher les protocoles 
							$('#protocolList').html('<ul id="listProt" data-role="listview" data-inset="true" data-filter="true" data-split-icon="gear" data-split-theme="d"></ul>');
							$("#listProt").listview();
					   
						xmlNode = $(xml);
					   $(xml).find('protocol').each(   
                         function()
                         {
						 
						var protName = $(this).find('display_label:first').text();;
						var protId = $(this).attr('id');
						// pour chaque protocole, rajouter 1 ligne à la listeview
						
						 var ligne = '<li idPr=' + protId + ' class=protList><br/> '+ protName + '</li>';
						 $('#listProt').append(ligne);
						 $("#listProt").listview('refresh');  
						 					
                          });
						  
                      }
        });
		

		
		
		
 }
  
  );
  
  $(".protList").live ("click", function ()
    {
		var idProtocol = this.getAttribute('idPr');
		//var idProtocol = this.attr('idPr');
		var nomProtocol = this.textContent;
		localStorage.protId = idProtocol;
		localStorage.protoName = nomProtocol;
	//	alert(this.getAttribute('idPr'));
		$("#titre").html(nomProtocol);
		generateProtocolPage();
		$.mobile.changePage ($("#frm"));
      });