	//debugger;
	// window.Doc
$().ready(function() {
//$(document).bind('pageinit', function () {
//$(document).ready(function () {
		init();
}) ;
//*********************** change page

$("#home").bind("pageshow", function(){
				genererListProto();
	 
	});
	
$("#home").bind("pagecreate", function(){
	$("#btnSearch").bind("click", function(){
			$.mobile.changePage ($("#Search"));	
	});
});


//************************************* Fonctions
function init (){
	var dbCreated = localStorage.getItem('dbCreated');
	initializeDB();
	if (dbCreated != "true"){
	
	}
	
}

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
  $("#btnsubmit").click(function(){

		var str = decodeURIComponent($("#divform").serialize());
		$("#resultat").text(str);
		TestQuery(str);
	});
	
	$("#btnRecherche").click(function(){
		if(document.getElementById('id').checked) {
		var val = "Ttax_PK_Id = "+ document.getElementById('txtSearch').value;
		}else if(document.getElementById('Status').checked) {
		var val = "Thes_Status_Precision ='"+ document.getElementById('txtSearch').value+"'";
		} else if(document.getElementById('Frequency').checked) {
		var val = "TCarac_Transmitter_Frequency = '"+ document.getElementById('txtSearch').value+"'";
		}



		Search(db,val);
	});
	
	
	function Search(db, val) {

	var query = "SELECT * FROM Ttaxon WHERE "+val;
	
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
}

	function dataSelectItem (transaction, resultSet) {
  //success callback
	var obsTab = new Array();
				$("#listValeur").listview();
			    var len = resultSet.rows.length;
				$('#listValeur').children().remove('li');
			    for (i = 0; i < len; i++) {
				//for (j in resultSet.rows.item(i)){ alert(j);}
				//alert(resultSet.rows.item(i).Thes_Status_Precision);  
				var spn = '<li data-role="list-divider">  Thes_Status_Precision : '+resultSet.rows.item(i).Thes_Status_Precision+'</li>'
				spn =spn + '<li data-theme="B">  TCarac_Transmitter_Frequency : '+resultSet.rows.item(i).TCarac_Transmitter_Frequency+'</li>'
				spn =spn + '<li data-theme="B">  TCarac_Breeding_Ring_Code : '+resultSet.rows.item(i).TCarac_Breeding_Ring_Code+'</li>'
				spn =spn + '<li data-theme="B">  TCarac_Chip_Code  : '+resultSet.rows.item(i).TCarac_Chip_Code+'</li>'
				
				
				$('#listValeur').append(spn);
				$('#listValeur').listview("refresh");
			}
			$('#total').html('nombre de lignes : '+ i);
			document.body.style.cursor = 'default';
}

