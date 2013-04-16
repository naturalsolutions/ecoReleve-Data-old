// ************************************** Gestion de la cartographie
var ecoReleveData = (function(app) {
    "use strict";

app.utils.initMap = function () {
//$("#map").attr('style', 'width:620px;height:250px;');
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
	debugger;	 
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
	app.utils.markers = new OpenLayers.Layer.Markers( "Markers");
	app.map.addLayer(app.utils.markers);
	app.point = app.point.transform(
							new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
							new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
							);
	app.utils.addMarker(app.point);
	app.map.setCenter(app.point,12);
	app.map.updateSize();
	

} // fin initMap 
app.utils.myObservationsOnMap =  function (collection){
	
	// point pour recuperer les coord du dernier point 
	var lastpoint ;
	debugger
	// ajouter layer switcher control
	 app.map.addControl(new OpenLayers.Control.LayerSwitcher());  

	// Strategy debut ************************************

	var features = [];
	// style
	var colors = {
		low: "rgb(181, 226, 140)", 
		middle: "rgb(241, 211, 87)", 
		high: "rgb(253, 156, 115)"
	};

	// Define three rules to style the cluster features.
	var lowRule = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.LESS_THAN,
			property: "count",
			value: 15
		}),
		symbolizer: {
			fillColor: colors.low,
			fillOpacity: 0.9, 
			strokeColor: colors.low,
			strokeOpacity: 0.5,
			strokeWidth: 12,
			pointRadius: 10,
			label: "${count}",
			labelOutlineWidth: 1,
			fontColor: "#ffffff",
			fontOpacity: 0.8,
			fontSize: "12px"
		}
	});
	var middleRule = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "count",
			lowerBoundary: 15,
			upperBoundary: 50
		}),
		symbolizer: {
			fillColor: colors.middle,
			fillOpacity: 0.9, 
			strokeColor: colors.middle,
			strokeOpacity: 0.5,
			strokeWidth: 12,
			pointRadius: 15,
			label: "${count}",
			labelOutlineWidth: 1,
			fontColor: "#ffffff",
			fontOpacity: 0.8,
			fontSize: "12px"
		}
	});
	var highRule = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.GREATER_THAN,
			property: "count",
			value: 50
		}),
		symbolizer: {
			fillColor: colors.high,
			fillOpacity: 0.9, 
			strokeColor: colors.high,
			strokeOpacity: 0.5,
			strokeWidth: 12,
			pointRadius: 20,
			label: "${count}",
			labelOutlineWidth: 1,
			fontColor: "#ffffff",
			fontOpacity: 0.8,
			fontSize: "12px"
		}
	});

	// Create a Style that uses the three previous rules
	var style = new OpenLayers.Style(null, {
		rules: [lowRule, middleRule, highRule]
	}); 
	
	collection.each(function(o) {
		var lon = o.get('longitude');
		var lat = o.get('latitude');
		 var lonlat = new OpenLayers.LonLat(lon, lat);
		lonlat.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
		var f = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat));
		features.push(f);
		lastpoint = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
	});
	
		var vector = new OpenLayers.Layer.Vector("Features", {
			renderers: ['Canvas','SVG'],
			strategies: [
				new OpenLayers.Strategy.AnimatedCluster({
					distance: 10,
					animationMethod: OpenLayers.Easing.Expo.easeOut,
					animationDuration: 20
				})
			],
			styleMap:  new OpenLayers.StyleMap(style)
	});
	app.map.addLayer(vector);
	vector.addFeatures(features);
		//****************************************** fin strategy 

	app.map.setCenter(lastpoint,12);
	app.map.panTo(lastpoint);	
	//app.map.updateSize();
	//app.map.setCenter(lastpoint);
	//app.map.panTo(lastpoint);	
	
}

/*
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
*/
app.utils.addMarker = function (point){
	var size = new OpenLayers.Size(23,27);
	var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
	var icon = new OpenLayers.Icon('images/marker.png',size,offset);
	//marker = new OpenLayers.Marker(lonLatToMercator(new OpenLayers.LonLat(x,y)),icon);
	app.utils.marker = new OpenLayers.Marker(point,icon);
	app.utils.markers.addMarker(app.utils.marker);
}	
/*
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
*/
 return app;
})(ecoReleveData);