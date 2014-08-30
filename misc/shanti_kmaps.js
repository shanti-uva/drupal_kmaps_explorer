(function ($) {
	
	Drupal.settings.kmaps = {
     type: location.pathname.indexOf('subjects') !== -1 ? "subjects" : "places",
     baseUrl: location.pathname.indexOf('subjects') !== -1 ? "http://subjects.kmaps.virginia.edu" : "http://places.kmaps.virginia.edu",
     mmsUrl: "http://dev-mms.thlib.org",
     placesUrl: "http://places.kmaps.virginia.edu",
     subjectsUrl: "http://subjects.kmaps.virginia.edu",
     placesPath: location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/places',
     subjectsPath: location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/subjects',
     mediabaseURL: "http://mediabase.drupal-dev.shanti.virginia.edu",
     tree: null,
	};
	
  Drupal.behaviors.explore_menu = {
    attach: function (context, settings) {
    	if(context == document ) {
    		//console.log('calling kmtree init');
    		setTimeout(function() { kmap_trees_init(); }, 500);
    	}
    }
  };
  
  function kmap_trees_init() {
  	build_kmap_tree('#km-places-tree', Drupal.settings.kmaps.placesUrl);
  	build_kmap_tree('#km-subjects-tree', Drupal.settings.kmaps.subjectsUrl);
  }
  
  function build_kmap_tree(divId, apiUrl) {
  	console.log(divId, apiUrl);
    $(divId + " div.tree").fancytree({
      extensions: ["glyph", "filter"],
      checkbox: false,
      selectMode: 2,
      debugLevel: 0,
      autoScroll: true,
      // closeOnExternalClick:false,
      // flapMargin:0,
      filter: { mode: 'hide' },
      activate: function(event,data) {
          // console.log("activate " + data.node.key);

          var listitem = $(".title-field[kid='" + data.node.key + "']");
          $('.row_selected').removeClass('row_selected');
          $(listitem).closest('tr').addClass('row_selected')
      },
      glyph: {
          map: {
              doc: "",
              docOpen: "",
              error: "glyphicon glyphicon-warning-sign",
              expanderClosed: "glyphicon glyphicon-plus-sign",
              expanderLazy: "glyphicon glyphicon-plus-sign",
              // expanderLazy: "glyphicon glyphicon-expand",
              expanderOpen: "glyphicon glyphicon-minus-sign",
              // expanderOpen: "glyphicon glyphicon-collapse-down",
              folder: "",
              folderOpen: "",
              loading: "glyphicon glyphicon-refresh"
//              loading: "icon-spinner icon-spin"
          }
      },
      source: {
          url: apiUrl + "/features/fancy_nested.json?view_code=" + $('nav li.form-group input[name=option2]:checked').val(),
          cache: false,
          debugDelay: 1000,
          timeout: 30000,
          error: function(e) {
              notify.warn("networkerror","Error retrieving tree from kmaps server.");
          }
      },
      activate: function(event, data) {
        //alert(JSON.stringify(data.node.title));
        window.location.hash = "id=" + data.node.key;
      },
      focus: function(event, data){ data.node.scrollIntoView(true); },
      renderNode: function(event,data) {
          if (!data.node.isStatusNode) {
              decorateElementWithPopover(data.node.span, data.node);
          }
      },
      cookieId: "kmaps1tree", // set cookies for search-browse tree, the first fancytree loaded
      idPrefix: "kmaps1tree"
   	});
  }
  
  
	function decorateElementWithPopover(elem, node) {
    jQuery(elem).attr('rel', 'popover');
    var path = "<div class='kmap-path'>/" + $.makeArray(node.getParentList(false, true).map(function (x) {
        return x.title;
    })).join("/") + "</div>";
    var caption = ((node.data.caption)?node.data.caption:"");
    var kmapid = "<span class='kmapid-display'>" + node.key + "</span>";
    var lazycounts = "<div class='counts-display'>...</div>";
    jQuery(elem).popover({
            html: true,
            content: function() {
                return path + caption + "<div class='info-wrap' id='infowrap" + node.key +"'>" + lazycounts + "</div>";
            },
            title: function() {
                return node.title + kmapid;
            }
        }
    );
    jQuery(elem).on('shown.bs.popover', function(x) {
    		$(".popover").addClass("searchPop"); // target css styles on search tree popups
        //  var counts = jQuery(elem.parentNode||elem[0].parentNode).find('.info-wrap .counts-display');
        var counts = $("#infowrap" + node.key + " .counts-display");
        // console.log(counts.html());
        // alert(node.key + " --- " + counts);
        $.ajax({
            type: "GET",
            url: Drupal.settings.kmaps.baseUrl + "/features/" + node.key + ".xml",
            dataType: "xml",
            timeout: 30000,
            beforeSend: function(){
                counts.html("<span class='assoc-resources-loading'>loading...</span>");
            },
            error: function(e) {
                counts.html("<i class='glyphicon glyphicon-warning-sign' title='"+ e.statusText);
            },
            success: function (xml) {
                // force the counts to be evaluated as numbers.
                var related_count = Number($(xml).find('related_feature_count').text());
                var description_count = Number($(xml).find('description_count').text());
                var place_count = Number($(xml).find('place_count').text());
                var picture_count = Number($(xml).find('picture_count').text());
                var video_count = Number($(xml).find('video_count').text());
                var document_count = Number($(xml).find('document_count').text());

                if (related_count) counts.html("<span class='associated'><i class='icon shanticon-sources'></i><span class='badge' + (related_count)?' alert-success':''>" + related_count + "</span></span>");
                if (description_count) counts.append("<span class='associated'><i class='icon shanticon-essays'></i><span class='badge' + (description_count)?' alert-success':'>" + description_count + "</span></span>");
                if (place_count) counts.append("<span class='associated'><i class='icon shanticon-places'></i><span class='badge' + (place_count)?' alert-success':'>" + place_count + "</span></span>");
                if (picture_count) counts.append("<span class='associated'><i class='icon shanticon-photos'></i><span class='badge' + (picture_count)?' alert-success':'>" + picture_count + "</span></span>");
                if (video_count) counts.append("<span class='associated'><i class='icon shanticon-audio-video'></i><span class='badge' + (video_count)?' alert-success':'>" + video_count + "</span></span>");
                if (document_count) counts.append("<span class='associated'><i class='icon shanticon-texts'></i><span class='badge' + (document_count)?' alert-success':'>" + document_count + "</span></span>");

            }
        });
    });
    return elem;
};
})(jQuery);