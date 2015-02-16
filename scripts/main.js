var map_dir = get_href_directory();
var show_place_names = false;
var current_pd_view = 'roman.popular';
var hover_style = 'thl_hover';
var geoserver_url = "http://www.thlib.org:8080/thdl-geoserver";
var geonetwork_url = "http://www.thlib.org:8080/geonetwork";
var thdllayername = "thdl:test2";
var location_hash_update_enabled = false;
var hovering_enabled = true;

// The method by which proximity searches are performed, with possible values of
// 'single' for selecting the closest match and 'multiple' for all matches.
var proximity_search_method = 'single';

var enable_no_scale = true;

var map, overview_map, loading_panel, current_hash, feature_types_data, characteristic_selector;
var default_map_bounds = new OpenLayers.Bounds(4370000, 290000, 14230000, 5670000);
if(typeof is_fullscreen == "undefined"){
	is_fullscreen = false;
}

if(is_fullscreen && window.location.search.indexOf("hash=") > -1) {
	var newHash = window.location.search;
	newHash = newHash.substring(newHash.indexOf("hash=") + 5);
	window.location.hash = newHash;
}

// Code to make it reload in top window iframe if coming from another iframed app
if(top != self) {
	try {
		window.document.domain="thlib.org";
		var tophash = top.window.location.hash;
		var myloc = self.window.location.toString();
		myloc = "#iframe=" + myloc.replace(/\#/g,"|hash|");
		if(tophash != myloc) { top.window.location.href = top.window.location.pathname + myloc; }
	} catch(e) {
		if(typeof(console) == "object") { console.info("error: " + e.toString());}
	}
}

// Set variables that depend on the map's environment
var map_environment, pd_url, subjects_url;
if(window.location.host.indexOf('localhost') == 0){
	map_environment = 'local';
}else if(window.location.host.indexOf('dev.thlib') == 0){
	map_environment = 'dev';
}else if(window.location.host.indexOf('staging.thlib') == 0){
	map_environment = 'staging';
}else{
	map_environment = 'production';
}
switch(map_environment){
	case 'local':
		geoserver_url = 'http://www.thlib.org:8080/thdl-geoserver';
		geonetwork_url = 'http://www.thlib.org:8080/geonetwork';
		pd_url = 'http://places.thlib.org';
		//pd_url = 'http://localhost:3000';
		subjects_url = 'http://subjects.thlib.org';
		break;
	case 'dev':
		/* Dev settings do not work right now (ndg: 1/17/11)
		geoserver_url = 'http://dev.thlib.org:8080/thlib-geoserver';
		geonetwork_url = 'http://www.thlib.org:8080/geonetwork'; 
		pd_url = 'http://dev.places.thlib.org';*/
		geoserver_url = 'http://staging.thlib.org:8080/thdl-geoserver';
		geonetwork_url = 'http://staging.thlib.org:8080/geonetwork';
		pd_url = 'http://staging.places.thlib.org';
		subjects_url = 'http://dev-subjects.thlib.org'; 
		break;
	case 'staging':
		geoserver_url = 'http://staging.thlib.org:8080/thdl-geoserver';
		geonetwork_url = 'http://staging.thlib.org:8080/geonetwork';
		pd_url = 'http://staging.places.thlib.org';
		subjects_url = 'http://staging-subjects.thlib.org';
		break;
	case 'production':
		/*geoserver_url = 'http://sds7.itc.virginia.edu:8080/thdl-geoserver';
		geonetwork_url = 'http://sds7.itc.virginia.edu:8080/geonetwork';*/
		geoserver_url = 'http://www.thlib.org:8080/thdl-geoserver';
		geonetwork_url = 'http://www.thlib.org:8080/geonetwork';
		pd_url = 'http://places.thlib.org';
		subjects_url = 'http://subjects.thlib.org';
		break;
}
var pd_api_url = pd_url+'/features/';
var pd_api_name_url = pd_url+'/features/by_name/';
var pd_api_fids_by_name_url = pd_url+'/features/fids_by_name/';
var pd_api_fid_url = pd_url+'/features/by_fid/';
var pd_views = {
	'roman.popular': 'Popular Standard (romanization)',
	'roman.scholar': 'Scholarly Standard (romanization)',
	'pri.tib.sec.roman': 'Tibetan Script (secondary romanization)',
	'pri.tib.sec.chi': 'Tibetan Script (secondary Chinese)',
	'simp.chi': 'Chinese Characters (simplified)',
	'trad.chi': 'Chinese Characters (traditional)'
}

OpenLayers.ProxyHost = "/places/maps/interactive/utils/proxy.php?url=";
// The following two settings will hide pink error tiles.  They are currently commented to allow us
// to more easily detect errors.
//OpenLayers.Util.onImageLoadErrorColor = "transparent";
//OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;

// Utility functions ------------------------------------------------------------------------------------

function in_array(array, element) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == element) {
			return true;
		}
	}
	return false;
}

function get_href_directory() {
	var href = window.location.href;
	var href_split = href.split("/");
	delete href_split[(href_split.length-1)];
	return href_split.join("/");
}

function reduce_sparse_array(array) {
	var new_array = new Array();
	for (var i in array) {
        new_array.push(array[i]);
    }
    return new_array;
}

function index_of(value, array) {
	for (var i in array) {
		if(array[i] == value){
			return i;
		}
    }
    return false;
}

function is_defined(mixed){
	return !(typeof mixed == 'undefined');
}

function utf8_encode(string){
	string = string.replaceAll(/\r\n/g,"\n");
	var utftext = "";

	for (var n = 0; n < string.length; n++) {

		var c = string.charCodeAt(n);

		if (c < 128) {
			utftext += String.fromCharCode(c);
		}
		else if((c > 127) && (c < 2048)) {
			utftext += String.fromCharCode((c >> 6) | 192);
			utftext += String.fromCharCode((c & 63) | 128);
		}
		else {
			utftext += String.fromCharCode((c >> 12) | 224);
			utftext += String.fromCharCode(((c >> 6) & 63) | 128);
			utftext += String.fromCharCode((c & 63) | 128);
		}

	}

	return utftext;
}

function escape_attribute(str){
	str = str.replaceAll('"', '&#34;');
	str = str.replaceAll('\'', '&#39;');
	str = str.replaceAll('\n', ' ');
	return str;
}

String.prototype.replaceAll = function(strTarget, strSubString){
	var strText = this;
	var intIndexOfMatch = strText.indexOf( strTarget );
	while (intIndexOfMatch != -1){
		strText = strText.replace( strTarget, strSubString );
		intIndexOfMatch = strText.indexOf( strTarget );
	}
	return( strText );
}

function get_pd_feature_name(feature){
	if(is_defined(feature.header)){
		return feature.header;
	}else if(is_defined(feature.names[0].value)){
		return feature.names[0].value;
	}else{
		return feature.id;
	}
}

// Map events --------------------------------------------------------------------------------------------

function onRemoveLayer(){
	update_location_hash();
	updateLinkPopup();
}
function onAddLayer(){
	update_location_hash();
	updateLinkPopup();
}
function onMoveEnd(){
	update_location_hash();
	updateLinkPopup();
}
function onZoomEnd(){
	update_location_hash();
	updateLinkPopup();
}

function updateLinkPopup(){
	if(!jQuery('#link_popup').is(':hidden')){	
		jQuery('#link_popup .map_link').val(map_dir+''+create_location_hash());
		jQuery('#link_popup .map_link').select();
	}
}

// XML handling ------------------------------------------------------------------------------------------

function has_gmd_namespace(){
	var gmd_namespace = 'http://www.isotc211.org/2005/gmd';
	return this.namespaceURI == gmd_namespace;
}

// Adding and removing layers ------------------------------------------------------------------------------------

function add_coverage(id){

	var url = geonetwork_url+'/srv/en/xml.metadata.get?id='+id;
	
	url = OpenLayers.ProxyHost+escape(url)+"&mimeType=text/xml";
	
	jQuery.ajax({
		type: "GET",
		url: url,
		dataType: (jQuery.browser.msie) ? "text" : "xml",
		success: function(data){
			
			var xml = get_dom_from_ajax_xml(data);
			
			// Namespaces in jQuery are handled in two ways in different browsers, so we'll perform a check to see
			// which method is appropriate to use.  A custom jQuery.find() method should be made that incorporates
			// both of these to properly clean up this code.
			
			if(xml.find('gmd\\:title :first').length > 0){
				var resource = xml.find('gmd\\:CI_OnlineResource').filter(function(){
					var name = jQuery(this).find('gmd\\:name').text();
					var protocol = jQuery(this).find('gmd\\:protocol').text();
					return (jQuery.trim(name) == 'View in Interactive Map' && jQuery.trim(protocol) == 'OGC:WMS-1.1.1-http-get-map');
				});
				if(resource){
					var layer_name_match = resource.find('gmd\\:URL').text().match(/layers=(.*?)(&|$)/);
					if(layer_name_match){
						var layer_name = layer_name_match[1];
					}
					var title = xml.find('gmd\\:title :first').text();
					var extent_xml = xml.find('gmd\\:EX_GeographicBoundingBox');
					var bounds = false;
					if(extent_xml.text()){
						var bounds = new OpenLayers.Bounds();
						var left = extent_xml.find('gmd\\:westBoundLongitude :first').text();
						var bottom = extent_xml.find('gmd\\:southBoundLatitude :first').text();
						var right = extent_xml.find('gmd\\:eastBoundLongitude :first').text();
						var top = extent_xml.find('gmd\\:northBoundLatitude :first').text();
						bounds = new OpenLayers.Bounds(left, bottom, right, top);
					}
				}
			}else{
				var resource = xml.find('CI_OnlineResource').filter(has_gmd_namespace).filter(function(){
					var name = jQuery(this).find('name').text();
					var protocol = jQuery(this).find('protocol').text();
					return (jQuery.trim(name) == 'View in Interactive Map' && jQuery.trim(protocol) == 'OGC:WMS-1.1.1-http-get-map');
				});
				if(resource){
					var layer_name_match = resource.find('URL').text().match(/layers=(.*?)(&|$)/);
					if(layer_name_match){
						var layer_name = layer_name_match[1];
					}
					var title = xml.find('title').filter(has_gmd_namespace).find(':first').text();
					var extent_xml = xml.find('EX_GeographicBoundingBox').filter(has_gmd_namespace);
					var bounds = false;
					if(extent_xml.text()){
						var bounds = new OpenLayers.Bounds();
						var left = extent_xml.find('westBoundLongitude').filter(has_gmd_namespace).find(':first').text();
						var bottom = extent_xml.find('southBoundLatitude').filter(has_gmd_namespace).find(':first').text();
						var right = extent_xml.find('eastBoundLongitude').filter(has_gmd_namespace).find(':first').text();
						var top = extent_xml.find('northBoundLatitude').filter(has_gmd_namespace).find(':first').text();
						bounds = new OpenLayers.Bounds(left, bottom, right, top);
					}
				}
			}
			
			if(is_defined(layer_name)){
				var new_layer = new OpenLayers.Layer.WMS(title, geoserver_url+"/wms", {
						layers: layer_name,
						transparent: true,
						sphericalMercator: true,
						projection: new OpenLayers.Projection("EPSG:900913"),
						units: "m"
					},
					{
						opacity: 0.5,
						singleTile: true,
						ratio: 1.5,
						wrapDateLine: true
					});
				
				var layer_id = 'coverage_'+layer_name.replaceAll(/([^\w_])/, '').replaceAll(':', '');
				new_layer.id = layer_id;
				
				map.addLayer(new_layer);
				
				if(bounds){
					bounds.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
					map.zoomToExtent(bounds);
				}
			}
		}
	});
	
}

