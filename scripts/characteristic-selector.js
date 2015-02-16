function CharacteristicSelector(){

	// URL for JSON that lists categories in the form [{"name":"Agricultrure","id":4074},{"name":"Agriculture","id":2558}]
	this.listService = "";
	
	// A script on the same subdomain. When a URL is appended to this string, the resulting URL should return the original URL's content.
	// The proxy can be bypassed by using service URLs that don't begin with "http" (and are thus on the subdomain and don't need a proxy)
	this.proxy = "";
	
	// The id attribute of the div which contains all of DOM elements for this 
	this.divId = "";
	
	// The jQuery-wrapped DOM element of the div which contains all of DOM elements for this
	this.div = null;
	
	// The name and label attributes of the hidden field in which the selected ID(s) will be entered
	this.fieldName = "characteristic_name";
	this.fieldLabel = "";
	
	// The name attribute of the hidden input
	this.hiddenIdInputName = "characteristic_id";
	
	// The jQuery-wrapped DOM element of the hidden input which stores the selected ID(s)
	this.hiddenIdInput = null;
	
	// The jQuery-wrapped DOM element of the autocomplete text field input
	this.autocompleteInput = null;
	
	// Whether or not a tree (and the accompanying tree link) should be used 
	this.hasTree = true;
	
	// Whether the user can select only one category from the tree (if present) or select multiple categories
	this.singleSelectionTree = false;
	
	// The id attribute of the div which contains the tree popup
	this.treePopupId = null;
	
	// The jQuery-wrapped DOM element of the div which contains the tree popup
	this.treePopup = null;
	
	// The jQuery-wrapped DOM element that lists the names selected from the tree
	this.treeNames = null;
	
	// The jQuery-wrapped DOM element that removes the names selected from the tree
	this.treeRemove = null;
	
	this.treeHtml = null;
	this.treeLoaded = false;
	
	// See the attribute documentation above for explanations of these arguments
	this.init = function(divId, options){
		if(options.fieldName)			{ this.fieldName = options.fieldName; }
		if(options.fieldLabel)			{ this.fieldLabel = options.fieldLabel; }
		if(options.proxy)				{ this.proxy = options.proxy; }
		if(options.listService)			{ this.listService = options.listService; }
		this.divId = divId;
		this.div = jQuery('#'+divId);
		this.div.html(
			(this.fieldLabel ? '<label for="'+this.fieldName+'">'+this.fieldLabel+'</label>' : '')+
			'<input type="text" name="'+this.fieldName+'" id="'+this.fieldName+'" />'+
			'<input type="hidden" name="'+this.hiddenIdInputName+'" id="'+this.hiddenIdInputName+'" />'
		);
		this.autocompleteInput = this.div.find('#'+this.fieldName);
		this.hiddenIdInput = this.div.find('#'+this.hiddenIdInputName);
		
		// Request the service through a proxy if it's not local
		if(this.listService.substr(0,4) == 'http'){
			this.listService = this.proxy+this.listService;
		}
		
		var thisCharacteristicSelector = this;
		jQuery.getJSON(this.listService, function(data){
			thisCharacteristicSelector.autocompleteInput.autocomplete(data, {
				matchContains: true,
				mustMatch: true,
				max: 20,
				formatItem: thisCharacteristicSelector.autocompleteFormatItem,
				formatMatch: thisCharacteristicSelector.autocompleteFormatMatch,
				formatResult: thisCharacteristicSelector.autocompleteFormatItem
			});
			thisCharacteristicSelector.autocompleteInput.blur(function(){
				if(!jQuery.trim(jQuery(this).val())){
					thisCharacteristicSelector.hiddenIdInput.val('');
				}
				return true;
			});
			thisCharacteristicSelector.autocompleteInput.result(thisCharacteristicSelector.autocompleteCallback);
			thisCharacteristicSelector.objectList = [];
			for(var i in data){
				thisCharacteristicSelector.objectList[data[i].id] = data[i];
			}
		});
		if(this.selectedObjects && this.selectedObjects.length == 1){
			this.autocompleteInput.val(this.selectedObjects[0].name);
			this.hiddenIdInput.val(this.selectedObjects[0].id);
		}
		if(this.hasTree){
			this.div.append('<br /><span class="selector-text">Input characteristic above or <a href="#" class="tree-link">select from list</a>'+
				'<span class="tree-names"></span> <a href="#" class="tree-remove">(remove)</a></span><span class="tree-loading" style="float:right;"></span>');
			this.treePopupId = this.divId+"_model_searcher_tree_popup";
			this.treeLink = this.div.find('.tree-link');
			this.treeRemove = this.div.find('.tree-remove');
			this.treeNames = this.div.find('.tree-names');
			this.treeLoading = this.div.find('.tree-loading');
			this.treeRemove.hide();
			this.treeRemove.click(function(){
				thisCharacteristicSelector.treeNames.html('');
				thisCharacteristicSelector.treeRemove.hide();
				thisCharacteristicSelector.hiddenIdInput.val('');
				return false;
			});
			this.treeLink.click(function(){
				if(thisCharacteristicSelector.treeLoaded){
					jQuery('#'+thisCharacteristicSelector.treePopupId).show();
				}else{
					thisCharacteristicSelector.treeLoading.html(' <img src="../images/ajax-loader.gif" />');
					jQuery.getJSON(thisCharacteristicSelector.listService, function(data){
						thisCharacteristicSelector.treeHtml = thisCharacteristicSelector.formatData(data);
						thisCharacteristicSelector.loadPopup();
						thisCharacteristicSelector.treeHtml = null;
						data = null;
						thisCharacteristicSelector.treeLoading.html('');
						thisCharacteristicSelector.treeLoaded = true;
					});
				}
				return false;
			});
		}
	};
	
	this.loadPopup = function(){
		thisCharacteristicSelector.treePopup = jQuery().thlPopup({
			id: thisCharacteristicSelector.treePopupId,
			header: '',
			content: '',
			footer: '',
			width: 500,
			closeWith: 'hide'
		});
		var content = '<div style="font-size: 12px; line-height: 1.1em; height: 500px;"><br />'+
			'<div>Please select one or more characteristics from the list below.</div><br />'+
			'<form method="get" action="">'+
			'<div'+(thisCharacteristicSelector.singleSelectionTree ? ' class="single_selection_tree"' : '' )+
			' style="max-height: 400px; height:auto !important; height: 400px; overflow: auto;">'+
			thisCharacteristicSelector.treeHtml+
			'</div>'+
			'<br /><input type="submit" value="Select" /> <input type="button" value="Cancel" onclick="jQuery(this).parents(\'.draggable-popup:first\').hide(); return false;" />'+
			'</form>'+
			'</div>'
			;
		thisCharacteristicSelector.treePopup.setContent(content);
		thisCharacteristicSelector.treePopup.div.find('form:first').submit(function(){
			var ids = [];
			jQuery(this).find(':checkbox:checked').each(function(){
				ids.push(jQuery(this).val());
			});
			if(ids.length == 0){
			}else{
				var names = [];
				for(var i in ids){
					names.push(thisCharacteristicSelector.objectList[ids[i]].name);
				}
				thisCharacteristicSelector.hiddenIdInput.val(ids.join(','));
				thisCharacteristicSelector.autocompleteInput.val('');
				thisCharacteristicSelector.treeNames.html(':<br />'+names.join(', '));
				thisCharacteristicSelector.treeRemove.show();
			}
			jQuery('#'+thisCharacteristicSelector.treePopupId).hide();
			return false;
		});
		// For large trees, keeping this in memory can cause performance issues, so we'll set it to null
		// and use thisCharacteristicSelector.treePopupId when we need it.
		thisCharacteristicSelector.treePopup = null;
	};
	
	this.resetFields = function(){
		this.autocompleteInput.val('');
		this.hiddenIdInput.val('');
		this.treeNames.html('');
		this.treeRemove.hide();
		jQuery('#'+this.treePopupId).hide();
	};
	
	this.autocompleteFormatItem = function(item, i, max){
		return jQuery.trim(item.name);
	};
	
	this.autocompleteFormatMatch = function(item, i, max){
		return jQuery.trim(item.name);
	};
	
	this.autocompleteFormatResult = function(item, i, max){
		return item.id;
	};
	
	var thisCharacteristicSelector = this;
	this.autocompleteCallback = function(event, data, formatted) {
		if(data){
			thisCharacteristicSelector.hiddenIdInput.val(data.id);
		}else{
			thisCharacteristicSelector.hiddenIdInput.val('');
		}
		thisCharacteristicSelector.treeNames.html('');
		thisCharacteristicSelector.treeRemove.hide();
		return false;
	};
	
	this.formatData = function(data){
		html = '<ul>';
		for(var i in data){
			var item = data[i];
			var element_id = this.fieldName+'_'+item.id;
			html += '<li><input type="checkbox" value="'+item.id+'" id="'+element_id+'" /> <label for='+element_id+'>'+item.name+'</label></li>';
		}
		html += '</ul>';
		return html;
	};

};