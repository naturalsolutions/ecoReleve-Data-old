
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

