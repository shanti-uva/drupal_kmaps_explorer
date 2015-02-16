// Custom OpenLayers Classes ------------------------------------------------------

OpenLayers.Control.Hover = OpenLayers.Class(OpenLayers.Control, {
	defaultHandlerOptions: {
		'delay': 500,
		'pixelTolerance': null,
		'stopMove': false
	},

	initialize: function(options) {
		this.handlerOptions = OpenLayers.Util.extend(
			{}, this.defaultHandlerOptions
		);
		OpenLayers.Control.prototype.initialize.apply(
			this, arguments
		); 
		this.handler = new OpenLayers.Handler.Hover(
			this,
			{'pause': this.onPause, 'move': this.onMove},
			this.handlerOptions
		);
	}, 

	onPause: function(evt) {},

	onMove: function(evt) {},
	
	CLASS_NAME: "OpenLayers.Control.Hover"
});

OpenLayers.Control.FeatureInfo = OpenLayers.Class(OpenLayers.Control, {

    
    /**
     * Constructor: OpenLayers.Control.Navigation
     * Create a new navigation control
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *                    the control
     */
    initialize: function(options) {
    	this.handlers = {};
		this.handlerOptions = OpenLayers.Util.extend(
			{}, this.defaultHandlerOptions
		);
		OpenLayers.Control.prototype.initialize.apply(
			this, arguments
		); 
		this.handler = new OpenLayers.Handler.Hover(
			this,
			{'pause': this.onPause, 'move': this.onMove},
			this.handlerOptions
		);
    },
    
	defaultHandlerOptions: {
		'delay': 500,
		'pixelTolerance': null,
		'stopMove': false
	},

	onPause: function(evt) {},

	onMove: function(evt) {},

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        this.deactivate();
        OpenLayers.Control.prototype.destroy.apply(this,arguments);
    },
    
    /**
     * Method: activate
     */
    activate: function() {   
        this.handlers.click.activate();
        return OpenLayers.Control.prototype.activate.apply(this,arguments);
    },

    /**
     * Method: deactivate
     */
    deactivate: function() {
        this.handlers.click.deactivate();
        return OpenLayers.Control.prototype.deactivate.apply(this,arguments);
    },
    
    /**
     * Method: draw
     */
    draw: function() {
        // disable right mouse context menu for support of right click events
        if (this.handleRightClicks) {
            this.map.div.oncontextmenu = function () { return false;};
        }

        var clickCallbacks = { 
            'click': this.defaultClick
        };
        var clickOptions = {
            'single': true, 
            'double': false,
            'stopDouble': true
        };
        this.handlers.click = new OpenLayers.Handler.Click(
            this, clickCallbacks, clickOptions
        );
        this.activate();
    },

    /**
     * Method: defaultClick 
     * 
     * Parameters:
     * evt - {Event} 
     */
    defaultClick: function (evt){},

    CLASS_NAME: "OpenLayers.Control.FeatureInfo"
});


OpenLayers.Control.ZoomOutFromPoint = OpenLayers.Class(OpenLayers.Control, {

    
    /**
     * Constructor: OpenLayers.Control.Navigation
     * Create a new navigation control
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *                    the control
     */
    initialize: function(options) {
        this.handlers = {};
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        this.deactivate();
        OpenLayers.Control.prototype.destroy.apply(this,arguments);
    },
    
    /**
     * Method: activate
     */
    activate: function() {   
        this.handlers.click.activate();
        return OpenLayers.Control.prototype.activate.apply(this,arguments);
    },

    /**
     * Method: deactivate
     */
    deactivate: function() {
        this.handlers.click.deactivate();
        return OpenLayers.Control.prototype.deactivate.apply(this,arguments);
    },
    
    /**
     * Method: draw
     */
    draw: function() {
        // disable right mouse context menu for support of right click events
        if (this.handleRightClicks) {
            this.map.div.oncontextmenu = function () { return false;};
        }

        var clickCallbacks = { 
            'click': this.defaultClick
        };
        var clickOptions = {
            'single': true, 
            'double': false
        };
        this.handlers.click = new OpenLayers.Handler.Click(
            this, clickCallbacks, clickOptions
        );
        this.activate();
    },

    /**
     * Method: defaultClick 
     * 
     * Parameters:
     * evt - {Event} 
     */
    defaultClick: function (evt) {
        var newCenter = this.map.getLonLatFromViewPortPx( evt.xy ); 
        this.map.setCenter(newCenter, this.map.zoom - 1);
    },

    CLASS_NAME: "OpenLayers.Control.ZoomOutFromPoint"
});



