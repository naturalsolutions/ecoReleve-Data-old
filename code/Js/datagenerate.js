function loadFileIndiv(db){	
    $.ajax({
       type: 'GET',
       url: 'ressources/Indiv_LastPositions.csv',
       data: null,
       success: function(text) {
			$("#birdsHeader").html("Chargement du fichier indiv...");
			console.log("generation de la table individus");
			//$("#waitControlIndiv").attr('style', 'display:inherit; position:absolute; left:'+((w_screen*0.5)-50)+'px; top:'+((h_screen*0.5)-50)+'px; width:100px;height:100px; z-index:5;');
           var fields = text.split(/\n/);
           var data = fields.slice(1,fields.length);
           for(var j = 0; j < data.length; j += 1) {
				// suivre l'état d'avancement de generation de la table dans la BD
				$("#birdsHeader").html("Chargement de la ligne " + j + " /" + data.length + "...");
				var dataFields = data[j].split(';');
				var  values = ""
				for(var k = 0; k < dataFields.length; k += 1) {
				values = values +"'"+dataFields[k]+"',";
				}
				var n=values.lastIndexOf(",");
				var val = values.substr(0,n);
				var req = "INSERT INTO TIndividus (Tind_FieldWorker1 ,"
				+"Tind_FieldWorker2 , Tind_FieldActivity_Name , Tind_Name , Tind_Region , Tind_Place , Tind_DATE ,"
				+"Tind_LAT , Tind_LON , Tind_Site_name ,Tind_MonitoredSite_type , Tind_label , Tind_Sex ,"
				+"Tind_Origin , Tind_Species , Tind_Status , Tind_Tr_Shape , Tind_Tr_Model , Tind_Tr_Number ," 
				+ "Tind_NumBagBre , Tind_Chip , Tind_TCaracThes_Mark_Color_1_Precision , Tind_PTT , Tind_Frequency ,"
				+"Tind_NumBagRel , Tind_Fk_TInd_ID , Tind_FreqOpti ) VALUES ("+ val +")";
				insertRow(req);
           }
		   localStorage.setItem('fileIndivLoaded', "true");
		   $("#birdsHeader").html("Birds");
		   $("#waitControlIndiv").attr('style', 'display:none;');
       }
    });
}

function loadFileThesaurus (db){	
    $.ajax({
    
       type: 'GET',
       url: 'ressources/Thesaurus_Plantes_Outardes.csv',
       data: null,
       success: function(text) {
			$("#taxonsHeader").html("Chargement du fichier taxa...");
			console.log("generation de la table taxons");
			//$("#waitControlTaxa").attr('style', 'display:inherit; position:absolute; left:'+((w_screen*0.5)-50)+'px; top:'+((h_screen*0.5)-50)+'px; width:100px;height:100px; z-index:5;');
           var fields = text.split(/\n/);
           var data = fields.slice(1,fields.length);
           for(var j = 0; j < data.length; j += 1) {
				// suivre l'état d'avancement de generation de la table dans la BD
				$("#taxonsHeader").html("Chargement de la ligne " + j + " /" + data.length + "...");
				var dataFields = data[j].split(';');
				var  values = ""
				for(var k = 0; k < dataFields.length; k += 1) {
				values = values +"'"+dataFields[k]+"',";
				}
				var n=values.lastIndexOf(",");
				var val = values.substr(0,n);
				var req = "INSERT INTO thesaurus (ereleveId,Id_Type,Id_Parent,hierarchy,topic_fr,topic_en,definition_fr,definition_en,Reference,available_EAU,available_Morocco)"
						+ " VALUES ("+ val +")";
				insertRow(req);
           }
		   localStorage.setItem('fileThesaurusLoaded', "true");
		   $("#taxonsHeader").html("Taxons");
		   $("#waitControlTaxa").attr('style', 'display:none;');
       }
    });
}