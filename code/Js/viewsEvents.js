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
$("#data-entry").bind("pagecreate", function(){
	genererListProto();
	$("#data-entry").append(navBar);
});
	
$("#birds").bind("pagecreate", function(){
	$("#birds").append(navBar);
});

$("#birdsListValeurs li").live("click", function(){
	var idIndiv = $(this).attr('indiv_id');
	// requete details indiv
	var query = "SELECT * FROM TIndividus WHERE Tind_PK_Id=" + idIndiv ;
	getItems(db, query, successIndivDetails);
});

$("#taxons").bind("pagecreate", function(){
	$("#taxons").append(navBar);
});

$("#my-map").bind("pagecreate", function(){
	$("#my-map").append(navBar);
});

$("#data-sync").bind("pagecreate", function(){
	$("#data-sync").append(navBar);
});

$("#btnsubmit").click(function(){
	var str = decodeURIComponent($("#divform").serialize());
	$("#resultat").text(str);
	TestQuery(str);
});	
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

// controles carte	
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