OpenLayers.Control.LonLatDialog = OpenLayers.Class(OpenLayers.Control, {

    
    /**
     * Constructor: OpenLayers.Control.Navigation
     * Create a new navigation control
     * 
     * Parameters:
     * options - {Object} An optional object whose properties will be set on
     *                    the control
     */
    initialize: function(options) {
        this.handlers = {};
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        this.deactivate();
        OpenLayers.Control.prototype.destroy.apply(this,arguments);
    },
    
    /**
     * Method: activate
     */
    activate: function() {   
        this.handlers.click.activate();
        return OpenLayers.Control.prototype.activate.apply(this,arguments);
    },

    /**
     * Method: deactivate
     */
    deactivate: function() {
        this.handlers.click.deactivate();
        return OpenLayers.Control.prototype.deactivate.apply(this,arguments);
    },
    
    /**
     * Method: draw
     */
    draw: function() {
        // disable right mouse context menu for support of right click events
        if (this.handleRightClicks) {
            this.map.div.oncontextmenu = function () { return false;};
        }

        var clickCallbacks = { 
            'click': this.defaultClick
        };
        var clickOptions = {
            'single': true, 
            'double': false
        };
        this.handlers.click = new OpenLayers.Handler.Click(
            this, clickCallbacks, clickOptions
        );
        this.activate();
    },

    /**
     * Method: defaultClick 
     * 
     * Parameters:
     * evt - {Event} 
     */
    defaultClick: function (evt) {
        lonlat = map.getLonLatFromPixel(evt.xy).transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
        jQuery('#lon_lat_popup_lat').text(lonlat.lat.toFixed(6));
        jQuery('#lon_lat_popup_lon').text(lonlat.lon.toFixed(6));
        jQuery('#lon_lat_popup').dialog('open');
    },

    CLASS_NAME: "OpenLayers.Control.LonLatDialog"
});




OpenLayers.Control.Dropdown = OpenLayers.Class(OpenLayers.Control, {
    /**
     * Property: type
     * {Integer} OpenLayers.Control.TYPE_BUTTON.
     */
    //type: OpenLayers.Control.TYPE_BUTTON,
    
    /**
     * Method: trigger
     * Called by a control panel when the button is clicked.
     */
    trigger: function() {},
    onchange: function() {},
    element_id: 'drop_down_control',
    options: null,
    selected: null,
    
    /**
    * Method: draw 
    *
    * Parameters:
    * px - {<OpenLayers.Pixel>} 
    */
    
    draw: function(px) {
        if (this.div == null) {
            this.div = OpenLayers.Util.createDiv(this.id);
            this.div.className = this.displayClass;
            if (!this.allowSelection) {
                this.div.className += " olControlNoSelect";
                this.div.setAttribute("unselectable", "on", 0);
                this.div.onselectstart = function() { return(false); }; 
            }    
            if (this.title != "") {
                this.div.title = this.title;
            }
        }
        if (px != null) {
            this.position = px.clone();
        }
        var select_element = document.createElement("select");
        select_element.id = this.element_id;
        select_element.onchange = this.onchange;
        var i = 0;
        for(value in this.options){
        	select_element.options[i] = new Option(this.options[value], value, value==this.selected);
        	i++;
        }
        this.div.appendChild(select_element);
        this.moveTo(this.position);
        return this.div;
    },
    

    CLASS_NAME: "OpenLayers.Control.Dropdown"
});



