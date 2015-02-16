OpenLayers.THLMap = OpenLayers.Class(OpenLayers.Map, {

	initialize: function(div, options){
		OpenLayers.Map.prototype.initialize.apply(this, [div, options]);
		
		this.setMapEnvironment();
	},

	mapEnvironment: 'production',
	
	geoserverUrl: null,
	proxyUrl: null,
	
	language: 'roman.popular',

	setMapEnvironment: function(){
		// Determine the map's environment
		if(window.location.host.indexOf('localhost') == 0){
			this.mapEnvironment = 'local';
		}else if(window.location.host.indexOf('dev.thlib') == 0){
			this.mapEnvironment = 'dev';
		}else{
			this.mapEnvironment = 'production';
		}
		
		// Set variables that depend on the map's environment
		switch(this.mapEnvironment){
			case 'local':
				this.geoserverUrl = 'http://www.thlib.org:8080/thdl-geoserver';
				break;
			case 'dev':
				// this.geoserverUrl = 'http://dev.thlib.org:8080/thlib-geoserver'; /* does not work (ndg, 1-17-11) */
				this.geoserverUrl = 'http://www.thlib.org:8080/thdl-geoserver';
				break;
			case 'staging':
				this.geoserverUrl = 'http://staging.thlib.org:8080/thdl-geoserver';
				break;
			case 'production':
				this.geoserverUrl = 'http://www.thlib.org:8080/thdl-geoserver';
				break;
		}
	},
	
	setLanguage: function(language) {
		var layers = this.getThlWmsLayers();
		var i;
		for(i in layers){
			layers[i].setLanguage(language);
		}
		this.language = language;
	},
	
	getThlWmsLayers: function(){
		var thlWmsLayers = [];
		var layers = this.layers;
		var i, layer;
		for(i in layers){
			layer = layers[i];
			if(this.utilsIsDefined(layer.CLASS_NAME) && layer.CLASS_NAME == "OpenLayers.Layer.THLWMS"){
				thlWmsLayers.push(layer);
			}
		}
		return thlWmsLayers;
	},
	
	getThlWmsLayerCqlFilter: function(layer){
		var cql = layer.params.CQL_FILTER;
		var cql_split = cql.split(';');
		//This code is retired because the logic only going to work if there are only 2 items
		//inside the array.
		//if(cql_split.length == 2 && cql_split[0] == cql_split[1]){
		//	return cql_split[0];
		//}
		// this new code should able to handle situation where are there are more than 2 items in the array
		if (cql_split.length > 0)
		{
			//compare value , return first value if they are identical
			var firstValue=cql_split[0];
			var allCQLAreIdentical=true;
			var i=1;
			for (i=1; i<cql_split.length;i++)
			{
				var curCQL=cql_split[i];
				if (curCQL!=firstValue)
				{
					allCQLAreIdentical=false;
				}
			}
			if (allCQLAreIdentical==true)
			{
				return firstValue;
			}; 
		};

		return false;
	},

	zoomToThlWmsLayer: function(layer){
		var cql_filter = this.getThlWmsLayerCqlFilter(layer);
		if(cql_filter){
			this.zoomToCqlFilter(cql_filter);
		}
	},
	
	zoomToActiveFeatures: function(){
		var layers = this.getThlWmsLayers();
		var cql_filters = [];
		var i, layer, cql_filter;
		for(i in layers){
			layer = layers[i];
			// Only use visible layers
			if(layer.visibility){
				cql_filter = this.getThlWmsLayerCqlFilter(layer);
				if(cql_filter){
					cql_filters.push('('+cql_filter+')');
				}
			}
		}
		
		if(cql_filters.length > 0){
			cql_filter = cql_filters.join('OR');
			this.zoomToCqlFilter(cql_filter);
		}
	},
	
	zoomToCqlFilter: function(cql_filter){
		var max_zoom = 3;
		var min_zoom = 0;
		url = this.geoserverUrl+
			'/wfs?service=wfs&version=1.1.0&request=GetFeature&typename=thl:bbox&cql_filter='+cql_filter+
			'&projection=EPSG:4326&SRS=EPSG:4326&outputFormat=json';
		var cur=this; //marker for current instance 
		OpenLayers.loadURL(url, null, this,
			function(data){
				data = data.responseText;
				if(data){
					var parser = new OpenLayers.Format.JSON();
					data = parser.read(data);
					if(data){
						var bounds = data.bbox;
						bounds = new OpenLayers.Bounds.fromArray([ bounds[1], bounds[0], bounds[3], bounds[2] ]);
						/*bounds = new OpenLayers.Bounds.fromArray([
							this.utilsRange(bounds[1], -90, 90),
							this.utilsRange(bounds[0], -180, 180),
							this.utilsRange(bounds[3], -90, 90),
							this.utilsRange(bounds[2], -180, 180)
						]);*/
						bounds = bounds.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
						/*for(var i in bounds){
							bounds[i] = this.utilsRange(bounds[i], -20037508.34, 20037508.34)
						}*/
						cur.RenderLocationMarker(bounds.getCenterLonLat());
						this.zoomToExtent(bounds);
						if(this.zoom > max_zoom){
							this.zoomTo(max_zoom);
						}
						if(this.zoom < min_zoom){
							this.zoomTo(min_zoom);
						}
					}
				}
			},
			function(){
				// There was an error accessing the URL.
				// This empty function replaces the OpenLayers error message dialog.
			}
		);
	},
	//render location marker using vector layer
	//lonLat: instance of OpenLayers.LonLat
	RenderLocationMarker: function(lonlat){
        var layer_style = OpenLayers.Util.extend({}, OpenLayers.Feature.Vector.style['default']);
        layer_style.fillOpacity = 0.4;
        layer_style.graphicOpacity = 1;
		LocationMarker = new OpenLayers.Layer.Vector("LocationMarker", {style: layer_style});
		
		this.addLayer(LocationMarker);

		var style_red = OpenLayers.Util.extend({}, layer_style);
		style_red.strokeColor = "black";
		style_red.fillColor = "#00AEFF";
		style_red.graphicName = "circle";
		style_red.pointRadius = 7;
		style_red.strokeWidth = 2;		
		style_red.strokeLinecap = "butt";
		
        var point = new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat);
        var pointFeature = new OpenLayers.Feature.Vector(point,null,style_red);
		
		LocationMarker.addFeatures([pointFeature]);		
		this.events.register("zoomend", this, this.ZoomOutEventHandler);
	},

	//show location marker only of the curZoomLevel is lower than 6
	ZoomOutEventHandler: function(evt){
		var Layers=this.getLayersByName("LocationMarker");		
		if (Layers)
		{
			var vectorLayer=Layers[0];
			if (vectorLayer)
			{
				var curZoomLevel=this.getZoom();
				vectorLayer.setVisibility((parseInt(curZoomLevel)< 6));
			}
		}
		
	},
	
	utilsIsDefined: function(mixed){		
		return !(typeof mixed == 'undefined');
	},
	
	utilsRange: function(number, min, max){
		return Math.max(Math.min(number, max), min);
	},
	
	CLASS_NAME: "OpenLayers.THLMap"
});