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
			            new OpenLayers.Layer.Google(
			                "Google Physical",
			                {type: google.maps.MapTypeId.TERRAIN}
			            ),
			            new OpenLayers.Layer.Google(
			                "Google Streets", // the default
			                {numZoomLevels: 20}
			            ),
			            new OpenLayers.Layer.Google(
			                "Google Hybrid",
			                {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
			            ),
			            new OpenLayers.Layer.Google(
			                "Google Satellite",
			                {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
			            )
			        ]

			        /*
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
				]*/,
				controls : [
					new OpenLayers.Control.MousePosition(),
					new OpenLayers.Control.LayerSwitcher(),
					new OpenLayers.Control.Navigation({
						dragPanOptions: {
							enableKinetic: true
						}
					}),
					 new OpenLayers.Control.Zoom()
				]//,
				//renderers : ['SVG']
				,renderers: ["Canvas"]
			}); 

			// add masked element to store selected elements id
			$(this.el).append('<input id="updateSelection" type="hidden" value="" />');
			$(this.el).append('<input id="featuresId"  type="hidden" value="" />');
			//this.map.featuresId ="";
			// tables to store latitude and longitudes values for selected points in vector layers
			this.map.latitudes = new Array();
			this.map.longitudes = new Array();
			this.map.selectedFeatures = new Array();
			
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
		},
		/******************** Methods *****************************************/
		addLayer : function(options){
			
			//this.displayWaitControl();
			var layerName = options.layerName || "Features";
			// style
			// if layer exists, remove it
			checkLayer(layerName, this.map);
			
			/*var s = options.style || new OpenLayers.Style({
			  'pointRadius': 10,
			  'externalGraphic': '${thumbnail}'
			});*/
			var s = options.style || new OpenLayers.Style({
			 /* 'pointRadius': 10,
			  'externalGraphic': '${thumbnail}'*/
			  pointRadius:4,strokeWidth:1,fillColor:'#edb759',strokeColor:'black',cursor:'pointer'
			 // , label : "${Site_name}",  labelXOffset: "50", labelYOffset: "-15"
			});
			
			var defaultStyle = s;
			//var defaultStyle = new OpenLayers.Style({pointRadius:4,strokeWidth:1,fillColor:'#edb759',strokeColor:'black',cursor:'pointer'});
			var selectStyle = new OpenLayers.Style({fillColor:'#36b7d1'});
			var styleMap = new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle});	
			var vector = new OpenLayers.Layer.Vector(layerName, {
				//styleMap:  new OpenLayers.StyleMap(s),
				projection: 'EPSG:4326'
			});					
			// if provided data is a backbone collection
			// check if we can display popup
			vector.popup = (options.popup) || (false);
			vector.renderers= ['Canvas'];
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
						var f = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat), {id:waypointId, description:featureDescription}// ,
						//{externalGraphic: 'img/marker.png', graphicHeight: 25, graphicWidth: 21, graphicXOffset:-12, graphicYOffset:-25  }
						);
						//lastpoint = new OpenLayers.LonLat(lon, lat);
						
						vector.addFeatures(f);
						//vector.popup = true;
						//$("#waitControl").remove(); 
					}
				});
				var cluster = options.cluster;	
				// cluster style
				vector.styleMap = styleMap;
				if (cluster =="yes"){
					var layerStyle;
					var rules = clusterMapRules ();
					layerStyle = new OpenLayers.Style(null, {
					rules: rules
					}); 
					vector.styleMap = layerStyle;
				}
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
				var f = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat), {description:featureDescription} //,
					//{externalGraphic: ( marker || 'img/marker.png'), graphicHeight: 25, graphicWidth: 21, graphicXOffset:-12, graphicYOffset:-25  }
				);
				vector.styleMap = styleMap;
				vector.addFeatures(f);
				$("#waitControl").remove(); 
			}
			var strategies;
			var layerStrategies = new Array();
			var fixedStrategy = false;
			// if provided data is from a file (kml) or a server  --> a protocol + a strategy
			if (options.protocol){
				var url = options.protocol.attributes.url;
				var format = options.protocol.attributes.format || "";
				var params = options.protocol.attributes.params || "";
				strategies = options.protocol.attributes.strategies|| "";
				layerStrategies = new Array();
				var dataFormat;
				var cluster = options.protocol.attributes.cluster;
				
				var popup = options.protocol.attributes.popup;
				var style = options.protocol.attributes.style;
				
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
				vector.popup = popup ;
				// cluster style
				if (cluster){
					var layerStyle;
					var rules = clusterMapRules ();
					layerStyle = new OpenLayers.Style(null, {
					rules: rules
					}); 
					vector.styleMap = layerStyle;
				} else {
					vector.styleMap = styleMap;
					if (style){
						var defaultStyle = style;
						var selectStyle = new OpenLayers.Style({fillColor:'#36b7d1'});
						vector.styleMap = new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle});	
					}
				}
				//$("#waitControl").remove(); 
			}		
			this.map.addLayer(vector);
			if (! options.protocol){
				this.map.zoomToExtent(vector.getDataExtent());
				$("#waitControl").remove(); 
			}
			if (options.zoom) {
				var zoomLevel = options.zoom;
				this.map.zoomTo(zoomLevel);
			}
			if (options.center){
				var center = new OpenLayers.LonLat(options.center.longitude,options.center.latitude);
				this.map.setCenter(options.center);
				center = center.transform(
				   new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
				   new OpenLayers.Projection("EPSG:3857") // to Spherical Mercator Projection
				);
				this.map.panTo(center);
			}
		/*	vector.events.register("loadend", vector, function(){
		        var bounds = this.map.getDataExtent();
				if(bounds){ 
					this.map.panTo(bounds.getCenterLonLat());
					this.map.zoomToExtent(bounds); 
				}
				//this.events.unregister("featuresadded", this, zoomToData);
				$("#waitControl").remove(); 

				
		    }); */


			/*
			if (! options.point){
				this.map.zoomToExtent(vector.getDataExtent());
			}
			else {
				//	this.map.panTo(bounds.getCenterLonLat());
			}*/

			// check if layer is not the first one to add selection tools
			if (!options.noSelect) {
				vector.events.register("featuresadded", vector, zoomToData);
				vector.events.on({
	                'featureselected': function(feature) {
						var featureId = feature.feature.attributes.id;
						this.map.selectedFeatures.push(featureId); 
						//update list of stored selected features id in the hidden input
						updateSelectedFeatures(this.map.selectedFeatures);
						var displayPopup = feature.feature.layer.popup;
						// add coordinates of selected feature to arrays
						if (!displayPopup){
							var lon = feature.feature.geometry.x;
							var lat = feature.feature.geometry.y;
							this.map.latitudes.push(lat);
							this.map.longitudes.push(lon); 
							updateBBOX(this.map.longitudes,this.map.latitudes );
						} else {
							createPopup(feature);
						}
						$('#map').trigger('selectedFeatures:change');
	                },
	                'featureunselected': function(feature) {
						var featureId = feature.feature.attributes.id;
						var displayPopup = feature.feature.layer.popup;
						// remove id feature from selected features list if exists
						removeItem(this.map.selectedFeatures, featureId);
						//update list of stored selected features id in the hidden input
						updateSelectedFeatures(this.map.selectedFeatures);
						// add coordinates of selected feature to arrays
						if (!displayPopup){
							var lon = feature.feature.geometry.x;
							var lat = feature.feature.geometry.y;
							// remove values if exists
							removeItem(this.map.latitudes, lat);
							removeItem(this.map.longitudes, lon);
							// update selecting BBOX
							updateBBOX(this.map.longitudes,this.map.latitudes );
						} else {
							destroyPopup();
						}
						$('#map').trigger('selectedFeatures:change');
	                },
	                'unselectAll': function(	options	){
	                	alert("unselect all");
	                },
	                'clickoutFeature': function(	options	){
	                	alert("clickoutFeature");
	                }
	            });
				//this.map.events.register('zoomend', this, function (event) {
				this.map.events.register('moveend', this, function (event) {
					var vector_layer ;
					for(var i = 0; i < this.map.layers.length; i++ ){
						if(((this.map.layers[i].name) !="OpenStreetMap") && ( ((this.map.layers[i].name) !="Imagery") ) && (((this.map.layers[i].name) !="OpenCycleMap") )) {
							vector_layer = this.map.layers[i] ;
							if (!vector_layer.fixedStrategy){
								var bounds = this.map.getExtent(); 
								var minLat = bounds.bottom;
								var maxLat= bounds.top;
								var minlong = bounds.left;
								var maxLong = bounds.right;

								var minPoint=new OpenLayers.LonLat(minlong,minLat);
								minPoint=minPoint.transform(
									new OpenLayers.Projection("EPSG:3857"), // transform from WGS 1984
									//new OpenLayers.Projection("EPSG:3857") // to Spherical Mercator Projection  900913
									new OpenLayers.Projection("EPSG:4326") // to Spherical Mercator Projection
								);
								var maxPoint = new OpenLayers.LonLat(maxLong,maxLat);
								maxPoint=maxPoint.transform(
									new OpenLayers.Projection("EPSG:3857"), // transform from WGS 1984
									new OpenLayers.Projection("EPSG:4326") // to Spherical Mercator Projection
								);
								var minLatWGS = minPoint.lat;
								var minLonWGS = minPoint.lon;
								var maxLatWGS = maxPoint.lat;
								var maxLonWGS = maxPoint.lon;

								var bbox = minLonWGS   + "," + minLatWGS + "," + maxLonWGS + "," + maxLatWGS ;
								$("#updateSelection").val(bbox);  
								$(".updateSelection").val(bbox);  
								// convert values to decimal format "x.xx"	
								minLatWGS = parseFloat(minLatWGS);
	                    		minLatWGS = minLatWGS.toFixed(2);	
	                    		minLonWGS = parseFloat(minLonWGS);
	                    		minLonWGS = minLonWGS.toFixed(2);	
	                    		maxLatWGS = parseFloat(maxLatWGS);
	                    		maxLatWGS = maxLatWGS.toFixed(2);
	                    		maxLonWGS = parseFloat(maxLonWGS);
	                    		maxLonWGS = maxLonWGS.toFixed(2);	

	                    		if (NS.UI.bbox){
		                    		NS.UI.bbox.set("minLatWGS", minLatWGS || "");
		                    		NS.UI.bbox.set("minLonWGS", minLonWGS || "");
		                    		NS.UI.bbox.set("maxLatWGS", maxLatWGS || "");
		                    		NS.UI.bbox.set("maxLonWGS", maxLonWGS || "");
	                    		}
							}
						}
					};
					//$("#waitControl").remove(); 
				});
				// unselect features
				this.map.events.register("click", map , function(e){
						//alert("click on map");
						/*this.map.selectedFeatures = [];
						this.map.latitudes = [];
						this.map.longitudes = [];*/

				});
				
				var selectCtr = new OpenLayers.Control.SelectFeature(vector,{hover:false,multiple:true,box:true});
				var panelControls = [
				    new OpenLayers.Control.Navigation(),
					selectCtr    
				];
				var toolbar = new OpenLayers.Control.Panel({
				   displayClass: 'olControlEditingToolbar',
				   defaultControl: panelControls[0]
				});
				toolbar.addControls(panelControls);
				this.map.addControl(toolbar);
				// add unselection button
				//$(".olMapViewport").append('<div style="position :absolute;z-index:1008;right:85px; top:4px;"><a><img id"mapunselectfeatures" src="images/editing_tool_unselect.png" /></a></div>');
			}

			function createPopup(feature) {
				var map = feature.feature.layer.map;
				feature.popup = new OpenLayers.Popup.FramedCloud("pop",
				  feature.feature.geometry.getBounds().getCenterLonLat(),
				  null,
				  '<div class="markerContent">'+ feature.feature.attributes.description +'</div>',
				  null,
				  true, 
				  function() { 
					 // destroy popups
					var popupsList = map.popups;
					for (var i=0; i< popupsList.length ; i++){popupsList[i].destroy();}
					popupsList.splice(0, popupsList.length);
				  }
			  );
			    map.addPopup(feature.popup, true);
			}

			function destroyPopup(feature) {
			 /* feature.popup.destroy();
			  feature.popup = null;*/
			}
			function zoomToData(){
				
				/*var bounds = this.getDataExtent();
				if(bounds){ 
					this.map.panTo(bounds.getCenterLonLat());
					this.map.zoomToExtent(bounds); 
				}*/
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
			//console.log("Current size: "+mapDiv.style.width+ " / "+mapDiv.style.height);
			var width = mapDiv.clientWidth;
			var height = mapDiv.clientHeight;
			mapDiv.style.width = (4* width )  + "px";
			mapDiv.style.height = (3 * height) + "px";
			//console.log("New size: "+mapDiv.style.width+ " / "+mapDiv.style.height);
			this.map.updateSize();
		},
		reduce: function(){
			var mapDiv = this.el;
			var width = mapDiv.clientWidth;
			var height = mapDiv.clientHeight;
			//console.log("Current size: "+mapDiv.style.width+ " / "+mapDiv.style.height);
			mapDiv.style.width = (width / 4) + "px";
			mapDiv.style.height = (height/3 ) + "px";
			//console.log("New size: "+mapDiv.style.width+ " / "+mapDiv.style.height);
			map.updateSize();
		},
		updateLayer: function(layerName, params, center){
			//this.displayWaitControl();
			var self = this;
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
			if (params.zoom){
				vector_layer.map.zoomTo(params.zoom);
			}
			if (center){
				vector_layer.map.setCenter(center);
			}
			vector_layer.refresh({force: true}); 
			
			vector_layer.events.register("beforefeaturesadded", vector_layer,function(){
				self.displayWaitControl();
	
			});
			vector_layer.events.register("featuresadded", vector_layer, zoomData);	
			//$("#waitControl").remove(); 
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
			//this.map.zoom = 12;
			this.map.setCenter(point);
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
			var st = $("#waitControl").html();
			if ($("#waitControl").length == 0) {
				$(mapDiv).append(ele);
			}
		},
		editLabel : function(layerName, label){
			var vector_layer;
			for(var i = 0; i < this.map.layers.length; i++ ){
					if((this.map.layers[i].name) ==layerName){vector_layer = this.map.layers[i] ;break;}
			};
			/*vector_layer.styleMap['default'] = style;
			vector_layer.redraw(false);*/
			//vector_layer.refresh({force: true}); 
			vector_layer.styleMap.styles.default.defaultStyle.label = "${" + label + "}";
			vector_layer.redraw();

		},
		moveLabel : function(layerName, direction, value){
			var vector_layer;
			for(var i = 0; i < this.map.layers.length; i++ ){
					if((this.map.layers[i].name) ==layerName){vector_layer = this.map.layers[i] ;break;}
			};

			var actualVal = 0;
			if (direction =="h"){
				actualVal = vector_layer.styleMap.styles.default.defaultStyle.labelXOffset  ;
				vector_layer.styleMap.styles.default.defaultStyle.labelXOffset = parseInt(actualVal) + parseInt(value) ;

			} else {
				actualVal = vector_layer.styleMap.styles.default.defaultStyle.labelYOffset  ;
				vector_layer.styleMap.styles.default.defaultStyle.labelYOffset = parseInt(actualVal) + parseInt(value) ;
			}
			vector_layer.redraw();
		},events : {
			"click #mapunselectfeatures" : "unselectFeatures"
		},
		/*afterRender: function () {
            $('#mapunselectfeatures').on('click', this, function (e) {
                e.preventDefault();
                e.stopPropagation();
               var tn; 
				
				
            });
        },*/
		unselectFeatures : function(){
			this.map.controls.selectControl.unselectAll();
		},

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
NS.UI.BBOXModel = Backbone.Model.extend({
	schema: {
		minLonWGS: { type: 'Number' },
		minLatWGS: { type: 'Number' },
		maxLonWGS: { type: 'Number' },
		maxLatWGS: { type: 'Number' }
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

function onPopupClose(evt) {
    this.map.controls.selectControl.unselect(this.feature);
}
function onFeatureSelect(bounds) {
	var bbox = bounds.left +',' +  bounds.bottom +',' + bounds.right +',' + bounds.top ;
	$("#updateSelection").val(bbox).trigger('change');
} 
function updateBBOX(tabLon, tabLat){
	if (tabLon.length > 0 ){
		var minLat = Math.min.apply({},tabLat);
		var maxLat = Math.max.apply({},tabLat);
		var minLon = Math.min.apply({},tabLon);
		var maxLon = Math.max.apply({},tabLon);

		var minLonLat = new OpenLayers.Geometry.Point(minLon,minLat);
		minLonLat =minLonLat.transform(
			   new OpenLayers.Projection("EPSG:3857"), // to Spherical Mercator Projection
			   new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
		);
		var maxLonLat = new OpenLayers.Geometry.Point(maxLon,maxLat);
		maxLonLat =maxLonLat.transform(
			   new OpenLayers.Projection("EPSG:3857"), // to Spherical Mercator Projection
			   new OpenLayers.Projection("EPSG:4326") // transform from WGS 1984
		);
		
		var bbox = ( minLonLat.x - 0.0001) +',' +  ( minLonLat.y - 0.0001) +',' + (maxLonLat.x + 0.0001) +',' + (maxLonLat.y + 0.0001) ;
	} else {
		var bbox = "";
	}
	$("#updateSelection").val(bbox).trigger('change');

}
function updateSelectedFeatures(listId){
	var nb = listId.length;
	var value = ""
	if ((nb < 15) && (nb > 0)){	
		for (var i=0; i<nb; i++){
			value += listId[i] + ",";
		}
		// delete last ","
		var lenString = value.length;
		value = value.substring(0,(lenString  - 1));
	} else {
		value="";
	}
	$("#featuresId").val(value);
	//map.featuresId = value;

}				
function removeItem(array, item){
    for(var i in array){
        if(array[i]==item){
            array.splice(i,1);
            break;
            }
    }
}
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                initialize: function(options) {
                	this.map = options.map;
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.trigger
                        }, this.handlerOptions
                    );
                }, 

                trigger: function(e) {
                   // var lonlat = map.getLonLatFromPixel(e.xy);
                   var map = this.map;
                   var tm;
                   map.controls.selectControl.unselectAll();
                   // alert("You clicked near " + lonlat.lat + " N, " + + lonlat.lon + " E");
                }

            });