/*
function onDeviceReady(){
		//alert("device ready: chargement phonegap");
        document.addEventListener("backbutton", onBackKeyDown, false);
		document.addEventListener("menubutton", onMenuKeyDown, false);
    }
function onBackKeyDown(){
// connaitre la page en cous
var idPage = $('.ui-page-active').attr('id');
   if (idPage  == 'home') { 
   navigator.notification.confirm("Quitter l'application?", confirmCallbackQuitter, 'Arrêt de l application', 'Oui,Annuler');
   }
}
function confirmCallbackQuitter(){
	 navigator.app.exitApp(); 
}
function onMenuKeyDown(){
//alert("Arret de l'application"); 
 //  navigator.app.exitApp(); 
 navigator.notification.confirm("Quitter l'application?", confirmCallbackQuitter, 'Arrêt de l application', 'Oui,Annuler');
}
function setLogin(){
	$.mobile.changePage($("#login"), {transition: "pop"});
	$("#login a.ok").bind("click", function (event)
		{
			var login = $("#login input").val();
			login=$.trim(login);
			if	(login){
				localStorage.idPhone = login;
				$.mobile.changePage($("#home"));
			}		
		});
}
function loadTaxaObs(nomTaxon){
var query = "SELECT * FROM TObservations WHERE nomTaxon =" + "'" + nomTaxon + "'";
getItems(db, query, successSelectOneTaxa);
}
// callback loadTaxaObs
function successSelectOneTaxa (transaction, resultSet) {
			$('#obsOneTaxaContent').html('<ul id="obsTaxa-list" data-role="listview" data-inset="true" data-filter="false" data-split-icon="delete"></ul>');
			$("#obsTaxa-list").listview();
			    var len = resultSet.rows.length;
			    for (i = 0; i < len; i++) {
				var ligne = "<li><a href='#'><h2>"+ resultSet.rows.item(i).date +" - " + resultSet.rows.item(i).heure  + "</h2>Longitude : "
				+ resultSet.rows.item(i).longitude  + "<br/>Latitude : " + resultSet.rows.item(i).latitude + "</a><a href='#' class='liOneObsDetails' idField='" + resultSet.rows.item(i).id +"'>Supprimer l'observation</a></li>";
			//	+ resultSet.rows.item(i).longitude  + "<br/>Latitude : " + resultSet.rows.item(i).latitude  + "<br/>Nombre : "+ resultSet.rows.item(i).nombre +"</li>";
			$("#obsTaxa-list").append(ligne);
			}	
			$("#obsTaxa-list").listview('refresh'); 
			$(".liOneObsDetails").bind("click", function(){
				//debugger;
				var ident = $(this).attr("idField");
				$('#btnDelOnedata').attr('idObs',ident);
				$.mobile.changePage ($('#delOneObs'));	 
			});			
}
function saveImageInDB(imageFileName,idTaxa){
	var query = "INSERT INTO Tphotos (Ttax_id,Tpho_file_name) VALUES (?,?)";
	var param = [idTaxa,imageFileName];
	insertNewRow(query, param);
}
 // ************************************ Génération de l'interface de la vue taxons
function taxaLoad(db, criteres){	
	if (criteres == "")
	{	
			$('#taxaList').html('<div id="waitControlList" style="display:none;" ><img src="images/ajax-loader-round.gif" /></div>');
			$("#waitControlList").attr('style', 'display:inherit; position:absolute; left:'+((w_screen*0.5)-50)+'px; top:'+((h_screen*0.5)-50)+'px; width:100px;height:100px; z-index:5;');
			var query = "SELECT * FROM Ttaxons WHERE Ttax_groupe =1 ORDER BY Ttax_vernacular_name "	
			getItems(db, query, genererListeTaxa);			
			$("#taxa-list").listview('refresh');
			$("a.btnGroupe").bind("click", function(event){
				var goupId = parseInt($(this).attr('val'));
				if (selectedBtnGroupId != goupId){
					updateTaxaList(goupId);	
					$("#taxa-list").listview('refresh');
					selectedBtnGroupId = goupId;
				}
			});
	 }
	 else
	 {
		// cas ou on passe par la clé de determination
		listAllCharged = false;	
		listAllToLoad = false;
		//var tabFindTaxa = new Array();
		var query = criteriasQuery(criteres);
		getItems(db, query, genererListeTaxaSelonCriteres);  
	 }
}
function criteriasQuery(criteres){
	var criteresListe = new Array();
	var criteresTab = criteres.split('&');
	for (var i=0; i < criteresTab.length; i++){
			// exemple de structure de chaque element de criteresTab[i]: crit="1.2"
			var tab = criteresTab[i].split('=');
			// recuperer le code du critere et l'ajouter à la liste de criteres, la taille du tableau est le nombre de criteres selectionnés
			criteresListe.push(tab[1]);
	}
	var nbCriteres = criteresListe.length;
	// liste de codes criteres selectionnés
	//tabCriteres = criteres.split('&');
	$('#taxaListByKey').html('');
	// construction de la clause where de la requete : id=critere1 OR id= critere 2 ...
	var conditionWhere ="";
	for ( var i=0 ; i<criteresListe.length; i++){
	conditionWhere = conditionWhere + " Tcriteria_values_Tcri_val_PK_id = '" + criteresListe[i] + "' OR" ;
	}
	// enlever le dernier OR de la chaine
	var len = conditionWhere.length;
	var condition = conditionWhere.substring(0,len - 2);
	//var query = "SELECT * FROM Ttaxons_has_Tcriteria_values WHERE " + condition + " ORDER BY Ttaxons_Ttax_PK_Id";	
	var conditionSelectionTaxa ="";
	var query = "SELECT Ttaxons_Ttax_PK_Id FROM Ttaxons_has_Tcriteria_values WHERE " + condition + " GROUP BY Ttaxons_Ttax_PK_Id HAVING count(Ttaxons_Ttax_PK_Id)=" + nbCriteres ;	
	return query ;
}
function genererListeTaxa(tr,rs){
	var currentRow;
	$('#taxaList').html("");
	$('#taxaList').append('<ul id="taxa-list" data-role="listview" data-inset="true" data-filter="true" ></ul>');
	$("#taxa-list").listview();
	for (var j=0; j < rs.rows.length; j++) {
		var currentRow = rs.rows.item(j);
		var ligne = "<li ID=" + currentRow['Ttax_id'] + "" + "><a href='#'>" + "<img src='images/thumb/" + currentRow['Ttax_photoFileName'] + 
					"' WIDTH='75' HEIGHT='75'/><h2>" + currentRow['Ttax_vernacular_name'] + "</h2><p><i>"+ currentRow['Ttax_latin_name'] + "</i></p></a></li>"; 
		$('#taxa-list').append(ligne);
		$("#taxa-list").listview('refresh');
	}			
}
function genererListeTaxaSelonCriteres(transaction, resultSet){
	var tabIdTaxa = new Array();
	var currentRow;					
	for (var j=0; j < resultSet.rows.length; j++) {
		currentRow = resultSet.rows.item(j);
		tabIdTaxa.push(parseInt(currentRow['Ttaxons_Ttax_PK_Id']));
	}
	// parcourir le tableau d'identifiants de taxons, pour formuler la condition de la requete de selection de taxons (WHERE id=1 OR id = 2 ....)
	if (tabIdTaxa.length == 0 ){
		$('#taxaListByKey').append('<ul id="taxa-listKey" data-role="listview" data-inset="true" data-filter="true" data-split-icon="gear" data-split-theme="d"></ul>');
		$("#taxa-listKey").listview();
		var ligne = "<li ><h2>Pas de taxons pour ces criteres</h2></li>"; 
		$('#taxa-listKey').append(ligne);
		$("#taxa-listKey").listview('refresh');
	}
	else {
		var condition ="";		
		for (var j=0; j < tabIdTaxa.length; j++) {
			condition = condition + " Ttax_id = " + tabIdTaxa[j] + " OR";
		}
		// enlever le dernier OR de la chaine
		var len = condition.length;
		conditionSelectionTaxa  = condition.substring(0,len - 2);
		// selectionner les taxons dans la table Ttaxons
		var query = "SELECT * FROM Ttaxons WHERE " + conditionSelectionTaxa + " ORDER BY Ttax_vernacular_name" ;
		getItems(db, query, genListTaxaCrit); 
	}
}
function genListTaxaCrit(transaction, resultSet) { 
	var currentRow;		
	$('#taxaListByKey').append('<ul id="taxa-listKey" data-role="listview" data-inset="true" data-filter="true" data-split-icon="gear" data-split-theme="d"></ul>');
	$("#taxa-listKey").listview();	
	for (var j=0; j < resultSet.rows.length; j++) {
		currentRow = resultSet.rows.item(j);
		var ligne = "<li ID=" + currentRow['Ttax_id'] + "" + "><a href='#'>" + "<img src='images/thumb/" + currentRow['Ttax_photoFileName'] +
		"' WIDTH='75' HEIGHT='75'/><h2>" + currentRow['Ttax_vernacular_name'] + "</h2><p><i>"+ currentRow['Ttax_latin_name'] + "</i></p></a></li>"; 
		$('#taxa-listKey').append(ligne);		
	}								
	$("#taxa-listKey").listview('refresh');
} 
function updateTaxaList(groupId){
	$('#taxa-list').html('<div id="waitControlList" style="display:none;" ><img src="images/ajax-loader-round.gif" /></div>');
	$("#waitControlList").attr('style', 'display:inherit; position:absolute; left:'+((w_screen*0.5)-50)+'px; top:'+((h_screen*0.5)-50)+'px; width:100px;height:100px; z-index:5;');
	var requete;
	if (groupId == '0') {
		requete = "SELECT * FROM Ttaxons ORDER BY Ttax_vernacular_name ";	
	} else {
		requete = "SELECT * FROM Ttaxons WHERE Ttax_groupe=" + groupId + " ORDER BY Ttax_vernacular_name ";	
	}
	getItems(db, requete, successUpdateTaxaList); 
}
function successUpdateTaxaList(transaction, resultSet) { 
	$('#taxa-list').html('');
	var currentRow;
	for (var j=0; j < resultSet.rows.length; j++) {
		currentRow = resultSet.rows.item(j);
		var ligne = "<li ID=" + currentRow['Ttax_id'] + "" + "><a href='#'>" + "<img src='images/thumb/" + currentRow['Ttax_photoFileName'] + "' WIDTH='75' HEIGHT='75'/><h2>" + currentRow['Ttax_vernacular_name'] + "</h2><p><i>"+ currentRow['Ttax_latin_name'] + "</i></p></a></li>"; 
		$('#taxa-list').append(ligne);
		$("#taxa-list").listview('refresh');
	}
}
function loadTaxaList(query, ele){
			var li = "<li data-role='list-divider'>"+ ele +"</li>";
			$('#taxa-list').append(li);
    db.transaction(function (trxn) {
        trxn.executeSql(
			query, //requete à executer
			[], successSelectTaxa, 			
			function (transaction, error) {  //error callback
			    console.log('error');
			}
		);
	});
}
function successSelectTaxa (transaction, resultSet) {
	var len = resultSet.rows.length;
	for (i = 0; i < len; i++) {
		currentRow = resultSet.rows.item(i);
		var ligne = "<li ID=" + currentRow['Ttax_id'] + "" + "><a href='#'>" + "<img src='" + currentRow['Ttax_media_url'] + "' WIDTH='75' HEIGHT='75'/><h2>" + currentRow['Ttax_vernacular_name'] + "</h2><p><i>"+ currentRow['Ttax_latin_name'] + "</i></p></a></li>"; 
		$('#taxa-list').append(ligne);
	}	
	$("#taxa-list").listview('refresh');  	
}
// ************************************* Génération de l'interface de la vue groupes de taxons
function criteresChargerGroupes(db){
		$('#groupList').html('<ul id="group-list" data-role="listview" data-inset="true" data-filter="false" data-split-icon="gear" data-split-theme="d"></ul>');
		$("#group-list").listview();
		var requete = "SELECT * FROM Ttaxa_group ORDER BY Ttax_group_label ";
		getItems(db, requete, successCriteresChargerGroupes); 
 }
// Callback criteresChargerGroupes
function successCriteresChargerGroupes(transaction, resultSet) { 
	var MonTableau ;
	MonTableau = new Array();
	$('#taxa-list').html('');
	var currentRow;
	for (var j=0; j < resultSet.rows.length; j++) {
		currentRow = resultSet.rows.item(j);
		var name = currentRow['Ttax_group_label'];
		var photoUrl = currentRow['Ttax_group_media_url'];
		var id = currentRow['Ttax_group_id'];
	    MonTableau.push(name + ";"+photoUrl+ ";"+id);
	}
	MonTableau.sort();
	for (i=0;i<MonTableau.length;i++){ 
		var ligne;
		//recuperer nom  + url photo
		var elem = MonTableau[i].split(';');
		var nomGroup = elem[0];
		var urlPhoto = elem[1];
		var idElement = elem[2];
		ligne = "<li ID=gr" + idElement + " " + "><a href=''>" + "<img src='" + urlPhoto + "' WIDTH='75' HEIGHT='75'/><h2>" + nomGroup + "</h2></a></li>"; 
		$('#group-list').append(ligne);
		var idelem = '#gr'+ idElement;
		$(idelem).bind("click",  function(e){
			
			var id = $(this).attr('id');
			if (id =="gr1" || id =="gr2"){
			// generation du contenu de la vue "determination"
			$.mobile.changePage ($("#key"));
			// recuperer l'identifiant de groupe en enlevant "gr", rajouté au début de l'id de la ligne
			var len = id.length;
			// variable globale pur stocker l'id du groupe de taxa sélectionné
			var id2 = id.substring(2, len);
			criteria(id2);
			lastViewCrit = "criteres";
			} else{
			alert("critères non définis pour ce groupe");
			}
			// arreter la propagation de l'evenement
			return false;
		});
	}
	$("#group-list").listview('refresh');  
}
function criteria(idGroup){
// fonction qui sert à générer l'interface de la vue clé de détermination
			$('#divform').empty();
			$('#divform').html("<ul id='crit-list' data-role='listview' data-inset='true' data-split-icon='gear' data-split-theme='d'></ul>");
            $("#crit-list").listview();
			// recuperer l'identifiant groupe sélectionné
			var requete = "SELECT * FROM Tcriteria_values WHERE Ttax_group_id='" + idGroup + "'";	
			getItems(db, requete, genererInterfaceKey); 	
}
// Callback criteria(idGroup)
function genererInterfaceKey(transaction, resultSet){
	var tabCriteres = new Array() ;
	var currentRow;
	for (var j=0; j < resultSet.rows.length; j++) {
		currentRow = resultSet.rows.item(j);
		var labelCritere = currentRow['Tcri_label'] ;
		var idCritere = currentRow['Tcri_id'] ;
		var url = currentRow['Tcri_val_media_url'] ;
		var codeValueCritere = currentRow['Tcri_val_code'] ;
		// charger chaque enregistrement dans le tableau tabCriteres
		tabCriteres.push(idCritere + ";" + labelCritere + ";" + url + ";" + codeValueCritere);
	}
	// recuperer l'id du premier critere
	var value = tabCriteres[0];
	var tabVal = value.split(';');
	var labelCritere1 = tabVal[1];
	var idCritere1 = tabVal[0];
	var lblCrit = "<li identifiant='"+ idCritere1 +"'><span><h3>" + labelCritere1 + " </h3></span><img src='images/aide.png' class='imgHelpKey'/></li>";
	$('#crit-list').append(lblCrit);
	var radioCrit = "<li data-role='fieldcontain' style='padding:0px;'><fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'>" ;  
	var numCritere= 1;
	var nameBtnRadio1 = "crit" + numCritere ;
	radioCrit +="<span class='RadioCustom'>";
	radioCrit += "<label for='" +  tabVal[3] + "' ><img src='" + tabVal[2] + "' /></label>";
	radioCrit +=  "<input  type='radio' name = '" + nameBtnRadio1 + "' id='" +  tabVal[3] +"' value='" +  tabVal[3] + "'/></span>";
	for (var j=1; j < tabCriteres.length; j++) {
		var value2 = tabCriteres[j];
		var tabVal2 = value2.split(';');
		var idCriterej = tabVal2[0];
		var codeVal = tabVal2[3];
		if (idCriterej === idCritere1 ) {
			var nameBtnRadio = "crit" + numCritere ;
			radioCrit +="<span class='RadioCustom'>";
			radioCrit += "<label for='" +  tabVal2[3] + "' ><img src='" + tabVal2[2] + "' /></label>";
			radioCrit +=  "<input  type='radio' name = '" + nameBtnRadio + "' id='" +  tabVal2[3] +"' value='" +  tabVal2[3] + "'/></span>";
			idCritere1 = idCriterej ;
		}
		else {
			numCritere += 1 ;
			radioCrit += "</fieldset></li></ul>";   
			$('#crit-list').append(radioCrit);
			// nouvelle ligne pour nouveau critere
			labelCritere1 = tabVal2[1];
			idCritere1 = tabVal2[0];
			lblCrit = "<li identifiant='" + idCritere1 +"'><span><h3>" + labelCritere1 + " </h3></span><img src='images/aide.png' class='imgHelpKey' /></li>";
			$('#crit-list').append(lblCrit);
			var nameBtnRadio = "crit" + numCritere ;
			radioCrit = "<li data-role='fieldcontain' style='padding:0px;'><fieldset data-role='controlgroup' data-type='horizontal' data-role='fieldcontain'>" ;  
			radioCrit +="<span class='RadioCustom'>";
			radioCrit +=  "<label for='" +  tabVal2[3] + "' ><img src='" + tabVal2[2] + "' /></label>";
			radioCrit +=  "<input  type='radio' name = '" + nameBtnRadio + "' id='" +  tabVal2[3] +"' value='" +  tabVal2[3] + "'/></span>";
			idCritere1 = idCriterej ;
		}
	}
				
	radioCrit += "</fieldset></li></ul>";   
	$('#crit-list').append(radioCrit);
	$("#crit-list").listview('refresh');
	$(".imgHelpKey").click(function(){
		var criteriaAttr = $(this).parent().attr('identifiant');
		// fonction pour charger le contenu de la vue aide du critere slectionné
		loadKeyHelpData(criteriaAttr);
		$.mobile.changePage ($('#helpKey'), {transition : "pop"});
	});
	// initialiser la séléction des radio buttons
	$('input[type=radio]').uncheckableRadio(); 
	// en cas de modification de séléction calculer le nombre de taxons correspendant aux nouveaux criteres
	$('input[type=radio]').bind("click", function(){
		var str = $("#divform").serialize();
		if (str !=""){
			var query = criteriasQuery(str);
			getItems(db, query, countSelectedTaxa);
		} else{
			$("#nbrSelectedTaxa").html("choisissez<br/>au moins<br/>un critère");
		}
	});
}
function loadKeyHelpData(criteriaAttr){
   var requete = "SELECT * FROM Tcriteria_values WHERE Tcri_id='" + criteriaAttr + "'";	 
   getItems(db, requete, loadKeyHelpView);
}
// Callback loadKeyHelpData
function loadKeyHelpView(tr, rs){
	var textToShow ="";
	for (var i=0; i< rs.rows.length; i++){
		currentRow = rs.rows.item(i);
		textToShow += "<p><img src ='" + currentRow['Tcri_val_media_url'] + "'<br/>" + currentRow['Tcri_val_label'] + "<br/></p>" ; 
	}
	$("#helpKeyContent").html(textToShow);
}
function countSelectedTaxa(tr,rs){
	var nbSelectedTaxa = rs.rows.length ;
	$("#nbrSelectedTaxa").html("<span>" + nbSelectedTaxa +"</span>");
}
//
function taxaDetailsQuery(idTaxon){
	$("#descImageImg").attr( "src", "" );
	$("#descContent").html("");
	var requete = "SELECT * FROM Ttaxons WHERE Ttax_id=" + idTaxon ;	
	getItems(db, requete, taxaDetails);
}
function taxaDetails(tr,rs){
	var currentRow;
	for (var j=0; j < rs.rows.length; j++) {
		currentRow = rs.rows.item(j);
		var idTax = currentRow['Ttax_id'];
		var description = currentRow['Ttax_description'];
		//var photoUrl = currentRow['Ttax_media_url'];
		// methode pour selectionner toutes les photos qui correspondent au taxon séléctionné (dans la table Tphotos)
		var query = "SELECT * FROM Tphotos WHERE Ttax_id='" + idTax + "'";	 
		getItems(db, query, loadPhotosInDetailsView);
		var nomTaxon = currentRow['Ttax_vernacular_name'];
		//	$("#descImageImg").attr( "src", photoUrl );
		// afficher les pictos de criteres auxquels ce taxon est associé (dans un collasible)
		var requete = "SELECT * FROM Ttaxons_has_Tcriteria_values WHERE Ttaxons_Ttax_PK_Id = '" + idTax + "'";
		getItems(db, requete, loadCriteriasPictosForTaxa);
		var divContent = "<div data-role='collapsible' id='collapsibleElement'>"
						+ "<h3>En savoir plus</h3><p> " + description + " </p></div>";
		$("#descContent").html(divContent);
		$("#collapsibleElement").collapsible();
		$("#taxaName").text(nomTaxon);					
	}

}
// Callback taxaDetails
function loadPhotosInDetailsView (tr,rs){
	var photosList ="";
	for (var i=0; i< rs.rows.length; i++){
		currentRow = rs.rows.item(i);
		photosList += "<li><a href='images/full/" + currentRow['Tpho_file_name'] + "' rel='external'><img src='images/thumb/" + currentRow['Tpho_file_name'] + "' alt='' /></a></li>"
	}
	//alert (photosList);
	$(".gallery").html(photosList);

}
// Callback taxaDetails
function loadCriteriasPictosForTaxa(tr,rs){
	// le résultat recupéré par cette fonction callback est la listes de codes critères pour le taxon affiché dans la vue détails 
	// pour chaque code critère, il faut récupérer l'url de son picto et l'ajouter dans un tableau à afficher dans l'élément collapsible
	// ajouter l'élément dans lequel seront affichés les pictos
	var divContent = "<div data-role='collapsible' id='collapsibleElement2'><h3>Critères associés</h3><p>"
								+	"<div data-role='fieldcontain'><fieldset data-role='controlgroup' data-type='horizontal' id='tablePictosTaxa'></fieldset></div></p></div>";	
									//		+ "<table><tr id='tablePictosTaxa'></tr></table></p></div>";								
						$("#descContent").append(divContent);
						$("#collapsibleElement2").collapsible();
	for (var i=0; i< rs.rows.length; i++){
		currentRow = rs.rows.item(i);
		 var codeCritere = currentRow['Tcriteria_values_Tcri_val_PK_id'] ;
		 // sélectionner l'enregisitrement qui correspond à ce code dans la table Tcriteria_values
		 var query = " SELECT * FROM Tcriteria_values WHERE Tcri_val_code = '" + codeCritere +"'";
		getItems(db, query, addPictoForTaxa);	
	}
}
//Callback loadCriteriasPictosForTaxa
function addPictoForTaxa (tr,rs){
	currentRow = rs.rows.item(0);
	var urlPicto = currentRow['Tcri_val_media_url'];
	var labelPicto = currentRow['Tcri_val_label'];
//	var txtToAppend= "<td><img src='" + urlPicto + "'/></td><td>" + labelPicto + "</td>";
	var txtToAppend= "<img src='" + urlPicto + "'/>  " + labelPicto + "";
	$("#tablePictosTaxa").append(txtToAppend);
}
//*************************************** génération de l'interface de la liste de mes  balades
function chargerMesBalades(){
	// créer une listview dans la vue mesbalades
	$('#mesBaladesList').html('<ul id="mesBalades-list" data-role="listview" data-inset="true" data-filter="true" data-split-icon="gear" data-split-theme="d"></ul>');
	$("#mesBalades-list").listview();
	var requete = "SELECT * FROM Tbalades";	
	genererInterfaceBalades (db, requete);
}
function genererInterfaceBalades (db, requete){
	db.transaction(function (trxn){
		trxn.executeSql(
			requete, 
			[],  
			function (transaction, resultSet) { 
				var currentRow;
				for (var j=0; j < resultSet.rows.length; j++) {
					currentRow = resultSet.rows.item(j);
					var ligne = "<li ID='liMesBalades' code=" + currentRow['Tbal_id'] + "><a href='#'>" + "<img src='" + currentRow['Tbal_url_photo'] + 
								"' WIDTH='80' HEIGHT='80'/><h2>" + currentRow['Tbal_label'] + "</h2><p><i> Niveau : "+ currentRow['Tbal_level'] +
								" , Distance : "+ currentRow['Tbal_distance'] + " km , Durée : " + currentRow['Tbal_duration'] +" hr</i></p></a></li>"; 
					$('#mesBalades-list').append(ligne);
					$("#mesBalades-list").listview('refresh');
				}
				$('#liMesBalades').bind("click", function (){
					var id =parseInt( $(this).attr('code'));
					$.mobile.changePage ($('#balade'));	 
					loadBalade(id);
						
				});
			});
		});	

}
//*************************************** génération de l'interface de la vue balade
function loadBalade(idBalade){
	var requete = "SELECT * FROM Tbalades WHERE Tbal_id = " + idBalade + "";	
	getItems(db, requete,successLoadBalade);
}
// Callback loadBalade(idBalade)
function successLoadBalade(tr, rs){
	var currentRow;
	for (var j=0; j < rs.rows.length; j++) {
		currentRow = rs.rows.item(j);
		// afficher le nom de la balade
		$("#titreBalade").text(currentRow['Tbal_label']);
		$("#baladePhoto").html("<img src ='" + currentRow['Tbal_url_photo'] + "'></img>");
		$("#baladeInfos").html("<div class='btn_highlight'><a data-role='button' href='#criteres' data-inline='true' data-corners='true' data-shadow='true' data-iconshadow='true' data-wrapperels=span' data-theme='a' class='ui-btn ui-shadow ui-btn-corner-all ui-btn-up-a' data-form='ui-btn-up-a'id ='btnBalade'><span class='ui-btn-inner ui-btn-corner-all'><span class='ui-btn-text'>C'est parti !</span></span></a></div>");
		$("#btnBalade").button();
		$("#baladeInfos").append("<p>Niveau : " + currentRow['Tbal_level'] + "</p>");
		$("#baladeInfos").append("<p>Accès : " + currentRow['Tbal_access'] + "</p>");
		$("#baladeInfos").append("<p>Durée : " + currentRow['Tbal_duration'] + " hr </p>");
		$("#baladeInfos").append("<p>Distance : " + currentRow['Tbal_distance'] + " km </p>");
		// description de la balade
		$("#baladeDescription").html('<p>' + currentRow['Tbal_description'] +'</p>');				
	}
}
function loadPOIs(db, baladeId){
//tabPOIs est une matrice dans laquelle seront chargées les POI (key, longitude, latitude et valeur pour indiquer si alerte déjà declanchée)
//chaque POI represente une ligne de cette matrice
	var requete = "SELECT * FROM TPOIs WHERE Tbal_id = " + baladeId + "";
	getItems(db, requete, successLoadPOIs);
}
// Callback loadPOIs(db, baladeId)
function successLoadPOIs(tr, rs){
	var currentRow;
	for (var j=0; j < rs.rows.length; j++) {
		currentRow = rs.rows.item(j);
		var tab = new Array();
		var id = currentRow['Tpoi_id'];
		var longitude = currentRow['Tpoi_longitude'];
		var latitude =  currentRow['Tpoi_latitude'];
		tab.push("0");
		tab.push(id);
		tab.push(longitude);
		tab.push(latitude);
		tab.push("0");
		tabPOIs.push(tab); // variable globale pour stocker les poi	
	}
}
function ajoutObs(){
    var obs = new Object();
    var dt = new Date();
    var dte, hr,mn;
    //console.log(dt.getDate() + "/" + (dt.getMonth()+1) + "/" + dt.getFullYear());
   // console.log(dt.getHours() + ":" + dt.getMinutes());
    dte = dt.getDate() + "/" + (dt.getMonth() + 1) + "/" + dt.getFullYear();
    mn = dt.getMinutes();
    if (mn < 10) {
        mn = "0" + mn;
    }
    hr = dt.getHours() + ":" + mn;
	obs["idPhone"] = localStorage.getItem('idPhone');
    obs["date"] = dte;
    obs["heure"] = hr;
	obs["idTaxon"] = localStorage.getItem('idTaxon');
    obs["nomTaxon"] = localStorage.getItem('nomTaxon');
    obs["number"] = '1';
    obs["latitude"] = localStorage.getItem('latitude');
    obs["longitude"] = localStorage.getItem('longitude');
  // inserer une observation dans la table TObservations
	var query = 'INSERT INTO TObservations (idPhone, date, heure, idTaxon, nomTaxon, nombre, latitude,longitude) VALUES (?,?,?,?,?,?,?,?);';
	var param = [obs.idPhone, obs.date, obs.heure, obs.idTaxon, obs.nomTaxon, obs.number, obs.latitude, obs.longitude];  // parametres de la requete
	insertNewRow(query, param);
	// incrémenter la valeur d'observations stockées
	var nbOsStored = parseInt(localStorage.getItem('nbStoredObs'));
	nbOsStored += 1;
	localStorage.setItem('nbStoredObs', nbOsStored);
	getListOfTaxaObserved(db);
	// mettre à jour le nombre affiché dans le bouton "Mon profil" de la barre de navigation
	$(".nbstoredobservations").html("<span>" + nbOsStored + "</span>");
}
function getListObservations(db){
	var query = 'SELECT nomTaxon,SUM(nombre) AS som FROM TObservations GROUP BY nomTaxon'
	getItems(db, query, successGetListObs);
}
// Callbak getListObservations(db)
function successGetListObs (tr, rs) {
	var obsTab = new Array();
			    var len = rs.rows.length;
				var nbTotal = 0;
			    for (i = 0; i < len; i++) {
				//for (j in resultSet.rows.item(i)){ alert(j);}
				obsTab.push(rs.rows.item(i).nomTaxon + ";" + rs.rows.item(i).som);  
				nbTotal += parseInt(rs.rows.item(i).som);				
			}
			 // trier le tableau
			 obsTab.sort();
			$('#obsContent').html('<br/>  <ul id="obs-list" data-role="listview" data-inset="true" data-filter="true" data-split-icon="gear" data-split-theme="d"></ul>');
			$("#obs-list").listview();
			
			for (i = 0; i < obsTab.length; i++) {
			var nTax, nb;
			var Tab = new Array();
			 Tab = obsTab[i].split(';');
			 nTax = Tab[0];
			 nb = Tab[1];
			 
			var ligne = "<li><a href='#'><h2>"+ nTax + "</h2><span class='ui-li-count'>" + nb  + "</span></a></li>";
			$("#obs-list").append(ligne);
			}
			$("#obs-list").listview('refresh'); 
			localStorage.setItem('nbStoredObs', nbTotal);
			// mettre à jour la valeur d'observations stockées affiché dans le bouton "Mon profil" de la barre de navigation
			$(".nbstoredobservations").html("<span>"+ nbTotal +"</span>");	 	
}
 function fail(error) {
        console.log(error.code);
}
function nbSpecies(db){
	var query = "SELECT * FROM Ttaxons " ;
		getItems(db, query, callbackNbSpecies); 
}
function callbackNbSpecies(tr, rs){
	var nbSpecies = rs.rows.length;
	localStorage.setItem('nbSpecies',nbSpecies);
}
function getListOfTaxaObserved(db){
	var query = 'SELECT * FROM TObservations GROUP BY nomTaxon'
	getItems(db, query, successListOfTaxaObserved);
}
function successListOfTaxaObserved(tr, rs){
	var nbSpeciesObserved = rs.rows.length;
	localStorage.setItem('nbSpeciesObserved',nbSpeciesObserved);
}
	

*/