function add_feature_by_fid(fid, name, zoom){
	if(!is_defined(name)){
		name = false;
	} else {
		if(name!=false){
			name = unescape(name);
		}		
	}
	if(!is_defined(zoom)){
		zoom = true;
	}
	var match = map.getLayer('feature_fid_'+fid);
	if(!match){
		// Not sure how name is being cast into a string, but we need to fix it...
		var new_layer = new OpenLayers.Layer.THLWMS(name ? name : 'FID: '+fid, {
				cql_filter: "fid="+fid,
				styles: "thl_noscale"
			});
		new_layer.togglePlaceNames(show_place_names);
		new_layer.setLanguage(map.language);
		new_layer.id = 'feature_fid_'+fid;
		map.addLayer(new_layer);
		if(zoom){
			map.zoomToThlWmsLayer(new_layer);
		}
		if(!name){
			jQuery.getJSON(OpenLayers.ProxyHost+escape(pd_api_url+fid+'.json'),
				function(data){
					var feature = data.feature;
					fid = feature.id
					match = map.getLayer('feature_fid_'+fid);
					if(match){
						match.setName(get_pd_feature_name(feature));
					}
				}
			);
		}
	}else{
		match.setVisibility(true);
	}
	return false;
}

function remove_feature_by_fid(fid){
	var match = map.getLayer('feature_fid_'+fid);
	if(match){
		match.destroy();
	}
}

function add_feature_type(el){
	var MonasteryId=104;
	var id;
	if(typeof(el) == 'number'){
		id = el;
	}else{
		id = el.find('label').attr('name').split('feature_type_');
		id = id[1];
	}
	var match = map.getLayer('feature_type_'+id);
	if(!match){
		var new_layer = new OpenLayers.Layer.THLWMS(feature_type_names[id], {
			CQL_FILTER: "(object_type="+id+")"			
			});
		new_layer.id = 'feature_type_'+id;
		new_layer.togglePlaceNames(show_place_names);
		new_layer.setLanguage(map.language);
		if(enable_no_scale){
			new_layer.mergeNewParams({
				STYLES: 'thl_noscale,thl_noscale,thl_noscale'
			});
		}
		map.addLayer(new_layer);
		if (id==MonasteryId)
		{
			try
			{
				var style = new OpenLayers.Style({
                    pointRadius: "${radius}",
                    fillColor: "#ffcc66",
                    fillOpacity: 0.8,
                    strokeColor: "#cc6633",
                    strokeWidth: 2,
                    strokeOpacity: 0.8
                }, {
                    context: {
                        radius: function(feature) {
                            return Math.min(feature.attributes.count, 7) + 3;
                        }
                    }
                });
                var url = geoserver_url+
						'/wfs?service=wfs&version=1.1.0&request=GetFeature&outputFormat=json&propertyName=fid,name,fid,name,geometry&cql_filter=object_type=104&typename=roman_popular_pt'+
						'&projection=EPSG:4326&SRS=EPSG:4326&outputFormat=json';
				try
				{
					jQuery.getJSON(url,
						function(data){
							var test=data;
							var parser = new OpenLayers.Format.JSON();
							var data1 = parser.read(data);
						}
					);
				}
				catch(err)
				{
					var message=err.description;
				}
				var strategy = new OpenLayers.Strategy.Cluster();
                strategy.threshold = 30;
				var clusters = new OpenLayers.Layer.Vector("Clusters", {
                    strategies: [new OpenLayers.Strategy.Fixed(),strategy],
					projection: new OpenLayers.Projection("EPSG:900913"), 
                    styleMap: new OpenLayers.StyleMap({
                        "default": style,
                        "select": {
                            fillColor: "#8aeeef",
                            strokeColor: "#32a8a9"
                        }
                    })
                });
                var select = new OpenLayers.Control.SelectFeature(
                    clusters, {hover: true}
                );
                map.addControl(select);
                select.activate();
				map.addLayers(clusters);
			}
			catch(err)
			{
				var message=err.description;
			}
			var test1=""
		}
	}
}

function remove_feature_type(el){
	var id = el.find('label').attr('name').split('feature_type_');
	id = id[1];
	var match = map.getLayer('feature_type_'+id)
	if(match){
		match.destroy();
	}
	remove_hover_features();
}

function remove_hover_features(){
	var match = map.getLayer('hover_features')
	if(match != null){
		match.destroy();
	}
}

function add_hover_features(event){

	remove_hover_features();
	
	var cql_filter = get_map_cql_filter();
	
	// Only make a request if there are active feature layers
	if(cql_filter.length > 0){

		var event_bounds = create_bounds_from_event(event);
		
		//var bbox_clause = 'BBOX(geometry,'+event_bounds.toBBOX()+')';
		var geometryString = event_bounds.toGeometry().toString();
		var bbox_clause = 'INTERSECT(geometry,'+geometryString+')';
		cql_filter += 'AND('+bbox_clause+')';
		
		var new_layer = new OpenLayers.Layer.THLWMS('Hover features', {
			CQL_FILTER: cql_filter,
			STYLES: hover_style+','+hover_style+','+hover_style	
		});
		new_layer.id = 'hover_features';
		new_layer.displayInLayerSwitcher = false;
		new_layer.setLanguage(map.language)
		map.addLayer(new_layer);
		
	}else{
	}
	
}
	
function expand_check_tree(el){
	if(el.parent().attr('id') == 'feature_types_accordion'){
		el.siblings('li').each(function() {
			jQuery(this).children(".expanded").click();
		});
	}
}
// Clicking on features -----------------------------------------------------------------------------

var link_popup, mouseLoc;

function get_map_cql_filter(){

	var or_clauses = new Array();
	var cql_filter;
	for(var i in map.layers){
		if(map.layers[i].id.indexOf('feature_fid_') == 0 && map.layers[i].visibility){
			or_clauses.push('(fid='+map.layers[i].id.substring(12)+')');
		}else if(map.layers[i].id.indexOf('feature_type_') == 0 && map.layers[i].visibility){
			or_clauses.push('(object_type='+map.layers[i].id.substring(13)+')');
		}else if(
			(map.layers[i].id == 'selected_area_features' || map.layers[i].id == 'selected_area_feature_type_features')
			&& map.layers[i].visibility
			&& is_defined(map.layers[i].params) && is_defined(map.layers[i].params.CQL_FILTER)){
				or_clauses.push('('+map.layers[i].params.CQL_FILTER.replaceAll(' ', '+')+')');
		}
	}
	cql_filter = (or_clauses.length > 0) ? '('+or_clauses.join('OR')+')' : '';
	
	return cql_filter;

}

function create_bounds_from_event(event){	
	var tolerance = 8;
	
	var event1 = {xy: {x: event.xy.x-tolerance, y: event.xy.y-tolerance}};
	var event2 = {xy: {x: event.xy.x+tolerance, y: event.xy.y+tolerance}};
	var point1 = map.getLonLatFromPixel(event1.xy).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
	var point2 = map.getLonLatFromPixel(event2.xy).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
	var bounds = new OpenLayers.Bounds(point1.lon, point1.lat, point2.lon, point2.lat);
	return bounds;
}

function findFeatures(event){

	var cql_filter = get_map_cql_filter();
	
	// Only make a request if there are active feature layers
	if(cql_filter.length > 0){
	
		jQuery('#find_features_loading').css('left', event.xy.x+'px').css('top', event.xy.y+130+'px').show();

		mouseLoc = map.getLonLatFromPixel(event.xy);

		var event_bounds = create_bounds_from_event(event);
	
		var clicked_box_layer = new OpenLayers.Layer.Vector('Clicked location');
		var clicked_geometry = event_bounds;
		clicked_geometry = clicked_geometry.toGeometry();

		// Not sure which of these is the preferred method...
		if(true){
			var geometryString = event_bounds.toGeometry().toString();
			var bbox_clause = 'INTERSECT(geometry,'+geometryString+')';
			cql_filter += '+AND+('+bbox_clause+')';
		}else{
			var geometryString = clicked_geometry.toString();		
			var bbox_clause = 'BBOX(geometry,'+event_bounds.toBBOX()+')';
			cql_filter += '+AND+('+bbox_clause+')';
		}
		
		var wfs_url = geoserver_url+'/wfs?service=wfs&version=1.0.0&request=GetFeature'
			+'&outputFormat=json&propertyName=fid,name,area';
		wfs_url+='&cql_filter='+escape(cql_filter)+'&typename=';
		
		if(proximity_search_method == 'single'){
		
			// The proximity search should sort by these rules:
			// 1. Points are prioritized above polygons
			// 2. Polygons are prioritized by ascending size
			// 3. Points are prioritized by ascending distance to the clicked point
			// For 3., we need to get the geometry of the point feature results.  Polygon geometries are too big,
			// though, so we don't want those, and consequently need to make two WFS queries, one to get points
			// with geometries, and one to get polygons without geometries.
			var features = [];
			
			// Get polygons without geometries
			OpenLayers.loadURL(wfs_url+'roman_popular_poly', '', this, function(response){
				response = JSON.parse(response.responseText);
				var polygon_features = response.features ? response.features : [];
				features = features.concat(polygon_features);
				
				// Get points with geometries
				OpenLayers.loadURL(wfs_url.replace(',area', ',area,geometry')+'roman_popular_pt', '', this, function(response){
					response = JSON.parse(response.responseText);
					var point_features = response.features ? response.features : [];
					features = features.concat(point_features.concat(point_features));
					show_popup_for_closest_feature(features, new OpenLayers.Geometry.Point(event.xy));
				});
			});
		}else{
			OpenLayers.loadURL(wfs_url+'roman_popular_poly,roman_popular_pt', '', this, show_popup_for_all_features);
		}
		
	}

    Event.stop(event);
}

function findAllFeatures(event){

		jQuery('#find_features_loading').css('left', event.xy.x+'px').css('top', event.xy.y+130+'px').show();

		mouseLoc = map.getLonLatFromPixel(event.xy);

		var event_bounds = create_bounds_from_event(event);
	
		var clicked_box_layer = new OpenLayers.Layer.Vector('Clicked location');
		var clicked_geometry = event_bounds;
		clicked_geometry = clicked_geometry.toGeometry();
		
		if(true){
			var geometryString = event_bounds.toGeometry().toString();
			var bbox_clause = 'INTERSECT(geometry,'+geometryString+')';
			var cql_filter = '('+bbox_clause+')';
		}else{
			var geometryString = clicked_geometry.toString();		
			var bbox_clause = 'BBOX(geometry,'+event_bounds.toBBOX()+')';
			var cql_filter = '('+bbox_clause+')';
		}
		
		var wfs_url = geoserver_url+'/wfs?typename=thdl%3Atest2&layers=thdl%3Atest2&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature'
			+'&outputFormat=json&propertyName=fid,name,language';
		wfs_url+='&CQL_FILTER='+escape(cql_filter);
		
		OpenLayers.loadURL(wfs_url, '', this, show_popup_for_all_features);
		
    Event.stop(event);
}

function show_vector_features(cql_filter){


	var match = map.getLayer('vector_features');
	if(match){
		map.removeLayer(match);
	}
	var new_layer = new OpenLayers.Layer.WFS('Hover features', geoserver_url + "/wfs", {
			sphericalMercator: true,
			typename: thdllayername,
			srsName: 'EPSG:900913',
			projection: new OpenLayers.Projection("EPSG:900913"),
			CQL_FILTER: cql_filter				
	});
	new_layer.id = 'vector_features';
	map.addLayer(new_layer);

}

var feature_info_popup;

