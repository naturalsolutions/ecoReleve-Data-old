// ************************************ Gestion de la database
function initializeDB(){
// initialise la base si elle n'existe pas
	try {
		if (window.openDatabase) {
			 window.db = openDatabase("ecoReleve-mobile", "1.0", "db ecoreleve", 20*1024*1024); // espace accordé à la BD: 20 MO
		
			
			/*requete = 'DROP TABLE IF EXISTS thesaurus';
			clearTable(requete);
			requete = 'DROP TABLE IF EXISTS TIndividus';
			clearTable(requete);
			requete = 'DROP TABLE IF EXISTS Tobservations';
			clearTable(requete);
			requete = 'DROP TABLE IF EXISTS Tpositions';
			clearTable(requete);
			requete = 'DROP TABLE IF EXISTS Tprotocols';
			clearTable(requete);*/
			
			/*var requete = 'CREATE TABLE IF NOT EXISTS ecoReleve (PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Sub NVARCHAR(100), '
							+ 'Farm NVARCHAR(100),Prospection BOOLEAN, Frequence INTEGER, Qualite NVARCHAR(100))';
			createTable(requete);*/
			// creer la table individus
			var requete = 'CREATE TABLE IF NOT EXISTS TIndividus(Tind_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,Tind_FieldWorker1 VARCHAR,'
			+'Tind_FieldWorker2 VARCHAR, Tind_FieldActivity_Name VARCHAR, Tind_Name VARCHAR, Tind_Region VARCHAR, Tind_Place VARCHAR, Tind_DATE VARCHAR,'
			+'Tind_LAT VARCHAR, Tind_LON VARCHAR, Tind_Site_name VARCHAR,Tind_MonitoredSite_type VARCHAR, Tind_label VARCHAR, Tind_Sex VARCHAR,'
			+'Tind_Origin VARCHAR, Tind_Species VARCHAR, Tind_Status VARCHAR, Tind_Tr_Shape VARCHAR, Tind_Tr_Model VARCHAR, Tind_Tr_Number VARCHAR,' 
			+ 'Tind_NumBagBre VARCHAR, Tind_Chip VARCHAR, Tind_TCaracThes_Mark_Color_1_Precision VARCHAR, Tind_PTT VARCHAR, Tind_Frequency VARCHAR,'
			+'Tind_NumBagRel VARCHAR, Tind_Fk_TInd_ID VARCHAR, Tind_FreqOpti VARCHAR)';
			createTable(requete);
			// table taxons (thesaurus)
			requete = 'CREATE TABLE IF NOT EXISTS thesaurus (PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, '
							+ 'ereleveId VARCHAR ,Id_Type VARCHAR, Id_Parent VARCHAR, hierarchy VARCHAR, topic_fr VARCHAR, topic_en VARCHAR, definition_fr VARCHAR,'
							+ 'definition_en VARCHAR, Reference VARCHAR, available_EAU VARCHAR, available_Morocco VARCHAR )';
			createTable(requete);
			// Table protocoles
			requete = 'CREATE TABLE IF NOT EXISTS Tprotocols (Tprot_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, prot_id VARCHAR, prot_name VARCHAR)';
			createTable(requete);
			// Table observations
			requete = 'CREATE TABLE IF NOT EXISTS Tobservations (Tobs_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, dateNow VARCHAR, prot_name VARCHAR, protValues VARCHAR)';
			createTable(requete);
			// table positions
			requete = 'CREATE TABLE IF NOT EXISTS Tpositions (Tpos_PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, pos_name VARCHAR, pos_latitude VARCHAR,'
					+ 'pos_longitude VARCHAR, pos_date VARCHAR , pos_time VARCHAR)';
			createTable(requete);
			// table tracks
			/*var requete = 'CREATE TABLE IF NOT EXISTS Ttracks (PK_Id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, Ttra_coords VARCHAR)';
			createTable(requete);*/
			
			localStorage.setItem('mydbCreated', true);
			// netoyer la BD
			if (!db)
				alert("Impossible d'ouvrir la bdd. Peut être un problème de version ou alors pas assez de quota d'espace disque disponible pour ce domaine.");
		//createTaxaTable(db);
		} else
			alert("Impossible d'ouvrir la base de données. Merci d'essayer avec un autre navigateur.");
		return db;
		} catch (err) { }
 }
function createTable(requete){
    var query = requete;
	db.transaction (function (trxn) {
		trxn.executeSql(
			query, //requete à executer
			[],  // parametres de la requete
			function (transaction, resultSet){  //success callback
			//	console.log('success');
			},
			function (transaction, error){  //error callback
			console.log('erreur dan la creation de la table');
			}
		);
	});
}
function clearTable(requete){
     //   var query = 'DROP TABLE IF EXISTS TObservations';
        db.transaction(function (trxn) {
            trxn.executeSql(
			requete, //requete à executer
			[],  // parametres de la requete
			function (transaction, resultSet) {  //success callback
			   // console.log('success netoyage de table');
			},
			function (transaction, error) {  //error callback
			    console.log('erreur suppression de table');
			}
		);
});								 
 } 