OpenLayers.Control.DropdownBox = OpenLayers.Class(OpenLayers.Control.Button, {

    /**
     * Property: type
     * {Integer} OpenLayers.Control.TYPE_BUTTON.
     */
    type: OpenLayers.Control.TYPE_BUTTON,
    /**
     * Method: trigger
     * Called by a control panel when the button is clicked.
     */
    trigger: function() {},
    onclick: function() {},
    element_id: null,
    control_id: null,
    control_title: '',
    box_id: null,
    box_content: '',
    allowSelection: false,
    collapseImage: '',
    expandImage: '',
    draw: function(px) {
		if (this.div == null) {
			this.div = OpenLayers.Util.createDiv(this.id);
			this.div.className = this.displayClass;
			if (!this.allowSelection) {
				this.div.className += " olControlNoSelect";
				this.div.setAttribute("unselectable", "on", 0);
				this.div.onselectstart = function() { return(false); }; 
			}
			if (this.title != "") {
				this.div.title = this.title;
			}
		}
		if (px != null) {
			this.position = px.clone();
		} 
		if (this.element_id) {
			this.div.id = this.element_id;
		}
		var control_element = document.createElement("div");
		control_element.className = 'olControlDropdownBoxControl';
		if(this.control_id){
			control_element.id = this.control_id;
		}
		control_element.onclick = this.onclick;
		var plus_minus_element = document.createElement("div");
		plus_minus_element.className = 'olControlDropdownBoxPlusMinus';
		var plus_minus_image = document.createElement("img");
		plus_minus_image.src = this.expandImage;
		plus_minus_image.style.display = 'inline';
		plus_minus_image.style.margin = '5px 3px 0 0';
		plus_minus_element.appendChild(plus_minus_image);
		control_element.appendChild(plus_minus_element);
		control_element.appendChild(document.createTextNode(this.control_title));
		var box_element = document.createElement("div");
		box_element.className = 'olControlDropdownBoxBox';
		if(this.box_id){
			box_element.id = this.box_id;
		}
		box_element.innerHTML = this.box_content;
		box_element.style.display = 'none';
				/*control_element.className += " olControlNoSelect";
				control_element.setAttribute("unselectable", "on", 0);
				control_element.onselectstart = function() { return(false); };
				box_element.className += " olControlNoSelect";
				box_element.setAttribute("unselectable", "on", 0);
				box_element.onselectstart = function() { return(false); };*/
		this.div.appendChild(control_element);
		this.div.appendChild(box_element);
		this.moveTo(this.position);
		return this.div;
    },
    

    CLASS_NAME: "OpenLayers.Control.DropdownBox"
});



OpenLayers.Popup.Fixed = OpenLayers.Class(OpenLayers.Popup, {

    initialize:function(id, lonlat, contentSize, contentHTML, closeBox, closeBoxCallback) {
        if (id == null) {
            id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
        }

        this.id = id;
        this.lonlat = lonlat;

        this.contentSize = (contentSize != null) ? contentSize 
                                  : new OpenLayers.Size(
                                                   OpenLayers.Popup.WIDTH,
                                                   OpenLayers.Popup.HEIGHT);
        if (contentHTML != null) { 
             this.contentHTML = contentHTML;
        }
        this.backgroundColor = OpenLayers.Popup.COLOR;
        this.opacity = OpenLayers.Popup.OPACITY;
        this.border = OpenLayers.Popup.BORDER;

        this.div = OpenLayers.Util.createDiv(this.id, null, null, 
                                             null, null, null, "hidden");
        this.div.className = this.displayClass;
        
        var groupDivId = this.id + "_GroupDiv";
        this.groupDiv = OpenLayers.Util.createDiv(groupDivId, null, null, 
                                                    null, "relative", null,
                                                    "hidden");

        var id = this.div.id + "_contentDiv";
        this.contentDiv = OpenLayers.Util.createDiv(id, null, this.contentSize.clone(), 
                                                    null, "relative");
        this.contentDiv.className = this.contentDisplayClass;
        this.groupDiv.appendChild(this.contentDiv);
        this.div.appendChild(this.groupDiv);

        if (closeBox) {
            this.addCloseBox(closeBoxCallback);
        } 

        this.registerEvents();
    },/*
    draw: function(px) {
        if (px == null) {
            if ((this.lonlat != null) && (this.map != null)) {
                px = this.map.getLayerPxFromLonLat(this.lonlat);
            }
        }
        
        //listen to movestart, moveend to disable overflow (FF bug)
        if (OpenLayers.Util.getBrowserName() == 'firefox') {
            this.map.events.register("movestart", this, function() {
                var style = document.defaultView.getComputedStyle(
                    this.contentDiv, null
                );
                var currentOverflow = style.getPropertyValue("overflow");
                if (currentOverflow != "hidden") {
                    this.contentDiv._oldOverflow = currentOverflow;
                    this.contentDiv.style.overflow = "hidden";
                }
            });
            this.map.events.register("moveend", this, function() {
                var oldOverflow = this.contentDiv._oldOverflow;
                if (oldOverflow) {
                    this.contentDiv.style.overflow = oldOverflow;
                    this.contentDiv._oldOverflow = null;
                }
            });
        }

        this.moveTo(px);
        if (!this.autoSize && !this.size) {
            this.setSize(this.contentSize);
        }
        this.setBackgroundColor();
        this.setOpacity();
        this.setBorder();
        this.setContentHTML();
        
        if (this.panMapIfOutOfView) {
            this.panIntoView();
        }    

        return this.div;
    },*/
	//updatePosition: function() {},
	//moveTo: function() {},

    CLASS_NAME: "OpenLayers.Popup.Fixed"
});