function show_popup_for_all_features(response) {
	
	jQuery('#find_features_loading').hide();

	response = JSON.parse(response.responseText);
	var features = response.features ? response.features : null;
	
	var popup_info = "<h3>Features</h3>";
	if(features == null || features.length == 0){
		if(features.length == 0){
			popup_info += '<div>No features found</div>';
		}	
	}else{
		var fids = new Array();
		for(var i in features){
			var fid = features[i].properties.fid;
			if(!in_array(fids, fid)){
				fids.push(fid);
			}
		}
		popup_info += '<div id="feature_info_result">Loading features...</div>';
		//jQuery.getJSON(OpenLayers.ProxyHost+escape(pd_api_fid_url+fid+'.json'),
		jQuery.ajax({	
			type: "GET",
			dataType: "json",
			url: OpenLayers.ProxyHost+escape(pd_api_fid_url+(fids.join(','))+'.json'),
			error: function(response){jQuery('#feature_info_result').html('Sorry, no results were found.');},
			success: function(data){
				if(data == ''){
					jQuery('#feature_info_result').html('');
					update_popup_height();
					return;
				}
				var features = data.features;
				var name, type, this_fid, feature;
				var html = '';
				for(var i in features){
					feature = features[i];
					name = get_pd_feature_name(feature);
					var types_array = []
					for(var j in feature.feature_types){
						types_array.push(feature.feature_types[j].title);
					}
					type = '('+types_array.join(', ')+')';
					
					this_fid = feature.id;
					var link_attributes =  'href="'+pd_url+'/features/iframe/'+feature.db_id+'" class="thl-pop iframe no-view-alone width-800 height-488"';
					html += '<div class="feature_info_result_name"><a '+link_attributes+'>'+name+'</a></div>';
					html += '<div class="feature_info_result_type">'+type+'</div>';
					html += '<div class="feature_info_result_caption">[Caption will be here] <a '+link_attributes+'>Read more...</a></div>';
				}
				jQuery('#feature_info_result').html(html);
				ActivateThlPopups('#feature_info_result');
				update_popup_height();
			}
		});
	}
	popup_info += "<br />";
	if (feature_info_popup != null) {
		feature_info_popup.destroy();
		feature_info_popup = null;
	}
	feature_info_popup = new OpenLayers.Popup.FramedCloud("feature_info_results",
		mouseLoc,
		new OpenLayers.Size(250, 250),
		popup_info,
		null,
		true
	);
	feature_info_popup.minSize = new OpenLayers.Size(250, 70);
	feature_info_popup.maxSize = new OpenLayers.Size(250, 300);
	feature_info_popup.setBackgroundColor("#bcd2ee");
	feature_info_popup.contentDiv.style.overflow = 'auto';
	update_popup_height();
	map.addPopup(feature_info_popup);
}

function show_popup_for_closest_feature(features, point) {
	
	jQuery('#find_features_loading').hide();

	if(features == null || features == []){
		alert('Sorry, no features were found at this location.');
		return false;
	}
	
	// Sort features by area
	features = features.sort(function(a, b){
		var area_a = a.properties.area;
		var area_b = b.properties.area;
		if(area_a != 0 && area_b == 0){
			return 1;
		}else if(area_b != 0 && area_a == 0){
			return -1;
		// Both features are points, so sort by the shortest distance to the clicked point
		}else if(area_a == 0 && area_b == 0){
			var distance_a = point.distanceTo(new OpenLayers.Geometry.Point(a.geometry.coordinates));
			var distance_b = point.distanceTo(new OpenLayers.Geometry.Point(b.geometry.coordinates));
			return distance_a - distance_b;
		}else{
			return area_a - area_b;
		}
	});
	
	var feature = features[0];
	
	if(is_defined(feature)){
		// We have the feature's FID, but we need to get it's ID in the PD to open the iframe.
		// This is done via the PD API:
		jQuery.getJSON(OpenLayers.ProxyHost+escape(pd_api_url+feature.properties.fid+".json"),
			function(data){
				$('#closest_feature_popup').remove();
				var id = data.feature.db_id;
				var popup = jQuery().thlPopup({
					id: 'closest_feature_popup',
					url: pd_url+'/features/iframe/'+db_id,
					header: '<strong>'+feature.properties.name+'</strong>',
					loadWith: 'iframe',
					showLink: false,
					width: 800,
					height: 488
				});
			}
		);
	}else{
		alert('Sorry, no active features were found at this location.');
	}
}

function update_popup_height(){
	var popup_correction_height = 30;
	feature_info_popup.updateSize();
	//feature_info_popup.setSize(new OpenLayers.Size(feature_info_popup.size.w, feature_info_popup.size.h * 0.8));
	var height = 0;
	jQuery('#feature_info_results_contentDiv').children().each(function(){
		height = height + jQuery(this).height();
	});
	feature_info_popup.setSize(new OpenLayers.Size(feature_info_popup.size.w, height + popup_correction_height));
}

// Misc functions -------------------------------------------------------------------------------------------

var feature_type_names = new Array();


// Creates a checktree-formatted unordered list from feature type data
function create_list_from_array(arr){
	var html = '';
	if(arr.categories && arr.categories.category){
		html += '<ul class="tree">';
		if(arr.categories.category && arr.categories.category[0]){
			for(var i in arr.categories.category) {
				html += '<li>';
				html += '<input type="checkbox" class="toggle"><label name="feature_type_'+arr.categories.category[i].id+'">'+arr.categories.category[i].title+
					' ('+arr.categories.category[i].shape_count+'/'+arr.categories.category[i].feature_count+')</label>';
				if(arr.categories.category[i].categories){
					html += create_list_from_array(arr.categories.category[i]);
				}
				html += '</li>';
				feature_type_names[arr.categories.category[i].id] = arr.categories.category[i].title;
			}
		}else if(arr.categories.category){
			html += '<li>';
			html += '<input type="checkbox" class="toggle"><label name="feature_type_'+arr.categories.category.id+'">'+
				arr.categories.category.title+' ('+arr.categories.category.shape_count+'/'+arr.categories.category.feature_count+')</label>';
			if(arr.categories.category.categories){
				html += create_list_from_array(arr.categories.category);
			}
			html += '</li>';
			feature_type_names[arr.categories.category.id] = arr.categories.category.title;
		}
		html += '</ul>';
	}
	return html;
}

function init_dialogs(){

	jQuery('#drawn_area_feature_type_popup').dialog({
		autoOpen: false,
		height: 120,
		title: 'Select a feature type'
	});

	jQuery('#lon_lat_popup').dialog({
		autoOpen: false,
		width: 210,
		height: 100,
		title: 'Location'
	});
	
	jQuery('#save_as_popup').dialog({
		autoOpen: false,
		width: 200,
		height: 250,
		title: 'Save Map As...'
	});
	
	jQuery('#link_popup').dialog({
		autoOpen: false,
		width: 440,
		height: 160,
		title: 'Link for this Map'
	});

}

// Feature Search functions
function feature_search(){
	var q = jQuery('#feature_search_q').val();
	var feature_type = jQuery('#searcher_id_input').val();
	var scope = jQuery('#sidebar_section_feature_search [name=scope]:checked').val();
	var characteristic_id = jQuery('#characteristic_id').val();
	var params = 'feature_type='+feature_type+'&scope='+scope+'&characteristic_id='+characteristic_id;
	pd_feature_search(q, params, 1);
	return false;
}

function pd_feature_search(q, params, page){
	var url = pd_api_name_url+utf8_encode(q).replaceAll(/[\s]+/, '%20').replaceAll(' ', '%20')+'.json?per_page=8&page='+page+'&view_code='+map.language+'&'+params;
	var search_results_div = jQuery('#sidebar_section_feature_search_results');
	jQuery("#sidebar_section_feature_search_results").parent().show();
	if(!search_results_div.hasClass("expanded")){
		search_results_div.siblings("h4").click();
	}
	search_results_div.html('<img src="/places/maps/interactive/img/ajax-loader.gif" alt=""  style="display: inline; margin-right: 5px;" />Searching...');
	jQuery.ajax({	
		type: "GET",
		dataType: "json",
		url: OpenLayers.ProxyHost+escape(url),
		error: function(){search_results_div.html('Sorry, no results were found.');},
		success: function(data){
			var features = data.features;
			if(features.length == 0){
				search_results_div.html('Sorry, no results were found.');
			} else {
				var query_params = "'"+escape_attribute(q)+"', '"+params+"'";
				var html = '<div class="feature_search_results">';
				html += '<div class="result"><div class="result_links">' +
                  '<a href="#" onclick="return toggle_map_feature_search(this, '+query_params+', true);">Map all results</a>' +
                  '<a href="#" onclick="return toggle_map_feature_search(this, '+query_params+', false);" style="display: none;">Remove results from map</a>' +
                '</div></div>';
				var name, type, fid, has_shapes, link_attributes;
				for(var i in features){
					feature = features[i];
					name = get_pd_feature_name(feature);
					var types_array = []
					for(var j in feature.feature_types){
						types_array.push(feature.feature_types[j].title);
					}
					type = '('+types_array.join(', ')+')';
					fid = feature.id
					has_shapes = is_defined(feature.has_shapes) ? feature.has_shapes == 1 : true;
					show_on_map_link = has_shapes ?
						'<a href="#" onclick="return toggle_show_on_map(this, '+fid+', \''+escape_attribute(name)+'\', 1);">Show on Map</a>'+
						'<a href="#" onclick="return toggle_show_on_map(this, '+fid+', \''+escape_attribute(name)+'\', 0);" style="display: none;">Remove from Map</a>' :
						'No location data';
					link_attributes =  'href="'+pd_url+'/features/iframe/'+feature.db_id+'" class="thl-pop iframe no-view-alone width-800 height-488"';
					html += '<div class="result">'+
							'<div class="result_name">'+name+'</div>'+
							'<div class="feature_info_result_type">'+type+'</div>'+
							'<div class="result_links">'+
								show_on_map_link+
								' | '+
								'<a '+link_attributes+'>Read more...</a>'+
							'</div>'+
						'</div>';
				}
				var total_pages = parseInt(data.features.total_pages);
				var page = parseInt(data.features.page);
				if(total_pages > 1){
					html += '<div class="feature_search_pagination">';
					html += (page == 1) ? '&#171; Prev' : '<a href="#" onclick="return pd_feature_search('+query_params+', '+(page-1)+');">&#171; Prev</a>';
					for(var i=1; i<=total_pages; i++){
						if(page == i){
							html += ' '+page;
						}else{
							html += ' <a href="#" onclick="return pd_feature_search('+query_params+', '+i+');">'+i+'</a>';
						}
					}
					html += (page == total_pages) ? ' Next &#187;' : ' <a href="#" onclick="return pd_feature_search('+query_params+', '+(page+1)+');">Next &#187;</a>';
					html += '</div>';
				}
				html += '</div>';
				search_results_div.html(html);
				ActivateThlPopups('#sidebar_section_feature_search_results');
			}
		}
	});
	return false;
}

function toggle_map_feature_search(link_elem, q, params, show_on_map) {
	jQuery(link_elem).hide();
	jQuery(link_elem).siblings('a').show();
	var url = pd_api_fids_by_name_url+utf8_encode(q).replaceAll(/[\s]+/, '%20').replaceAll(' ', '%20')+'.json?' + params;
	jQuery.ajax({	
		type: "GET",
		dataType: "json",
		url: OpenLayers.ProxyHost+escape(url),
		error: function() {},
		success: function(data){
			features = data.features
			for(var i in features){
				fid = features[i]
				if(show_on_map) {
					add_feature_by_fid(fid, false, false);
				} else {
					remove_feature_by_fid(fid);
				}
			}
		}
	});
	return false;
}

function toggle_show_on_map(link_elem, fid, name, show){
	jQuery(link_elem).hide();
	jQuery(link_elem).siblings('a').show();
	if(show){
		add_feature_by_fid(fid, name);
	}else{
		remove_feature_by_fid(fid);
	}
	return false;
}

// Go To functions
var renderer = OpenLayers.Layer.Vector.prototype.renderers;
function go_to_lon_lat(this_form){


	var match = map.getLayer('lon_lat_location');
	if(match){
		match.destroy();
	}

	var lon_lat = new OpenLayers.LonLat(this_form.lon.value, this_form.lat.value);
	lon_lat = lon_lat.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
	
	var lon_lat_layer = new OpenLayers.Layer.Vector("Lon/Lat Location", {
		styleMap: new OpenLayers.StyleMap({'default':{
			strokeOpacity: 1,
			strokeWidth: 2,
			strokeColor: "#FCC222",
			fillColor: "#000000",
			fillOpacity: 0,
			pointRadius: 3,
			pointerEvents: "visiblePainted",
			label: "Lon/Lat Location",
			labelAlign: "rb",
			fontColor: "#00FF00",
			fontSize: "12px",
			fontFamily: "arial, helvetica, sans"
		}}),
		renderers: renderer
	});
	var lon_lat_point = new OpenLayers.Geometry.Point(lon_lat.lon, lon_lat.lat);
	var lon_lat_feature = new OpenLayers.Feature.Vector(lon_lat_point);
	lon_lat_feature.attributes = {name: 'lon_lat'};
	lon_lat_layer.addFeatures([lon_lat_feature]);
	lon_lat_layer.id = 'lon_lat_location';
	
	map.addLayer(lon_lat_layer);

	map.setCenter(lon_lat, 5);
	return false;
}

