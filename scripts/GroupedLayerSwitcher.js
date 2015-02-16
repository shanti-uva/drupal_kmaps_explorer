/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/** 
 * @requires OpenLayers/Control.js
 */

/**
 * Class: OpenLayers.Control.GroupedLayerSwitcher
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
OpenLayers.Control.GroupedLayerSwitcher = 
  OpenLayers.Class(OpenLayers.Control, {

    /**  
     * Property: activeColor
     * {String}
     */
    activeColor: "darkblue",
    
    /**  
     * Property: layerStates 
     * {Array(Object)} Basically a copy of the "state" of the map's layers 
     *     the last time the control was drawn. We have this in order to avoid
     *     unnecessarily redrawing the control.
     */
    layerStates: null,
    

  // DOM Elements
  
    /**
     * Property: layersDiv
     * {DOMElement} 
     */
    layersDiv: null,
    
    /** 
     * Property: baseLayersDiv
     * {DOMElement}
     */
    baseLayersDiv: null,

    /** 
     * Property: baseLayers
     * {Array(<OpenLayers.Layer>)}
     */
    baseLayers: null,
    
    
    /** 
     * Property: dataLbl
     * {DOMElement} 
     */
    dataLbl: null,
    
    /** 
     * Property: dataLayersDiv
     * {DOMElement} 
     */
    dataLayersDiv: null,
    
    /** 
     * Property: treeLbl
     * {DOMElement} 
     */
    treeLbl: null,
    
    /** 
     * Property: treeLayersDiv
     * {DOMElement} 
     */
    treeLayersDiv: null,

    /** 
     * Property: dataLayers
     * {Array(<OpenLayers.Layer>)} 
     */
    dataLayers: null,

    /** 
     * Property: dataLayers
     * {Array()} 
     */
    dataTree: null,
    
    /** 
     * Property: layerMatches
     * {id, layers} 
     */
    layerMatches: null,


    /** 
     * Property: minimizeDiv
     * {DOMElement} 
     */
    minimizeDiv: null,

    /** 
     * Property: maximizeDiv
     * {DOMElement} 
     */
    maximizeDiv: null,

    /** 
     * Property: maximizeDiv
     * {DOMElement} 
     */
    windowDiv: null,

    /** 
     * Property: baseLayerSliderId
     * {id} 
     */    
    baseLayerSliderId: "slider_base_layer",
    
    /**
     * APIProperty: ascending
     * {Boolean} 
     */
    ascending: true,
    
    /**
     * APIProperty: ascending
     * {Boolean} 
     */
    windowWidth: 350,
 
    /**
     * Constructor: OpenLayers.Control.GroupedLayerSwitcher
     * 
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
        this.layerStates = [];
    },

    /**
     * APIMethod: destroy 
     */    
    destroy: function() {
        
        OpenLayers.Event.stopObservingElement(this.div);

        OpenLayers.Event.stopObservingElement(this.minimizeDiv);
        OpenLayers.Event.stopObservingElement(this.maximizeDiv);

        //clear out layers info and unregister their events 
        this.clearLayersArray("base");
        this.clearLayersArray("data");
        
        this.map.events.un({
            "addlayer": this.redraw,
            "changelayer": this.redraw,
            "removelayer": this.redraw,
            "changebaselayer": this.redraw,
            scope: this
        });
        
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /** 
     * Method: setMap
     *
     * Properties:
     * map - {<OpenLayers.Map>} 
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);

        this.map.events.on({
            "addlayer": this.redraw,
            "changelayer": this.redraw,
            "removelayer": this.redraw,
            "changebaselayer": this.redraw,
            scope: this
        });
    },

    /**
     * Method: draw
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the 
     *     switcher tabs.
     */  
    draw: function() {
        OpenLayers.Control.prototype.draw.apply(this);

        // create layout divs
        this.loadContents();

        // set mode to minimize
        if(!this.outsideViewport) {
            this.minimizeControl();
        }

        // populate div with current info
        this.redraw();
        
        this.maximizeControl();

        return this.div;
    },

    /** 
     * Method: clearLayersArray
     * User specifies either "base" or "data". we then clear all the
     *     corresponding listeners, the div, and reinitialize a new array.
     * 
     * Parameters:
     * layersType - {String}  
     */
    clearLayersArray: function(layersType) {
        var layers = this[layersType + "Layers"];
        if (layers) {
            for(var i=0, len=layers.length; i<len ; i++) {
                var layer = layers[i];
                OpenLayers.Event.stopObservingElement(layer.inputElem);
                if(layer.namesElem){
					OpenLayers.Event.stopObservingElement(layer.namesElem);
				}
                OpenLayers.Event.stopObservingElement(layer.labelSpan);
            }
        }
        this[layersType + "LayersDiv"].innerHTML = "";
        this[layersType + "Layers"] = [];
    },


    /**
     * Method: checkRedraw
     * Checks if the layer state has changed since the last redraw() call.
     * 
     * Returns:
     * {Boolean} The layer state changed since the last redraw() call. 
     */
    checkRedraw: function() {
        var redraw = false;
        if ( !this.layerStates.length ||
             (this.map.layers.length != this.layerStates.length) ) {
            redraw = true;
        } else {
            for (var i=0, len=this.layerStates.length; i<len; i++) {
                var layerState = this.layerStates[i];
                var layer = this.map.layers[i];
                if ( (layerState.name != layer.name) || 
                     (layerState.inRange != layer.inRange) || 
                     (layerState.id != layer.id) || 
                     (layerState.visibility != layer.visibility) ) {
                    redraw = true;
                    break;
                }    
            }
        }    
        return redraw;
    },
    
    inArray: function(element, array) {
    	for (var i = 0; i < array.length; i++) {
			if (array[i] == element) {
				return true;
			}
		}
		return false;
    },
    
    parserAddShowValue: function(parent, idList) {
		var numFound = 0;
		delete parent.parentShow;
		if(parent.categories && parent.categories.category){
			if(parent.categories.category[0]){
				for(var i in parent.categories.category){
					var node = parent.categories.category[i];
					delete node.show;
					if(this.inArray(node.id, idList)){
						node.show = true;
						numFound += 1;
						if(numFound > 0){
							parent.parentShow = true;
						}
					}
					if(node.categories && node.categories.category){
						node = this.parserAddShowValue(node, idList);
					}
				}
			}else if(parent.categories.category){
				var node = parent.categories.category;
				delete node.show;
				if(this.inArray(node.id, idList)){
					node.show = true;
					numFound += 1;
					if(numFound > 0){
						parent.parentShow = true;
					}
				}
				if(node.categories && node.categories.category){
					node = this.parserAddShowValue(node, idList);
				}
			}
		}
    	return parent;
    },
    
    layersTree: null,
    
    buildLayersTreeFunction: function(parent, parentNode, node, isCollapsible) {

		var newElement = null;
		var lastUlElement = null;
		// For shown nodes with shown children, create a <ul> with a checkbox/label
		if(node.show == true){
			if(node.parentShow == true){
				newElement = document.createElement("ul");
			}else{
				newElement = document.createElement("li");				
			}
			
			var layer = this.layerMatches.layers[node.id];
			
			var checked = layer.getVisibility();

			// create input element
			var inputElem = document.createElement("input");
			inputElem.id = this.id + "_input_feature_type_" + node.id;
			inputElem.name = this.id + "_input_feature_type_" + node.id;
			inputElem.type = "checkbox";
			inputElem.value = node.title;
			inputElem.checked = checked;
			inputElem.defaultChecked = checked;

			// create place names toggle element
			var namesElem = document.createElement("input");
			namesElem.id = this.id + "_names_feature_type_" + node.id;
			namesElem.name = this.id + "_names_feature_type_" + node.id;
			namesElem.type = "checkbox";
			namesElem.value = node.title+"_names";
			namesElem.checked = layer.placeNamesShown;
			namesElem.defaultChecked = layer.placeNamesShown;
			
			var labelSpan = document.createElement("span");
			labelSpan.innerHTML = node.title;

			var context = {
				'inputElem': inputElem,
				'namesElem': namesElem,
				'layer': layer,
				'layerSwitcher': this
			};
			OpenLayers.Event.observe(inputElem, "mouseup", 
				OpenLayers.Function.bindAsEventListener(this.onInputClick,
														context)
			);
			OpenLayers.Event.observe(namesElem, "mouseup", 
				OpenLayers.Function.bindAsEventListener(this.onNamesClick,
														context)
			);
			OpenLayers.Event.observe(labelSpan, "click", 
				OpenLayers.Function.bindAsEventListener(this.onInputClick,
														context)
			);
			
			layer.inputElem = inputElem;
			layer.namesElem = namesElem;
			
			this.dataLayers.push({
				'layer': layer,
				'inputElem': inputElem,
				'namesElem': namesElem,
				'labelSpan': labelSpan
			});
			
			newElement.appendChild(inputElem);
			newElement.appendChild(namesElem);
			newElement.appendChild(labelSpan);
			//this.layersTree.appendChild(newElement);
			if(parent.parentShow || parent.show){
				if(!parentNode){
				}else{
					parentNode.appendChild(newElement);
				}
			}else{
				this.layersTree.appendChild(newElement);
			}
			if(node.parentShow == true){
				lastUlElement = newElement;
			}
		// For unshown nodes with shown children, only create a <ul> with a label
		}else if(node.parentShow == true){
			newElement = document.createElement("ul");
			if(isCollapsible){
				newElement.innerHTML = '<span class="layer_list_heading">'+
										'<a href="#" onclick="return toggle_selected_layers_group(this);" class="expanded">'+
										'<img src="css/images/btn-minus-lg.gif" alt="Collapse" class="selected_layers_group_toggle" />'+node.title+'</a></span>';
			}else{
				newElement.innerHTML = '<span class="layer_list_heading">'+node.title+'</span>';
			}
			this.layersTree.appendChild(newElement);
			lastUlElement = newElement;
		}
		
		if(node.categories && node.categories.category){// && node.categories.category.length > 0){
			this.buildLayersTree(node, lastUlElement, false);
		}
			
    },
    
    buildLayersTree: function(parent, parentNode, isCollapsible) {
		var html = '';
		if(parent.categories){
			if(parent.categories.category && parent.categories.category[0]){
				for(var i in parent.categories.category){
					var node = parent.categories.category[i];
					this.buildLayersTreeFunction(parent, parentNode, node, isCollapsible);
				}
			}else if(parent.categories.category){
				var node = parent.categories.category;
				this.buildLayersTreeFunction(parent, parentNode, node, isCollapsible);
			}
		}
    	return '';
    },
    
    getLayerMatches: function(prefix) {
    	var ids = new Array();
    	var layers = {};
		for(var i in map.layers){
			if(map.layers[i].id.indexOf(prefix) == 0){
				var id = map.layers[i].id.substring(prefix.length);
				ids.push(id);
				layers[id] = map.layers[i];
			}
		}
		var out = {};
		out.ids = ids;
		out.layers = layers;
		return out;
    },
    
    /** 
     * Method: redraw
     * Goes through and takes the current state of the Map and rebuilds the
     *     control to display that state. Groups base layers into a 
     *     radio-button group and lists each data layer with a checkbox.
     *
     * Returns: 
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */  
    redraw: function() {
        //if the state hasn't changed since last redraw, no need 
        // to do anything. Just return the existing div.
        if (!this.checkRedraw()) { 
            return this.div; 
        } 

        //clear out previous layers 
        this.clearLayersArray("base");
        this.clearLayersArray("data");
        
        var containsOverlays = false;
        var containsBaseLayers = false;
        var containsTreeOverlays = false;
        
        // Save state -- for checking layer if the map state changed.
        // We save this before redrawing, because in the process of redrawing
        // we will trigger more visibility changes, and we want to not redraw
        // and enter an infinite loop.
        var len = this.map.layers.length;
        this.layerStates = new Array(len);
        for (var i=0; i <len; i++) {
            var layer = this.map.layers[i];
            this.layerStates[i] = {
                'name': layer.name, 
                'visibility': layer.visibility,
                'inRange': layer.inRange,
                'id': layer.id
            };
        }    

		var layersListElement = document.createElement("ul");

        var layers = this.map.layers.slice();
        if (!this.ascending) { layers.reverse(); }
        
        if(this.dataTree != null){
			this.layerMatches = this.getLayerMatches('feature_type_');
			if(this.layerMatches.ids.length > 0){
				containsTreeOverlays = true;
			}
			this.dataTree.category = this.parserAddShowValue(this.dataTree.category, this.layerMatches.ids);
			this.layersTree = document.createElement("div");//changed
			this.buildLayersTree(this.dataTree.category, null, true)
			this.treeLayersDiv.innerHTML = '';
			this.treeLayersDiv.appendChild(this.layersTree);
		}
        
        for(var i=0, len=layers.length; i<len; i++) {
            var layer = layers[i];
            var baseLayer = layer.isBaseLayer;

            if (layer.displayInLayerSwitcher) {
            
                if (baseLayer) {
                    containsBaseLayers = true;
                } else if (layer.id.indexOf('feature_type_') != 0) {
                    containsOverlays = true;
                }
                
             if(baseLayer || layer.id.indexOf('feature_type_') != 0) {
             	
                // only check a baselayer if it is *the* baselayer, check data
                //  layers if they are visible
                var checked = (baseLayer) ? (layer == this.map.baseLayer)
                                          : layer.getVisibility();
    
                // create input element
                var inputElem = document.createElement("input");
                inputElem.id = this.id + "_input_" + layer.name;
                inputElem.name = (baseLayer) ? "baseLayers" : layer.name;
                inputElem.type = (baseLayer) ? "radio" : "checkbox";
                inputElem.value = layer.name;
                inputElem.checked = checked;
                inputElem.defaultChecked = checked;

                if (!baseLayer && !layer.inRange) {
                    inputElem.disabled = true;
                }
                var context = {
                    'inputElem': inputElem,
                    'layer': layer,
                    'layerSwitcher': this
                };
                OpenLayers.Event.observe(inputElem, "mouseup", 
                    OpenLayers.Function.bindAsEventListener(this.onInputClick,
                                                            context)
                );
                
                // create span
                var labelSpan = document.createElement("span");
                if (!baseLayer && !layer.inRange) {
                    labelSpan.style.color = "gray";
                }
                labelSpan.innerHTML = layer.name;
                labelSpan.style.verticalAlign = (baseLayer) ? "bottom" 
                                                            : "baseline";
                OpenLayers.Event.observe(labelSpan, "click", 
                    OpenLayers.Function.bindAsEventListener(this.onInputClick,
                                                            context)
                );
                // create line break
                var br = document.createElement("br");
                
                if(!baseLayer){
					var slider = document.createElement("div");
					slider.id = "slider_" + layer.id;
					slider.title = layer.id;
					slider.style.marginLeft = '3px';
					slider.style.marginRight = '3px';
					slider.style.marginTop = '5px';
					slider.style.marginBottom = '5px';
					slider.style.width = '90%';
					slider.style.fontSize = '10px';
                }
    
                
                var groupArray = (baseLayer) ? this.baseLayers
                                             : this.dataLayers;
                groupArray.push({
                    'layer': layer,
                    'inputElem': inputElem,
                    'labelSpan': labelSpan
                });
                                                     
    
                var groupDiv = (baseLayer) ? this.baseLayersDiv
                                           : this.dataLayersDiv;
                groupDiv.appendChild(inputElem);
                groupDiv.appendChild(labelSpan);
                if(!baseLayer){
					groupDiv.appendChild(slider);
				}
                groupDiv.appendChild(br);
                
                // Initialize the slider and add its event handlers
                if(!baseLayer){
                	var selector = '#'+slider.id;
                	if(jQuery(selector).length > 0){
						jQuery(selector).slider().slider('value', layer.opacity == null ? 100 : layer.opacity*100);
						jQuery(selector).bind("slide slidechange", function(event, ui) {
							var slider = jQuery(event.target);
							var value = slider.slider("value")/100;
							var layer_id = slider.attr('title');
							var layer = map.getLayer(layer_id);
							if(layer){
								layer.setOpacity(value);
							}
						});
						
						// There's a bug with event propagation, so we have to manually add this event observer.
						// The reason for mouseup events not propagating should be found, and a fix based on
						// that should be used instead of this.
						OpenLayers.Event.observe(document.getElementById(slider.id), "mouseup", 
							OpenLayers.Function.bindAsEventListener(function(e){
								jQuery(selector).trigger('mouseup');
							}, this)
						);
					}
				}
            }
          }
        }
        
        // Add the base layer slider
		if(this.map && this.map.baseLayer){

			var slider = document.createElement("div");
			slider.id = this.baseLayerSliderId;
			slider.style.marginLeft = '3px';
			slider.style.marginRight = '3px';
			slider.style.marginTop = '5px';
			slider.style.marginBottom = '5px';
			slider.style.width = '90%';
			slider.style.fontSize = '10px';
			this.baseLayersDiv.appendChild(slider);
			
			var selector = '#'+slider.id;
			var base_layer = this.map.baseLayer;
			jQuery(selector).slider().slider('value', base_layer.opacity == null ? 100 : base_layer.opacity*100);
			jQuery(selector).bind("slide slidechange", function(event, ui) {
				var slider = jQuery(event.target);
				var value = slider.slider("value")/100;
				base_layer.setOpacity(value);
			});
			
			// There's a bug with event propagation, so we have to manually add this event observer.
			// The reason for mouseup events not propagating should be found, and a fix based on
			// that should be used instead of this.
			OpenLayers.Event.observe(document.getElementById(slider.id), "mouseup", 
				OpenLayers.Function.bindAsEventListener(function(e){
					jQuery(selector).trigger('mouseup');
				}, this)
			);
			
		}

        // if no overlays, dont display the overlay label
        //this.dataLbl.style.display = (containsOverlays) ? "" : "none"; 
		this.dataLbl.style.display = (containsOverlays) ? "" : "none";

        // if no overlays, dont display the overlay label
        this.treeLbl.style.display = (containsTreeOverlays) ? "" : "none";      
        
        // if no baselayers, dont display the baselayer label
        this.baseLbl.style.display = (containsBaseLayers) ? "" : "none";        

		this.resizeWindowDiv();

        return this.div;
    },

    /** 
     * Method:
     * A label has been clicked, check or uncheck its corresponding input
     * 
     * Parameters:
     * e - {Event} 
     *
     * Context:  
     *  - {DOMElement} inputElem
     *  - {<OpenLayers.Control.GroupedLayerSwitcher>} layerSwitcher
     *  - {<OpenLayers.Layer>} layer
     */

    onInputClick: function(e) {
        if (!this.inputElem.disabled) {
            if (this.inputElem.type == "radio") {
                this.layer.setOpacity(jQuery('#'+this.layerSwitcher.baseLayerSliderId).slider('value')/100);
                this.inputElem.checked = true;
                this.layer.map.setBaseLayer(this.layer);
            } else {
                this.inputElem.checked = !this.inputElem.checked;
                this.layerSwitcher.updateMap();
            }
        }
        OpenLayers.Event.stop(e);
    },
    
    onNamesClick: function(e) {
        if (this.namesElem) {
			this.namesElem.checked = !this.namesElem.checked;
			if(this.namesElem.checked){
				this.layer.showPlaceNames();
			}else{
				this.layer.hidePlaceNames();
			}
			//this.layer.placeNamesOverride = true;
        }
        OpenLayers.Event.stop(e);
    },
    
    /**
     * Method: onLayerClick
     * Need to update the map accordingly whenever user clicks in either of
     *     the layers.
     * 
     * Parameters: 
     * e - {Event} 
     */
    onLayerClick: function(e) {
        this.updateMap();
    },


    /** 
     * Method: updateMap
     * Cycles through the loaded data and base layer input arrays and makes
     *     the necessary calls to the Map object such that that the map's 
     *     visual state corresponds to what the user has selected in 
     *     the control.
     */
    updateMap: function() {

        // set the newly selected base layer        
        for(var i=0, len=this.baseLayers.length; i<len; i++) {
            var layerEntry = this.baseLayers[i];
            if (layerEntry.inputElem.checked) {
                this.map.setBaseLayer(layerEntry.layer, false);
            }
        }

        // set the correct visibilities for the overlays
        for(var i=0, len=this.dataLayers.length; i<len; i++) {
            var layerEntry = this.dataLayers[i];   
            layerEntry.layer.setVisibility(layerEntry.inputElem.checked);
        }

    },

    /** 
     * Method: maximizeControl
     * Set up the labels and divs for the control
     * 
     * Parameters:
     * e - {Event} 
     */
    maximizeControl: function(e) {

        this.showControls(false);

		/*jQuery(this.div).animate({
			right: "0px"
		}, 500);*/

        if (e != null) {
            OpenLayers.Event.stop(e);                                            
        }
    },
    
    /** 
     * Method: minimizeControl
     * Hide all the contents of the control, shrink the size, 
     *     add the maximize icon
     *
     * Parameters:
     * e - {Event} 
     */
    minimizeControl: function(e) {
		
		/*jQuery(this.div).animate({
			right: (18 - this.windowWidth)+"px" //18 - 290
		}, 500);*/

        this.showControls(true);

        if (e != null) {
            OpenLayers.Event.stop(e);                                            
        }
    },

    /**
     * Method: showControls
     * Hide/Show all LayerSwitcher controls depending on whether we are
     *     minimized or not
     * 
     * Parameters:
     * minimize - {Boolean}
     */
    showControls: function(minimize) {

        //this.maximizeDiv.style.display = minimize ? "" : "none";
        //this.minimizeDiv.style.display = minimize ? "none" : "";

        //this.layersDiv.style.display = minimize ? "none" : "";
    },
    
    /** 
     * Method: loadContents
     * Set up the labels and divs for the control
     */
    loadContents: function() {

        //configure main div
        //this.div.style.position = "absolute";
        //this.div.style.top = "25px";
        //this.div.style.right = "-182px";
        //this.div.style.left = "";
        //this.div.style.width = this.windowWidth+"px";
        this.div.style.height = "auto";
        //this.div.style.fontWeight = "bold";
        //this.div.style.marginTop = "3px";
        //this.div.style.marginLeft = "3px";
        //this.div.style.marginBottom = "3px";
        //this.div.style.fontSize = "smaller";
    
        OpenLayers.Event.observe(this.div, "mouseup", 
            OpenLayers.Function.bindAsEventListener(this.mouseUp, this));
        OpenLayers.Event.observe(this.div, "click",
                      this.ignoreEvent);
        OpenLayers.Event.observe(this.div, "mousedown",
            OpenLayers.Function.bindAsEventListener(this.mouseDown, this));
        OpenLayers.Event.observe(this.div, "dblclick", this.ignoreEvent);


        // layers list div        
        this.layersDiv = document.createElement("div");
        this.layersDiv.id = this.id + "_layersDiv";
        this.layersDiv.style.paddingTop = "5px";
        //this.layersDiv.style.paddingLeft = "5px";
        this.layersDiv.style.paddingBottom = "5px";
        this.layersDiv.style.paddingRight = "12px";
        this.layersDiv.className = "olControlGroupedLayerSwitcherLayersDiv";
        //this.layersDiv.style.backgroundColor = this.activeColor;        

        // had to set width/height to get transparency in IE to work.
        // thanks -- http://jszen.blogspot.com/2005/04/ie6-opacity-filter-caveat.html
        //
        this.layersDiv.style.width = "100%";
        //this.layersDiv.style.height = "100%";
        
        this.baseLbl = document.createElement("div");
        this.baseLbl.innerHTML = OpenLayers.i18n("baseLayer");
        this.baseLbl.style.marginTop = "3px";
        this.baseLbl.style.marginLeft = "3px";
        this.baseLbl.style.marginBottom = "3px";
        this.baseLbl.className = 'olControlGroupedLayerSwitcherLayerHeader';
        
        this.baseLayersDiv = document.createElement("div");
        this.baseLayersDiv.style.paddingLeft = "3px";
        /*OpenLayers.Event.observe(this.baseLayersDiv, "click", 
            OpenLayers.Function.bindAsEventListener(this.onLayerClick, this));
        */
                     

        this.dataLbl = document.createElement("div");
        this.dataLbl.innerHTML = OpenLayers.i18n("overlays");
        this.dataLbl.style.marginTop = "3px";
        this.dataLbl.style.marginLeft = "3px";
        this.dataLbl.style.marginBottom = "3px";
        this.dataLbl.className = 'olControlGroupedLayerSwitcherLayerHeader';

        this.treeLbl = document.createElement("div");
        this.treeLbl.innerHTML = OpenLayers.i18n("Active Feature Types (display/name)");
        this.treeLbl.style.marginTop = "3px";
        this.treeLbl.style.marginLeft = "3px";
        this.treeLbl.style.marginBottom = "3px";
        this.treeLbl.className = 'olControlGroupedLayerSwitcherLayerHeader';
        
        this.dataLayersDiv = document.createElement("div");
        this.dataLayersDiv.style.paddingLeft = "3px";
        
        this.treeLayersDiv = document.createElement("div");
        this.treeLayersDiv.style.paddingLeft = "3px";
        this.treeLayersDiv.className = "olControlGroupedLayerSwitcherLayerTree";

        if (this.ascending) {
            this.layersDiv.appendChild(this.baseLbl);
            this.layersDiv.appendChild(this.baseLayersDiv);
            this.layersDiv.appendChild(this.dataLbl);
            this.layersDiv.appendChild(this.dataLayersDiv);
            this.layersDiv.appendChild(this.treeLbl);
            this.layersDiv.appendChild(this.treeLayersDiv);
        } else {
            this.layersDiv.appendChild(this.dataLbl);
            this.layersDiv.appendChild(this.dataLayersDiv);
            this.layersDiv.appendChild(this.treeLbl);
            this.layersDiv.appendChild(this.treeLayersDiv);
            this.layersDiv.appendChild(this.baseLbl);
            this.layersDiv.appendChild(this.baseLayersDiv);
        }
/*
        OpenLayers.Rico.Corner.round(this.div, {corners: "tl bl",
                                        bgColor: "transparent",
                                        color: this.activeColor,
                                        blend: false});

        OpenLayers.Rico.Corner.changeOpacity(this.layersDiv, 0.75);
*/

        //this.div.appendChild(this.layersDiv);
        
        this.windowDiv = document.createElement("div");
        this.windowDiv.appendChild(this.layersDiv);
        this.windowDiv.className = "olControlGroupedLayerSwitcherWindowDiv";
        //this.windowDiv.style.marginLeft = "18px";
        //this.div.style.right = '18px';
        this.windowDiv.style.overflowX = 'hidden';
        this.windowDiv.style.overflowY = 'auto';

        //var imgLocation = OpenLayers.Util.getImagesLocation();
        var imgLocation = 'img/';
        var sz = new OpenLayers.Size(18,18);        

        // maximize button div
        var img = imgLocation + 'expand_l.png';
        this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MaximizeDiv", 
                                    null, 
                                    sz, 
                                    img, 
                                    "relative");
        //this.maximizeDiv = document.createElement("div");
        //this.maximizeDiv.innerHTML = '<img src="'+img+'" alt="Maximize" />';
        //this.maximizeDiv.style.right = this.maximizeDiv.style.width;
        this.maximizeDiv.style.left = "";
        this.maximizeDiv.style.cssFloat = 'left';
        this.maximizeDiv.style.display = "none";
        OpenLayers.Event.observe(this.maximizeDiv, "click", 
            OpenLayers.Function.bindAsEventListener(this.maximizeControl, this)
        );
        
        this.div.appendChild(this.maximizeDiv);

        // minimize button div
        var img = imgLocation + 'contract_l.png';
        var sz = new OpenLayers.Size(18,18);        
        this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MinimizeDiv", 
                                    null, 
                                    sz, 
                                    img, 
                                    "relative");
        //this.minimizeDiv.style.right = this.maximizeDiv.style.width;
        this.minimizeDiv.style.left = "";
        this.minimizeDiv.style.cssFloat = 'left';
        this.minimizeDiv.style.display = "none";
        OpenLayers.Event.observe(this.minimizeDiv, "click", 
            OpenLayers.Function.bindAsEventListener(this.minimizeControl, this)
        );

        this.div.appendChild(this.minimizeDiv);
        
        this.div.appendChild(this.windowDiv);
    },
    
    /** 
     * Method: resizeWindowDiv
     * 
     * Parameters:
     * evt - {Event} 
     */
    resizeWindowDiv: function() {
        var mapHeight = this.map.div.clientHeight;
        var windowDivHeight = parseInt(this.layersDiv.clientHeight);
        var divTop = parseInt(this.div.offsetTop);
        if(windowDivHeight + divTop > mapHeight){
        	this.windowDiv.style.height = (mapHeight-divTop)+'px';
        }else{
        	this.windowDiv.style.height = 'auto';
        }
    },
    
    /** 
     * Method: ignoreEvent
     * 
     * Parameters:
     * evt - {Event} 
     */
    ignoreEvent: function(evt) {
        OpenLayers.Event.stop(evt);
    },

    /** 
     * Method: mouseDown
     * Register a local 'mouseDown' flag so that we'll know whether or not
     *     to ignore a mouseUp event
     * 
     * Parameters:
     * evt - {Event}
     */
    mouseDown: function(evt) {
        this.isMouseDown = true;
        this.ignoreEvent(evt);
    },

    /** 
     * Method: mouseUp
     * If the 'isMouseDown' flag has been set, that means that the drag was 
     *     started from within the LayerSwitcher control, and thus we can 
     *     ignore the mouseup. Otherwise, let the Event continue.
     *  
     * Parameters:
     * evt - {Event} 
     */
    mouseUp: function(evt) {
        if (this.isMouseDown) {
            this.isMouseDown = false;
            this.ignoreEvent(evt);
        }
    },

    CLASS_NAME: "OpenLayers.Control.GroupedLayerSwitcher"
});
