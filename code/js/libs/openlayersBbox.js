OpenLayers.Control.SelectFeature.prototype.selectBox = function(position) {
	var minLatWGS, minLonWGS ,maxLatWGS ,maxLonWGS;

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
        
		var minPoint = new OpenLayers.LonLat(minXY.lon,minXY.lat);
		var maxPoint = new OpenLayers.LonLat(maxXY.lon,maxXY.lat);
		minPoint=minPoint.transform(
									new OpenLayers.Projection("EPSG:3857"), // transform from WGS 1984
									new OpenLayers.Projection("EPSG:4326") // to Spherical Mercator Projection
								);
								
		maxPoint=maxPoint.transform(
									new OpenLayers.Projection("EPSG:3857"), // transform from WGS 1984
									new OpenLayers.Projection("EPSG:4326") // to Spherical Mercator Projection
								);
								
		var minLatWGS = minPoint.lat;
		var minLonWGS = minPoint.lon;
		var maxLatWGS = maxPoint.lat;
		var maxLonWGS = maxPoint.lon;
								
		// convert values to decimal format "x.xx"	
		minLatWGS = parseFloat(minLatWGS);
		minLatWGS = minLatWGS.toFixed(2);	
		minLonWGS = parseFloat(minLonWGS);
		minLonWGS = minLonWGS.toFixed(2);	
		maxLatWGS = parseFloat(maxLatWGS);
		maxLatWGS = maxLatWGS.toFixed(2);
		maxLonWGS = parseFloat(maxLonWGS);
		maxLonWGS = maxLonWGS.toFixed(2);	

		//alert("minLong: " + minLonWGS + "miLat: " + minLatWGS + "maxLong: "+ maxLonWGS + "maxLat: " + maxLatWGS);         
		var bbox = minLonWGS   + "," + minLatWGS + "," + maxLonWGS + "," + maxLatWGS ;
		$("#updateSelection").val(bbox);  
		//$(".updateSelection").val(bbox);  
		
		
		
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
								//this.map.selectedFeatures.push(feature.attributes.id);
                            }
                        }
                    }
                }
        }
        onFeatureSelect(selectedFeatures, layer); // <-- Modification of original function (3/3)
        this.multiple = prevMultiple;
    } else {
    	$("#featuresId").val("");
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
		minLatWGS = minPoint.lat;
		minLonWGS = minPoint.lon;
		maxLatWGS = maxPoint.lat;
		maxLonWGS = maxPoint.lon;
		bbox = minLonWGS   + "," + minLatWGS + "," + maxLonWGS + "," + maxLatWGS ;
		$("#updateSelection").val(bbox);  
    }
}
function onFeatureSelect(f, layer){
	var ln = f.length;
	var value = "";
	var cluster = layer.cluster;
	if ((ln < 15) && (!cluster)){
		for (var i=0;i<ln;i++){
			var featureId = f[i].attributes.id;
			value += featureId + ",";
		}
		// delete last ","
		var lenString = value.length;
		value = value.substring(0,(lenString  - 1));
	} else {
		value="";
	}
	$("#featuresId").val(value);
}