function getItems(db, query, queryCallback){
	db.transaction(function(tx){
				tx.executeSql(query,[], queryCallback);
	});
}
function insertNewRow(requete, parametres){
  //  var query = requete;
    db.transaction(function (transaction) {
        transaction.executeSql(
			requete, //requete à executer
			parametres
		);
    });
}
function insertRow(requete){
  //  var query = requete;
    db.transaction(function (transaction) {
        transaction.executeSql(requete);
    });
}
function selectItems(req){
db.transaction(function (tx) {
   tx.executeSql(req, [], function (tx, results) {
   return results;
 }, null);
});
}
function updateTable(requete){
  //  var query = requete;
    db.transaction(function (transaction) {
        transaction.executeSql(requete);
    });
}
///////////////

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
	window.point = new OpenLayers.LonLat(5.37,43.29);
	window.idObservationToEdit = "";
	window.entryMode ="newObs";
	
	document.addEventListener("deviceready", onDeviceReady, false);
	$(document).bind( "mobileinit", function(){
    $.support.cors = true; 
    $.mobile.allowCrossDomainPages = true;
	});
	// langue du navigateur 
	/*{
		var language = navigator.language;
		if (language.indexOf('fr') > -1) {alert ("navigateur en français");}
	}
	*/
	var dbCreated = localStorage.getItem('mydbCreated');
	//var xmlTrackLoaded = localStorage.getItem('xmlTrackLoaded'); 
	initializeDB();
	var fileIndivLoaded = localStorage.getItem('fileIndivLoaded');
	var fileThesaurusLoaded = localStorage.getItem('fileThesaurusLoaded');
	var fileProtocolsLoaded = localStorage.getItem('fileProtocolsLoaded');
	if (fileIndivLoaded != "true"){
		loadFileIndiv(db);
	}
	if (fileThesaurusLoaded != "true"){
		loadFileThesaurus(db);
	}
	if (fileProtocolsLoaded != "true"){
		loadFileProtocols(db);
	}
	// charger la table tracks 
	/*if (xmlTrackLoaded != "true"){
		loadXmlTrack(db);
	}*/

	// initialiser le groupe de taxa sélectionné pour la page taxa
	localStorage.setItem('taxaSelectedGroup', "");
	initMap(); // initialiser la carte openstreetmap
	myPositionOnMap();
	parseXML();
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
	var spn ="";
	for (var i = 0; i < lenBoucle; i++) {
		var spn = '<li taxa_id=' + resultSet.rows.item(i).PK_Id + '><a href=#> '+resultSet.rows.item(i).topic_en +'</a></li>';
		//spn =spn + '<li data-theme="B">  TCarac_Breeding_Ring_Code : '+resultSet.rows.item(i).TCarac_Breeding_Ring_Code+'</li>'
		//spn =spn + '<li data-theme="B">  TCarac_Chip_Code  : '+resultSet.rows.item(i).TCarac_Chip_Code+'</li>'
	}
	if (spn != ""){
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
	var spn ="";
	for (var i = 0; i < lenBoucle; i++) {
		spn += '<li indiv_id=' + resultSet.rows.item(i).Tind_PK_Id + '><a href=#>Frequency : '+resultSet.rows.item(i).Tind_Frequency +'</a></li>';
		//spn =spn + '<li data-theme="B">  TCarac_Breeding_Ring_Code : '+resultSet.rows.item(i).TCarac_Breeding_Ring_Code+'</li>'
		//spn =spn + '<li data-theme="B">  TCarac_Chip_Code  : '+resultSet.rows.item(i).TCarac_Chip_Code+'</li>'
	}
	if (spn != "" ){
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
function saveObservation(valFormulaire){

	var dateObs = new Date();
	var protocolName = localStorage.getItem('protoName');
	var protId = localStorage.getItem('protId');
	//nouvelle observation
	if (window.entryMode == "newObs"){
	var query = 'INSERT INTO Tobservations (dateNow, prot_name, protValues) VALUES (?,?,?);';
	var param = [dateObs, protocolName, valFormulaire];  // parametres de la requete
	insertNewRow(query, param);
	$("#data-entry-infos").text("observation stored !");
	// edition obs existante
	} else {
		var query = 'UPDATE Tobservations SET protValues = "' + valFormulaire + '" WHERE Tobs_PK_Id =' + window.idObservationToEdit ;
		//alert ("id obs" + window.idObservationToEdit);
		updateTable(query);
		$("#data-entry-infos").text("observation updated !");
	}
	$('#listform').empty();
	$("#btnsubmitProto").attr("style","display:none;");
	$("#data-entry-select-taxa-div").attr("style","display:none;");
	$("#data-entry-infos").attr("style","");
	//$("#data-entry-infos").text("observation stored !");
	//mettre à jour l'infobulle du nbre d'obs stockées par protocole
	var spanInfoId = "#info-" + protId;
	var lastValSpanInfo = $(spanInfoId).text();
	if (lastValSpanInfo ==""){
		$(spanInfoId).text("1");
	}else{
		lastValSpanInfo = parseInt(lastValSpanInfo) + 1; 
		 $(spanInfoId).text(lastValSpanInfo);
	}
	window.entryMode = "newObs";
}
function loadMyStoredData(){
	var query = "SELECT prot_name,COUNT(prot_name) AS som FROM Tobservations GROUP BY prot_name";
	getItems(db, query, successSelectionObsProt);
}
function successSelectionObsProt(tr, rs){
	var len = rs.rows.length;
	var spn ="";
	$('#protListObs').empty();
	for ( var i = 0; i < len; i++) {
		spn += '<li name="'+ rs.rows.item(i).prot_name +'"><a href=#>'+ rs.rows.item(i).prot_name +'<span class="ui-li-count">' + rs.rows.item(i).som + '</span></a></li>';
	}
	$('#protListObs').append(spn);
	$('#protListObs').listview("refresh");
}
function generateDetailsObsForProtocol(nomProtocol){
	var query = "SELECT * FROM Tobservations WHERE prot_name='" + nomProtocol + "'";
	getItems(db, query, successGenerateDetailsObsForProtocol);
}
function successGenerateDetailsObsForProtocol(tr,rs){
	var spn ="";
	for ( var i = 0; i < rs.rows.length; i++) {
		var myDate = rs.rows.item(i).dateNow;
		var obsId = rs.rows.item(i).Tobs_PK_Id;
		myDate = myDate.substring(0,25);
		spn += "<li ><a href=# obsId='" + obsId +"' lien='details'>Obs date : "+ myDate +"<span class='ui-li-count'>&gt;</span></a><a href=# class='liOneObsDetails' obsId='" + obsId +"' data-icon='delete'>Supprimer l'observation</a></li>";
	}
	$('#selectedProtObsDetails').append(spn);
	$('#selectedProtObsDetails').listview("refresh");
}
function getObsDetails(idObs){
	var query = "SELECT * FROM Tobservations WHERE Tobs_PK_Id=" + idObs ;
	getItems(db, query, successObsDetails);
}
function successObsDetails(tr,rs){
	var protName = rs.rows.item(0).prot_name;
	var formValues = rs.rows.item(0).protValues;
	var idObs = rs.rows.item(0).Tobs_PK_Id;
	loadDetailsForSelectedObs(protName,formValues,idObs);
	$.mobile.changePage ($('#alerteJQM'));
	$("#btnOk-alerteJQM").attr("href","#my-data"); 
	$("#alerteJQMheader").html("<h3>Details</h3>");
	// contenu de la fenetre flottante -> details champs pour l'observation selectionnée

}
function loadDetailsForSelectedObs(protName, formValues,idObs){
	// spliter la chaine correspondant aux valeurs de champs de saisie pour l'obs selectionnée pour alimenter la vue de la fenetre affichée
	//getProtocolId(protName);
	//var protId = localStorage.getItem('selectedProtocol');
	var stringHtml = splitFormValues(formValues);
	$("#alerteJQM-Content").html(stringHtml);
	// il faut rajouter un controle permettant de générer la page"data entry" avant l'id du protocole et en affectant aux champs les valeurs contenues dans "formValues"
	//? /
	var obsVals = '<div id="obsDetailsObsVals" style="display:none;" idObs="'+ idObs +'">'+ formValues +'<div>';
	$("#alerteJQM-Content").append(obsVals);
	// rajouter le bouton edit valeur observation
	var btnEdit = '<a href=# data-role=button id="btnEditObs" data-icon="check" >Edit</a>';
	$("#alerteJQM-Content").append(btnEdit);
}
// foction qui splite la chaine "contenu formulaire et qui retourne le code html à afficher dans la vue 
function splitFormValues(fieldsValues){
	var maReg =/[+]/g;
	var strHtml ="";
	var formFieldsListe = new Array();
	var fieldsTab = fieldsValues.split('&');
	for (var i=0; i < fieldsTab.length; i++){
		var tab = fieldsTab[i].split('=');
		// si la valeur du champ n'est pas vide
		if (tab[1] != ""){
			var tabValsFieldName = tab[0].split("-");
			var labelField ="";
			var len = tabValsFieldName.length;
			for (var j= 2; j<len; j++){
				labelField += " " + tabValsFieldName[j];
			}
			// enlever le signe "+" de la chaine valeur, si ce signe ne se trouve pas en 1ère position de la chaine
			var fieldVal = tab[1];
			var fieldValsub = fieldVal.substring(1, fieldVal.length);
			fieldValToDisplay = fieldVal.substring(0,1) + fieldValsub.replace(maReg, " ");
			var ln = "<li><p><i>"+ labelField + " : </i>" + fieldValToDisplay + "</p></li>";
			strHtml += ln;
		}
	}
	return strHtml;
}

function savePosition(valFormulaire){
	var posName, latitude, longitude, posDate, posTime;
	var valFields = valFormulaire.split('&');
	for (var i=0; i < valFields.length; i++){
		var tab = valFields[i].split('=');
		if(tab[0] == "newPosName"){
		posName = tab[1];
		}else if ( tab[0] == "newPosLon" ){
		longitude = tab[1];
		}else if ( tab[0] == "newPosLat" ){
		latitude = tab[1];
		}else if ( tab[0] == "newPosDate" ){
		posDate = tab[1];
		}else if ( tab[0] == "newPosTime" ){
		posTime = tab[1];
		}
	}
	//alert ("posName : " + posName + " longitude: " + longitude + " latitude: " + latitude + " posDate: "+ posDate + " posTime:"+ posTime);
	var query = 'INSERT INTO Tpositions (pos_name, pos_latitude, pos_longitude, pos_date, pos_time) VALUES (?,?,?,?,?);';
	var param = [posName, longitude, latitude, posDate,posTime ];  // parametres de la requete
	insertNewRow(query, param);
	// renseigner la partie infos station
	$("#data-entry-info-position").attr("style","");
	$("#stat-name").text(posName);
	$("#stat-lat").text(latitude);
	$("#stat-long").text(longitude);
	$("#stat-time").text(posTime);
}
function updateTime(){
	var timeNow = getTimeNow();
	$("#homeHorloge").text(timeNow);
	timerID = setTimeout("updateTime()",1000);
}
function getTimeNow(){
	var today   = new Date();
	var Heure = today.getHours();
	var Min = today.getMinutes();
	var timeValue = Heure;
	timeValue += ((Min < 10) ? ":0" : ":") + Min;
	return timeValue;
}
function getToday(){
	var today  = new Date();
	var day = dayName(today);
	var MM = mounthName(today);
	var dateMonth = today.getDate();
	return (day + " " + MM + " " + dateMonth);
	//$("#dateToday").text(day + " " + MM + " " + dateMonth);
}
function mydateToday(){
	var today  = new Date();
	var year = today.getFullYear();
	var MM = today.getMonth();
	MM = ((MM < 10) ? "0" : "") + MM;
	var day = today.getDate();
	day = ((day < 10) ? "0" : "") + day;
	return (day +"/" + MM + "/" + year);
}
function loadStoredPositions(){
	var query = "SELECT * FROM Tpositions";
	getItems(db, query, successloadStoredPositions);
}
function successloadStoredPositions(tr,rs){
	// construire le tableau de points qui va servir pour etre affiché avec le plugin data-Table
	// les noms de colonnes
	var tabPositions = new Array();
	
	for ( var i = 0; i < rs.rows.length; i++) {
		var tab = new Array();
		tab[0] = rs.rows.item(i).Tpos_PK_Id;
		tab[1] = rs.rows.item(i).pos_name;
		tab[2] = rs.rows.item(i).pos_latitude;
		tab[3] = rs.rows.item(i).pos_longitude;
		tab[4] = rs.rows.item(i).pos_date;
		tab[5] = rs.rows.item(i).pos_time;
		tabPositions.push(tab);
	}
    $('#storedLocationsContent').html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="storedLocationsTable"></table>' );
    oTable = $('#storedLocationsTable').dataTable( {
        "aaData": tabPositions //[
            /* Reduced data set 
            [ "Trident", "Internet Explorer 4.0", "Win 95+", 4, "X" ],
            [ "Trident", "Internet Explorer 5.0", "Win 95+", 5, "C" ]
        ]*/,
        "aoColumns": [
            { "sTitle": "Id" },
            { "sTitle": "Nom du lieu" },
            { "sTitle": "Latitude" },
			 { "sTitle": "Longitude" },
            { "sTitle": "date", "sClass": "center" },
            { "sTitle": "heure", "sClass": "center" }
        ]
    }); 

	/* Add a click handler to the rows - this could be used as a callback */
    $("#storedLocationsTable tbody tr").click( function( e ) {
        if ( $(this).hasClass('row_selected') ) {
            $(this).removeClass('row_selected');
        }
        else {
            oTable.$('tr.row_selected').removeClass('row_selected');
            $(this).addClass('row_selected');
        }
		var aPos = oTable.fnGetPosition( this );

		// Get the data array for this row
		var aData = oTable.fnGetData( aPos[1] ); 
		//		alert (" position : " + aData[aPos] );
		// Update the data array and return the value
		/*aData[ aPos[1] ] = 'clicked';
		this.innerHTML = 'clicked';*/
		window.selectedLigne = aData[aPos];
    });
}
/* plugin data-Table : Get the rows which are currently selected */
function fnGetSelected( oTableLocal )
{
    return oTableLocal.$('tr.row_selected');
}
/*function createNewPosition(){
	var formPosition ="<form id='newLocationDivform'>"
					+	"<ul id='newLocationColumnsList' data-role='listview' data-inset='true' data-split-icon='gear' data-split-theme='d'>"
					+	"<li><span>Nom du lieu</span><input  name ='newPosName' value='Saisir le nom du lieu' id ='newPosName'/></li>"
					+	"<li><span>Longitude</span><input name ='newPosLon' id ='newPosLon' value='0.00'/></li>"
					+	"<li><span>Latitude</span><input name ='newPosLat' id ='newPosLat' value='0.00'/></li>"
					+	"<li><span>Date</span><input name ='newPosDate' id ='newPosDate' /></li>"
					+	"<li><span>Heure</span><input name ='newPosTime' id ='newPosTime' /></li>"	
					+	"</ul>"
					+	"</form> "
					+	"<div data-role='controlgroup' data-type='horizontal' >"
					+		"<a href='' data-role=button  data-icon='check' id='newLocationBtnSubmit' >Valider</a>"
					+		"<a href='' data-role=button  data-icon='delete' id='newLocationBtnReset' >Annuler</a>"
					+	"</div>";
	$("#data-entry-new-pos-form").html(formPosition);
}*/
function getValStationName(){
	var query = "select * from Tpositions order by Tpos_PK_Id desc limit 1; ";
	getItems(db, query, successGetIdLastStation);
}
function successGetIdLastStation(tr,rs){
	var id_last_station
	if ( rs.rows.length > 0){
		id_last_station = rs.rows.item(0).Tpos_PK_Id;
	}
	else{
		id_last_station = 0;
	}
	id_last_station +=1;
	$("#newPosName").val("sta" + id_last_station );
}
function successQueryTaxaAutocomplete(tr,rs){
	var listResult = new Array();
	if ( rs.rows.length > 0){
		for ( var i = 0; i < rs.rows.length; i++) {
			listResult.push(rs.rows.item(i).topic_en);
		}
		listResult.sort();
	}
	$("#taxaSelection-input").autocomplete({
		target: $('#taxaSelection-taxa-list'),
		source: listResult,
		link: null,
		minLength: 1,
		matchFromStart: false
	});
	
}
function getProtocolId(protocolName){
	protocolName = trim(protocolName);
	var query = "select * from Tprotocols WHERE prot_name LIKE '" + protocolName + "';";
	getItems(db, query, successGetProtocolId);
}
function successGetProtocolId (tr,rs){
	var protId = rs.rows.item(0).prot_id ;
	localStorage.setItem('selectedProtocol', protId);
}
function loadActualFieldsValues(fieldsValues,idProtocol,idObsToEdit){
	window.idObservationToEdit = idObsToEdit;
	var taxaName="";
	var stationName ="";
	var fieldvalOutput ;
	//var maReg = new RegExp( "\+", "gi") ; 
	var maReg =/[+]/g;
	// variable qui sert à controler si le formulaire est chargé dans le DOM
	//var formLoaded = localStorage.getItem("fildsLoded");
	var xmlString = localStorage.getItem("protocol-id-" + idProtocol); 
	var xmlProtocolVal = parseXml(xmlString);
	//var nameProt = $(xmlnodeVal2).find('display_label:first').text();
	var valFields = fieldsValues.split('&');
	for (var i=0; i < valFields.length; i++){
		var tab = valFields[i].split('=');
		fieldVal =tab[1];
		//chercher s'il y a des "+" dans la valeur de fieldVal pour les remplacer par des " "
		var indice = fieldVal.lastIndexOf("+");
		if ( indice > 0 ){
			//fieldVal = fieldVal.replaceAll("\\[+\\]", " "); 
			
			//var fieldvalOutput = fieldVal.replace(maReg,"&nbsp;");
			fieldvalOutput = fieldVal.replace(maReg, " ");
			fieldVal = fieldvalOutput;
		//	fieldVal = fieldVal.replace(/'+'/g, " ");
			//fieldVal = replaceAll(fieldVal,"+"," ");
		}
		var fieldName = tab[0];  // valeur recuperée exemple: 1-1-densité (id protocole - id champ - nom champ )
		var fielNameTab = fieldName.split('-');
		var fieldId = fielNameTab[1];
		fieldName = fielNameTab[2]; // partie de la chaine qui correspond au nom du champ
		// remplacer le caractère "+" par " "
		//fieldName =fieldName.replace("+"," ");	
		if ( (fieldName !='taxa') && (fieldName !='station')){
		//var nodeField = $(xmlProtocolVal).find('fields display_label:contains("'+ fieldName + '")').text();
		//var nodeField = $(xmlProtocolVal).find('fields display_label:contains("'+ fieldName + '")').parent().parent().find('default_value').text(fieldVal);

			$(xmlProtocolVal).find('fields > *').each(function(){
				 if( $(this).attr("id")== fieldId ){
					//alert (" fieldId : "+ fieldId);
					$(this).find('default_value').text(fieldVal);
					var fieldvalue = $(this).find('default_value').text();
					//alert("id : "+ fieldId + "value : " + fieldvalue);
				 };
			});
		}
		else if (fieldName =='taxa'){
			//var nameInput = idProtocol + "-0-taxa";
			taxaName = fieldVal;
		}
		else if (fieldName =='station'){
			//var nameInput = idProtocol + "-0-taxa";
			stationName = fieldVal;
			//alert(stationName);
		}
	}
	// regenerer l'ecran de saisie de la page "data-entry" avec les nouvelles valeurs par defaut des champs correspondant aux données à modifier
	$.mobile.changePage ($('#data-entry'));	
	generateFormFromXml(xmlProtocolVal,taxaName,stationName);
	$("#data-entry-infos").attr("style","display:none;");
	$("#listform-Info-Pos").attr("style","display:none;");
	
}
function deleteOneObs(idObservation){
	var query = "DELETE FROM Tobservations WHERE Tobs_PK_Id=" + idObservation ;
	clearTable(query);
}
// parseur XML
function parseXML(){
	if (typeof window.DOMParser != "undefined") {
		window.parseXml = function(xmlStr) {
			return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
		};
	} else if (typeof window.ActiveXObject != "undefined" &&
		   new window.ActiveXObject("Microsoft.XMLDOM")) {
		window.parseXml = function(xmlStr) {
			var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
			xmlDoc.async = "false";
			xmlDoc.loadXML(xmlStr);
			return xmlDoc;
		};
	} else {
		throw new Error("No XML parser found");
	}
}
/*function replaceAll(txt, replace, with_this) {
  return txt.replace(new RegExp(replace, 'g'),with_this);
}*/
function trim(myString){ 
	return myString.replace(/^\s+/g,'').replace(/\s+$/g,'') ;
} 
function dayName (dateToday){
  switch (dateToday.getDay())
    {
    case 1 : return "Monday";
             break;
    case 2 : return "Tuesday";
             break;
    case 3 : return "Wednesday";
             break;
    case 4 : return "Thursday";
             break;
    case 5 : return "Friday";
             break;
    case 6 : return "Saturday";
             break;
    case 7 : return "Sunday";
             break;
    }
}
function mounthName(dateToday){
switch (dateToday.getMonth())
  {
  case 0 : return ("january");
           break;
  case 1 : return ("february");
           break;
  case 2 : return ("march");
           break;
  case 3 : return ("april");
           break;
  case 4 : return ("may");
           break;
  case 5 : return ("june");
           break;
  case 6 : return ("july");
           break;
  case 7 : return ("august");
           break;
  case 8 : return ("september");
           break;
  case 9 : return ("october");
           break;
  case 10 : return ("november");
           break;
  case 11 : return ("december");
           break;
  }
}
///////////////
// ******************************* Gestion des évènements sur les  pages
// rajouter une barre de navigation
var navBar = ""//"<div data-role='footer' data-position='fixed' data-id='nav'>"
			+ "<div data-role='app-bar' >"
			//+ "<ul><li>"
			+" <a href='#home' data-icon='home' data-iconpos='top'>Home</a>"
			//+"</li><li>"
			+ "<a href='#data-entry' data-icon='grid'>Data entry</a>"
			//+ "</li><li>"
			+ "<a href='#birds' data-icon='search'>Birds</a>"
			//+ "</li><li>"
			//+ "<ul><li>"
			+"<a href='#taxons' data-icon='search'>Taxons</a>"
			//+"</li><li>"
			+"<a href='#my-map' data-icon='grid'>Map</a>"
			+"<a href='#my-data' data-icon='grid'>My data</a>"
			//+ "</li><li>"
			+"<a href='#data-sync' data-icon='grid'>Data sync</a>"
			//+"</li></ul>"
			//+"</div>"
			+"</div>";
//Metro style
/*var navBar = "<div class='appbar'>"
			+ "<ul id='menu' class='appbar-buttons'>"
			//+ <li><a href='#data-entry' data-theme='a' data-icon='star'>Data entry</a></li>"
			+ "<li><a href='#data-entry' class='home'><img src='images/1pixel.gif' alt='entry'/></a><span class='charm-title'>Data entry</span></li>"
			//+		"<li><a href='#birds' data-icon='info'>Birds</a></li>"
			+ "<li><a href='#birds' class='home'><img src='images/1pixel.gif' alt='birds'/></a><span class='charm-title'>Birds</span></li>"
			//+		"<li><a href='#taxons' data-icon='info'>Taxons</a></li>"
			+ "<li><a href='#taxons' class='home'><img src='images/1pixel.gif' alt='taxa'/></a><span class='charm-title'>Taxons</span></li>"
			//+		"<li><a href='#my-map' data-icon='gear'>Map</a></li>"
			//+ "<li><a href='#my-map' class='home'><img src='images/1pixel.gif' alt='map'/></a><span class='charm-title'>Map</span></li>"
			//+		"<li><a href='#data-sync' data-icon='gear'>Data sync</a></li>"
		//	+ "<li><a href='#data-sync' class='home'><img src='images/1pixel.gif' alt='sync'/></a><span class='charm-title'>Data sync</span></li>"
			+   "</ul></div>";
	*/							
$("#splash").bind("pagecreate", function(){
	$(function() {
	  setTimeout(hideSplash, 2000);
	});
	function hideSplash() {
	  $.mobile.changePage("#home", "fade");
	}
});	
$("#home").bind("pagecreate", function(){
	updateTime();
	var date_today = getToday();
	$("#dateToday").text(date_today);
	// initialiser la carte
	/*require(['openlayers'], function(openlayers){
		//define(['app-bar','autocomplete','database','app-init','viewsEvents','datagenerate','map','gps','ProtocolsList'], function(){ });
		window.point = new OpenLayers.LonLat(5.37,43.29);
		initMap(); // initialiser la carte openstreetmap
		myPositionOnMap();
	});*/
	
	
	
});	

//********************************************************************** #data-entry
$("#data-entry").bind("pagecreate", function(){
	$("#listProt").attr("style", "display:none;");
	genererListProto();
	$("#data-entry").append(navBar);
	$("#data-entry-infos-messages").html("1- Cr&eacute;er une nouvelle station");
});
$("#btnsubmitProto").click(function(){
	var str = decodeURIComponent($("#divformProto").serialize());
	saveObservation(str);
});
$("#data-entry-New-pos").bind("click", function(){
	$("#data-entry-new-pos-form").attr("style","");
	$("#data-entry-form-protos").attr("style","display:none;");
	$("#data-entry-info-position").attr("style","display:none;");
	$("#data-entry-infos-messages").html("");
	var dateToday = mydateToday();
	var timeNow = getTimeNow();
	// MAJ coordonnées
	getPosition();
	var latitude = localStorage.getItem("latitude");
	var longitude = localStorage.getItem("longitude");
	$("#newPosLon").val(longitude);
	$("#newPosLat").val(latitude);
	$("#newPosDate").val(dateToday);
	$("#newPosTime").val(timeNow);
	// renseigner automatiquement le champ nom de station
	getValStationName();
	//$("#newPosName").val("Saisir le nom du lieu");
});

$("#newLocationBtnRefrech").bind("click", function(){
	var dateToday = mydateToday();
	var timeNow = getTimeNow();
	//var latLong = getPosition();
	/*var tabCoords = latLong.split(";");
	var latitude = tabCoords[0];
	var longitude = tabCoords[1];*/
	/*var latitude = latLong.latitude;
	var longitude = latLong.longitude;
	alert ("latitude :" + latitude  + " longitude : " + longitude );*/
	getPosition();
	var latitude = localStorage.getItem("latitude");
	var longitude = localStorage.getItem("longitude");
	$("#newPosLon").val(longitude);
	$("#newPosLat").val(latitude);
	$("#newPosTime").val(timeNow);
	$("#newPosDate").val(dateToday);
});
// newLocation
/*$("#newLocation").bind("pageshow", function(){
	var dateToday = mydateToday();
	var timeNow = getTimeNow();
	$("#newPosDate").val(dateToday);
	$("#newPosTime").val(timeNow);
	$("#newPosName").val("Saisir le nom du lieu");
});*/
$("#newPosName").bind("click", function(){
	$("#newPosName").val("");
});
$("#newLocationBtnSubmit").bind("click", function(){
	var locationName = $("#newPosName").val();
	if (( locationName !="") && (locationName != "Saisir le nom du lieu")){
		$("#listProt").attr("style", "");
		var str = decodeURIComponent($("#newLocationDivform").serialize());
		savePosition(str);
		$("#data-entry-new-pos-form").attr("style","display:none;");
		$("#data-entry-infos-messages").html("Coordonnées de station sauvegard&eacute;es. &#10; 2- S&eacute;lection de protocole");
	}
	else {
		alert("Merci d'attribuer un nom au lieu");
	}
});
$("#newLocationBtnReset").bind("click", function(){
	$("#data-entry-new-pos-form").attr("style","display:none;");
	$("#data-entry-infos-messages").html("Saisie de cordonn&eacute;es de station annul&eacute;e !");
});
// evenement de MAJ de la valeur du slider affichée
/*$('.sliderControl').live("change", function(){
	var idSpan = $(this).attr("name");
	alert("name : " + idSpan + " valeur : " + $(this).val() );
});*/
//********************************************************************** 	
$("#birds").bind("pagecreate", function(){
	$("#birds").append(navBar);
});
$("#birdsListValeurs li").live("click", function(){
	var idIndiv = $(this).attr('indiv_id');
	// requete details indiv
	var query = "SELECT * FROM TIndividus WHERE Tind_PK_Id=" + idIndiv ;
	getItems(db, query, successIndivDetails);
});
//********************************************************************** 
$("#taxons").bind("pagecreate", function(){
	$("#taxons").append(navBar);
});
//********************************************************************** 
$("#my-map").bind("pagecreate", function(){
	$("#my-map").append(navBar);
});
//********************************************************************** my-data
$("#my-data").bind("pagecreate", function(){
	$("#my-data").append(navBar);
});
$("#my-data").bind("pageshow", function(){
	loadMyStoredData();
	localStorage.setItem("fildsLoded","false");
});
// à modifier pour limiter les modifs de DOM
$("#my-data").bind("pagehide", function(){
	$("#protListObs").empty();
});
$(".liOneObsDetails").live("click", function(){
	var idObs = $(this).attr('obsId');
	// afficher l'alerte pour suppression d'obs
	$.mobile.changePage ($('#delObs'));
	//$("#btnOk-alerteJQM").text("Ok"); 
	$("#delObs-Content").html("<h3>Are you sure to delete observation?</h3>");
	$("#delObs-header").html("<h3>Delete observation</h3>");
	$("#delObs-btnReset").attr("href","#my-data");
	$("#delObs-btnOk").attr("idObs",idObs);
	
});
$("#protListObs").find("li").live("click", function (event) {
	//afficher le titre pour la liste d'obs
	$("#myDataListForSelectedProtocol").attr("style","");
	$('#selectedProtObsDetails').empty();
	var nomProtocol = this.getAttribute('name');
	$(this).parent('ul').children('li').removeClass('active');
	$(this).addClass('active');
	generateDetailsObsForProtocol(nomProtocol);
});
$("#selectedProtObsDetails").find("li a[lien='details']").live("click", function (){
	var idObservation = this.getAttribute('obsId');
	getObsDetails(idObservation);
});
//********************************************************************** #delObs
$("#delObs-btnOk").bind("click", function(){
	var idObs = $(this).attr("idObs");
	deleteOneObs(idObs);
	$("#selectedProtObsDetails").empty();
	$.mobile.changePage ($('#my-data'));	 	
});
//********************************************************************** #data-sync
$("#data-sync").bind("pagecreate", function(){
	$("#data-sync").append(navBar);
});
//**********************************************************************
$("#advancedSearchSubmit").click(function(){
	var str = $("#advancedSearchDivform").serialize();
	criteriasQuery(str);
	$.mobile.changePage ($('#birds'));	 	
});	
/*$("#btnRecherche").click(function(){
		if(document.getElementById('id').checked) {
		var val = "Ttax_PK_Id = "+ document.getElementById('txtSearch').value;
		}else if(document.getElementById('Status').checked) {
		var val = "Thes_Status_Precision ='"+ document.getElementById('txtSearch').value+"'";
		} else if(document.getElementById('Frequency').checked) {
		var val = "TCarac_Transmitter_Frequency = '"+ document.getElementById('txtSearch').value+"'";
		}
		Search(db,val);
});*/
$("#btnSimpleSearch").click(function(){
	var valFrequency = $("#birdstxtSearch").val();
	var val = "Tind_Frequency = '"+ valFrequency + "'";
	var query = "SELECT * FROM TIndividus WHERE " + val;
	getItems(db, query, successSelectionIndiv);
});
$("#birdsbtnSimpleSearch").click(function(){
	$("#birdstxtSearch").attr("value","");
	$("#birdsListValeurs").empty();
	$("#birdsDetailsIndiv").empty();
});

$("#birdsbtnAdvSearch").click(function(){
	$("#birdstxtSearch").attr("value","");
	$("#birdsListValeurs").empty();
	$("#birdsDetailsIndiv").empty();
	$.mobile.changePage ($('#advancedSearch'));	 
});

$("#taxonsBtnPlants").click(function(){
	$("#taxonsTxtSearch").attr("value","");
	$("#taxonsListValeurs").empty();
	$("#taxonsDetailsIndiv").empty();
	localStorage.setItem('taxaSelectedGroup', "plants");
});
$("#taxonsBtnBirds").click(function(){
	$("#taxonsTxtSearch").attr("value","");
	$("#taxonsListValeurs").empty();
	$("#taxonsDetailsIndiv").empty();
	localStorage.setItem('taxaSelectedGroup', "birds");
});
$("#taxons-btnSimpleSearch").click(function(){
	var group = localStorage.getItem('taxaSelectedGroup');
	var id_type;
	if (group !=""){
		if (group == "plants"){ id_type = "65346788"; } else {id_type = "1139238005";}
		var chaineQuery = $("#taxonsTxtSearch").val();
		var val = "Id_Type = '" + id_type + "' AND topic_en LIKE '"+ chaineQuery + "%'";
		var query = "SELECT * FROM thesaurus WHERE " + val;
		getItems (db, query, successQueryTaxaList);
	} else {
		alert("Please select a group of taxa");
	}
});
$("#taxonsListValeurs li").live("click", function(){
	var idTaxa = $(this).attr('taxa_id');
	// requete details indiv
	var query = "SELECT * FROM thesaurus WHERE PK_Id=" + idTaxa ;
	getItems(db, query, successTaxaDetails);
	
});
$("#exit").bind("pagecreate", function(){
	$("#btnExit").bind("click", function(){
		navigator.app.exitApp(); 
	});	
	$("#btnResetExit").bind("click", function(){
		$.mobile.changePage ($('#home'), {transition : "pop"});
	});
});
//click bouton afficher carte
$("#birds-showLastLocation").click(function(){
	// désactiver l'affichage de la position utilisateur
	showMyLocation = 0 ;
	watchID = null;
	var latitude = localStorage.getItem('lastLatitude');
	latitude = convertToFloat(latitude);
	var longitude = localStorage.getItem('lastLongitude');
	longitude = convertToFloat(longitude);
	if ((latitude != "") && (longitude != "")){
		 $.mobile.changePage("#my-map", "fade");
		 markers.removeMarker(marker);
		point = new OpenLayers.LonLat(longitude,latitude);
		point = point.transform(
							new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
							new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
		);
		 addMarker(point);
		 map.setCenter(point,12);
		 map.panTo(point);
	}
});
//********************************************************* # my-map
$("#plus").live('click', function(){
		map.zoomIn();
});	
$("#minus").live('click', function(){
		map.zoomOut();
});
$("#centerMap").live('click', function(){
	$("#option").attr('style', 'display:none;');
	$("#maximize").attr('style', 'display:inherit;');
	$("#minimize").attr('style', 'display:none;');
	 map.setCenter(point);

});
$("#btnMapTracks").live('click', function(){
	addTracks();
	$("#option").attr('style', 'display:none;');
	$("#maximize").attr('style', 'display:inherit;');
	$("#minimize").attr('style', 'display:none;');
});
$("#MaskerTracks").bind("click", function(){
	if (trackLoaded == true){
	$("#option").attr('style', 'display:none;');
	$("#maximize").attr('style', 'display:inherit;');
	$("#minimize").attr('style', 'display:none;');
	kmlLayer.removeAllFeatures();	
	map.removeLayer(kmlLayer); 
	trackLoaded = false;
	}
});
$("#MyPosition").bind("click", function(){
	$("#option").attr('style', 'display:none;');
	$("#maximize").attr('style', 'display:inherit;');
	$("#minimize").attr('style', 'display:none;');
	if (showMyLocation != 1){
		showMyLocation = 1 ;
		myPosition();
	}
	else{
		map.setCenter(point);
	}
});
$("#maximize").live('click', function(){
		$("#maximize").attr('style', 'display:none;');
		$("#minimize").attr('style', 'display:inherit;');
		$("#option").attr('style', 'display:inherit;');
});
$("#minimize").live('click', function(){
		$("#minimize").attr('style', 'display:none;');
		$("#maximize").attr('style', 'display:inherit;');
		$("#option").attr('style', 'display:none;');
});



//*************************************************************************** #storedLocations
$("#storedLocations").bind("pageshow", function() {
	loadStoredPositions();
});
$("#storedLocationsBtnReset").bind("click", function(){
	$.mobile.changePage ($('#data-entry'));
});
/* Add a click handler for the delete row */
    $('#storedLocationsBtnSubmit').click( function() {
	//	oTable = $('#example').dataTable();	
        var anSelected = fnGetSelected( oTable );
        if ( anSelected.length !== 0 ) {
			var ligne = window.selectedLigne;
			; // =  anSelected[0].innerHTML;
			// avoir la valeur de l'id de l'élément sélectionné
			alert ( "valeur ligne :" + ligne);
  // Init DataTables
        }
		else{
			alert("merci de selectionner 1 ligne");
		}
 });

//*************************************************************************** #taxaSelection
// masquer le bouton "valider le choix de selection (validate your choice)" tant que pas de resultats affichés
$("#taxaSelection").bind("pageshow", function() {
	$("#taxaSelection-btn-submit").attr("style","display:none;");
});
$("#taxaSelection").bind("pagehide", function() {
	$(".target").val("");
	$("#taxaSelection-taxa-list").empty();
	$("#taxaSelection-btn-submit").attr("style","display:none;");
});
$(".target").bind("keyup", function() {
	var taxaVal = $(this).val();
	window.selectedTaxa ="";
	var query = "SELECT * FROM thesaurus WHERE topic_en LIKE '" + taxaVal + "%'";
	getItems (db, query, successQueryTaxaAutocomplete); 
});
// masquer le bouton "valider le choix de selection (validate your choice)" si chaine de recherche change
$(".target").bind("click", function() {
	$("#taxaSelection-btn-submit").attr("style","display:none;");
});
$("#taxaSelection-btn-submit").live("click", function() {
	var valSelectedTaxa = window.selectedTaxa;
	//$("#taxaSelection-taxa-list > li.ui-link-inherit:active").text();
	if (valSelectedTaxa !=""){
		$('#data-entry-select-taxa-input').val(valSelectedTaxa);
		$.mobile.changePage ($('#data-entry'));	
	} else {
		alert("please select a taxa");
	}
});
$(".liTaxaAutocomplete").live("click", function() {
	var taxaVal = $(this).text();
	window.selectedTaxa = taxaVal;
	$("#taxaSelection-btn-submit").attr("style","");
});
//*************************************************************************** #alerteJQM / details observation
$("#btnEditObs").live("click", function() {
	//var idProtocol = $("#obsDetailsObsVals").attr('protId');
	//alert ("proto a modif :" + idProtocol);
	var fieldsValues = $("#obsDetailsObsVals").text();
	var idObsToEdit = $("#obsDetailsObsVals").attr("idObs");
	//recuperer id du protocole
	var idProt = fieldsValues.substring(0,1);
	$.mobile.changePage ($('#data-entry'));	
	window.entryMode = "editObs";
	//generateProtocolPage(idProtocol);
	loadActualFieldsValues(fieldsValues,idProt,idObsToEdit);
});
/////////////////////////////////////
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
				for(var k = 0; k < dataFields.length; k += 1){
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
function loadFileProtocols (db){	
    $.ajax({
       type: 'GET',
       url: 'ressources/XML_ProtocolDef.xml',
      dataType: "xml",
       success: function(xml) {
			xmlNode = $(xml);	
			$(xml).find('protocol').each(   
                         function()
                         {
						var protName = $(this).find('display_label:first').text();
						protName = trim(protName);
						var protId = $(this).attr('id');
						// pour chaque protocole, rajouter 1 enregistrement dans la table Tprotocoles
						var req = "INSERT INTO Tprotocols (prot_id, prot_name)" + " VALUES ('"+ protId + "','" + protName + "')";
						insertRow(req);
						});
		   localStorage.setItem('fileProtocolsLoaded', "true");
		   }
    });
}
//////////////////////////////////
// ************************************** Gestion de la cartographie
function initMap() {
$("#map").attr('style', 'width:'+w_screen+'px;height:'+(h_screen * 0.9)+'px;');
	map = new OpenLayers.Map("map",
    {// maxExtent: new OpenLayers.Bounds(-20037508,-20037508,20037508,20037508),
		numZoomLevels: 15,
           // maxResolution: 156543,
        units: 'm',
          //  projection: "EPSG:900913",
        controls: [
			//  new OpenLayers.Control.LayerSwitcher({roundedCornerColor: "#575757"}),
              new OpenLayers.Control.TouchNavigation({
							dragPanOptions: {
							enableKinetic: true
							}}),
			  new OpenLayers.Control.MousePosition()
        ],
         displayProjection:  new OpenLayers.Projection("EPSG:4326")
	});
		 
	var cycle = new OpenLayers.Layer.OSM("OpenCycleMap",
                                        ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                                         "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                                         "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]/*,
                                          {
                                            eventListeners: {
														tileloaded: updateStatus
													}
										}*/);
	map.addLayer(cycle);
		/*
		cacheRead = new OpenLayers.Control.CacheRead();
		cacheWrite = new OpenLayers.Control.CacheWrite({
        imageFormat: "image/png",
        eventListeners: {
            cachefull: function() {
                 $("#status").html("Cache full.");
            }
			}
		});
		map.addControls([cacheRead, cacheWrite]);
		
		document.addEventListener("online", onOnline, false);
		document.addEventListener("offline", onOffline, false);
		*/
	var defStyle = {strokeColor: "red", strokeOpacity: "0.7", strokeWidth: 4, cursor: "pointer"};		
	var sty = OpenLayers.Util.applyDefaults(defStyle, OpenLayers.Feature.Vector.style["default"]);		
	var sm = new OpenLayers.StyleMap({
			'default': sty,
			'select': {strokeColor: "bleu", fillColor: "blue"}
	});
	markers = new OpenLayers.Layer.Markers( "Markers");
	map.addLayer(markers);
	point = point.transform(
							new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
							new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
							);
	addMarker(point);
	map.setCenter(point,12);
} // fin initMap 

function addTracks(){
	if (trackLoaded == false){
	$("#waitLoadingTracks").attr('style', 'display:inherit; position:absolute; left:'+((w_screen*0.5)-50)+'px; top:'+((h_screen*0.5)-50)+'px; width:100px;height:100px; z-index:5;');	
	kmlLayer = new OpenLayers.Layer.Vector("KML", {
            strategies: [new OpenLayers.Strategy.Fixed()],
            protocol: new OpenLayers.Protocol.HTTP({
                url: "ressources/tracks_3.kml",
                format: new OpenLayers.Format.KML({
                    extractStyles: true, 
                    extractAttributes: true,
                    maxDepth: 2
                })
            })
    });
	map.addLayer(kmlLayer); 
	setTimeout(hideWaitLoadingTrack, 10000);
	trackLoaded = true;
	}	
}
function addMarker(point){
	var size = new OpenLayers.Size(23,27);
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var icon = new OpenLayers.Icon('Css/images/marker.png',size,offset);
	//marker = new OpenLayers.Marker(lonLatToMercator(new OpenLayers.LonLat(x,y)),icon);
	marker = new OpenLayers.Marker(point,icon);
	markers.addMarker(marker);
}	
function ShowTrack(wktVal){	
	var wkt =  new OpenLayers.Format.WKT({
					internalProjection: new OpenLayers.Projection("EPSG:900913"),
					externalProjection: new OpenLayers.Projection("EPSG:4326")
			});			
	var feature = wkt.read(wktVal);
	vectorTrack.addFeatures(feature);
}
/*
function updateStatus(evt) {
        if (window.localStorage) {
		var i, nbTuiles = 0;
		for (i=0; i<=localStorage.length-1; i++){  
			key = localStorage.key(i);  
			if (localStorage.getItem(key).substr(0, 5) === "data:"){
				nbTuiles++;
			}  
		}
           $("#status").html(nbTuiles + " tuiles stockés.");
        } else {
            $("#status").html("Stockage local non supporté. Changer de navigateur.");
        }
        if (evt && evt.tile.url.substr(0, 5) === "data:") {
            cacheHits++;
        }
        $("#hits").html(cacheHits + " tuiles lues.");
}*/

function hideWaitLoadingTrack(){
$("#waitLoadingTracks").attr("style","display:none;");
}
/*
function onOnline() {
		cacheWrite.activate();
		cacheRead.deactivate();
}	
function onOffline() {
			cacheRead.activate();
			cacheWrite.deactivate();
}
*/
///////////////////////////////////////////////
//*************************************** GPS
function getPosition(){
	var latitude, longitude;
	var myPosition = new Object(); ;
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			//alert ("latitude :" + latitude  + " longitude : " + longitude );
			localStorage.setItem("latitude", latitude);
			localStorage.setItem("longitude", longitude);
			//myPosition.longitude = longitude;
			//return myPosition;
		},erreurPosition,{timeout:10000});
	}
	//return (latitude + ";" + longitude);	
