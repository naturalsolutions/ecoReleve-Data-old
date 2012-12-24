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