function go_to_thl_id(this_form){
	var fid = parseInt(this_form.thl_id.value);
	add_feature_by_fid(fid);
	return false;
}

// Selected area functions

function init_selected_area_feature_type_popup(){

	var this_data = reduce_sparse_array(feature_type_names);
	
	jQuery("#drawn_area_feature_type_input").autocomplete(this_data,
		{
			matchContains: true
		}
	);

	jQuery("#drawn_area_feature_type_input").result(function(event, data, formatted){
		jQuery("#drawn_area_feature_type_value").attr("value", index_of(data[0], feature_type_names));
	});
	
}

function get_selected_area_feature_types_checktree(){
	var data = feature_types_data;
	var feature_types_list_html = create_list_from_array(data.category);
	var checktree = jQuery("#selected_area_feature_types_checktree");
	feature_types_list_html = '<div style="height: 500px"><div style="font-size: 1.2em; margin-top: 1em;">Please select one or more feature types from the list below:</div>'+
		'<form method="get" action="" onsubmit="return multiple_selected_area_feature_types(this);">'+
		'<div style="max-height: 440px; height:auto !important; height: 440px; overflow: auto;">'+
		feature_types_list_html+
		'</div>'+
		'<br /><input type="submit" value="Show features" />'+
		'</form>'+
		'</div>'
		;
	checktree.append(feature_types_list_html);
	checktree.checkTree({
	});
}

function multiple_selected_area_feature_types(the_form){
	var types = [];
	jQuery(the_form).find(':checkbox:checked').each(function(){
		var label_name = jQuery(this).siblings('label').attr('name');
		if(label_name.indexOf('feature_type_') == 0){
			types.push(label_name.substring(13));
		}
	});
	if(types.length == 0){
		alert('Please select at least one feature type.');
		jQuery('.jqmWindow').jqmHide();
		jQuery('#selected_area_feature_type_search_button').click();
	}else{
		jQuery('.jqmWindow').jqmHide();
		get_selected_area_feature_type(types);
	}
	return false;
}

function selected_area_feature_type_search(){
	var type = document.getElementById('drawn_area_feature_type_value').value;
	if(type.length == 0){
		alert('Please select at least one feature type.');
	}else{
		get_selected_area_feature_type([type]);
	}
	return false;
}

function selected_area(geometry) {
	
	var match = map.getLayer('selected_area_features');
	if(match){
		match.destroy();
	}
	
	var vertices = geometry.geometry.getVertices();
	if(vertices.length < 3){
		alert('Please draw a shape with at least two vertices.');
		return false;
	}
	
	var geometryString = geometry.geometry.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")).toString();
	var cql_filter = 'INTERSECT(geometry,'+geometryString+')';
	var new_layer = new OpenLayers.Layer.THLWMS('Features that intersect the selected area', {
		cql_filter: cql_filter,
		styles: "thl_noscale"
	});
	new_layer.togglePlaceNames(show_place_names);
	new_layer.setLanguage(map.language);
	new_layer.id = 'selected_area_features';
	map.addLayer(new_layer);
	
	//cql_filter = 'fid=4';
	cql_filter = escape('INTERSECT(geometry,'+geometryString+')');
	var wfs_url = geoserver_url+'/wfs?typename=thdl%3Atest2&layers=thdl%3Atest2&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature'
		+'&outputFormat=json&propertyName=fid,name,language';
	var count_url = geoserver_url+'/wfs?typename=thdl%3Atest2&layers=thdl%3Atest2&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature'
		+'&CQL_FILTER='+cql_filter+'&resultType=hits';
		wfs_url = geoserver_url+'/wfs?typename=thdl%3Atest2&layers=thdl%3Atest2&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature'
		+'&outputFormat=json&propertyName=fid,name,language';
	wfs_url+='&CQL_FILTER='+escape('fid=4');
	
}

function selected_area_feature_type(geometry) {
	
	var match = map.getLayer('selected_area_feature_type_polygon');
	if(match){
		match.destroy();
	}
	
	var vertices = geometry.geometry.getVertices();
	if(vertices.length < 3){
		alert('Please draw a shape with at least two vertices.');
		return false;
	}
	
	var feature_layer = new OpenLayers.Layer.Vector('Selected area');
	feature_layer.id = 'selected_area_feature_type_polygon';
	feature_layer.addFeatures([geometry]);
	map.addLayer(feature_layer);
	
	jQuery('#drawn_area_feature_type_popup').dialog('open');
	jQuery('#drawn_area_feature_type_popup input:text:first').focus();
	
}

function get_selected_area_feature_type(types, cancel){

	// If cancel is present and true, this function removes the selected_area_feature_type layer
	if(!is_defined(cancel)){
		cancel = false;
	}

	jQuery('#drawn_area_feature_type_popup').dialog('close');

	var match = map.getLayer('selected_area_feature_type_polygon');
	if(match){
		
		var types_cql_array = [];
		for(var i in types){
			types_cql_array.push('(object_type='+types[i]+')');
		}
		var types_cql = '('+types_cql_array.join(' OR ')+')';
		if(!cancel){
			var polygon_feature = match.features[0];
			var geometryString = polygon_feature.geometry.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")).toString();
			
			var new_layer = new OpenLayers.Layer.THLWMS('Features that intersect the selected area', {
				cql_filter: 'INTERSECT(geometry,'+geometryString+') AND '+types_cql,
				styles: "thl_noscale"
			});
			new_layer.togglePlaceNames(show_place_names);
			new_layer.setLanguage(map.language);
			new_layer.id = 'selected_area_feature_type_features';
		}
		
		remove_selected_area_feature_type_polygon();
	
		if(!cancel){
			
			// Remove the previous feature results layer
			match = map.getLayer('selected_area_feature_type_features');
			if(match){
				match.destroy();
			}
			
			// Add the new feature results layer
			map.addLayer(new_layer);

		}		
	}


}

function remove_selected_area_feature_type_polygon(){
	var match = map.getLayer('selected_area_feature_type_polygon');
	if(match){
		map.removeLayer(match);
	}
	return false;
}

function cancel_selected_area_feature_type(){
	remove_selected_area_feature_type_polygon();
	jQuery('#drawn_area_feature_type_popup').dialog('close');
	return false;
}

/*function selected_area_feature_type_search(cancel){

	// If cancel is present and true, this function removes the selected_area_feature_type layer
	if(typeof cancel == 'undefined'){
		cancel = false;
	}

	jQuery('#drawn_area_feature_type_popup').dialog('close');

	var match = map.getLayer('selected_area_feature_type_polygon');
	if(match){
	
		if(!cancel){
			var polygon_feature = match.features[0];
			var geometryString = polygon_feature.geometry.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")).toString();
			var object_type = document.getElementById('drawn_area_feature_type_value').value;
			var new_layer = new OpenLayers.Layer.THLWMS('"'+feature_type_names[object_type]+'" features that intersect selected area', {
				CQL_FILTER: 'INTERSECT(geometry,'+geometryString+') AND (object_type='+object_type+')'	
			});
			new_layer.togglePlaceNames(show_place_names);
			new_layer.id = 'selected_area_feature_type_features';
		}
		
		// Remove the polygon layer
		map.removeLayer(match);
	
		if(!cancel){
			
			// Remove the previous feature results layer
			match = map.getLayer('selected_area_feature_type_features');
			if(match){
				match.destroy();
			}
			
			// Add the new feature results layer
			map.addLayer(new_layer);

		}		
	}
	
}*/