//	return myPosition;
}
function myPositionOnMap(){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			point = new OpenLayers.LonLat(longitude, latitude);
			if (showMyLocation == 1 ){
				 if (markers && marker){
				markers.removeMarker(marker);
				}
				point = point.transform(
									new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
									new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
									);
				addMarker(point);
				map.setCenter(point);
				map.panTo(point);
			}
		},erreurPosition,{timeout:10000});
	}
}
/*
function ecouteGps (){
	if (navigator.geolocation) {
	  if (watchID == null) {
		//var options = { timout:1000, enableHighAccuracy: true, maximumAge:5000 };
		//var options = { timout:1000, maximumAge:5000 };
		watchID = navigator.geolocation.watchPosition(surveillePosition, erreurPosition, options);
	  }
	}
}

function surveillePosition(position){
	console.log(typeof position);
	if (typeof position == 'undefined') return;	

	var dateTimestamp = (position.timestamp).getTime();
	var dateNow = new Date().getTime();
	var diff = (parseInt(dateNow) - parseInt(dateTimestamp))/1000;
	if ( diff < 1 ) {
	}
	else {


		point = new OpenLayers.LonLat(position.coords.longitude,position.coords.latitude);
		 if (showMyLocation == 1 ){
			 if (markers && marker){
			markers.removeMarker(marker);
			}
			point = point.transform(
								new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
								new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
								);
			addMarker(point);
			map.setCenter(point,12);
		 }
	}
}*/
function erreurPosition(error){
	var info = "Erreur lors de la geolocalisation : ";
	switch(error.code) {
	case error.TIMEOUT:
		info += "Timeout !";
	break;
	case error.PERMISSION_DENIED:
		info += "Vous n’avez pas donne la permission";
	break;
	case error.POSITION_UNAVAILABLE:
		info += "La position n’a pu etre determinee, verifiez l'etat du GPS";
	break;
	case error.UNKNOWN_ERROR:
		info += "Erreur inconnue";
	break;
	}
	alert (info);
	localStorage.setItem( "latitude", "");
	localStorage.setItem( "longitude", "" );
}
////////////////////////////////////
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