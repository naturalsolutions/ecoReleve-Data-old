define([
	'backbone',
	'google',
	'openlayers',
	'models/point'
], function(Backbone, GoogleMapsLoader, OpenLayers, Point) {

	'use strict';

	function clusterMapRules (){
		var colors = {
			low: 'rgb(140, 204, 226)', // green : rgb(181, 226, 140)
			middle: 'rgb(241, 211, 87)',
			high: 'rgb(253, 156, 115)'
		};

		// Define three rules to style the cluster features.
		var lowRule = new OpenLayers.Rule({
			filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.BETWEEN,
				property: 'count',
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
				label: '${count}',
				labelOutlineWidth: 1,
				fontColor: '#ffffff',
				fontOpacity: 0.8,
				fontSize: '12px'
			}
		});
		var middleRule = new OpenLayers.Rule({
			filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.BETWEEN,
				property: 'count',
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
				label: '${count}',
				labelOutlineWidth: 1,
				fontColor: '#ffffff',
				fontOpacity: 0.8,
				fontSize: '12px'
			}
		});
		var highRule = new OpenLayers.Rule({
			filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.GREATER_THAN,
				property: 'count',
				value: 50
			}),
			symbolizer: {
				fillColor: colors.high,
				fillOpacity: 0.9,
				strokeColor: colors.high,
				strokeOpacity: 0.5,
				strokeWidth: 12,
				pointRadius: 20,
				label: '${count}',
				labelOutlineWidth: 1,
				fontColor: '#ffffff',
				fontOpacity: 0.8,
				fontSize: '12px'
			}
		});

		var SoloRule = new OpenLayers.Rule({
			filter: new OpenLayers.Filter.Comparison({
				type: OpenLayers.Filter.Comparison.EQUAL_TO,
				property: 'count',
				value: 1
			}),
			symbolizer: {
				fillColor: colors.low,
				fillOpacity: 0.9,
				strokeColor: colors.low,
				strokeOpacity: 0.5,
				strokeWidth: 12,
				pointRadius: 10,
				label: '',
				labelOutlineWidth: 1,
				fontColor: '#ffffff',
				fontOpacity: 0.8,
				fontSize: '12px'
			}
		});

		return [SoloRule,lowRule, middleRule, highRule] ;
	}
	function checkLayer(layerName, map){
		var layer = 'null';
		for(var i = 0; i < map.layers.length; i++ ){
				if((map.layers[i].name) == layerName ) {
					layer = map.layers[i];
					break;
				}
		}
		if (layer!='null'){
			map.removeLayer(layer);
		}
	}

	function onPopupClose(evt) {
		this.map.controls.selectControl.unselect(this.feature);
	}
	/*function onFeatureSelect(bounds) {
		var bbox = bounds.left +',' +  bounds.bottom +',' + bounds.right +',' + bounds.top ;
		$('#updateSelection').val(bbox).trigger('change');
	} */
	function updateBBOX(tabLon, tabLat){
		var bbox;
		if (tabLon.length > 0 ){
			var minLat = Math.min.apply({},tabLat);
			var maxLat = Math.max.apply({},tabLat);
			var minLon = Math.min.apply({},tabLon);
			var maxLon = Math.max.apply({},tabLon);

			var minLonLat = new OpenLayers.Geometry.Point(minLon,minLat);
			minLonLat =minLonLat.transform(
				new OpenLayers.Projection('EPSG:3857'), // to Spherical Mercator Projection
				new OpenLayers.Projection('EPSG:4326') // transform from WGS 1984
			);
			var maxLonLat = new OpenLayers.Geometry.Point(maxLon,maxLat);
			maxLonLat =maxLonLat.transform(
				new OpenLayers.Projection('EPSG:3857'), // to Spherical Mercator Projection
				new OpenLayers.Projection('EPSG:4326') // transform from WGS 1984
			);

			bbox = ( minLonLat.x - 0.0001) +',' +  ( minLonLat.y - 0.0001) +',' + (maxLonLat.x + 0.0001) +',' + (maxLonLat.y + 0.0001) ;
		} else {
			bbox = '';
		}
		$('#updateSelection').val(bbox).trigger('change');

	}
	function updateSelectedFeatures(listId){
		var nb = listId.length;
		var value = '';
		if ((nb < 15) && (nb > 0)){
			for (var i=0; i<nb; i++){
				value += listId[i] + ',';
			}
			// delete last ','
			var lenString = value.length;
			value = value.substring(0,(lenString  - 1));
		} else {
			value='';
		}
		$('#featuresId').val(value);
		//map.featuresId = value;

	}

	return Backbone.View.extend({
		initialize: function(options) {
			this.options = options;
			var self = this;
			GoogleMapsLoader.done( function () {
				self.initMap(options);
				_.bindAll(self, 'initMap');
			});
			this.zoomLevelIndicator = 0;
			this.selectedFeatures='';
			this.selectedFeatureOrder = 0;
		},

		initMap: function(options) {
			// Initialize Basic Openlayers;
			var refresh;
			this.map = new OpenLayers.Map(this.el, {
				projection: new OpenLayers.Projection('EPSG:3857'),
				displayProjection: new OpenLayers.Projection('EPSG:4326'),
				layers: [
						new OpenLayers.Layer.Google(
							'Google Physical',
							{type: google.maps.MapTypeId.TERRAIN}
						),
						new OpenLayers.Layer.Google(
							'Google Streets', // the default
							{numZoomLevels: 20}
						),
						new OpenLayers.Layer.Google(
							'Google Hybrid',
							{type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
						),
						new OpenLayers.Layer.Google(
							'Google Satellite',
							{type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 22}
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
					new OpenLayers.Control.Zoom(),
					new OpenLayers.Control.ZoomBox()
				],//,
				//renderers : ['SVG']
				renderers: ['Canvas'],
				maxExtent: new OpenLayers.Bounds(-180, -90, 180, 90),
				updateSize: refresh,
				zoomDuration: 15
			});
			refresh = this.map.baseLayer.redraw();
			// add masked element to store selected elements id
			$(this.el).append('<input id="updateSelection" type="hidden" value="" />');
			$(this.el).append('<input id="featuresId"  type="hidden" value="" />');
			//this.map.featuresId ='';
			// tables to store latitude and longitudes values for selected points in vector layers
			this.map.latitudes = [];
			this.map.longitudes = [];
			this.map.selectedFeatures = [];
			this.mapAjaxCall ='';

			/*** center *******************************************************************************/

			var centerPoint =  options.center || new Point({ latitude : 0, longitude: 0, label:'center'});

			var lat = centerPoint.attributes.latitude;
			var lon = centerPoint.attributes.longitude;
			var center=new OpenLayers.LonLat(lon,lat);

			center=center.transform(
				new OpenLayers.Projection('EPSG:4326'), // transform from WGS 1984
				new OpenLayers.Projection('EPSG:3857') // to Spherical Mercator Projection
			);
			/*********** zoom *********/
			var mapZoom =  this.options.zoom || 0 ;
			this.map.setCenter(center, mapZoom);
		},
		remove: function() {
			this.trigger('remove', this);
			console.log('map removed');
			/**/
			if(this.events) {
			if(this.eventListeners) {
				this.events.un(this.eventListeners);
			}
			this.events.destroy();
			this.events = null;
			}
			this.eventListeners = null;
			console.log('map destroy');
			// eliminate circular references
			if (this.handler) {
				this.handler.destroy();
				this.handler = null;
			}
			if(this.handlers) {
				for(var key in this.handlers) {
					if(this.handlers.hasOwnProperty(key) &&
					typeof this.handlers[key].destroy == 'function') {
						this.handlers[key].destroy();
					}
				}
				this.handlers = null;
			}
			if (this.map) {
				this.map.removeControl(this);
				this.map = null;
			}
			this.div = null;
			console.log('map div destroy');
			/**/
			Backbone.View.prototype.remove.apply(this, arguments);
			var tm;
		},
		/******************** Methods *****************************************/
		loadGeoJSON: function(url, layerName) {
			var featurecollection;
			var coordinates = [];
			var nbFeatures = 0;
			var style = new OpenLayers.StyleMap({
				"default": new OpenLayers.Style({
					graphicName: "circle",
					pointRadius: 4,
					fillOpacity: 0.7,
					fillColor: "#217a15", // 1A6921  -> red
					strokeColor: "#217a15",
					strokeWidth: 1
				})
			});
			$.ajax({
				context: this,
				url: url,
				dataType: "json"
			}).done( function(data) {
				var geojson_format = new OpenLayers.Format.GeoJSON({
					'internalProjection': this.map.baseLayer.projection,
					'externalProjection': new OpenLayers.Projection("EPSG:4326")
				});
				var vector_layer = new OpenLayers.Layer.Vector(layerName, {
					styleMap: style
				});
				this.map.addLayer(vector_layer);
				vector_layer.addFeatures(geojson_format.read(data));
				this.map.zoomToExtent(vector_layer.getDataExtent());
			}).fail( function() {
				alert("error loading data, please check connexion to webservice");
			});
		},

		addLayer : function(options){
			//this.displayWaitControl();
			var layerName = options.layerName || 'Features';
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
			// , label : '${Site_name}',  labelXOffset: '50', labelYOffset: '-15'
			});

			var defaultStyle = s;
			//var defaultStyle = new OpenLayers.Style({pointRadius:4,strokeWidth:1,fillColor:'#edb759',strokeColor:'black',cursor:'pointer'});
			var selectStyle = new OpenLayers.Style({fillColor:'#EB421C'});
			var styleMap = options.styleMap || new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle});
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
					var undef = ( used == 'undefined' );
					if (( used === false ) || ( used === undefined )){
						var waypointId = o.attributes.id || o.attributes.positionId;
						//var myStationModel = app.collections.stations.get(stationId);
						var lon = o.attributes.longitude;
						var lat = o.attributes.latitude;
						var name = o.attributes.name;
						var time = o.attributes.waypointTime;
						//var link = o.attributes.link ;
						var featureDescription = '<p><b>Station name :' + name + '<br/> Longitude : ' + lon + '<br/> Latitude : ' + lat  + '<br/> id : <span>' + waypointId ; // + '<br/><a href='#stationInfos'>Select this point</a>
						var lonlat = new OpenLayers.LonLat(lon, lat);
						lonlat.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857'));
						var f = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat), {id:waypointId, description:featureDescription}// ,
						//{externalGraphic: 'img/marker.png', graphicHeight: 25, graphicWidth: 21, graphicXOffset:-12, graphicYOffset:-25  }
						);
						//lastpoint = new OpenLayers.LonLat(lon, lat);

						vector.addFeatures(f);
						//vector.popup = true;
						//$('#waitControl').remove();
					}
				});
				var cluster = options.cluster;
				// cluster style
				vector.styleMap = styleMap;
				if (cluster =='yes'){
					var layerStyle;
					var rules = clusterMapRules ();
					layerStyle = new OpenLayers.Style(null, {
					rules: rules
					});
					//vector.styleMap = layerStyle;
					vector.styleMap = new OpenLayers.StyleMap({'default':layerStyle,'select':selectStyle});
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
				lonlat.transform(new OpenLayers.Projection('EPSG:4326'), new OpenLayers.Projection('EPSG:3857'));
				var f = new OpenLayers.Feature.Vector( new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat), {description:featureDescription} //,
					//{externalGraphic: ( marker || 'img/marker.png'), graphicHeight: 25, graphicWidth: 21, graphicXOffset:-12, graphicYOffset:-25  }
				);
				vector.styleMap = styleMap;
				vector.addFeatures(f);
				$('#waitControl').remove();
			}
			var strategies;
			var layerStrategies = [];
			var fixedStrategy = false;
			// if provided data is from a file (kml) or a server  --> a protocol + a strategy
			if (options.protocol){
				var url = options.protocol.attributes.url;
				var format = options.protocol.attributes.format || '';
				var params = options.protocol.attributes.params || '';
				strategies = options.protocol.attributes.strategies|| '';
				layerStrategies = [];
				var dataFormat;
				var cluster = options.protocol.attributes.cluster;

				var popup = options.protocol.attributes.popup;
				var style = options.protocol.attributes.style;

				switch (format)
				{
					case 'KML':
						dataFormat = new OpenLayers.Format.KML({
						extractStyles: true,
						extractAttributes: true,
						maxDepth: 2
						});
					break;
					case 'GEOJSON':
						dataFormat = new OpenLayers.Format.GeoJSON();
					break;
				}
				for( var i= 0 ; i< strategies.length; i++){
					switch (strategies[i].toUpperCase())
					{
						case 'FIXED':
							var strategy = new OpenLayers.Strategy.Fixed();
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
							fixedStrategy = true;
						break;
						case 'BBOX':
							var strategy = new OpenLayers.Strategy.BBOX();
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
						break;
						case 'FILTER':
							var strategy = new OpenLayers.Strategy.Filter();
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
						break;
						case 'CLUSTER':
							var strategy = new OpenLayers.Strategy.Cluster();
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
						break;
						case 'REFRESH':
							var strategy = new OpenLayers.Strategy.Refresh({force: true, active: true});
							strategy.setLayer(vector);
							layerStrategies.push(strategy);
						break;
						case 'ANIMATEDCLUSTER':
							var strategy = new OpenLayers.Strategy.AnimatedCluster({
													distance: 45,
													animationMethod: OpenLayers.Easing.Expo.easeOut,
													animationDuration: 10
												});
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
				// zoom modif : reload data if strategy 'fixed' is not activated
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
					//vector.styleMap = layerStyle;
					vector.styleMap = new OpenLayers.StyleMap({'default':layerStyle,'select':selectStyle});
				} else {
					vector.styleMap = styleMap;
					if (style){
						var defaultStyle = style;
						var selectStyle = new OpenLayers.Style({fillColor:'#EB421C'});
						vector.styleMap = new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle});
					}
				}
				//$('#waitControl').remove();
			}
			if (options.ajaxCall){
				var url = options.ajaxCall.url;
				var format = options.ajaxCall.format || '';
				var params = options.ajaxCall.params || '';
				var cluster = options.ajaxCall.cluster || false;
				var  serverCluster = options.ajaxCall.serverCluster || false;
				var style = options.ajaxCall.style || false;
				if (cluster){
					var layerStyle;
					var rules = clusterMapRules ();
					layerStyle = new OpenLayers.Style(null, {
					rules: rules
					});
					vector.styleMap = new OpenLayers.StyleMap({'default':layerStyle,'select':selectStyle});
					if (!serverCluster) {
						var strategy = new OpenLayers.Strategy.AnimatedCluster({
							distance: 45,
							animationMethod: OpenLayers.Easing.Expo.easeOut,
							animationDuration: 10
						});
						strategy.setLayer(vector);
						vector.strategies = [];
						vector.strategies.push(strategy);
					}
					vector.cluster = true;

				} else {
					vector.styleMap = styleMap;
					if (style){
						var defaultStyle = style;
						var selectStyle = new OpenLayers.Style({fillColor:'#EB421C'});
						vector.styleMap = new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle});
					}
				}

				vector.bboxStrategy = true;

				vector.url = url;
				vector.params = params;
				// ajax call to get data
				this.getData(this,vector, url,params);
			}
			this.map.addLayer(vector);
			var zoomToExtent = options.zoomToExtent || false ;
			if (options.zoomToExtent ){   //(! options.protocol) ||
				this.map.zoomToExtent(vector.getDataExtent());
				//$('#waitControl').remove();
			}
			if (options.zoom) {
				var zoomLevel = options.zoom;
				this.map.zoomTo(zoomLevel);
			}
			if (options.center){
				var center = new OpenLayers.LonLat(options.center.longitude,options.center.latitude);
				this.map.setCenter(options.center);
				center = center.transform(
				new OpenLayers.Projection('EPSG:4326'), // transform from WGS 1984
				new OpenLayers.Projection('EPSG:3857') // to Spherical Mercator Projection
				);
				this.map.panTo(center);
			}
			// check if layer is not the first one to add selection tools
			if (!options.noSelect) {
				vector.events.register('featuresadded', vector, zoomToData);
				vector.events.on({
					'featureselected': function(feature) {

						var featureId = feature.feature.attributes.id;
						if (featureId!==''){
							this.map.selectedFeatures.push(featureId);
						}
						$('#map').trigger('selectedFeatures:change');
					},
					'featureunselected': function(feature) {
						var featureId = feature.feature.attributes.id;
						var displayPopup = feature.feature.layer.popup;
						// remove id feature from selected features list if exists
						removeItem(this.map.selectedFeatures, featureId);
						$('#map').trigger('selectedFeatures:change');

						if (this.map.selectedFeatures.length === 0){
						//	this.map.events.trigger('moveend');
						}

					},
					'unselectAll': function(	options	){
						alert('unselect all');
					},
					'clickoutFeature': function(	options	){
						alert('clickoutFeature');
					}
				});
				this.map.events.register('moveend', this, function (event) {
					var vector_layer ;
					var bbox ='';
					if (this.map.layers){
						for(var i = 0; i < this.map.layers.length; i++ ){
							if(((this.map.layers[i].name) !='OpenStreetMap') && ( ((this.map.layers[i].name) !='Imagery') ) && (((this.map.layers[i].name) !='OpenCycleMap') )) {
								vector_layer = this.map.layers[i] ;
								if (!vector_layer.fixedStrategy){
									var bounds = this.map.getExtent();
									var minLat = bounds.bottom;
									var maxLat= bounds.top;
									var minlong = bounds.left;
									var maxLong = bounds.right;

									var minPoint=new OpenLayers.LonLat(minlong,minLat);
									minPoint=minPoint.transform(
										new OpenLayers.Projection('EPSG:3857'), // transform from WGS 1984
										//new OpenLayers.Projection('EPSG:3857') // to Spherical Mercator Projection  900913
										new OpenLayers.Projection('EPSG:4326') // to Spherical Mercator Projection
									);
									var maxPoint = new OpenLayers.LonLat(maxLong,maxLat);
									maxPoint=maxPoint.transform(
										new OpenLayers.Projection('EPSG:3857'), // transform from WGS 1984
										new OpenLayers.Projection('EPSG:4326') // to Spherical Mercator Projection
									);
									var minLatWGS = minPoint.lat;
									var minLonWGS = minPoint.lon;
									var maxLatWGS = maxPoint.lat;
									var maxLonWGS = maxPoint.lon;

									bbox = minLonWGS   + ',' + minLatWGS + ',' + maxLonWGS + ',' + maxLatWGS ;

									if (this.map.selectedFeatures.length === 0){
										$('#updateSelection').val(bbox);
										$('.updateSelection').val(bbox);
									}

									// convert values to decimal format 'x.xx'
									minLatWGS = parseFloat(minLatWGS);
									minLatWGS = minLatWGS.toFixed(2);
									minLonWGS = parseFloat(minLonWGS);
									minLonWGS = minLonWGS.toFixed(2);
									maxLatWGS = parseFloat(maxLatWGS);
									maxLatWGS = maxLatWGS.toFixed(2);
									maxLonWGS = parseFloat(maxLonWGS);
									maxLonWGS = maxLonWGS.toFixed(2);

									if (NS.UI.bbox){
										NS.UI.bbox.set('minLatWGS', minLatWGS || '');
										NS.UI.bbox.set('minLonWGS', minLonWGS || '');
										NS.UI.bbox.set('maxLatWGS', maxLatWGS || '');
										NS.UI.bbox.set('maxLonWGS', maxLonWGS || '');
									}

								}
							}
						}
					}
					//$('#waitControl').remove();
				var bboxStrategy = vector_layer.bboxStrategy || false ;
				/*if(bboxStrategy){
					var params = vector_layer.params;
					params.bbox = bbox;
					var url = vector_layer.url;
					this.getData(this,vector_layer, url,params);
				}*/

					$('#waitControl').remove();
				});
				// unselect features
				//this.map.events.register('click', map , function(e){
						//alert('click on map');
						/*this.map.selectedFeatures = [];
						this.map.latitudes = [];
						this.map.longitudes = [];*/

				//});

				var selectCtr = new OpenLayers.Control.SelectFeature(vector,{
					hover:false,multiple:true, clickout: true, box:true
					//toggleKey: 'ctrlKey', // ctrl key removes from selection
					//multipleKey: 'shiftKey', // shift key adds to selection
					//
					});
				var panelControls = [
					new OpenLayers.Control.Navigation(),
					selectCtr ,
					new OpenLayers.Control.ZoomBox()
				];
				var toolbar = new OpenLayers.Control.Panel({
				displayClass: 'olControlEditingToolbar',
				defaultControl: panelControls[1]
				});
				toolbar.addControls(panelControls);
				this.map.addControl(toolbar);
				// add unselection button
				//$('.olMapViewport').append('<div style='position :absolute;z-index:1008;right:85px; top:4px;'><a><img id'mapunselectfeatures' src='images/editing_tool_unselect.png' /></a></div>');
			}

			function createPopup(feature) {
				var map = feature.feature.layer.map;
				feature.popup = new OpenLayers.Popup.FramedCloud('pop',
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
				var bounds = this.getDataExtent();
				if(bounds){
					this.map.panTo(bounds.getCenterLonLat());
					//this.map.zoomToExtent(bounds);
				}
				this.events.unregister('featuresadded', this, zoomToData);
				$('#waitControl').remove();
			}

		},
		updateSize: function(){
			this.map.updateSize();
		},
		getZoom: function(){
			this.map.getZoom();
		},
		zoomOut : function(){
		//	this.map.zoomOut();
		},
		zoomIn : function(){
		//	this.map.zoomIn();
		},
		zoomTo : function(zoomLevel){
			this.map.zoomTo(zoomLevel);
		},
		enlarge: function(){
			var mapDiv = this.el;
			//console.log('Current size: '+mapDiv.style.width+ ' / '+mapDiv.style.height);
			var width = mapDiv.clientWidth;
			var height = mapDiv.clientHeight;
			mapDiv.style.width = (4* width )  + 'px';
			mapDiv.style.height = (3 * height) + 'px';
			//console.log('New size: '+mapDiv.style.width+ ' / '+mapDiv.style.height);
			this.map.updateSize();
		},
		reduce: function(){
			var mapDiv = this.el;
			var width = mapDiv.clientWidth;
			var height = mapDiv.clientHeight;
			//console.log('Current size: '+mapDiv.style.width+ ' / '+mapDiv.style.height);
			mapDiv.style.width = (width / 4) + 'px';
			mapDiv.style.height = (height/3 ) + 'px';
			//console.log('New size: '+mapDiv.style.width+ ' / '+mapDiv.style.height);
			map.updateSize();
		},
		getData: function(mapView,layer,url,params){
			var self = this;
			if(window.mapAjaxCall.xhr){
				window.mapAjaxCall.xhr.abort();
			}
			window.mapAjaxCall.xhr = $.ajax({
				url: url,
				dataType: 'json',
				data: params,
				beforeSend : function (){
					self.displayWaitControl();
				},
				success: function(data){

				},
				error : function(data) {
					alert('error loading geodata');
				}
			}).done(function(data) {
				data = eval( data);
				var bbox = data.bbox;
				var geojson_format = new OpenLayers.Format.GeoJSON({
					'internalProjection': mapView.map.baseLayer.projection,
					'externalProjection': new OpenLayers.Projection('EPSG:4326')
				});
				layer.removeAllFeatures();
				layer.addFeatures(geojson_format.read(data));
				if (bbox){
					var minlon = bbox.minlon -0.2;
					var minlat = bbox.minlat -0.2 ;
					var maxlon = bbox.maxlon + 0.2 ;
					var maxlat = bbox.maxlat + 0.2 ;
					var minLatLon = new OpenLayers.LonLat(minlon,minlat);
					minLatLon =minLatLon .transform(
							new OpenLayers.Projection('EPSG:4326'), // transform from WGS 1984
							new OpenLayers.Projection('EPSG:3857') // to Spherical Mercator Projection
					);
					var maxLatLon = new OpenLayers.LonLat(maxlon,maxlat);
					maxLatLon = maxLatLon .transform(
							new OpenLayers.Projection('EPSG:4326'), // transform from WGS 1984
							new OpenLayers.Projection('EPSG:3857') // to Spherical Mercator Projection
					);

					var bounds = new OpenLayers.Bounds();
					bounds.extend(minLatLon);
					bounds.extend(maxLatLon);
					layer.map.zoomToExtent(bounds);

				}

			});
		},
		updateLayer: function(layerName,url, params, center){
			//this.displayWaitControl();
			var self = this;
			var vector_layer;
			for(var i = 0; i < this.map.layers.length; i++ ){
					if((this.map.layers[i].name) ==layerName){vector_layer = this.map.layers[i] ;break;}
			}

			/*
			vector_layer.protocol.options.params = params;

			*/
			if (params){
				var cluster = params.cluster || false ;
			}
			this.getData(this,vector_layer, url,params);

			var selectStyle = new OpenLayers.Style({fillColor:'#EB421C'});   //#36b7d1
			if (cluster ==='no'){
				var defaultStyle = new OpenLayers.Style({pointRadius:4,strokeWidth:1,fillColor:'#edb759',strokeColor:'black',cursor:'pointer'});

				var styleMap = new OpenLayers.StyleMap({'default':defaultStyle,'select':selectStyle});
				vector_layer.styleMap = styleMap;
			}
			else if (cluster ==='yes' ||cluster || vector_layer.bboxStrategy ){
				var layerStyle;
				var rules = clusterMapRules ();
				layerStyle = new OpenLayers.Style(null, {
				rules: rules
				});
				//vector_layer.styleMap = layerStyle;
				vector_layer.styleMap = new OpenLayers.StyleMap({'default':layerStyle, 'select':selectStyle});
			}
			if ( params && params.zoom){
				vector_layer.map.zoomTo(params.zoom);
			}
			if (center){
				vector_layer.map.setCenter(center);
			}

			/*
			vector_layer.refresh({force: true});
			*/

			vector_layer.events.register('beforefeaturesadded', vector_layer,function(){
				self.displayWaitControl();

			});

			vector_layer.events.register('featuresadded', vector_layer, zoomData);
			//$('#waitControl').remove();
			function zoomData(){
				var bounds = this.getDataExtent();
				//var bounds = OpenLayers.Bounds.fromArray(this.llbbox);	bounds.transform(proj4326, proj900913);	this.map.zoomToExtent(bounds);
				if(bounds){
					this.map.panTo(bounds.getCenterLonLat());
					this.map.zoomToExtent(bounds);
					$('#waitControl').remove();
				}

				this.events.unregister('featuresadded', this, zoomData);
				$('#waitControl').remove();
			}
		},
		setCenter : function (point){
			point =point.transform(
				new OpenLayers.Projection('EPSG:4326'), // transform from WGS 1984
				new OpenLayers.Projection('EPSG:3857') // to Spherical Mercator Projection
			);
			//this.map.zoom = 12;
			this.map.setCenter(point);
		},
		panTo : function (point){

			point = point.transform(
				new OpenLayers.Projection('EPSG:4326'), // transform from WGS 1984
				new OpenLayers.Projection('EPSG:3857') // to Spherical Mercator Projection
			);
			this.map.panTo(point);
			this.map.zoomTo(8);
		},
		removeLayer : function (layerName){
			//layer.removeAllFeatures();
			//this.map.removeLayer(layer);
			for(var i = 0; i < this.map.layers.length; i++ ){
					if((this.map.layers[i].name) == layerName ) {
						this.clearLayer(this.map.layers[i]);
						break;
					}
				}
		},
		clearLayer : function (layer){
			layer.destroyFeatures();
		},
		displayWaitControl : function (){
			var mapDiv = this.el;
			var width =  ((screen.width)/2 -200);
			var height = ((screen.height)/2 - 200);
			var ele = '<div id ="waitControl" style="position: fixed; top:"' +
			height + '"px; left:"' + width +
			'"px;z-index: 1000;"><IMG SRC="images/PleaseWait.gif" /></div>';
			var st = $('#waitControl').html('');
			if ($('#waitControl').length === 0) {
				$(mapDiv).append(ele);
			}
		},
		editLabel : function(layerName, label){
			var vector_layer;
			for(var i = 0; i < this.map.layers.length; i++ ){
					if((this.map.layers[i].name) ==layerName){vector_layer = this.map.layers[i] ;break;}
			}
			vector_layer.styleMap.styles.default.defaultStyle.label = '${' + label + '}';
			vector_layer.redraw();

		},
		moveLabel : function(layerName, direction, value){
			var vector_layer;
			for(var i = 0; i < this.map.layers.length; i++ ){
					if((this.map.layers[i].name) ==layerName){vector_layer = this.map.layers[i] ;break;}
			}

			var actualVal = 0;
			if (direction =='h'){
				actualVal = vector_layer.styleMap.styles.default.defaultStyle.labelXOffset  ;
				vector_layer.styleMap.styles.default.defaultStyle.labelXOffset = parseInt(actualVal) + parseInt(value) ;

			} else {
				actualVal = vector_layer.styleMap.styles.default.defaultStyle.labelYOffset  ;
				vector_layer.styleMap.styles.default.defaultStyle.labelYOffset = parseInt(actualVal) + parseInt(value) ;
			}
			vector_layer.redraw();
		}
	});
});