function init_map(){

	var mapOptions = {
		controls: [],
		projection: new OpenLayers.Projection("EPSG:900913"),
		units: "m",
		maxExtent: new OpenLayers.Bounds(-100000000000000, -20037508.34, 100000000000000, 20037508.34),
		restrictedExtent: new OpenLayers.Bounds(-100000000000000, -20037508.34, 100000000000000, 20037508.34),
		minZoomLevel: 2,
		numZoomLevels: 20
	};
	
	map = new OpenLayers.THLMap('map', mapOptions);
	
	map.addControl(new OpenLayers.Control.MousePosition({
		displayProjection: new OpenLayers.Projection("EPSG:4326"),
		numDigits: 4,
		prefix: 'Location: '
	}));	
    
    loading_panel = new OpenLayers.Control.LoadingPanel();
	map.addControl(loading_panel);
	
	map.addControl(new OpenLayers.Control.PanZoomBar());
	var layer_switcher = new OpenLayers.Control.GroupedLayerSwitcher({
		'div' : OpenLayers.Util.getElement('sidebar_section_active_layers'),
		'ascending' : false,
		'dataTree': null
	});
	map.addControl(layer_switcher);
	map.addControl(new OpenLayers.Control.ScaleLine());
	map.addControl(new OpenLayers.Control.KeyboardDefaults());
	
	var polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer");
	
	
	if(is_fullscreen){
		var control_panel = new OpenLayers.Control.Panel({
			displayClass: 'controlPanel',
			div: document.getElementById('controlPanelBelow')
		});
	}else{
		var control_panel = new OpenLayers.Control.Panel({
			displayClass: 'controlPanel',
			div: document.getElementById('controlPanelAbove')
		});
	}
	
	var default_control = new OpenLayers.Control.Navigation(
			{title:'Default controls: drag to pan, double-click to zoom in',
			singleClick: function(event){
				try{findFeatures(event);}catch(err){}
			},
			draw: function() {
				// disable right mouse context menu for support of right click events
				if (this.handleRightClicks) {
					this.map.viewPortDiv.oncontextmenu = function () { return false;};
				}
		
				var clickCallbacks = { 
					'click' : this.singleClick,
					'dblclick': this.defaultDblClick, 
					'dblrightclick': this.defaultDblRightClick 
				};
				var clickOptions = {
					'single' : true,
					'double': true, 
					'stopDouble': true
				};
				this.handlers.click = new OpenLayers.Handler.Click(
					this, clickCallbacks, clickOptions
				);
				this.dragPan = new OpenLayers.Control.DragPan(
					OpenLayers.Util.extend({map: this.map}, this.dragPanOptions)
				);
				this.zoomBox = new OpenLayers.Control.ZoomBox({
					map: this.map, keyMask: this.zoomBoxKeyMask
				});
				this.dragPan.draw();
				this.zoomBox.draw();
				this.handlers.wheel = new OpenLayers.Handler.MouseWheel(this, {
					"up"  : this.wheelUp, "down": this.wheelDown
				});
				this.activate();
			},
			eventListeners: 
				{"activate": function(){
						document.getElementById('map').style.cursor = 'pointer';
					},
				 "deactivate": function(){
						document.getElementById('map').style.cursor = 'auto';
					}
			}
		});
	
	control_panel.addControls([
		new OpenLayers.Control.Button(
			{title:"Reset map",
			displayClass: "resetMapButton",
			trigger: reset_map}),
		default_control,
		new OpenLayers.Control.ZoomBox(
			{title:"Zoom to an area by clicking and dragging"}),
		new OpenLayers.Control.ZoomOutFromPoint(
			{title:"Zoom out from a point by clicking on it"}),
		new OpenLayers.Control.FeatureInfo(
			{title:
				hovering_enabled ?
					"Click to get a list of all features at that location, or hover over features to see their names" : 
					"Click to get a list of all features at that location",
			defaultClick:function(event){
					try{findAllFeatures(event);}catch(err){}
			},
			eventListeners: 
				{"activate": function(){
						document.getElementById('map').style.cursor = 'pointer';
					},
				 "deactivate": function(){
						document.getElementById('map').style.cursor = 'auto';
						remove_hover_features();
					}
			},
			handlerOptions: {
				'delay': 100
			},
			onPause: function(event){
				if(hovering_enabled){
					add_hover_features(event);
				}
			},
			onMove: function(event){
				/*var match = map.getLayer('hover_features')
				if(match != null){
					map.removeLayer(match);
				}*/
			}
			}),
		new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon,
			{
				title:"Draw an area to find features that intersect with it (double-click to close the area, hold Shift to draw continuously)", 
				featureAdded: selected_area
			}),
		new OpenLayers.Control.DrawFeature(polygonLayer, OpenLayers.Handler.Polygon,
			{
				title:"Draw an area to find features of a certain feature type that intersect with it (double-click to close the area, hold Shift to draw continuously)", 
				featureAdded: selected_area_feature_type
			}),
		new OpenLayers.Control.LonLatDialog(
			{title:"Get the longitude and latitude of a point by clicking on it"}),
		new OpenLayers.Control.Button(
			{title:"Zoom to active features",
			displayClass: "zoomToActiveFeaturesButton",
			trigger: function(){map.zoomToActiveFeatures()} })
	]);
	if(!is_fullscreen){
		control_panel.addControls([
			new OpenLayers.Control.Button(
				{title:"Expand Map",
				displayClass: "expandMapButton",
				trigger: expand_map}),
			new OpenLayers.Control.Button(
				{title:"Contract Map",
				displayClass: "contractMapButton",
				trigger: contract_map}),
			new OpenLayers.Control.Button(
				{title:"Popout Map",
				displayClass: "popoutMapButton",
				trigger: function(){
						window.open("fullscreen.php"+create_location_hash(),"","status=yes,menubar=no");
						//window.open("fullscreen.php"+create_location_hash());
				}})
		]);
	}
	control_panel.addControls([
		new OpenLayers.Control.Button(
			{title:"Link for this Map",
			displayClass: "olLinkButton",
			trigger: function(){
				jQuery('#link_popup').dialog('open');
				updateLinkPopup();
			}}),
		new OpenLayers.Control.Button(
			{title:"Save Map As...",
			displayClass: "olSaveButton",
			trigger: function(){
				jQuery('#save_as_popup').dialog('open');				
			}}),
		new OpenLayers.Control.Button(
			{title:"Print",
			displayClass: "olPrintButton",
			trigger: function(){
				render_map('print');
			}}),
		new OpenLayers.Control.Button(
			{title:"Feedback",
			displayClass: "olFeedbackButton",
			allowSelection: null,
			trigger: function(){
			}}),
		/*new OpenLayers.Control.Button(
			{title:"Help",
			displayClass: "olHelpButton",
			allowSelection: null,
			trigger: function(){
			}}),*/
		new OpenLayers.Control.Button(
			{
				title:"Stop and remove any loading layers",
				displayClass: "olStopLoadingButton",
				allowSelection: null,
				trigger: function(){
					var layer;
					var layers = map.layers.reverse();

					for(var i in layers){
						layer = layers[i];
						//if(!layer.BaseLayer && layer.numLoadingTiles && layer.numLoadingTiles > 0){
						if(!layer.BaseLayer && (is_defined(layer.isLoaded)) && !layer.isLoaded){
							if(layer.id.indexOf('feature_type_') == 0){
								map.getLayer(layer.id).destroy();
								uncheck_feature_type_checkbox(layer.id.substring(13));
							}else{
								map.getLayer(layer.id).destroy();
							}
						}
					}
					loading_panel.minimizeControl();
				}
			})
		
	]);
	map.addControl(control_panel);
	if(is_fullscreen){
		jQuery('.controlPanel').wrap('<div id="controlPanelWrapper" class="inside-map"></div>');
	}
	default_control.activate();
	
	var jpl = new OpenLayers.Layer.WMS(
		"Global Mosaic from Telascience",
		"http://t1.hypercube.telascience.org/cgi-bin/landsat7",
		{ layers: "landsat7", isBaseLayer: true }, 
		{
			singleTile: false,
			sphericalMercator: true,
			transitionEffect: 'resize'
		}
	);
	
	var gsat = new OpenLayers.Layer.Google(
		"Google Satellite",
		{type: google.maps.MapTypeId.SATELLITE, sphericalMercator: true, isBaseLayer: true}
	);
	var gphy = new OpenLayers.Layer.Google(
		"Google Physical",
		{type: google.maps.MapTypeId.TERRAIN, sphericalMercator: true, isBaseLayer: true}
	);
	var gstr = new OpenLayers.Layer.Google(
		"Google Streets",
		{type: google.maps.MapTypeId.ROADMAP, sphericalMercator: true, isBaseLayer: true}
	);
	var ghyb = new OpenLayers.Layer.Google(
		"Google Hybrid",
		{type: google.maps.MapTypeId.HYBRID, sphericalMercator: true, isBaseLayer: true}
	);
	var empty_layer = new OpenLayers.Layer(
		"No Base Layer",
		{isBaseLayer: true}
	);
	var controlOptions = {
		mapOptions: mapOptions,
		layers: [jpl, gsat]
	}


	map.addLayers([empty_layer, ghyb, gstr, gphy, gsat]);

	map.setBaseLayer(gsat);
	
	var overviewLayer = new OpenLayers.Layer.Google('Google Satellite', {
		type: google.maps.MapTypeId.SATELLITE,
		sphericalMercator: true
	});
	var overviewOptions = {
		projection: 'EPSG:900913',
		units: 'm',
		maxResolution: 156543.0339,
		maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34)
	};
	overview_map = new OpenLayers.Control.CustomOverviewMap({
		layers: [overviewLayer],
		minRatio: 32, maxRatio: 32,
		mapOptions: overviewOptions
	});

	map.addControl(overview_map);
	
	map.events.on({
		"removelayer": onRemoveLayer,
		"addlayer": onAddLayer,
		"moveend": onMoveEnd,
		"zoomend": onZoomEnd
	});
  
  	if(!zoom_to_hash_bounds()){
		map.zoomToExtent(default_map_bounds);
	}
	
	// Add a feature types selector to the search inputs
	ModelSearcher.init('subjects_category_selector', subjects_url+'/categories/20/list_with_shapes.json', subjects_url+'/categories/20/all_with_shapes.json', {
		fieldName: 'object_type',
		fieldLabel: 'Feature type: ',
		selectedObjects: [''],
		hasTree: true,
		proxy: OpenLayers.ProxyHost
	});
	characteristic_selector = new CharacteristicSelector();
	characteristic_selector.init('characteristic_selector', {
		fieldLabel: "Characteristic: ",
		listService: pd_url+'/features/characteristics_list/1',
		proxy: OpenLayers.ProxyHost
	});
	
	// Set up the onclick event that'll open the advanced search
	jQuery('#show_advanced_search').click(function(){
		if(jQuery('#advanced_search').is(':hidden')){
			jQuery('#advanced_search').show();
			jQuery(this).text('Hide Advanced Search');
		}else{
			jQuery('#advanced_search').hide();
			jQuery(this).text('Advanced Search');
			clear_advanced_search_fields();
		}
		return false;
	});
	
	jQuery('#clear_search_form').click(function(){
		jQuery('#feature_search_q').val('');
		clear_advanced_search_fields();
	});
	
	// Hide the results menu item initially (it'll be shown when a search is performed)
	jQuery("#sidebar_section_feature_search_results").parent().hide();

	// An initial first reading of the hash needs to be done to determine some options' values (currently enable_no_scale is the only relevant option).
	var location_hash = get_map_url_params();
	enable_no_scale = !location_hash.match(/no_scale:0/);

	// Populate the options
	var views_select = '<select name="pd_view" id="pd_view_select" style="width: 100%; margin-top: 5px;">'
	for(var i in pd_views){
		views_select += '<option value="'+i+'"'+(i==map.language ? ' selected="selected"' : '')+'>'+pd_views[i]+'</option>';
	}
	views_select += '</select>';
	jQuery("#sidebar_section_options").html(
		'<label for="pd_view">Place Name Language:</label>'+
		views_select+
		'<br /><br />'+
		'<label for="pd_view">Search Method for Map Clicks:</label>'+
		'<select name="proximity_search_method">'+
			'<option value="single" selected="selected">Closest feature</option>'+
			'<option value="multiple">All features</option>'+
		'</select>'+
		'<br /><br />'+
		'<label for="pd_view">Show All Features at All Zoom Levels:</label>'+
		'<br />'+
		'<select name="enable_no_scale">'+
			'<option value="0">No</option>'+
			'<option value="1" selected="selected">Yes</option>'+
		'</select>'
	);
	jQuery("#sidebar_section_options select[name=pd_view]").change(function(){
		change_pd_view(jQuery(this).val());
	});
	jQuery("#sidebar_section_options select[name=proximity_search_method]").change(function(){
		proximity_search_method = jQuery(this).val();
	});
	jQuery("#sidebar_section_options select[name=enable_no_scale]").val(enable_no_scale ? 1 : 0).change(function(){
		var layers = map.getThlWmsLayers();
		if(jQuery(this).val() == 1){
			for(var i in layers){
				var layer = layers[i];
				layer.mergeNewParams({
					STYLES: 'thl_noscale,thl_noscale,thl_noscale'
				});
			}
			enable_no_scale = true;
		}else{
			for(var i in layers){
				var layer = layers[i];
				layer.mergeNewParams({
					STYLES: layer.defaultStyleName
				});
			}
			enable_no_scale = false;
		}
		update_location_hash();
	});
	
	// Populate the feature types tree
	jQuery("#sidebar_section_feature_types").html('<img src="/places/maps/interactive/img/ajax-loader.gif" alt="" style="display: inline; margin-right: 5px;" />Loading...');
	jQuery.getJSON(OpenLayers.ProxyHost+escape(subjects_url+"/categories/20/all_with_shapes.json"),
		function(data){
			feature_types_data = data;
			layer_switcher.dataTree = data;
			var top_levels = data.category.categories.category;
			var feature_types_list_html = '<ul class="tree" id="feature_types_accordion">';
			for(var i in top_levels){
				var top_level = top_levels[i];
				feature_types_list_html += '<li><input type="checkbox"><label class="tree-header" name="feature_type_'+top_level.id+'">'+top_level.title+
					' ('+top_level.shape_count+'/'+top_level.feature_count+')</label>';
				feature_types_list_html += create_list_from_array(top_level);
				feature_types_list_html += '</li>';
				feature_type_names[top_level.id] = top_level.title;
			}
			feature_types_list_html += '</ul>';
			jQuery("#sidebar_section_feature_types").html(feature_types_list_html);
			jQuery("#sidebar_section_feature_types").checkTree({
				onCheck: add_feature_type,
				onUnCheck: remove_feature_type,
				onExpand: expand_check_tree,
				onLoad: onFeatureTypesTreeLoad 
			});
			
			// This relies on the JSON result, so we have to init it here
			init_selected_area_feature_type_popup();
		}
	);
	
	var sidebar_section_animate_time = 300;
	
	jQuery('#sidebar_content > div > h4:not(.no-accordion)').click(function(){
		var section_div = jQuery(this).parent('div');
		var content_div = jQuery(this).siblings('div');
		var header_element = jQuery(this);
		if(content_div.hasClass("collapsed")){
			jQuery('#sidebar_content > div > div.expanded').hide(sidebar_section_animate_time);
			var expanded_divs = jQuery('#sidebar_content > div > div.expanded');
			var expanded_divs_headers = jQuery(expanded_divs).siblings("h4:not(.no-accordion)");
			expanded_divs.removeClass("expanded");
			expanded_divs.addClass("collapsed");
			expanded_divs_headers.removeClass("expanded");
			expanded_divs_headers.addClass("collapsed");			
			content_div.show(sidebar_section_animate_time);
			content_div.removeClass("collapsed");
			content_div.addClass("expanded");
			header_element.removeClass("collapsed");
			header_element.addClass("expanded");
		}else{
			content_div.hide(sidebar_section_animate_time);
			content_div.removeClass("expanded");
			content_div.addClass("collapsed");
			header_element.removeClass("expanded");
			header_element.addClass("collapsed");
		}
	});
	
	jQuery('#sidebar_content > div > div').hide();
	jQuery('#sidebar_content > div > div').addClass("collapsed");
	
	// Open one of the sidebar items on pageload
	//jQuery('#sidebar_section_feature_types').siblings("h4").click();
	jQuery('#sidebar_section_feature_search').siblings("h4").click();
	//jQuery('#sidebar_section_map_layers').siblings("h4").click();
	//jQuery('#sidebar_section_active_layers').siblings("h4").click();
	
	//jQuery(".olHelpButtonItemInactive").html('<a href="#thl-popup=/access/wiki/site/c06fa8cf-c49c-4ebc-007f-482de5382105/thl%20interactive%20maps.html" class="wikipop new-window"><img src="img/help.png" /></a>');
	jQuery(".olFeedbackButtonItemInactive").html('<a href="#thl-popup=/places/maps/interactive/feedback.php" class="thl-content new-window"><img src="img/feedback.png" /></a>');
	//ActivateLinks(".olHelpButtonItemInactive");
	ActivateLinks(".olFeedbackButtonItemInactive");
	ActivateThlPopups('#sidebar_section_help');
	
	
	jQuery('#sidebar_toggle').click(function(){toggle_sidebar_wrapper()});
	
	var place_names_toggle_html = '<div class="olControlCustomToggle olControlNoSelect" style="width: 108px; float: left; margin: 5px;" unselectable="on">'
		+'<div class="custom_toggle_text" id="show_place_names_toggle"><a href="#" onclick="toggle_place_names(true); return false;">Show Place Names</a></div>'
		+'<div class="custom_toggle_text" id="hide_place_names_toggle"><a href="#" onclick="toggle_place_names(false); return false;">Hide Place Names</a></div>'
		+'</div>';
	jQuery("#controlPanelWrapper").prepend(place_names_toggle_html);
	
	toggle_place_names(true);
	show_languages_menu(false);
	jQuery('.contractMapButtonItemInactive').hide();
	show_sidebar_wrapper(1, 'linear');
	
}

