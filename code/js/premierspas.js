var drawControls;
var dActivate=false;
var map;
var zoom;
var vector;
var style;
var refresh;
function init(){	
	// Define three colors that will be used to style the cluster features
	// depending on the number of features they contain.
	var colors = {
		low: "rgb(181, 226, 140)", 
		middle: "rgb(241, 211, 87)", 
		high: "rgb(253, 156, 115)"
	};
	
	// Define three rules to style the cluster features.
	var lowRule = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.BETWEEN,
			property: "count",
			lowerBoundary: 2,
			upperBoundary: 15
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
	
	var SoloRule = new OpenLayers.Rule({
		filter: new OpenLayers.Filter.Comparison({
			type: OpenLayers.Filter.Comparison.EQUAL_TO,
			property: "count",
			value: 1
		}),
		symbolizer: {
			fillColor: colors.low,
			fillOpacity: 0.9, 
			strokeColor: colors.low,
			strokeOpacity: 0.5,
			strokeWidth: 12,
			pointRadius: 10,
			label: "",
			labelOutlineWidth: 1,
			fontColor: "#ffffff",
			fontOpacity: 0.8,
			fontSize: "12px"
		}
	});
	
	// Create a Style that uses the three previous rules
	style = new OpenLayers.Style(null, {
		rules: [SoloRule,lowRule, middleRule, highRule]
	}); 

	//OpenLayers.ImgPath = "http://js.mapbox.com/theme/dark/";
	map = new OpenLayers.Map('div_ma_carte',{
		controls: [
			new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.ArgParser(),
			new OpenLayers.Control.Attribution()
		]
	});
	var layer_de_base =  new OpenLayers.Layer.OSM();
	
	map.addLayers([layer_de_base]);
	var un_point=new OpenLayers.LonLat(24.729494,59.441193) // Center of the map
	un_point=un_point.transform(
           new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
           new OpenLayers.Projection("EPSG:900913") // to Spherical Mercator Projection
    );
	zoom=0;
	map.setCenter(un_point,zoom);
	//var element = document.getElementById("OpenLayers_Control_Zoom_5");
	//element.parentNode.removeChild(element);
	map.removeControl(OpenLayers.Control.PanZoom);
	map.addControl(new OpenLayers.Control.PanZoomBar());
	map.addControl(new OpenLayers.Control.ScaleLine());
	map.addControl(new OpenLayers.Control.MousePosition());
	//map.addControl(new OpenLayers.Control.NavToolbar());
	map.addControl(new OpenLayers.Control.LayerSwitcher({'ascending':false}));
	map.addControl(new OpenLayers.Control.OverviewMap());
	
	refresh = new OpenLayers.Strategy.Refresh({force: true, active: true});
	vector = new OpenLayers.Layer.Vector("Features", {
		protocol: new OpenLayers.Protocol.HTTP({
			url: "http://ns24422.ovh.net:81/cake/carto/station_get?zoom="+zoom+"&id_proto="+$("#id_proto").attr("value")+"&place="+$("#place").attr("value")+"&region="+$("#region").attr("value")+"&idate="+$('#idate').text()+"&cluster="+$("#select_cluster option:selected").attr('value')+"&taxonsearch="+$("#iTaxon").attr("value"),
			format: new OpenLayers.Format.GeoJSON()
		}),
		renderers: ['Canvas','SVG'],
		strategies: [new OpenLayers.Strategy.BBOX()		
		],
		styleMap:  new OpenLayers.StyleMap(style)
	});
	 var selectControl = new OpenLayers.Control.SelectFeature(vector, {
        
        callbacks: {
            over: function(feat) {
                console.log('Show popup type 1 id:'+feat.attributes.id);
            },
            out: function(feat) {
                console.log('Hide popup type 1');
            }
        },
        
        eventListeners: {
            featurehighlighted: function(feat) {
                console.log('Show popup type 2'+feat);
            },
            featureunhighlighted: function(feat) {
                console.log('Hide popup type 2');
            }
        }    
    });       
	
    map.addControls([selectControl]);
    selectControl.activate();
		
	map.addLayer(vector);
	 if (!map.getCenter()) {
		map.zoomToMaxExtent();
	}
	
	map.events.register("zoomend", map, zoomChanged1);
}


function zoomChanged1(){
	if($("#select_cluster option:selected").attr('value')=="yes"){	
		zoom=map.getZoom();
		for(i=0;i<map.layers.length;i++){
			if(map.layers[i].name=='Features')
				map.removeLayer(map.layers[i]);
		}
		vector = new OpenLayers.Layer.Vector("Features", {
			protocol: new OpenLayers.Protocol.HTTP({
				url: "http://ns24422.ovh.net:81/cake/carto/station_get?zoom="+zoom+"&id_proto="+$("#id_proto").attr("value")+"&place="+$("#place").attr("value")+"&region="+$("#region").attr("value")+"&idate="+$('#idate').text()+"&cluster="+$("#select_cluster option:selected").attr('value')+"&taxonsearch="+$("#iTaxon").attr("value"),
				format: new OpenLayers.Format.GeoJSON()
			}),
			renderers: ['Canvas','SVG'],
			strategies: [new OpenLayers.Strategy.BBOX()			
			],
			styleMap:  new OpenLayers.StyleMap(style)
		});
		
		map.addLayer(vector);
	}	
}

function zoomChanged(){	
	zoom=map.getZoom();
	for(i=0;i<map.layers.length;i++){
		if(map.layers[i].name=='Features')
			map.removeLayer(map.layers[i]);
	}
	vector = new OpenLayers.Layer.Vector("Features", {
		protocol: new OpenLayers.Protocol.HTTP({
			url: "http://ns24422.ovh.net:81/cake/carto/station_get?zoom="+zoom+"&id_proto="+$("#id_proto").attr("value")+"&place="+$("#place").attr("value")+"&region="+$("#region").attr("value")+"&idate="+$('#idate').text()+"&cluster="+$("#select_cluster option:selected").attr('value')+"&taxonsearch="+$("#iTaxon").attr("value"),
			format: new OpenLayers.Format.GeoJSON()
		}),
		renderers: ['Canvas','SVG'],
		strategies: [new OpenLayers.Strategy.BBOX()			
		],
		styleMap:  new OpenLayers.StyleMap(style)
	});
	
	map.addLayer(vector);
	
}