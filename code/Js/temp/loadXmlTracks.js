
function loadXmlTrack(db){				
	$.ajax( {
            type: "GET",
			url: "ressources/tracks_3.xml",
            dataType: "xml",
            success: function(xml) 
                     {
					   							
					   $(xml).find('coordinates').each(   
                         function()
                         {	
							var valCoords = $(this).text();
							var requete = "INSERT INTO Ttracks (Ttra_coords) VALUES (?)";
							var param = [valCoords];
							insertNewRow(requete, param);
						});
					localStorage.setItem('xmlTrackLoaded', true); 
			}
	});
 }