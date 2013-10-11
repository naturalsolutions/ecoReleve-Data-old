// v0.1 2013/30/09
var NS = window.NS || {};

if(NS.UI){} else { NS.UI={} ; };

NS.UI.MapView = Backbone.View.extend({
		initialize: function(options) {
			_.bindAll(this, 'initMap');
			this.initMap();
			this.options = options;
			this.zoomLevelIndicator = 0;
			this.selectedFeatures="";
			this.selectedFeatureOrder = 0;
		},

		initMap: function(options) {
			// Initialize Basic Openlayers;
			this.map = new OpenLayers.Map(this.el, {
				projection: new OpenLayers.Projection("EPSG:3857"),
				displayProjection: new OpenLayers.Projection("EPSG:4326"),
				layers: [
					new OpenLayers.Layer.XYZ(
						"OpenStreetMap", 
						[
							"http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
							"http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
							"http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png",
							"http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png"
						],
						{
							attribution: "Data, imagery and map information provided by <a href='http://www.mapquest.com/'  target='_blank'>MapQuest</a>, <a href='http://www.openstreetmap.org/' target='_blank'>Open Street Map</a> and contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/' target='_blank'>CC-BY-SA</a>  <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
							transitionEffect: "resize"
						}
					),
					new OpenLayers.Layer.XYZ(
						"Imagery",
						[
							"http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
							"http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
							"http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png",
							"http://otile4.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png"
						],
						{
							attribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency. <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
							transitionEffect: "resize"
						}
					),
					new OpenLayers.Layer.OSM("OpenCycleMap",
                                        ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                                         "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
                                         "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]
					)
				],
				controls : [
					new OpenLayers.Control.MousePosition(),
					new OpenLayers.Control.LayerSwitcher(),
					new OpenLayers.Control.Navigation({
						dragPanOptions: {
							enableKinetic: true
						}
					}),
					 new OpenLayers.Control.Zoom()
				]

			}); 
			// add masked element to store selected elements id
			$(this.el).append('<input id="updateSelection"  type="hidden" value="" />');
	
			//this.this.map = map;
			/*** center *******************************************************************************/
			
			var centerPoint =  this.options.center || new NS.UI.Point({ latitude : 0, longitude: 0, label:"center"});

			var lat = centerPoint.attributes.latitude; 
			var lon = centerPoint.attributes.longitude;
			var center=new OpenLayers.LonLat(lon,lat);
			
			center=center.transform(
				new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				new OpenLayers.Projection("EPSG:3857") // to Spherical Mercator Projection
			);
			/*********** zoom *********/
			var mapZoom =  this.options.zoom || 0 ;
			this.map.setCenter(center, mapZoom);
			/**** enhanced controls *******************************************************************/
			var panel = new OpenLayers.Control.Panel({displayClass: 'panel', allowDepress: false});
			var zoomBox = new OpenLayers.Control.ZoomBox();
			var navigation = new OpenLayers.Control.Navigation();
			var zoomBoxBtn = new OpenLayers.Control.Button({displayClass: 'olControlZoomBox', type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
				   'activate': function(){zoomBox.activate(); navigation.deactivate(); }, 
				   'deactivate': function(){zoomBox.deactivate()}
				}
			});
			var navigationBtn = new OpenLayers.Control.Button({displayClass: 'olControlNavigation', type: OpenLayers.Control.TYPE_TOOL,
				eventListeners: {
				   'activate': function(){navigation.activate(); zoomBox.deactivate();}, 
				   'deactivate': function(){navigation.deactivate()}
				}
			});		
			panel.addControls([zoomBoxBtn, navigationBtn]);
			this.map.addControls([panel,zoomBox,navigation]);
			
		},
		/******************** Methods *****************************************/
		addLayer : function(options){
			var layerName = options.layerName || "Features";
			// style
			// if layer exists, remove it
			checkLayer(layerName, this.map);
			
			var s = options.style || new OpenLayers.Style({
			  'pointRadius': 10,
			  'externalGraphic': '${thumbnail}'
			});
			var vector = new OpenLayers.Layer.Vector(layerName, {
				//styleMap:  new OpenLayers.StyleMap(s),
				projection: 'EPSG:4326'
			});					
			// if provided data is a backbone collection
			
			if (options.collection){
				options.collection.each(function(o) {
					// if station not used, display it
					var used = o.attributes.used;
					var undef = ( used == "undefined" );
					
					if (( used == false ) || ( used == undefined )){
						var waypointId = o.attributes.id;
						//var myStationModel = app.collections.stations.get(stationId);
						var lon = o.attributes.longitude;
						var lat = o.attributes.latitude;
						var name = o.attributes.name;
						var time = o.attributes.waypointTime;
						//var link = o.attributes.link ;
						var featureDescription = '<p><b>Station name :' + name + '<br/> Longitude : ' + lon + '<br/> Latitude : ' + lat  + '<br/> id : <span>' + waypointId ; // + '<br/><a href="#stationInfos">Select this point</a>
						var lonlat = new OpenLayers.LonLat(lon, lat);
						lonlat.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:3857"));
						var f = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat), {description:featureDescription} ,
						{externalGraphic: 'img/marker.png', graphicHeight: 25, graphicWidth: 21, graphicXOffset:-12, graphicYOffset:-25  }
						);
						//lastpoint = new OpenLayers.LonLat(lon, lat);
						vector.addFeatures(f);
					}
				});
			}
			// if provided data is a model point (latitude, longitude, label)
			if (options.point){
				var lon = options.point.attributes.longitude;
				var lat = options.point.attributes.latitude;
				var label = options.point.attributes.label; 
				var lonlat = new OpenLayers.LonLat(lon, lat);
				var marker = options.marker;
				var featureDescription = '<p><b>Label :' + label + '<br/> Longitude : ' + lon + '<br/> Latitude : ' + lat  + '<br/>' ;
				lonlat.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:3857"));
				var f = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat), {description:featureDescription} ,
					{externalGraphic: ( marker || 'img/marker.png'), graphicHeight: 25, graphicWidth: 21, graphicXOffset:-12, graphicYOffset:-25  }
				);
				vector.addFeatures(f);
			}
			// if provided data is from a file (kml) or a server  --> a protocol + a strategy
			if (options.protocol){
				var url = options.protocol.attributes.url;
				var format = options.protocol.attributes.format;
				var params = options.protocol.attributes.params;
				var strategies = options.protocol.attributes.strategies; 
				var layerStrategies = new Array();
				var dataFormat;
				var cluster = options.protocol.attributes.cluster;
				var fixedStrategy = false;
				
				switch (format)
				{
					case "KML":
						dataFormat = new OpenLayers.Format.KML({
						extractStyles: true, 
						extractAttributes: true,
						maxDepth: 2
						});
					break;
					case "GEOJSON":
						dataFormat = new OpenLayers.Format.GeoJSON();
					break;
				}
				for( var i= 0 ; i< strategies.length; i++){
					switch (strategies[i].toUpperCase())
					{
						case "FIXED":
							var strategy = new OpenLayers.Strategy.Fixed();
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
							fixedStrategy = true;
						break;
						case "BBOX":
							var strategy = new OpenLayers.Strategy.BBOX();
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
						break;
						case "FILTER":
							var strategy = new OpenLayers.Strategy.Filter();
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
						break;
						case "CLUSTER":
							var strategy = new OpenLayers.Strategy.Cluster();
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
						break;
						case "REFRESH":
							var strategy = new OpenLayers.Strategy.Refresh({force: true, active: true});
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
						break;
					}
				}
				var protocol= new OpenLayers.Protocol.HTTP({
					url: url,
					format: dataFormat,
					params : params
				});
				// zoom modif : reload data if strategy "fixed" is not activated
				vector.fixedStrategy = true;
				if (!fixedStrategy){
					vector.fixedStrategy = false;
					protocol.filterToParams = function(filter, params) {
						var format = new OpenLayers.Format.QueryStringFilter({
							wildcarded: this.wildcarded,
							srsInBBOX: this.srsInBBOX
						});
						params.zoom = vector.map.getZoom();
						return format.write(filter, params);
					};
				}
				vector.protocol = protocol;
				vector.strategies = layerStrategies;
				
				// cluster style
				if (cluster){
					var layerStyle;
					var rules = clusterMapRules ();
					layerStyle = new OpenLayers.Style(null, {
					rules: rules
					}); 
					vector.styleMap = layerStyle;
				} else {
					var defaultStyle = new OpenLayers.Style({pointRadius:4,strokeWidth:1,fillColor:'#edb759',strokeColor:'black',cursor:'pointer'});
					var selectStyle = new OpenLayers.Style({fillColor:'#36b7d1'});
					var styleMap = new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle});
					vector.styleMap = styleMap;
				}
			}		
			this.map.addLayer(vector);
			this.displayWaitControl();
			if (! options.point){
				this.map.zoomToExtent(vector.getDataExtent());
			}
			else {
			/////////////////////////////////////////////////	this.map.panTo(bounds.getCenterLonLat());
			}
			vector.events.register("featuresadded", vector, zoomToData);
			this.map.events.register('zoomend', this, function (event) {
				var vector_layer ;
				for(var i = 0; i < this.map.layers.length; i++ ){
					if(((this.map.layers[i].name) !="OpenStreetMap") && ( ((this.map.layers[i].name) !="Imagery") ) && (((this.map.layers[i].name) !="OpenCycleMap") )) {
						vector_layer = this.map.layers[i] ;
						if (!vector_layer.fixedStrategy){
							vector_layer.refresh({force: true}); 
						}
					}
				};
			});
			this.map.selectedFeatureOrder = 0;
			var panelControls = [
			 new OpenLayers.Control.Navigation(),
			 new OpenLayers.Control.SelectFeature(vector,{hover:false,multiple:true,box:true,onSelect:selectionnerEntite,onUnselect:deselectionnerEntite})
			];
			var toolbar = new OpenLayers.Control.Panel({
			   displayClass: 'olControlEditingToolbar',
			   defaultControl: panelControls[0]
			});
			toolbar.addControls(panelControls);
			this.map.addControl(toolbar);
			
			function selectionnerEntite(feature) {

			}
			function deselectionnerEntite(feature) {
			
				$("#updateSelection").val("");
			}
			vector.events.register("featuresselected",this, function(e) {
			
				console.log ("selection features !");
				console.log(e);
			});
			function createPopup(feature) {
			  feature.popup = new OpenLayers.Popup.FramedCloud("pop",
				  feature.geometry.getBounds().getCenterLonLat(),
				  null,
				  '<div class="markerContent">'+feature.attributes.description+'</div>',
				  null,
				  true,
				  function() {controls['selector'].unselectAll(); }
			  );
			  //feature.popup.closeOnMove = true;
			    this.map.addPopup(feature.popup);
			   var texte = feature.attributes.description;
			}

			function destroyPopup(feature) {
			  feature.popup.destroy();
			  feature.popup = null;
			}
			function zoomToData(){
				var bounds = this.getDataExtent();
				if(bounds){ 
					this.map.panTo(bounds.getCenterLonLat());
					this.map.zoomToExtent(bounds); 
				}
				this.events.unregister("featuresadded", this, zoomToData);
				$("#waitControl").remove(); 
			}
		
		},
		updateSize: function(){
			this.map.updateSize();
		},
		getZoom: function(){
			this.map.getZoom();
		},
		zoomOut : function(){
			this.map.zoomOut();
		},
		zoomIn : function(){
			this.map.zoomIn();
		},
		enlarge: function(){
			var mapDiv = this.el;
			var width = mapDiv.clientWidth;
			var height = mapDiv.clientHeight;
			mapDiv.style.width = (4* width )  + "px";
			mapDiv.style.height = (3 * height) + "px";
			this.map.updateSize();
		},
		reduce: function(){
			var mapDiv = this.el;
			var width = mapDiv.clientWidth;
			var height = mapDiv.clientHeight;
			mapDiv.style.width = (width / 4) + "px";
			mapDiv.style.height = (height/3 ) + "px";
			map.updateSize();
		},
		updateLayer: function(layerName, params){
			this.displayWaitControl();
			var vector_layer;
			for(var i = 0; i < this.map.layers.length; i++ ){
					if((this.map.layers[i].name) ==layerName){vector_layer = this.map.layers[i] ;break;}
			};
			vector_layer.protocol.options.params = params;
			var cluster = params.cluster ;
			if (cluster =="no"){
				var defaultStyle = new OpenLayers.Style({pointRadius:4,strokeWidth:1,fillColor:'#edb759',strokeColor:'black',cursor:'pointer'});
				var selectStyle = new OpenLayers.Style({fillColor:'#36b7d1'});
				var styleMap = new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle});
				vector_layer.styleMap = styleMap;
			} else if (cluster =="yes"){
				var layerStyle;
				var rules = clusterMapRules ();
				layerStyle = new OpenLayers.Style(null, {
				rules: rules
				}); 
				vector_layer.styleMap = layerStyle;
			}
			vector_layer.refresh({force: true}); 
			vector_layer.events.register("featuresadded", vector_layer, zoomData);	
			function zoomData(){
				var bounds = this.getDataExtent();
				if(bounds){ 
					this.map.panTo(bounds.getCenterLonLat());
					this.map.zoomToExtent(bounds); 
				}
				this.events.unregister("featuresadded", this, zoomData);
				$("#waitControl").remove(); 
			}
		},
		setCenter : function (point){
			point =point.transform(
				   new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				   new OpenLayers.Projection("EPSG:3857") // to Spherical Mercator Projection
			);
			this.map.zoom = 12;
			this.map.setCenter(point,12);
		},
		panTo : function (point){
			
			point = point.transform(
				   new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				   new OpenLayers.Projection("EPSG:3857") // to Spherical Mercator Projection
			);
			this.map.panTo(point);
			this.map.zoomTo(8);
		},
		removeLayer : function (layer){
			//layer.removeAllFeatures();
			this.map.removeLayer(layer);
		},
		clearLayer : function (layer){
			layer.destroyFeatures();
		},
		displayWaitControl : function (){
			var mapDiv = this.el;
			var width =  (screen.width)/2;
			var height = (screen.height)/2;
			var ele = "<div id ='waitControl' style='position: fixed; top:" + height + "px; left:" + width + "px;z-index: 1000;'><IMG SRC='images/loader.gif' /></div>"  
			$(mapDiv).append(ele);
		}
});
/******************************* Models **********************************************************/
NS.UI.Point = Backbone.Model.extend({
	schema: {
        latitude:    { type: 'Number' },
        longitude:   { type: 'Number' },
		label : { type: 'Text' }
    }
});
NS.UI.PointsList =  Backbone.Collection.extend({
	Model: NS.UI.Point
});
NS.UI.Protocol =  Backbone.Model.extend({
	schema: {
        url:    { type: 'Text' },
        format:   { type: 'Text' },
		cluster : { type: 'Boolean' },
		params : { type: 'Object' },
		strategies :{ type: '[]' }
    }
});
/********************************** functions **************************************************/
function clusterMapRules (){
	var colors = {
		low: "rgb(140, 204, 226)", // green : rgb(181, 226, 140)
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
	
	return [SoloRule,lowRule, middleRule, highRule] ;
}
function checkLayer(layerName, map){
	var layer = "null";
	for(var i = 0; i < map.layers.length; i++ ){
			if((map.layers[i].name) == layerName ) {
				layer = map.layers[i];
				break;
			}
	}
	if (layer!="null"){
		map.removeLayer(layer);
	} 
}
// extend SelectFeature to have possibility to get selected features list (not implemented in openlayers). Source : http://jsfiddle.net/_DR_/9dcuk/
OpenLayers.Control.SelectFeature.prototype.selectBox = function(position) {
    if (position instanceof OpenLayers.Bounds) {
        var minXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.left, position.bottom)
        );
        var maxXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.right, position.top)
        );
        var bounds = new OpenLayers.Bounds(
            minXY.lon, minXY.lat, maxXY.lon, maxXY.lat
        );
            
        // if multiple is false, first deselect currently selected features
        if (!this.multipleSelect()) {
            this.unselectAll();
        }
            
        // because we're using a box, we consider we want multiple selection
        var prevMultiple = this.multiple;
        this.multiple = true;
        var layers = this.layers || [this.layer];
        var layer;
        var selectedFeatures = []; // <-- Modification of original function (1/3)
        for(var l=0; l<layers.length; ++l) {
            layer = layers[l];
            for(var i=0, len = layer.features.length; i<len; ++i) {
                var feature = layer.features[i];
                // check if the feature is displayed
                if (!feature.getVisibility()) {
                    continue;
                }

                if (this.geometryTypes == null || OpenLayers.Util.indexOf(
                    this.geometryTypes, feature.geometry.CLASS_NAME) > -1) {
                        if (bounds.toGeometry().intersects(feature.geometry)) {
                            if (OpenLayers.Util.indexOf(layer.selectedFeatures, feature) == -1) {
                                this.select(feature);
                                selectedFeatures.push(feature); // <-- Modification of original function (2/3)
                            }
                        }
                    }
                }
        }
        onFeatureSelect(selectedFeatures); // <-- Modification of original function (3/3)
        this.multiple = prevMultiple;
    }
}
function onFeatureSelect(f) {
	var params = 'id_station=';
	for (var i=0; i < f.length ; i++){
		params += f[i].attributes.id + "," ;
	}
	var ln = params.length - 2;
	var params2 = params.substring (0, ln);
	$("#updateSelection").val(params2).trigger('change');
} 