function clear_advanced_search_fields(){
	jQuery("input[name='scope']").removeAttr('checked');
	jQuery("#scope_name").attr('checked', 'checked');
	ModelSearcher.resetFields();
	characteristic_selector.resetFields();
}

function toggle_place_names(show){
	if(show){
		jQuery('#show_place_names_toggle').hide();
		jQuery('#hide_place_names_toggle').show();
		show_place_names = true;
	}else{
		jQuery('#show_place_names_toggle').show();
		jQuery('#hide_place_names_toggle').hide();
		show_place_names = false;
	}
	show_languages_menu(false);
	var layer;
	for(var i in map.layers){
		layer = map.layers[i];
		if(!layer.isBaseLayer && is_defined(layer.placeNamesShown) && !layer.placeNamesOverride){
			if(show){
				layer.showPlaceNames();
				if(is_defined(layer.namesElem)){
					layer.namesElem.checked = true;
				}
			}else{
				layer.hidePlaceNames();
				if(is_defined(layer.namesElem)){
					layer.namesElem.checked = false;
				}
			}
		}
	}
}

/*function change_language(list_element){
	var language = jQuery(list_element).find('[name=languages_list]:checked').val();
	current_pd_view = language;
	map.setLanguage(language);
	update_location_hash();
	for(var i in map.layers){
		layer = map.layers[i];
		if(!layer.isBaseLayer && is_defined(layer.placeNamesShown)){
			layer.setLanguage(language);
		}
	}
}*/

function change_pd_view(view){

	current_pd_view = view;
	map.setLanguage(view);
	update_location_hash();
	
}

jQuery(document).ready(function(){

	jQuery("#sideMenuLink").css("background-position", "0% 0%");
	jQuery("#fxSideMenu").hide();
	if(top != self) {jQuery("#footer").remove();}
	
});

// Using (document).ready to load OpenLayers throws an error with return!!(document.namespaces) in
// OpenLayers in IE7 & 8, so we have to use the later event of (window).load instead.  For other browser,
// we'll use (document).ready to minimize the loading time.

if(jQuery.browser.msie){

	jQuery(window).load(function(){
		
		init_map();
		
		init_dialogs();
		
		MapLayers.init();
		
	});

} else {

	jQuery(document).ready(function(){
		
		init_map();
		
		init_dialogs();
		
		MapLayers.init();
		
	});

}

// Hash-related functions -----------------------------------------------------------------------------

function create_location_hash(){	
	var map_bounds = map.calculateBounds();
	if(map_bounds){
		var fids = [];
		var types = [];
		var params = [];
		for(var i in map.layers){
			if(map.layers[i].id.indexOf('feature_fid_') == 0){
				fids.push(map.layers[i].id.substring(12));
			} else if(map.layers[i].id.indexOf('feature_type_') == 0){
				types.push(map.layers[i].id.substring(13));
			}
		}
		if(types.length > 0){
			params.push('type:'+types.join(','));
		}
		if(fids.length > 0){
			params.push('fid:'+fids.join(','));
		}
		
		// Preserve the coverages hash param if it exists
		var url_hash = get_map_url_params();
		var coverage_hash = url_hash.match(/coverages:([\d,]+)/);
		if(coverage_hash){
			params.push('coverages:'+coverage_hash[1]);
		}
		
		if(!enable_no_scale){
			params.push('no_scale:0');
		}
		
		var bounds_string = Math.round(map_bounds.left)+','+Math.round(map_bounds.bottom)+','+Math.round(map_bounds.right)+','+Math.round(map_bounds.top);
		params.push('bounds:'+bounds_string);
		params.push('language:'+map.language);
		var hash_string = '#'+params.join(';');
		return hash_string;
	}
	return false;
}

function reset_map(){
	var match, layer;
	//window.location = window.location.pathname;
	jQuery('#feature_types_accordion div.checked').each(function(){
		if(jQuery(this).hasClass('checked')){
			jQuery(this).click();
		}
	});
	var map_layers = map.layers.reverse();
	for(var i in map_layers){
		layer = map_layers[i];
		/*if(!layer.isBaseLayer && (typeof layer.id != 'undefined')){
			if(map.getLayer(layer.id) != null){
				map.removeLayer(map.getLayer(layer.id));
			}
		}*/
		if(!layer.isBaseLayer){
			layer.destroy();
		}
	}
	map.zoomToExtent(default_map_bounds);
	loading_panel.minimizeControl();
}

// Retrieve the parameters that modify the map's initial state
function get_map_url_params() {
	var params_string;
	
	// First, look for these params in the location hash.
	if (window.location.hash) {
		params_string = window.location.hash;
		
	// They may also be set in location.search (i.e. as GET params) to allow their usage in iframes
	// (which already use a "#" earlier in the URL).
	} else if (window.location.search) {
		params_string = window.location.search;
	
	} else {
		params_string =  '';
	}
	
	return params_string;
}

function process_location_hash(){

	var location_hash = get_map_url_params();
	
	if(!location_hash){
		return false;
	}
	
	// Process the location hash
	
	var no_scale_hash = location_hash.match(/no_scale:0/);
	if(no_scale_hash){
		enable_no_scale = false;
	}
	var type_hash = location_hash.match(/type:([\d,]+)/);
	if(type_hash){
		var types = type_hash[1].split(',');
		for(var i in types){
			check_feature_type_checkbox(types[i]);
		}
	}
	var fid_hash = location_hash.match(/fid:([\d,]+)/);
	if(fid_hash){
		var fids = fid_hash[1].split(',');
		for(var i in fids){
			// Add the feature, but don't zoom to it (3rd arg)
			add_feature_by_fid(fids[i], false, false);
		}
	}
	var coverage_hash = location_hash.match(/coverages:([\d,]+)/);
	if(coverage_hash){
		jQuery('#sidebar_section_active_layers').siblings("h4").click();
		var coverages = coverage_hash[1].split(',');
		for(var i in coverages){
			add_coverage(coverages[i]);
		}
	}
	var language_hash = location_hash.match(/language:([\w.]+)/);
	if(language_hash){
		var language = language_hash[1];
		map.setLanguage(language);
		current_pd_view = language;
		jQuery('#pd_view_select').val(language);
	}
	var height_hash = location_hash.match(/height:([\w\%]+)/);
	if(height_hash){
		var height = height_hash[1];
		jQuery('#interface_wrapper, #sidebar_wrapper, #map_wrapper').css('height', height);
	}
	
	var bounds_hash = location_hash.match(/bounds:([\d,\.-]+)/);
	if(fid_hash && !bounds_hash){
		map.zoomToActiveFeatures();
	}
	zoom_to_hash_bounds(location_hash);
}

function update_location_hash(){
	if(location_hash_update_enabled){
		var new_hash = create_location_hash();
		if(new_hash){
			window.location.hash = new_hash;
		}
	}
	current_hash = window.location.hash;
}

function zoom_to_hash_bounds(hash){
	if(!is_defined(hash)){
		hash = window.location.hash;
	}
	var bounds_hash = hash.match(/bounds:([\d,\.-]+)/);
	if(bounds_hash){
		var bounds = bounds_hash[1];
		var bound=new OpenLayers.Bounds.fromString(bounds);
		map.zoomToExtent(bound);
		map.RenderLocationMarker(bound.getCenterLonLat());
		map.zoomTo(map.getZoom() + 1);
		return true;
	}
	return false;
}

function onFeatureTypesTreeLoad(){
	// Need to disable the automatic location hash updates to prevent the changes made by process_location_hash() to regenerate the hash
	location_hash_update_enabled = false;
	process_location_hash();
	location_hash_update_enabled = true;
}

function check_feature_type_checkbox(id){
	var checkbox_div = jQuery('label[name=feature_type_'+id+']').siblings('div.single_checkbox');
	if(checkbox_div && !checkbox_div.hasClass('checked')){
		checkbox_div.click();
	}
}

function uncheck_feature_type_checkbox(id){
	var checkbox_div = jQuery('label[name=feature_type_'+id+']').siblings('div.single_checkbox');
	if(checkbox_div && checkbox_div.hasClass('checked')){
		checkbox_div.click();
	}
}

// Functions for controls ---------------------------------------------------------------------

function contract_map(){
	jQuery('body').addClass('single-col').removeClass('full-width');
	map.updateSize();
	jQuery('.contractMapButtonItemInactive').hide();
	jQuery('.expandMapButtonItemInactive').show();
	jQuery('#olControlDropdownBoxLanguages').css('left', '363px');
}

function expand_map(){
	jQuery('body').addClass('full-width').removeClass('single-col');
	map.updateSize();
	jQuery('.contractMapButtonItemInactive').show();
	jQuery('.expandMapButtonItemInactive').hide();
	jQuery('#olControlDropdownBoxLanguages').css('left', '343px');
}

var sidebar_wrapper_animate_time = 400;
var sidebar_wrapper_width = 230;

function hide_sidebar_wrapper(time, easing){
	jQuery('#sidebar_toggle').removeClass('expanded').addClass('contracted');
	jQuery('#sidebar_wrapper').animate({right: '-'+sidebar_wrapper_width+'px'}, time, easing);
}

function show_sidebar_wrapper(time, easing){
	jQuery('#sidebar_wrapper').animate({right: '0px'}, time, easing);
	jQuery('#sidebar_toggle').removeClass('contracted').addClass('expanded');
}

function toggle_sidebar_wrapper(){
	if(parseInt(jQuery('#sidebar_wrapper').css('right')) > -20){
		hide_sidebar_wrapper(sidebar_wrapper_animate_time, 'swing');
	}else{
		show_sidebar_wrapper(sidebar_wrapper_animate_time, 'swing');
	}

}

function toggle_languages_menu(){
	if(jQuery('#olControlDropdownBoxLanguagesBox').css('display') == 'none'){
		show_languages_menu(true)
	}else{
		show_languages_menu(false);
	}
	return false;
}

function show_languages_menu(show, time){
	if(!is_defined(time)){
		time = 300;
	}
	if(show == false){
		jQuery('#olControlDropdownBoxLanguagesControl .olControlDropdownBoxPlusMinus img').attr('src', 'css/images/btn-plus-lg.gif');
		jQuery('#olControlDropdownBoxLanguagesBox').hide(time);
	}else{
		jQuery('#olControlDropdownBoxLanguagesControl .olControlDropdownBoxPlusMinus img').attr('src', 'css/images/btn-minus-lg.gif');
		jQuery('.olControlDropdownBoxBox').parents(':not(#olControlDropdownBoxLanguagesControl)').children('.olControlDropdownBoxBox').hide();
		jQuery('#olControlDropdownBoxLanguagesBox').show(time);
	}
}

// Saving and printing the map ----------------------------------------------------------------------------------------------------

