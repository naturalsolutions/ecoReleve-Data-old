//*************************************** GPS
var ecoReleveData = (function(app) {
    "use strict";

app.utils.getPosition = function (){
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
app.utils.myPositionOnMap = function (){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			var latitude = position.coords.latitude;
			var longitude = position.coords.longitude;
			app.point = new OpenLayers.LonLat(longitude, latitude);
			//if (showMyLocation == 1 ){
				 if (app.utils.markers && app.utils.marker){
				app.utils.markers.removeMarker(app.utils.marker);
				}
				app.point = app.point.transform(
									new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
									new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
									);
				app.utils.addMarker(app.point);
				app.map.setCenter(app.point);
				app.map.panTo(app.point);
				app.map.updateSize();
			//}
		// renseigner les coordonnées dans la zone dédiée
		$("#sation-position-latitude").val(latitude);
		$("#sation-position-longitude").val(longitude);
		
		
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
 return app;
})(ecoReleveData);