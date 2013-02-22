// ************************************** Gestion de la cartographie
function initMap() {
$("#map").attr('style', 'width:620px;height:250px;');
	app.map = new OpenLayers.Map("map",
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
	app.map.addLayer(cycle);

	var defStyle = {strokeColor: "red", strokeOpacity: "0.7", strokeWidth: 4, cursor: "pointer"};		
	var sty = OpenLayers.Util.applyDefaults(defStyle, OpenLayers.Feature.Vector.style["default"]);		
	var sm = new OpenLayers.StyleMap({
			'default': sty,
			'select': {strokeColor: "bleu", fillColor: "blue"}
	});
	markers = new OpenLayers.Layer.Markers( "Markers");
	app.map.addLayer(markers);
	app.point = app.point.transform(
							new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
							new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
							);
	addMarker(app.point);
	app.map.setCenter(app.point,12);
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
	app.map.addLayer(kmlLayer); 
	setTimeout(hideWaitLoadingTrack, 10000);
	trackLoaded = true;
	}	
}
function addMarker(point){
	var size = new OpenLayers.Size(23,27);
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var icon = new OpenLayers.Icon('images/marker.png',size,offset);
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

function hideWaitLoadingTrack(){
$("#waitLoadingTracks").attr("style","display:none;");
}