function render_map(mode, type) {
	if(mode == 'save' && type == 'shp'){
		var cql_filter = get_map_cql_filter();
		if(cql_filter.length > 0){
			var url = geoserver_url+'/wfs?typename=thdl%3Atest2&layers=thdl%3Atest2&projection=EPSG%3A4326&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&SRS=EPSG%3A4326'+
				'&outputformat=SHAPE-ZIP'+
				'&CQL_FILTER='+cql_filter;
			window.open(url);
		}else{
			alert("For a shapefile to be created, there must be visible, active layers on the map.");
		}
		return false;
	}
	else if(mode == 'save' && type == 'gml'){
		var cql_filter = get_map_cql_filter();
		if(cql_filter.length > 0){
			var url = geoserver_url+'/wfs?typename=thdl%3Atest2&layers=thdl%3Atest2&projection=EPSG%3A4326&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&SRS=EPSG%3A4326'+
				'&outputformat=GML2'+
				'&CQL_FILTER='+cql_filter;
			url = '/places/maps/interactive/utils/download.php?c=text/xml&n=thlmap.gml&u='+escape(url);
			window.open(url);
		}else{
			alert("For a GML file to be created, there must be visible, active layers on the map.");
		}
		return false;
	}
	else if(mode == 'save' && type == 'kml'){
		var cql_filter = get_map_cql_filter();
		if(cql_filter.length > 0){
			var bbox = map.calculateBounds().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")).toBBOX();
			var url = geoserver_url+'/wms?typename=thdl%3Atest2&layers=thdl%3Atest2&projection=EPSG%3A4326&SERVICE=WMS&VERSION=1.0.0&REQUEST=GetMap&SRS=EPSG%3A4326'+
				'&WIDTH='+map.size.w+'&HEIGHT='+map.size.h+'&BBOX='+bbox+
				'&format=application/vnd.google-earth.kml+XML'+
				'&CQL_FILTER='+cql_filter;
			url = '/places/maps/interactive/utils/download.php?c=text/xml&n=thlmap.kml&u='+escape(url);
			window.open(url);
		}else{
			alert("For a KML file to be created, there must be visible, active layers on the map.");
		}
		return false;
	}
	var printurl = 'render.php';
	var size     = map.getSize();
	var bounds	 = map.calculateBounds().transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326")).toBBOX();
	var zoom     = map.zoom;
	var dx = parseInt(map.layerContainerDiv.style.left);
	var dy = parseInt(map.layerContainerDiv.style.top);
	var gmaps_type  = map.baseLayer.name;
	var gmaps_types = {
		'Google Satellite': 'satellite',
		'Google Physical': 'terrain',
		'Google Streets': 'roadmap',
		'Google Hybrid': 'hybrid',
		'No Base Layer': 'none'
	}
	gmaps_type = gmaps_types[gmaps_type];
	// go through all layers, and collect a list of objects
	// each object is a tile's URL and the tile's pixel location relative to the viewport
	var layers = [];
	for (layername in map.layers) {
		// if the layer isn't visible at this range, or is turned off, skip it
		var layer = map.layers[layername];
		if (!layer.getVisibility()) continue;
		if (!layer.calculateInRange()) continue;
		// iterate through their grid's tiles, collecting each tile's extent and pixel location at this moment
		var tiles = [];
		for (tilerow in layer.grid) {
			for (tilei in layer.grid[tilerow]) {
				var tile     = layer.grid[tilerow][tilei]
				var url      = layer.getURL(tile.bounds);
				var position = tile.position;
				var opacity  = layer.opacity ? parseInt(100*layer.opacity) : 100;
				var index	 = layername;
				tiles.push({url:url, x:(position.x + dx), y:(position.y + dy), opacity:opacity, index:index});
			}
		}
		if(tiles.length > 0){
			layers.push(tiles);
		}
	}
	// hand off the list to our server-side script, which will do the heavy lifting
	var layers_json = JSON.stringify(layers);
	//var printparams = 'width='+size.w+'&height='+size.h+'&bounds='+bounds+'&zoom='+zoom+'&layers='+escape(layers_json);
	if(!is_defined(type)){
		type = '';
	}
	sendPostToNewWindow(printurl, {mode: mode, type: type, width: size.w, height: size.h, bounds: bounds, zoom: zoom, gmaps_type: gmaps_type, layers: escape(layers_json)});
	jQuery('#save_as_popup').dialog('close');
	return false;
}

  
// Need to see if jQuery provides a cleaner way to do this...
function sendPostToNewWindow(url, data){
	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("target", "_blank");
	form.setAttribute("action", url);
	
	for(var i in data){
		var hiddenField = document.createElement("input");              
		hiddenField.setAttribute("name", i);
		hiddenField.setAttribute("value", data[i]);
		form.appendChild(hiddenField);
	}
	
	document.body.appendChild(form);                  
	form.submit();
	document.body.removeChild(form);
}

// Get a jQuery-wrapped DOM object, give the response of an Ajax request for an XML file.
function get_dom_from_ajax_xml(data){
	var dom;
	if (typeof data == "string") {
		dom = new ActiveXObject("Microsoft.XMLDOM");
		dom.async = false;
		dom.loadXML(data);
	} else {
		dom = data;
	}
	dom = jQuery(dom);
	return dom;
}


