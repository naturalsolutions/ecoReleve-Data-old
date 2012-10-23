
$().ready(function() {
		init();
}) ;
//************************************* Fonctions
function init (){
	window.w_screen = screen.width;
	window.h_screen = screen.height;
	window.trackLoaded = false;
	window.showMyLocation = 1;
	window.watchID = null;
	//window.markers = new OpenLayers.Layer.Markers( "Markers");
	//window.marker = null;
	//window.flLat = 43.29;
	//window.flLong = 5.37;
	window.point = new OpenLayers.LonLat(5.37,43.29);
	document.addEventListener("deviceready", onDeviceReady, false);
	$(document).bind( "mobileinit", function(){
    $.support.cors = true; 
    $.mobile.allowCrossDomainPages = true;
	});

	var dbCreated = localStorage.getItem('mydbCreated');
	var xmlTrackLoaded = localStorage.getItem('xmlTrackLoaded'); 
	initializeDB();
	var fileIndivLoaded = localStorage.getItem('fileIndivLoaded');
	var fileThesaurusLoaded = localStorage.getItem('fileThesaurusLoaded');
	if (fileIndivLoaded != "true"){
		loadFileIndiv(db);
	}
	if (fileThesaurusLoaded != "true"){
		loadFileThesaurus(db);
	}
	// charger la table tracks 
	/*if (xmlTrackLoaded != "true"){
		loadXmlTrack(db);
	}*/

	// initialiser le groupe de taxa sélectionné pour la page taxa
	localStorage.setItem('taxaSelectedGroup', "");
	initMap(); // initialiser la carte openstreetmap
	myPosition();
}
function criteriasQuery(criteres){
	var conditionQuery ="";
	var criteresListe = new Array();
	var criteresTab = criteres.split('&');
	for (var i=0; i < criteresTab.length; i++){
			// exemple de structure de chaque element de criteresTab[i]: crit="1.2"
			var tab = criteresTab[i].split('=');
			if (tab[1] != "" && tab[1] != "vide"){
			//alert(tab[0] + " valeur: " + tab[1]);
				conditionQuery += tab[0] + "= '" + tab[1] +"' AND ";
			}
				
		//	criteresListe.push(tab[1]);
	}
	// enlever le dernier AND
	conditionQuery = conditionQuery.substring(0, conditionQuery.length - 4);
	var query = "SELECT * FROM TIndividus WHERE " + conditionQuery;
	getItems(db, query, successSelectionIndiv);
	//Search(db, conditionQuery);
}
function successIndivDetails(transaction, rs) { 
	$("#birdsDetailsIndiv").empty();
	var currentRow = rs.rows.item(0);
	var ligne = "<li><p><B>Frequency: </B>" + currentRow['Tind_Frequency'] + "</p></li>"; 
		ligne += "<li><p><B>FieldWorker1: </B>" + currentRow['Tind_FieldWorker1'] + "</p></li>"; 
		ligne += "<li><p><B>FieldActivity name: </B>" + currentRow['Tind_FieldActivity_Name'] + "</p></li>"; 
		ligne += "<li><p><B>Name: </B>" + currentRow['Tind_Name'] + "</p></li>"; 
		ligne += "<li><p><B>Region: </B>" + currentRow['Tind_Region'] + "</p></li>"; 
		ligne += "<li><p><B>DATE: </B>" + currentRow['Tind_DATE'] + "</p></li>"; 
		ligne += "<li><p><B>Place: </B>" + currentRow['Tind_Place'] + "</p></li>"; 
		ligne += "<li><p><B>Latitude: </B>" + currentRow['Tind_LAT'] + "</p></li>"; 
		ligne += "<li><p><B>Longitude: </B>" + currentRow['Tind_LON'] + "</p></li>"; 
		ligne += "<li><p><B>Site name: </B>" + currentRow['Tind_Site_name'] + "</p></li>"; 
		ligne += "<li><p><B>Monitored Site type: </B>" + currentRow['Tind_MonitoredSite_type'] + "</p></li>"; 
		ligne += "<li><p><B>Origin: </B>" + currentRow['Tind_Origin'] + "</p></li>"; 
		ligne += "<li><p><B>Species: </B>" + currentRow['Tind_Species'] + "</p></li>"; 
		ligne += "<li><p><B>Status: </B>" + currentRow['Tind_Status'] + "</p></li>"; 
		ligne += "<li><p><B>NumBagBre: </B>" + currentRow['Tind_NumBagBre'] + "</p></li>"; 
		ligne += "<li><p><B>NumBagRel: </B>" + currentRow['Tind_NumBagRel'] + "</p></li>"; 
		ligne += "<li><p><B>Chip: </B>" + currentRow['Tind_Chip'] + "</p></li>"; 
		ligne += "<li><p><B>Sex: </B>" + currentRow['Tind_Sex'] + "</p></li>"; 
		ligne += "<li><p><B>Label: </B>" + currentRow['Tind_label'] + "</p></li>"; 
		ligne += "<li><p><B>Status: </B>" + currentRow['Tind_Status'] + "</p></li>"; 
		ligne += "<li><p><B>Transmitter shape: </B>" + currentRow['Tind_Tr_Shape'] + "</p></li>"; 
		ligne += "<li><p><B>Transmitter model: </B>" + currentRow['Tind_Tr_Model'] + "</p></li>"; 
		ligne += "<li><p><B>Transmitter number: </B>" + currentRow['Tind_Tr_Number'] + "</p></li>"; 
		ligne += "<li><p><B>FreqOpti: </B>" + currentRow['Tind_FreqOpti'] + "</p></li>"; 
		ligne += "<li><p><B>PTT: </B>" + currentRow['Tind_PTT'] + "</p></li>"; 
		ligne += "<li><p><B>TCaracThes_Mark_Color_1_Precision: </B>" + currentRow['Tind_TCaracThes_Mark_Color_1_Precision'] + "</p></li>"; 

	$('#birdsDetailsIndiv').append(ligne);									
	$("#birdsDetailsIndiv").listview('refresh');
	// stocker les coordonnées dans le localStorage
	localStorage.setItem('lastLatitude', currentRow['Tind_LAT']);
	localStorage.setItem('lastLongitude', currentRow['Tind_LON']);
} 
function successLoadingTracks(transaction, rs) { 

	var len = rs.rows.length;
	for (var i = 0; i < 1000; i++) {
		debugger;
		var chaineWKT = "LINESTRING (" + rs.rows.item(i).Ttra_coords	+ ")";
		ShowTrack(chaineWKT);
	} 
}
function successQueryTaxaList (transaction, resultSet){
var len = resultSet.rows.length;
				var lenBoucle;
				$('#taxonsListValeurs').empty();
				if ( len == 0 ){
					$.mobile.changePage ($('#alerteJQM'));
					$("#alerteJQM-Content").text("No taxa for the selected criterias");
					$("#btnOk-alerteJQM").attr("href","#taxons"); 
					$("#alerteJQMheader").html("<h3>Query results</h3>");
				}
				else if (len < 50 ){
					lenBoucle = len;
				} else {
					lenBoucle = 50;
					alert (" + de 50 ligne! ");
				}
					for (var i = 0; i < lenBoucle; i++) {
					//for (j in resultSet.rows.item(i)){ alert(j);}
					//alert(resultSet.rows.item(i).Thes_Status_Precision);  

					var spn = '<li taxa_id=' + resultSet.rows.item(i).PK_Id + '><a href=#> '+resultSet.rows.item(i).topic_en +'</a></li>';
					//spn =spn + '<li data-theme="B">  TCarac_Breeding_Ring_Code : '+resultSet.rows.item(i).TCarac_Breeding_Ring_Code+'</li>'
					//spn =spn + '<li data-theme="B">  TCarac_Chip_Code  : '+resultSet.rows.item(i).TCarac_Chip_Code+'</li>'

					$('#taxonsListValeurs').append(spn);
					$('#taxonsListValeurs').listview("refresh");
					}

}
function successTaxaDetails(transaction, rs){
	$("#taxonsDetailsIndiv").empty();
	var currentRow = rs.rows.item(0);
	var ligne = "<li><p><B>Topic_en: </B>" + currentRow['topic_en'] + "</p></li>"; 
		ligne += "<li><p><B>definition_en: </B>" + currentRow['definition_en'] + "</p></li>"; 
		ligne += "<li><p><B>Hierarchy: </B>" + currentRow['hierarchy'] + "</p></li>"; 
	$('#taxonsDetailsIndiv').append(ligne);										
	$("#taxonsDetailsIndiv").listview('refresh');

}
/*
function TestQuery(criteres){
	var Sub, Farm, Prospection, Frequence, Qualite;
	var criteresListe = new Array();
	var criteresTab = criteres.split('&');
	for (var i=0; i < criteresTab.length; i++){
			// exemple de structure de chaque element de criteresTab[i]: crit="1.2"
			var tab = criteresTab[i].split('=');
			// recuperer le code du critere et l'ajouter à la liste de criteres, la taille du tableau est le nombre de criteres selectionnés
			//criteresListe.push(tab[1]);
			if(tab[0] == "Sub"){
			Sub = tab[1];
			}else if ( tab[0] == "Farm" ){
			Farm = tab[1];
			}else if ( tab[0] == "Prospection" ){
			Prospection = tab[1];
			}else if ( tab[0] == "Frequence" ){
			Frequence = tab[1];
			}else if ( tab[0] == "Qualite" ){
			Qualite = tab[1];
			}

	}
	var query = 'INSERT INTO ecoReleve (Sub, Farm, Prospection, Frequence, Qualite) VALUES (?,?,?,?,?);';
	var param = [Sub, Farm, Prospection, Frequence, Qualite];  // parametres de la requete
	insertNewRow(query, param);
}
function Search(db, val) {
	var query = "SELECT * FROM TIndividus WHERE " + val ;
	
		db.transaction(function (trxn) {
        trxn.executeSql(
			query, //requete à executer
			[], 
		dataSelectItem, 			// parametres de la requete
			function (transaction, error) {  //error callback
			    console.log('error');
			}
		);
	});
}*/
function successSelectionIndiv (transaction, resultSet) {
  //success callback
	var obsTab = new Array();
	var len = resultSet.rows.length;
	var lenBoucle;
	$('#birdsListValeurs').empty();
	if ( len == 0 ){
		$.mobile.changePage ($('#alerteJQM'));
		$("#alerteJQM-Content").text("No birds for the selected criterias");
		$("#btnOk-alerteJQM").attr("href","#birds"); 
		$("#alerteJQMheader").html("<h3>Query results</h3>");
	}
	else if (len < 50 ){
		lenBoucle = len;
	} else {
		lenBoucle = 50;
		alert (" + de 50 ligne! ");
	}
	for (i = 0; i < lenBoucle; i++) {
		var spn = '<li indiv_id=' + resultSet.rows.item(i).Tind_PK_Id + '><a href=#>Frequency : '+resultSet.rows.item(i).Tind_Frequency +'</a></li>';
		//spn =spn + '<li data-theme="B">  TCarac_Breeding_Ring_Code : '+resultSet.rows.item(i).TCarac_Breeding_Ring_Code+'</li>'
		//spn =spn + '<li data-theme="B">  TCarac_Chip_Code  : '+resultSet.rows.item(i).TCarac_Chip_Code+'</li>'
		$('#birdsListValeurs').append(spn);
		$('#birdsListValeurs').listview("refresh");
	}
}
function onDeviceReady(){  
		document.addEventListener("menubutton", onMenuKeyDown, false);
    }
function confirmCallbackQuitter(){
	 navigator.app.exitApp(); 
}
function onMenuKeyDown(){
  $.mobile.changePage($("#exit"), {transition: "pop"});
}
function convertToFloat(string){
var n=string.lastIndexOf(",");
var val = string.substr(0,n);
var str = val + "." + string.substr(n+1, string.length);
return parseFloat(str);
}