// MapLayers --------------------------------------------------------------------------------------------------
var MapLayers = {

	divId: 'sidebar_section_map_layers',
	legendDivId: 'MapLayers_legend',
	geoserverUrl: 'http://www.thlib.org:8080/thdl-geoserver',
	geonetworkUrl: 'http://www.thlib.org:8080/geonetwork',
	layers: [],
	// These are used in the getGeonetworkLayerData Ajax callbacks to determine when all of the layer data
	// has been retrieved.
	numberOfLayers: null,
	numberOfRetrievedLayers: 0,
	
	init: function(){
		this.initInterface();
		this.setLayers();
		this.initLegend();
	},
	
	initInterface: function(){
		jQuery('#'+this.divId)
			.width('680px')
			.append(
			'<a onclick="return MapLayers.close();" class="close-button">'+
				'<img src="/global/images/close.gif" /></a>'+
			'<h4>Map Layers</h4>'+
			'<div id="map_layers_container">'+
				'<table id="map_layers_table">'+
					'<tr>'+
					'<th></th>'+
					'<th>Title</th>'+
					'<th>Description</th>'+
					'<th>Year</th>'+
					'<th>Legend</th>'+
					'<th>Scale</th>'+
					'<th>Reference</th>'+
					'<th>Language</th>'+
					'<th>XML</th>'+
					'<th>Download</th>'+
					'<th>Zoom</th>'+
					'</tr>'+
				'</table>'+
			'</div>'
			);
	},
	
	initLegend: function(){
		jQuery('body').append('<div id="'+this.legendDivId+'"></div>');
		jQuery('#'+this.legendDivId).dialog({
			autoOpen: false,
			height: 390,
			width: 430,
			title: 'Legend'
		});
	},
		
	setLayers: function(){
		
		// The following GET value is the string we use to determine which GeoNetwork entries can be displayed on the map
		var url = this.geonetworkUrl+'/srv/en/xml.search?any=%22See%20the%20Datasets%20in%20a%20Web%20Map%22';
		url = OpenLayers.ProxyHost+escape(url)+"&mimeType=text/xml";
		
		jQuery.ajax({
			type: "GET",
			url: url,
			dataType: (jQuery.browser.msie) ? "text" : "xml",
			success: function(data){
				
				var xml = get_dom_from_ajax_xml(data);
				
				var id_nodes = xml.find('metadata > * > id');
				MapLayers.numberOfLayers = id_nodes.length;
				id_nodes.each(function(){
					var id = jQuery.trim(jQuery(this).text());
					MapLayers.getGeonetworkLayerData(id);
				});
				
			},
			error: function(data){
				//alert("There was an error retrieving this data.");
			}
		});
	},
	
	onLayerDataCompletion: function(){
		// Now that we've retrieved all of the layer data, we can check the URL hash to see if a layer
		// should be loaded by default. (This needs to be called from within this Ajax callback method.)
		MapLayers.processUrlHash();
	
	},
	
	processUrlHash: function(){
		var url_hash = get_map_url_params();
		if(!url_hash){
			return false;
		}
		var match = url_hash.match(/map_layer:([\d,]+)/);
		if(match){
			var layer_ids = match[1].split(',');
			for(var i in layer_ids){
				MapLayers.zoomToLayer(layer_ids[i]);
			}
		}
	},
	
	getGeonetworkLayerData: function(id){
		var url = this.geonetworkUrl+'/srv/en/xml.metadata.get?id='+id;
		url = OpenLayers.ProxyHost+escape(url)+"&mimeType=text/xml";
		
		jQuery.ajax({
			type: "GET",
			url: url,
			dataType: (jQuery.browser.msie) ? "text" : "xml",
			success: function(data){
				
				var xml = get_dom_from_ajax_xml(data);
				var layer = {};
				
				// Namespaces in jQuery are handled in two ways in different browsers, so we'll perform a check to see
				// which method is appropriate to use.  A custom jQuery.find() method should be made that incorporates
				// both of these to properly clean up this code.
				
				if(xml.find('gmd\\:title :first').length > 0){
					layer.id = xml.find('id').text();
					layer.title = xml.find('gmd\\:title :first').text();
					layer.description = xml.find('gmd\\:abstract :first').text();
					var year_match = xml.find('gmd\\:CI_Date :first :first').text().match(/[\d]{4}/);
					layer.year = year_match.length > 0 ? year_match[0] : '';
					layer.source = "";
					layer.scale = xml.find('gmd\\:equivalentScale :first :first :first').text();
					if(layer.scale){
						layer.scale = '1 : '+layer.scale;
					}
					layer.extentDescription = "";
					layer.language = xml.find('gmd\\:identificationInfo').find('gmd\\:language :first').text();
					
					layer.legendUrl = false;
					layer.legendName = false;
					var legend_resource = xml.find('gmd\\:CI_OnlineResource').filter(function(){
						// Temporarily checking for either name or description, but this should only check for one of these
						// fields once we have the setup finalized.
						var name = jQuery(this).find('gmd\\:name').text();
						var description = jQuery(this).find('gmd\\:description').text();
						var protocol = jQuery(this).find('gmd\\:protocol').text();
						// A jQuery.trim(protocol) == 'WWW:LINK-1.0-http--related' should be required too, but should be added
						// once we've switched entirely to the new legend metadata setup.
						return (jQuery.trim(name) == 'Legend' || jQuery.trim(description) == 'Legend');
					});
					if(legend_resource){
						var legend_resource_linkage = legend_resource.find('gmd\\:linkage');
						var legend_resource_name = legend_resource.find('gmd\\:name');
						if(legend_resource_linkage.length > 0){
							layer.legendUrl = jQuery.trim(legend_resource_linkage.text());
						}
						if(legend_resource_name.length > 0){
							layer.legendName = jQuery.trim(legend_resource_name.text());
							if(layer.legendName == 'Legend'){
								layer.legendName = false;
							}
						}
					}
					
					layer.geoserverName = false;
					var geoserver_name_resource = xml.find('gmd\\:CI_OnlineResource').filter(function(){
						var description = jQuery(this).find('gmd\\:description').find('gco\\:CharacterString').text();
						return ((jQuery.trim(description)+"") == "See the Datasets in a Web Map");
					});
					if(geoserver_name_resource){
						geoserver_name_resource = geoserver_name_resource.find('gmd\\:URL');
						if(geoserver_name_resource.length > 0){
							var geoserver_name_match = geoserver_name_resource.text().match(/layers=(.*?)&/);
							if(geoserver_name_match.length > 1){
								geoserver_name_resource = geoserver_name_match[1];
								layer.geoserverName = geoserver_name_match[1];
							}
						}
					}
					
					layer.reference = "";
					layer.metadata = "http://www.thlib.org:8080/geonetwork/srv/en/iso19139.xml?id="+layer.id;
					layer.info = "http://www.thlib.org/places/maps/collections/show.php?id="+layer.id;
					var extent_xml = xml.find('gmd\\:EX_GeographicBoundingBox');
					layer.bounds = false;
					if(extent_xml.text()){
						var bounds = new OpenLayers.Bounds();
						var left = extent_xml.find('gmd\\:westBoundLongitude :first').text();
						var bottom = extent_xml.find('gmd\\:southBoundLatitude :first').text();
						var right = extent_xml.find('gmd\\:eastBoundLongitude :first').text();
						var top = extent_xml.find('gmd\\:northBoundLatitude :first').text();
						bounds = new OpenLayers.Bounds(left, bottom, right, top);
						layer.bounds = bounds;
					}
				}else{
					layer.id = xml.find('id').text();
					layer.title = xml.find('title').filter(MapLayers.hasGmdNamespace).find(':first').text();
					layer.description = xml.find('abstract').filter(MapLayers.hasGmdNamespace).find(':first').text();
					var year_match = xml.find('CI_Date').filter(MapLayers.hasGmdNamespace).find(':first :first').text().match(/[\d]{4}/);
					layer.year = year_match.length > 0 ? year_match[0] : '';
					layer.source = "";
					layer.scale = xml.find('equivalentScale').filter(MapLayers.hasGmdNamespace).find(':first :first :first').text();
					if(layer.scale){
						layer.scale = '1 : '+layer.scale;
					}
					layer.extentDescription = "";
					layer.language = xml.find('identificationInfo').filter(MapLayers.hasGmdNamespace).find('language').filter(MapLayers.hasGmdNamespace).find(':first').text();
					layer.reference = "";
					layer.metadata = "http://www.thlib.org:8080/geonetwork/srv/en/iso19139.xml?id="+layer.id;
					layer.info = "http://www.thlib.org/places/maps/collections/show.php?id="+layer.id;
					
					layer.legendUrl = false;
					layer.legendName = false;
					var legend_resource = xml.find('CI_OnlineResource').filter(MapLayers.hasGmdNamespace).filter(function(){
						// Temporarily checking for either name or description, but this should only check for one of these
						// fields once we have the setup finalized.
						var name = jQuery(this).find('name').filter(MapLayers.hasGmdNamespace).text();
						var description = jQuery(this).find('description').filter(MapLayers.hasGmdNamespace).text();
						var protocol = jQuery(this).find('protocol').filter(MapLayers.hasGmdNamespace).text();
						// A jQuery.trim(protocol) == 'WWW:LINK-1.0-http--related' should be required too, but should be added
						// once we've switched entirely to the new legend metadata setup.
						return (jQuery.trim(name) == 'Legend' || jQuery.trim(description) == 'Legend');
					});
					if(legend_resource){
						var legend_resource_linkage = legend_resource.find('linkage').filter(MapLayers.hasGmdNamespace);
						var legend_resource_name = legend_resource.find('name').filter(MapLayers.hasGmdNamespace);
						if(legend_resource_linkage.length > 0){
							layer.legendUrl = jQuery.trim(legend_resource_linkage.text());
						}
						if(legend_resource_name.length > 0){
							layer.legendName = jQuery.trim(legend_resource_name.text());
							if(layer.legendName == 'Legend'){
								layer.legendName = false;
							}
						}
					}
					
					layer.geoserverName = false;
					var geoserver_name_resource = xml.find('CI_OnlineResource').filter(MapLayers.hasGmdNamespace).filter(function(){
						var description = jQuery(this).find('description').filter(MapLayers.hasGmdNamespace).find('CharacterString').filter(MapLayers.hasGcoNamespace).text();
						return ((jQuery.trim(description)+"") == "See the Datasets in a Web Map");
					});
					if(geoserver_name_resource){
						geoserver_name_resource = geoserver_name_resource.find('URL').filter(MapLayers.hasGmdNamespace);
						if(geoserver_name_resource.length > 0){
							var geoserver_name_match = geoserver_name_resource.text().match(/layers=(.*?)&/);
							if(geoserver_name_match.length > 1){
								geoserver_name_resource = geoserver_name_match[1];
								layer.geoserverName = geoserver_name_match[1];
							}
						}
					}
					
					var extent_xml = xml.find('EX_GeographicBoundingBox').filter(MapLayers.hasGmdNamespace);
					layer.bounds = false;
					if(extent_xml.text()){
						var bounds = new OpenLayers.Bounds();
						var left = extent_xml.find('westBoundLongitude').filter(MapLayers.hasGmdNamespace).find(':first').text();
						var bottom = extent_xml.find('southBoundLatitude').filter(MapLayers.hasGmdNamespace).find(':first').text();
						var right = extent_xml.find('eastBoundLongitude').filter(MapLayers.hasGmdNamespace).find(':first').text();
						var top = extent_xml.find('northBoundLatitude').filter(MapLayers.hasGmdNamespace).find(':first').text();
						bounds = new OpenLayers.Bounds(left, bottom, right, top);
						layer.bounds = bounds;
					}
				}
				MapLayers.layers.push(layer);
				
				// Only add the layer to the interface if it can be toggled on the map
				if(layer.geoserverName){
					MapLayers.addTableRow(layer);
				}
				
				MapLayers.numberOfRetrievedLayers++;
				if(MapLayers.numberOfLayers == MapLayers.numberOfRetrievedLayers){
					MapLayers.onLayerDataCompletion();
				}
			},
			error: function(data){
				//alert("There was an error retrieving this data.");
			}
		});
	},
	
	addTableRow: function(layer){
		var zoom = '';
		if(layer.bounds){
			zoom = '<a href="#" onclick="return MapLayers.zoomToLayer('+layer.id+')">Zoom</a>';
		}
		jQuery('#map_layers_table').append('<tr>'+
			'<td><input type="checkbox" id="map_layers_toggle_layer_'+layer.id+'" onclick="return MapLayers.toggleLayer(this, '+layer.id+');" /></td>'+
			'<td>'+layer.title+'</td>'+
			'<td>'+layer.description.replaceAll("\n", '<br />')+'</td>'+
			'<td>'+layer.year+'</td>'+
			'<td>'+(layer.legendUrl ? '<a href="#" onclick="return MapLayers.showLegend('+layer.id+');">Legend</a>' : '')+'</td>'+
			'<td class="no-wrap">'+layer.scale+'</td>'+
			'<td><a href="'+layer.info+'" target="_blank">Reference</a></td>'+
			'<td>'+layer.language+'</td>'+
			'<td><a href="'+layer.metadata+'" target="_blank">XML</a></td>'+
			'<td class="no-wrap">'+this.getDownloadLinks(layer)+'</td>'+
			'<td>'+zoom+'</td>'+
			'</tr>');
	},
	
	zoomToLayer: function(id){
		var layer = this.getLayerById(id);
		if(layer && layer.bounds){
			// Need to make a deep copy of the bounds; otherwise, .transform() will change them
			var bounds = jQuery.extend(true, {}, layer.bounds);
			map.zoomToExtent(bounds.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913")));
			MapLayers.showLayer(id);
			this.close();
		}
		return false;
	},
	
	getLayerById: function(id){
		var layer;
		for(var i in this.layers){
			if(this.layers[i].id == id){
				return this.layers[i];
			}
		}
		return false;
	},
	
	close: function(){
		var toggle_element = jQuery('#'+this.divId).siblings('h4');
		if(toggle_element.hasClass('expanded')){
			toggle_element.click();
		}
		return false;
	},

	toggleLayer: function(checkbox, id){
		if(jQuery(checkbox).is(':checked')){
			this.showLayer(id);
			this.close();
		}else{
			this.showLayer(id, false);
		}
		return true;
	},
	
	showLayer: function(id, show){
	
		// This function can either show or hide the layer, based on the value of the "show" arg, but
		// it shows be default.
		if(typeof show == 'undefined'){
			show = true;
		}
		
		var layer = this.getLayerById(id);
		if(layer){
			if(show){
				var match = map.getLayer('map_layer_'+id);
				if(!match){
					var new_layer = new OpenLayers.Layer.THLWMS(layer.title, {
							layers: layer.geoserverName
						});
					new_layer.id = 'map_layer_'+id;
					new_layer.setLanguageDependent(false);
					map.addLayer(new_layer);
					var checkbox = jQuery('#map_layers_toggle_layer_'+id);
					if(checkbox.length > 0 && !checkbox.is(':checked')){
						checkbox.attr('checked', 'checked');
					}
					this.showLegend(id);
				}
			}else{
				var match = map.getLayer('map_layer_'+id);
				if(match){
					map.removeLayer(match);
					var checkbox = jQuery('#map_layers_toggle_layer_'+id);
					if(checkbox.length > 0 && checkbox.is(':checked')){
						checkbox.attr('checked', '');
					}
				}
			}
		}
	},
	
	showLegend: function(layer_id){
		var layer = MapLayers.getLayerById(layer_id);
		if(layer.legendUrl){
			var legend_subtitle = layer.legendName ?
				'<div class="legend-subtitle" style="margin-bottom: 5px; margin-top: -10px;">'+layer.legendName+'</div>' : '';
			jQuery('#'+this.legendDivId).dialog('option', 'title', 'Legend: '+layer.title);
			jQuery('#'+this.legendDivId).dialog('open');
			jQuery('#'+this.legendDivId).html(
				legend_subtitle + '<img src="'+layer.legendUrl+'" alt="" title="Legend" class="legend-image" />'
			);
			jQuery('#'+this.legendDivId).dialog('option', 'position', 'right');
			
			// Resize the dialog to properly fit the legend graphic
			jQuery('#'+this.legendDivId+' .legend-image').load(function(){
			
				// We have to set the width first, because this will influence the height of the titlebar (depending on how many
				// linkbreaks exist in the title due to the width), which we need to calculate the entire height.
				var image_width = jQuery(this).width();
				jQuery('#'+MapLayers.legendDivId).dialog('option', 'width', image_width + 40);
				
				// Set the height
				var image_height = jQuery(this).height();
				var titlebar_height = jQuery('#'+MapLayers.legendDivId).siblings('.ui-dialog-titlebar').height();
				jQuery('#'+MapLayers.legendDivId).dialog('option', 'height', image_height + titlebar_height + 50);
				jQuery('#'+MapLayers.legendDivId).dialog('option', 'position', 'right');
				
			});
		}
		return false;
	},
	
	getDownloadLinks: function(layer){
		var bbox = new OpenLayers.Bounds(-180,-90,180,90).toBBOX();
		var shapefile_url = this.geoserverUrl+'/wfs?typeName='+layer.geoserverName+'&projection=EPSG%3A4326&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&SRS=EPSG%3A4326'+
				'&outputformat=SHAPE-ZIP';
		var gml_url = this.geoserverUrl+'/wfs?typeName='+layer.geoserverName+'&projection=EPSG%3A4326&SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&SRS=EPSG%3A4326'+
				'&outputformat=GML2';
		var kml_url = this.geoserverUrl+'/wms?layers='+layer.geoserverName+'&projection=EPSG%3A4326&SERVICE=WMS&VERSION=1.0.0&REQUEST=GetMap&SRS=EPSG%3A4326'+
				'&WIDTH=1024&HEIGHT=768'+
				'&BBOX='+bbox+
				'&format=application/vnd.google-earth.kml+XML';
		var links = this.formatDownloadLink('SHP', shapefile_url, layer.geoserverName+'.zip', 'application/octet-stream')+' | '+
					this.formatDownloadLink('GML', gml_url, layer.geoserverName+'.gml', 'text/xml')+' | '+
					this.formatDownloadLink('KML', kml_url, layer.geoserverName+'.kml', 'text/xml')
		return links;
	},
	
	formatDownloadLink: function(name, url, file_name, content_type){
		url = '/places/maps/interactive/utils/download.php?c='+content_type+'&n='+file_name+'&u='+escape(url);
		return '<a href="'+url+'" target="_blank">'+name+'</a>';
	},
	
	// These are used for filtering nodes by namespace when parsing GeoNetwork XML
	hasGmdNamespace: function(){
		var gmd_namespace = 'http://www.isotc211.org/2005/gmd';
		return this.namespaceURI == gmd_namespace;
	},
	
	hasGcoNamespace: function(){
		var gmd_namespace = 'http://www.isotc211.org/2005/gco';
		return this.namespaceURI == gmd_namespace;
	}
	
};