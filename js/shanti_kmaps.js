
(function ($) {
	console.info(Drupal.settings);
	Drupal.settings.kmaps = {
     type: location.pathname.indexOf('subjects') !== -1 ? "subjects" : "places",
     baseUrl: location.pathname.indexOf('subjects') !== -1 ? "http://subjects.kmaps.virginia.edu" : "http://places.kmaps.virginia.edu",
     mmsUrl: "http://dev-mms.thlib.org",
     placesUrl: "http://places.kmaps.virginia.edu",
     subjectsUrl: "http://subjects.kmaps.virginia.edu",
     placesPath: location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/places',
     subjectsPath: location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/subjects',
     mediabaseURL: "http://mediabase.drupal-dev.shanti.virginia.edu",
     templateURL: 'kmap/template',
     tree: null,
	};
	
	
  Drupal.behaviors.explore_menu = {
    attach: function (context, settings) {
    	if(context == document ) {
    		bbq_init();
    		setTimeout(function() { kmap_trees_init(); }, 500);
    	}
    }
  };
  
  function bbq_init() {
  	$(window).bind('hashchange', function(e) {
	    var hash_obj = $.deparam.fragment();
	    //Set the hash to the global settings object
	    Drupal.settings.kmaps.hash_obj = hash_obj;
	    var fragment = $.param.fragment();
	    //check if we are in the overlay and quit
	    if ( fragment !== undefined && fragment.indexOf('overlay') !== -1 ) { return; };
	
	    if (location.pathname.indexOf('subjects') !== -1) {
	      Drupal.settings.kmaps.app = 'subject';
	      var mHash = hash_obj.id || '2823';
	      var mUrl = Drupal.settings.kmaps.baseUrl + "/features/" + mHash + ".json";
	      kmap_load_template();
	      $.get(mUrl, processSubjectsData);
	    }
	
	    if (location.pathname.indexOf('places') !== -1) {
	      Drupal.settings.kmaps.app = 'place';
	      var mHash = hash_obj.id || '13735';
	      var mUrl = Drupal.settings.kmaps.placesUrl + "/features/" + mHash + ".json";
	      kmap_load_template();
	      $.get(mUrl, processPlacesData);
	    }
	
	  });
	
	  $(window).trigger( 'hashchange' );
  }
  
  function kmap_trees_init() {
  	build_kmap_tree('#km-places-tree', Drupal.settings.kmaps.placesUrl);
  	build_kmap_tree('#km-subjects-tree', Drupal.settings.kmaps.subjectsUrl);
  }
  
  function build_kmap_tree(divId, apiUrl) {
  	//console.log(divId, apiUrl);
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
          $(listitem).closest('tr').addClass('row_selected');
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
        window.location.hash = "kmid=" + data.node.key;
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
	}
		
	/**
	 * Loads template for content area
	 */
	function kmap_load_template() {
		if($('.main-content.kmap-template').length > 0) { return; } // if already loaded do nothing
		
		tempurl = location.origin + Drupal.settings.basePath + Drupal.settings.kmaps.templateURL;
		$.ajax({
			url: tempurl,
			dataType: 'json',
			success: function(data) {
				$('main.main-wrapper article.main-content').replaceWith(data.template);
			},
			error: function( jqXHR, textStatus, errorThrown ) {
				console.log('error loading template: ', errorThrown);
			},
			async:false
		});
	}
		
	/**
	 * Function that will process the returned data and create the various sections of the page.
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	function processSubjectsData(data) {
	  //Global variable to hold all the related resources count
	  shanti = {
	    shanti_related_counts: data.feature.associated_resources,
	    shanti_id: data.feature.id,
	    shanti_data: data
	  };
	
	  //Remove all content from show related pages
	  $('.show-related-pages').empty();
	  $('.content-section article.tab-pane').empty();
	
	  //Removes previous binds for the show related tabs.
	  $('a[href="#tab-overview"]').unbind('show.bs.tab');
	
	  //Removes previous binds for the show related tabs.
	  $('a[href="#tab-subjects"]').unbind('show.bs.tab');
	
	  //Removes previous binds for the show related photos tab.
	  $('a[href="#tab-photos"]').unbind('show.bs.tab');
	
	  //Removes previous binds for the show related audio-video tab.
	  $('a[href="#tab-audio-video"]').unbind('show.bs.tab');
	
	  //Remove previous binds for the show related places tab.
	  $('a[href="#tab-places"]').unbind('show.bs.tab');
	
	  //Remove previous binds for the show related texts tab.
	  $('a[href="#tab-texts"]').unbind('show.bs.tab');
	
	  //Remove previous binds for the show related essays tab.
	  $('a[href="#tab-essays"]').unbind('show.bs.tab');
	
	  //Change the page title to that of the new page being loaded
	  $(".page-title span").html(data.feature.header);
	
	  //Remove all the active classes from the pills so that their bind functions can trigger
	  $(".content-resources ul.nav-pills li").removeClass("active");
	
	  //Make the overview tab the default tab on URL Change.
	  //$("a[href='#tab-overview']").click();
	
	  //Remove all elements from Breadcrumbs and start adding them again.
	  $("ol.breadcrumb li").remove();
	  $("ol.breadcrumb").append('<li><a href="">Subjects:</a></li>');
	  $.each(data.feature.ancestors, populateBreadcrumbs);
	
	  //First Hide all the elements from the left hand navigation and then show relevant ones
	  $(".content-resources ul.nav-pills li").hide();
	
	  //Proces the solr index for more left hand content
	  var solrURL = 'http://kidx.shanti.virginia.edu/solr/kmindex/select?q=kmapid:subjects-' + Drupal.settings.kmaps.hash_obj.id + '&fq=&start=0&facets=on&group=true&group.field=service&group.facet=true&group.ngroups=true&group.limit=0&wt=json';
	  $.get(solrURL, processSubjectsSolr);
	
	  //Get the element that we want and display to overview.
	  //Show overview tab on the left hand column
	  if (data.feature) {
	    $(".content-resources ul.nav-pills li.overview").show();
	    $('a[href="#tab-overview"]').one('show.bs.tab', function(e) {
	      //Push a state to the url hash so we can bookmark it
	      $.bbq.pushState({que: $(e.target).attr('href').substr(1)});
	      $.bbq.removeState('nid');
	
	      var $tabOverview = $("#tab-overview");
	      $tabOverview.empty();
	      $tabOverview.append('<h6>' + data.feature.header + '</h6>');
	      if (data.feature.summaries.length > 0) {$tabOverview.append(data.feature.summaries[0].content)}
	      if (data.feature.illustrations.length > 0 && data.feature.illustrations[0].type != 'external') {
	        $.get(data.feature.illustrations[0].url, showOverviewImage);
	      }
	    });
	  }
	
	  //Related content section
	  if (data.feature.associated_resources.related_feature_count > 0) {
	    $("ul.nav li a[href='#tab-subjects'] .badge").text(data.feature.associated_resources.related_feature_count);
	    $(".content-resources ul.nav-pills li.subjects").show();
	    $('a[href="#tab-subjects"]').unbind('show.bs.tab').one('show.bs.tab', function(e) {
	      //Push a state to the url hash so we can bookmark it
	      $.bbq.pushState({que: $(e.target).attr('href').substr(1)});
	      $.bbq.removeState('nid');
	
	      var $tabRelated = $("#tab-subjects");
	      $tabRelated.empty();
	      $tabRelated.append('<h6>' + data.feature.header + '</h6>');
	      var relatedUrl = Drupal.settings.kmaps.baseUrl + "/features/" + data.feature.id + "/related.json";
	      $.get(relatedUrl, relatedResources);
	    });
	  }
	
	  //Related essays (descriptions) section
	  if (data.feature.associated_resources.description_count > 0) {
	    $("ul.nav li a[href='#tab-essays'] .badge").text(data.feature.associated_resources.description_count);
	    $(".content-resources ul.nav-pills li.essays").show();
	    $('a[href="#tab-essays"]').unbind('show.bs.tab').one('show.bs.tab', function(e) {
	      //Push a state to the url hash so we can bookmark it
	      $.bbq.pushState({que: $(e.target).attr('href').substr(1)});
	      $.bbq.removeState('nid');
	      
	      var $tabEssays = $("#tab-essays");
	      $tabEssays.empty();
	      var essaysURL = Drupal.settings.kmaps.baseUrl + '/features/' + data.feature.id + '/descriptions.json';
	      $.get(essaysURL, relatedEssays);
	    });
	  }
	
	  //Related Places section
	  if (data.feature.associated_resources.place_count > 0) {
	    $("ul.nav li a[href='#tab-places'] .badge").text(data.feature.associated_resources.place_count);
	    $(".content-resources ul.nav-pills li.places").show();
	    $('a[href="#tab-places"]').unbind('show.bs.tab').one('show.bs.tab', function(e) {
	      //Push a state to the url hash so we can bookmark it
	      $.bbq.pushState({que: $(e.target).attr('href').substr(1)});
	      $.bbq.removeState('nid');
	
	      var $tabPlaces = $("#tab-places");
	      $tabPlaces.empty();
	      var placesURL = Drupal.settings.kmaps.placesUrl + '/topics/' + data.feature.id + '.json';
	      shanti.placesURL = placesURL;
	      $.get(placesURL, relatedPlaces);
	    });
	  }
	
	  //Related Photos (picture) section
	  if (data.feature.associated_resources.picture_count > 0) {
	    $("ul.nav li a[href='#tab-photos'] .badge").text(data.feature.associated_resources.picture_count);
	    $(".content-resources ul.nav-pills li.photos").show();
	    $('a[href="#tab-photos"]').unbind('show.bs.tab').one('show.bs.tab', function(e) {
	      //Push a state to the url hash so we can bookmark it
	      $.bbq.pushState({que: $(e.target).attr('href').substr(1)});
	      $.bbq.removeState('nid');
	
	      var $tabPhotos = $("#tab-photos");
	      $tabPhotos.empty();
	      $tabPhotos.append('<h6>Photographs in ' + data.feature.header + '</h6>');
	      var photosURL = Drupal.settings.kmaps.mmsUrl + "/topics/" + data.feature.id + "/pictures.json?per_page=30";
	      shanti.photosURL = photosURL;
	      shanti.feature_id = data.feature.id;
	      //$.get(photosURL, relatedPhotos);
	      $.ajax({
	        url: photosURL,
	        beforeSend: function(xhr) {
	          $('li.photos i').removeClass('icon shanticon-photos').addClass('fa fa-spinner fa-spin');
	        }
	      })
	      .done(relatedPhotos)
	      .always(function() {
	        $('li.photos i').removeClass('fa fa-spinner fa-spin').addClass('icon shanticon-photos');
	      });
	    });
	  }
	
	  //Related Audio-Video (videos) section
	  // if (true) {
	  //   $("ul.nav li a[href='#tab-audio-video'] .badge").text(data.feature.associated_resources.video_count == 0 ? '1' : data.feature.associated_resources.video_count);
	  //   $(".content-resources ul.nav-pills li.audio-video").show();
	  //   $('a[href="#tab-audio-video"]').one('show.bs.tab', function(e) {
	  //     var $tabAudioVideo = $("#tab-audio-video");
	  //     $tabAudioVideo.empty();
	  //     $tabAudioVideo.append('<h6>' + 'Videos in ' + data.feature.header + '</h6>');
	  //     var audioVideoUrl = 'http://mediabase.drupal-dev.shanti.virginia.edu/services/subject/' + data.feature.id;
	  //     $.get(audioVideoUrl, relatedVideos);
	  //   });
	  // }
	
	  //Related Texts section
	  if (data.feature.associated_resources.document_count > 0) {
	    $("ul.nav li a[href='#tab-texts'] .badge").text(data.feature.associated_resources.document_count);
	    $(".content-resources ul.nav-pills li.texts").show();
	    $('a[href="#tab-texts"]').unbind('show.bs.tab').one('show.bs.tab', function(e) {
	      //Push a state to the url hash so we can bookmark it
	      $.bbq.pushState({que: $(e.target).attr('href').substr(1)});
	      $.bbq.removeState('nid');
	      
	      var $tabTexts = $("#tab-texts");
	      $tabTexts.empty();
	      $tabTexts.append('<h6>Texts in ' + data.feature.header + '</h6>');
	      var textsURL = Drupal.settings.kmaps.mmsUrl + "/topics/" + data.feature.id + "/documents.json";
	      $.get(textsURL, relatedTexts);
	    });
	  }
	  // var testUrl = location.href.substr(0, location.href.lastIndexOf('subjects')) + 'sharedshelf/api/projects/534/assets/filter/fd_24809_lookup.links.source_id/' + data.feature.id + '.json';
	  // $.get(testUrl, function(data) {
	  //   console.log(data);
	  // });
	}
	
	//Function to process solr index data
	function processSubjectsSolr(data) {
	  var data = $.parseJSON(data);
	
	  $('a[href="#tab-audio-video"]').unbind('show.bs.tab');
	
	  $.each(data.grouped.service.groups, function(solrIndex, solrSection) {
	    //Related Audio-Video (videos) section
	    if (solrSection.groupValue == "mediabase" && solrSection.doclist.numFound > 0) {
	      $("ul.nav li a[href='#tab-audio-video'] .badge").text(solrSection.doclist.numFound);
	      $(".content-resources ul.nav-pills li.audio-video").show();
	      $('a[href="#tab-audio-video"]').unbind('show.bs.tab').one('show.bs.tab', function(e) {
	        //Push a state to the url hash so we can bookmark it
	        $.bbq.pushState({que: $(e.target).attr('href').substr(1)});
	        $.bbq.removeState('nid');
	
	        if (!e.relatedTarget) {
	          var $tabAudioVideo = $("#tab-audio-video");
	          $tabAudioVideo.empty();
	          $tabAudioVideo.append('<h6>Audio/Video</h6>');
	          var audioVideoUrl = Drupal.settings.kmaps.mediabaseURL + '/services/' + Drupal.settings.kmaps.app + '/' + Drupal.settings.kmaps.hash_obj.id + '?rows=12';
	          $.get(audioVideoUrl, relatedVideos);
	        }
	
	      });
	    }
	
	    //Related Photos section
	    // if (solrSection.groupValue == "sharedshelf" && solrSection.doclist.numFound > 0) {
	    //   $("ul.nav li a[href='#tab-photos'] .badge").text(solrSection.doclist.numFound);
	    //   $(".content-resources ul.nav-pills li.photos").show();
	    // }
	  });
	
	  //Load default tab
	  if (Drupal.settings.kmaps.hash_obj.nid) {
	    var pageURL = Drupal.settings.kmaps.mediabaseURL + '/api/v1/media/node/' + Drupal.settings.kmaps.hash_obj.nid + '.json';
	    $.get(pageURL, showAudioVideoPage);
	  } else {
	    $('.content-resources').find('a[href="#' + (Drupal.settings.kmaps.hash_obj.que || 'tab-overview') + '"]').click();
	  }
	
	}
	
	function populateBreadcrumbs(bInd, bVal) {
	  $breadcrumbOl = $("ol.breadcrumb");
	  $breadcrumbOl.append('<li><a href="#id=' + bVal.id + '">' + bVal.header + '</a><i class="fa fa-angle-right"></i></li>');
	}
	
	function showOverviewImage(data) {
	  var retString = '<figure class="cap-bot">';
	  retString += '<img src="' + data.picture.images[3].url + '" class="img-responsive img-thumbnail" alt="' + 
	    (data.picture.captions.length > 0 ? data.picture.captions[0].title : "") + '">';
	  retString += '<figcaption>' + (data.picture.captions.length > 0 ? "<div class=\"center-caption\">" + data.picture.captions[0].title + "</div>" : "") + 
	    (data.picture.descriptions.length > 0 ? data.picture.descriptions[0].title : "") + '</figcaption>';
	  retString += '</figure>';
	
	  $("#tab-overview").append(retString);
	}
	
	//Function to populate related tab
	function relatedResources(data) {
	  var $tabRelated = $("#tab-subjects");
	  var contentR = '<ul class="list-unstyled list-group">';
	  $.each(data.feature_relation_types, function(rInd, rElm) {
	    contentR += '<li class="list-group-item">' + capitaliseFirstLetter(rElm.label) + " (" + rElm.features.length + "):";
	    contentR += '<ul class="list-group">';
	    $.each(rElm.features, function(rrInd, rrElm) {
	      contentR += '<li class="list-group-item"><a href="#id=' + rrElm.id + '&que=tab-overview">' + rrElm.header + ' (From the General Perspective)</a></li>';
	    });
	    contentR += '</ul>';
	    contentR += '</li>';
	  });
	  contentR += '</ul>';
	  $tabRelated.append(contentR);
	}
	
	//Function to populate photos tab
	function relatedPhotos(data) {
	
	  console.log(data);
	  
	  var contentPh = '<div class="related-photos">';
	
	  //First get and show photos from sharedshelf
	  var sharedShelfURL = location.href.substr(0, location.href.lastIndexOf('subjects')) + 'sharedshelf/api/projects/534/assets/filter/fd_24809_lookup.links.source_id/' + shanti.feature_id + '.json';
	  $.get(sharedShelfURL, function(ssData) {
	    console.log(ssData);
	  });
	
	  $.each(data.topic.media, function(rInd, rElm) {
	    contentPh += '<div class="each-photo">';
	    contentPh += '<a href="#pid' + rElm.id + '" class="thumbnail" data-toggle="modal">';
	    contentPh += '<img src="' + rElm.images[0].url + '" alt="' + (rElm.captions.length > 0 ? rElm.captions[0].title : "") + '">';
	    contentPh += '</a>';
	    contentPh += '</div>';
	
	    //Modal for each photo
	    contentPh += '<div class="modal fade" tabindex="-1" role="dialog" id="pid' + rElm.id + '">';
	    contentPh += '<div class="modal-dialog">';
	    contentPh += '<div class="modal-content">';
	    contentPh += '<div class="modal-header">';
	    contentPh += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
	    contentPh += '<h4 class="modal-title" id="myModalLabel">' + (rElm.captions.length > 0 ? rElm.captions[0].title : "") + '</h4>';
	    contentPh += '</div>';
	    contentPh += '<div class="modal-body">';
	    contentPh += '<img src="' + rElm.images[4].url + '" alt="' + (rElm.captions.length > 0 ? rElm.captions[0].title : "") + '">';
	    contentPh += '<p><strong>Resource #:</strong> ' + rElm.id + '</p>';
	    contentPh += '<p><strong>Description:</strong></p>';
	    contentPh += (rElm.descriptions.length > 0 ? rElm.descriptions[0].title : "");
	    contentPh += '<p><strong>Copyright holder:</strong> ' + (rElm.copyrights.length > 0 ? rElm.copyrights[0].copyright_holder.title : "") + '</p>';
	    if (rElm.photographer) {
	      contentPh += '<p><strong>Photographer:</strong> ' + (rElm.photographer.hasOwnProperty('fullname') ? rElm.photographer.fullname : "") + '</p>';
	    };
	    contentPh += '</div>';
	    contentPh += '</div>';
	    contentPh += '</div>';
	    contentPh += '</div>';
	  });
	
	  contentPh += '</div>';
	  contentPh += '<ul id="photo-pagination">';
	  contentPh += '<li class="first-page"><a href="' + shanti.photosURL + '&page=1' + '">&lt;&lt;</a></li>';
	  contentPh += '<li class="previous-page"><a href="' + shanti.photosURL + '&page=1' + '">&lt;</a></li>';
	  contentPh += '<li>PAGE</li>';
	  contentPh += '<li><input type="text" value="1" class="page-input"></li>';
	  contentPh += '<li>OF ' + data.topic.total_pages + '</li>';
	  contentPh += '<li class="next-page"><a href="' + shanti.photosURL + '&page=2' + '">&gt;</a></li>';
	  contentPh += '<li class="last-page"><a href="' + shanti.photosURL + '&page=' + data.topic.total_pages + '">&gt;&gt;</a></li>';
	  contentPh += '</ul>';
	  contentPh += '<div class="paginated-spin"><i class="fa fa-spinner"></i></div>';
	  $("#tab-photos").append(contentPh);
	
	  //Add the event listener for the first-page element
	  $("li.first-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    $.ajax({
	      url: currentTarget,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPhotos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val('1');
	      $('li.previous-page a').attr('href', currentTarget);
	      var nextTarget = currentTarget.substr(0, currentTarget.lastIndexOf('=') + 1) + 2;
	      $('li.next-page a').attr('href', nextTarget);
	    });
	  });
	
	  //Add the listener for the previous-page element
	  $("li.previous-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    currentTarget = currentTarget.substr(0, currentTarget.lastIndexOf('=') + 1);
	    var newpage = parseInt($('li input.page-input').val()) - 1;
	    if (newpage < 1) { newpage = 1; }
	    var currentURL = currentTarget + newpage;
	    var previousTarget = currentTarget + ((newpage - 1) < 1 ? 1 : (newpage - 1));
	    var nextTarget = currentTarget + ((newpage + 1) > parseInt(data.topic.total_pages) ? data.topic.total_pages : (newpage + 1));
	    $.ajax({
	      url: currentURL,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPhotos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $(e.currentTarget).attr('href', previousTarget);
	      $('li.next-page a').attr('href', nextTarget);
	    });
	  });
	
	  //Add the listener for the next-page element
	  $("li.next-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    currentTarget = currentTarget.substr(0, currentTarget.lastIndexOf('=') + 1);
	    var newpage = parseInt($('li input.page-input').val()) + 1;
	    if (newpage > parseInt(data.topic.total_pages)) { newpage = parseInt(data.topic.total_pages); }
	    var currentURL = currentTarget + newpage;
	    var previousTarget = currentTarget + ((newpage - 1) < 1 ? 1 : (newpage - 1));
	    var nextTarget = currentTarget + ((newpage + 1) > parseInt(data.topic.total_pages) ? data.topic.total_pages : (newpage + 1));
	    $.ajax({
	      url: currentURL,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPhotos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $('li.previous-page a').attr('href', previousTarget);
	      $(e.currentTarget).attr('href', nextTarget);
	    });
	  });
	
	  //Add the listener for the pager text input element
	  $("li input.page-input").change(function(e) {
	    e.preventDefault();
	    var currentTarget = shanti.photosURL + '&page=';
	    var newpage = parseInt($(this).val());
	    if (newpage > parseInt(data.topic.total_pages)) { newpage = parseInt(data.topic.total_pages); }
	    if (newpage < 1) { newpage = 1; }
	    var currentURL = currentTarget + newpage;
	    var previousTarget = currentTarget + ((newpage - 1) < 1 ? 1 : (newpage - 1));
	    var nextTarget = currentTarget + ((newpage + 1) > parseInt(data.topic.total_pages) ? data.topic.total_pages : (newpage + 1));
	    $.ajax({
	      url: currentURL,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPhotos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $('li.previous-page a').attr('href', previousTarget);
	      $('li.next-page a').attr('href', nextTarget);
	    });
	  });
	
	  //Add the event listener for the last-page element
	  $("li.last-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    var newpage = parseInt(data.topic.total_pages);
	    var previousTarget = shanti.photosURL + (newpage - 1);
	    $.ajax({
	      url: currentTarget,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPhotos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $('li.previous-page a').attr('href', previousTarget);
	      $('li.next-page a').attr('href', currentTarget);
	    });
	  });
	}
	
	//Function to process and show the paginated photos
	function paginatedPhotos(data) {
	  var paginatedContent = $("#tab-photos .related-photos");
	
	  var contentPh = '';
	  $.each(data.topic.media, function(rInd, rElm) {
	    contentPh += '<div class="each-photo">';
	    contentPh += '<a href="#pid' + rElm.id + '" class="thumbnail" data-toggle="modal">';
	    contentPh += '<img src="' + rElm.images[0].url + '" alt="' + (rElm.captions.length > 0 ? rElm.captions[0].title : "") + '">';
	    contentPh += '</a>';
	    contentPh += '</div>';
	
	    //Modal for each photo
	    contentPh += '<div class="modal fade" tabindex="-1" role="dialog" id="pid' + rElm.id + '">';
	    contentPh += '<div class="modal-dialog">';
	    contentPh += '<div class="modal-content">';
	    contentPh += '<div class="modal-header">';
	    contentPh += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
	    contentPh += '<h4 class="modal-title" id="myModalLabel">' + (rElm.captions.length > 0 ? rElm.captions[0].title : "") + '</h4>';
	    contentPh += '</div>';
	    contentPh += '<div class="modal-body">';
	    contentPh += '<img src="' + rElm.images[4].url + '" alt="' + (rElm.captions.length > 0 ? rElm.captions[0].title : "") + '">';
	    contentPh += '<p><strong>Resource #:</strong> ' + rElm.id + '</p>';
	    contentPh += '<p><strong>Description:</strong></p>';
	    contentPh += (rElm.descriptions.length > 0 ? rElm.descriptions[0].title : "");
	    contentPh += '<p><strong>Copyright holder:</strong> ' + (rElm.copyrights.length > 0 ? rElm.copyrights[0].copyright_holder.title : "") + '</p>';
	    contentPh += '<p><strong>Photographer:</strong> ' + (rElm.hasOwnProperty('photographer') ? rElm.photographer.fullname : "") + '</p>';
	    contentPh += '</div>';
	    contentPh += '</div>';
	    contentPh += '</div>';
	    contentPh += '</div>';
	  });
	  paginatedContent.empty().html(contentPh);
	}
	
	//Function to process and show related videos
	function relatedVideos(data) {
	  console.log(data);
	
	  var monthNames = [ "January", "February", "March", "April", "May", "June",
	                     "July", "August", "September", "October", "November", "December" ];
	  var contentAV = '<div class="related-audio-video">';
	
	  var current_url = $.param.fragment();
	
	  $.each(data.media, function(rInd, rElm) {
	    contentAV += '<div class="shanti-thumbnail video col-lg-2 col-md-3 col-sm-4 col-xs-12">';
	    contentAV += '<div class="shanti-thumbnail-image shanti-field-video">';
	    contentAV += '<a href="#' + current_url + '&nid=' + rElm.nid + '" class="shanti-thumbnail-link">';
	    contentAV += '<span class="overlay">';
	    contentAV += '<span class="icon"></span>';
	    contentAV += '</span>';
	    contentAV += '<img src="' + rElm.thumbnail + '/width/360/height/270/type/2/bgcolor/000000' + '" alt="Video" typeof="foaf:Image" class="k-no-rotate">';
	    contentAV += '<i class="shanticon-video thumbtype"></i>';
	    contentAV += '</a>';
	    contentAV += '</div>';
	    contentAV += '<div class="shanti-thumbnail-info">';
	    contentAV += '<div class="body-wrap">';
	    contentAV += '<div class="shanti-thumbnail-field shanti-field-created">';
	    contentAV += '<span class="shanti-field-content">';
	    var date = new Date(parseInt(rElm.created) * 1000);
	    contentAV += date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
	    contentAV += '</span>';
	    contentAV += '<div class="shanti-thumbnail-field shanti-field-title">';
	    contentAV += '<span class="field-content">';
	    contentAV += '<a href="#' + current_url + '&nid=' + rElm.nid + '" class="shanti-thumbnail-link">';
	    contentAV += rElm.title;
	    contentAV += '</a>';
	    contentAV += '</span>';
	    contentAV += '</div>';
	    contentAV += '<div class="shanti-thumbnail-field shanti-field-duration">';
	    contentAV += '<span class="field-content">' + rElm.duration.formatted + '</span>';
	    contentAV += '</div>';
	    contentAV += '</div>';
	    contentAV += '</div>';
	    contentAV += '<div class="footer-wrap">';
	    contentAV += '</div>';
	    contentAV += '</div>';
	    contentAV += '</div>';
	  });
	
	  contentAV += '</div>';
	
	  var avURL = Drupal.settings.kmaps.mediabaseURL + '/services/' + Drupal.settings.kmaps.app + '/' + Drupal.settings.kmaps.hash_obj.id + '?rows=12';
	  var total_pages = parseInt(data.total / data.rows);
	
	  contentAV += '<ul id="photo-pagination">';
	  contentAV += '<li class="first-page"><a href="' + avURL + '&pg=1' + '">&lt;&lt;</a></li>';
	  contentAV += '<li class="previous-page"><a href="' + avURL + '&pg=1' + '">&lt;</a></li>';
	  contentAV += '<li>PAGE</li>';
	  contentAV += '<li><input type="text" value="1" class="page-input"></li>';
	  contentAV += '<li>OF ' + total_pages + '</li>';
	  contentAV += '<li class="next-page"><a href="' + avURL + '&pg=2' + '">&gt;</a></li>';
	  contentAV += '<li class="last-page"><a href="' + avURL + '&page=' + total_pages + '">&gt;&gt;</a></li>';
	  contentAV += '</ul>';
	  contentAV += '<div class="paginated-spin"><i class="fa fa-spinner"></i></div>';
	
	  $("#tab-audio-video").append(contentAV);
	
	  //Add the event listener for the first-page element
	  $("li.first-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    $.ajax({
	      url: currentTarget,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedVideos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val('1');
	      $('li.previous-page a').attr('href', currentTarget);
	      var nextTarget = currentTarget.substr(0, currentTarget.lastIndexOf('=') + 1) + 2;
	      $('li.next-page a').attr('href', nextTarget);
	    });
	  });
	
	  //Add the listener for the previous-page element
	  $("li.previous-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    currentTarget = currentTarget.substr(0, currentTarget.lastIndexOf('=') + 1);
	    var newpage = parseInt($('li input.page-input').val()) - 1;
	    if (newpage < 1) { newpage = 1; }
	    var currentURL = currentTarget + newpage;
	    var previousTarget = currentTarget + ((newpage - 1) < 1 ? 1 : (newpage - 1));
	    var nextTarget = currentTarget + ((newpage + 1) > parseInt(total_pages) ? total_pages : (newpage + 1));
	    $.ajax({
	      url: currentURL,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedVideos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $(e.currentTarget).attr('href', previousTarget);
	      $('li.next-page a').attr('href', nextTarget);
	    });
	  });
	
	  //Add the listener for the next-page element
	  $("li.next-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    currentTarget = currentTarget.substr(0, currentTarget.lastIndexOf('=') + 1);
	    var newpage = parseInt($('li input.page-input').val()) + 1;
	    if (newpage > parseInt(total_pages)) { newpage = parseInt(total_pages); }
	    var currentURL = currentTarget + newpage;
	    var previousTarget = currentTarget + ((newpage - 1) < 1 ? 1 : (newpage - 1));
	    var nextTarget = currentTarget + ((newpage + 1) > parseInt(total_pages) ? total_pages : (newpage + 1));
	    $.ajax({
	      url: currentURL,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedVideos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $('li.previous-page a').attr('href', previousTarget);
	      $(e.currentTarget).attr('href', nextTarget);
	    });
	  });
	
	  //Add the listener for the pager text input element
	  $("li input.page-input").change(function(e) {
	    e.preventDefault();
	    var currentTarget = avURL + '&pg=';
	    var newpage = parseInt($(this).val());
	    if (newpage > parseInt(total_pages)) { newpage = parseInt(total_pages); }
	    if (newpage < 1) { newpage = 1; }
	    var currentURL = currentTarget + newpage;
	    var previousTarget = currentTarget + ((newpage - 1) < 1 ? 1 : (newpage - 1));
	    var nextTarget = currentTarget + ((newpage + 1) > parseInt(total_pages) ? total_pages : (newpage + 1));
	    $.ajax({
	      url: currentURL,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedVideos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $('li.previous-page a').attr('href', previousTarget);
	      $('li.next-page a').attr('href', nextTarget);
	    });
	  });
	
	  //Add the event listener for the last-page element
	  $("li.last-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    var newpage = parseInt(total_pages);
	    var previousTarget = avURL + (newpage - 1);
	    $.ajax({
	      url: currentTarget,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedVideos)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $('li.previous-page a').attr('href', previousTarget);
	      $('li.next-page a').attr('href', currentTarget);
	    });
	  });
	}
	
	//Function to process and show paginated videos
	function paginatedVideos(data) {
	  var monthNames = [ "January", "February", "March", "April", "May", "June",
	                     "July", "August", "September", "October", "November", "December" ];
	  var contentAV = '<div class="related-audio-video">';
	
	  var current_url = $.param.fragment();
	
	  $.each(data.media, function(rInd, rElm) {
	    contentAV += '<div class="shanti-thumbnail video col-lg-2 col-md-3 col-sm-4 col-xs-12">';
	    contentAV += '<div class="shanti-thumbnail-image shanti-field-video">';
	    contentAV += '<a href="#' + current_url + '&nid=' + rElm.nid + '" class="shanti-thumbnail-link">';
	    contentAV += '<span class="overlay">';
	    contentAV += '<span class="icon"></span>';
	    contentAV += '</span>';
	    contentAV += '<img src="' + rElm.thumbnail + '/width/360/height/270/type/2/bgcolor/000000' + '" alt="Video" typeof="foaf:Image" class="k-no-rotate">';
	    contentAV += '<i class="shanticon-video thumbtype"></i>';
	    contentAV += '</a>';
	    contentAV += '</div>';
	    contentAV += '<div class="shanti-thumbnail-info">';
	    contentAV += '<div class="body-wrap">';
	    contentAV += '<div class="shanti-thumbnail-field shanti-field-created">';
	    contentAV += '<span class="shanti-field-content">';
	    var date = new Date(parseInt(rElm.created) * 1000);
	    contentAV += date.getDate() + ' ' + monthNames[date.getMonth()] + ' ' + date.getFullYear();
	    contentAV += '</span>';
	    contentAV += '<div class="shanti-thumbnail-field shanti-field-title">';
	    contentAV += '<span class="field-content">';
	    contentAV += '<a href="#' + current_url + '&nid=' + rElm.nid + '" class="shanti-thumbnail-link">';
	    contentAV += rElm.title;
	    contentAV += '</a>';
	    contentAV += '</span>';
	    contentAV += '</div>';
	    contentAV += '<div class="shanti-thumbnail-field shanti-field-duration">';
	    contentAV += '<span class="field-content">' + rElm.duration.formatted + '</span>';
	    contentAV += '</div>';
	    contentAV += '</div>';
	    contentAV += '</div>';
	    contentAV += '<div class="footer-wrap">';
	    contentAV += '</div>';
	    contentAV += '</div>';
	    contentAV += '</div>';
	  });
	
	  contentAV += '</div>';
	
	  $("#tab-audio-video .related-audio-video").empty().html(contentAV);
	}
	
	//Function to process and show related texts
	function relatedTexts(data) {
	  var contentTX = '<div class="related-texts">';
	
	  $.each(data.topic.media, function(rInd, rElm) {
	    contentTX += '<div class="each-text">';
	    contentTX += '<a href="#pid' + rElm.id + '" class="thumbnail" data-toggle="modal">';
	    contentTX += '<img src="' + rElm.images[1].url + '" alt="' + (rElm.captions.length > 0 ? rElm.captions[0].title : "") + '">';
	    contentTX += '</a>';
	    contentTX += '</div>';
	
	    //Modal for each photo
	    contentTX += '<div class="modal fade" tabindex="-1" role="dialog" id="pid' + rElm.id + '">';
	    contentTX += '<div class="modal-dialog">';
	    contentTX += '<div class="modal-content">';
	    contentTX += '<div class="modal-header">';
	    contentTX += '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>';
	    contentTX += '<h4 class="modal-title" id="myModalLabel">' + (rElm.captions.length > 0 ? rElm.captions[0].title : "") + '</h4>';
	    contentTX += '</div>';
	    contentTX += '<div class="modal-body">';
	    contentTX += '<img src="' + rElm.images[6].url + '" alt="' + (rElm.captions.length > 0 ? rElm.captions[0].title : "") + '">';
	    contentTX += '<p><strong>Resource #:</strong> ' + rElm.id + '</p>';
	    contentTX += '</div>';
	    contentTX += '</div>';
	    contentTX += '</div>';
	    contentTX += '</div>';
	  });
	
	  contentTX += '</div>';
	
	  $("#tab-texts").append(contentTX);
	}
	
	//Function to process and show related places
	function relatedPlaces(data) {
	  $("#tab-places").empty();
	
	  var contentPl = '<h6>Features Associated with ' + shanti.shanti_data.feature.header + '</h6>';
	
	  contentPl += '<ul class="related-places">';
	  $.each(data.features, function(rInd, rElm) {
	    contentPl += '<li>';
	    contentPl += '<a href="' + Drupal.settings.kmaps.placesPath + '#id=' + rElm.id + '&que=tab-overview">';
	    contentPl += rElm.header;
	    contentPl += '</a>';
	    contentPl += '</li>';
	  });
	  contentPl += '</ul>';
	  contentPl += '<ul id="places-pagination"></ul>';
	
	  var avURL = Drupal.settings.kmaps.placesUrl + '/topics/' + shanti.shanti_data.feature.id + '.json';
	  var total_pages = data.total_pages;
	
	  contentPl += '<ul id="photo-pagination">';
	  contentPl += '<li class="first-page"><a href="' + avURL + '?page=1' + '">&lt;&lt;</a></li>';
	  contentPl += '<li class="previous-page"><a href="' + avURL + '?page=1' + '">&lt;</a></li>';
	  contentPl += '<li>PAGE</li>';
	  contentPl += '<li><input type="text" value="1" class="page-input"></li>';
	  contentPl += '<li>OF ' + total_pages + '</li>';
	  contentPl += '<li class="next-page"><a href="' + avURL + '?page=2' + '">&gt;</a></li>';
	  contentPl += '<li class="last-page"><a href="' + avURL + '?page=' + total_pages + '">&gt;&gt;</a></li>';
	  contentPl += '</ul>';
	  contentPl += '<div class="paginated-spin"><i class="fa fa-spinner"></i></div>';
	
	  $("#tab-places").append(contentPl);
	
	  //Add the event listener for the first-page element
	  $("li.first-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    $.ajax({
	      url: currentTarget,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPlaces)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val('1');
	      $('li.previous-page a').attr('href', currentTarget);
	      var nextTarget = currentTarget.substr(0, currentTarget.lastIndexOf('=') + 1) + 2;
	      $('li.next-page a').attr('href', nextTarget);
	    });
	  });
	
	  //Add the listener for the previous-page element
	  $("li.previous-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    currentTarget = currentTarget.substr(0, currentTarget.lastIndexOf('=') + 1);
	    var newpage = parseInt($('li input.page-input').val()) - 1;
	    if (newpage < 1) { newpage = 1; }
	    var currentURL = currentTarget + newpage;
	    var previousTarget = currentTarget + ((newpage - 1) < 1 ? 1 : (newpage - 1));
	    var nextTarget = currentTarget + ((newpage + 1) > parseInt(total_pages) ? total_pages : (newpage + 1));
	    $.ajax({
	      url: currentURL,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPlaces)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $(e.currentTarget).attr('href', previousTarget);
	      $('li.next-page a').attr('href', nextTarget);
	    });
	  });
	
	  //Add the listener for the next-page element
	  $("li.next-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    currentTarget = currentTarget.substr(0, currentTarget.lastIndexOf('=') + 1);
	    var newpage = parseInt($('li input.page-input').val()) + 1;
	    if (newpage > parseInt(total_pages)) { newpage = parseInt(total_pages); }
	    var currentURL = currentTarget + newpage;
	    var previousTarget = currentTarget + ((newpage - 1) < 1 ? 1 : (newpage - 1));
	    var nextTarget = currentTarget + ((newpage + 1) > parseInt(total_pages) ? total_pages : (newpage + 1));
	    $.ajax({
	      url: currentURL,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPlaces)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $('li.previous-page a').attr('href', previousTarget);
	      $(e.currentTarget).attr('href', nextTarget);
	    });
	  });
	
	  //Add the listener for the pager text input element
	  $("li input.page-input").change(function(e) {
	    e.preventDefault();
	    var currentTarget = avURL + '&pg=';
	    var newpage = parseInt($(this).val());
	    if (newpage > parseInt(total_pages)) { newpage = parseInt(total_pages); }
	    if (newpage < 1) { newpage = 1; }
	    var currentURL = currentTarget + newpage;
	    var previousTarget = currentTarget + ((newpage - 1) < 1 ? 1 : (newpage - 1));
	    var nextTarget = currentTarget + ((newpage + 1) > parseInt(total_pages) ? total_pages : (newpage + 1));
	    $.ajax({
	      url: currentURL,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPlaces)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $('li.previous-page a').attr('href', previousTarget);
	      $('li.next-page a').attr('href', nextTarget);
	    });
	  });
	
	  //Add the event listener for the last-page element
	  $("li.last-page a").click(function(e) {
	    e.preventDefault();
	    var currentTarget = $(e.currentTarget).attr('href');
	    var newpage = parseInt(total_pages);
	    var previousTarget = avURL + (newpage - 1);
	    $.ajax({
	      url: currentTarget,
	      beforeSend: function(xhr) {
	        $('.paginated-spin i.fa').addClass('fa-spin');
	        $('.paginated-spin').show();
	      }
	    })
	    .done(paginatedPlaces)
	    .always(function() {
	      $('.paginated-spin i').removeClass('fa-spin');
	      $('.paginated-spin').hide();
	      $('li input.page-input').val(newpage);
	      $('li.previous-page a').attr('href', previousTarget);
	      $('li.next-page a').attr('href', currentTarget);
	    });
	  });
	}
	
	//Function to process and show paginated places
	function paginatedPlaces(data) {
	  var paginatedPlaces = $("#tab-places .related-places");
	
	  var contentPl = '';
	  $.each(data.features, function(rInd, rElm) {
	    contentPl += '<li>';
	    contentPl += '<a href="' + Drupal.settings.kmaps.placesPath + '#id=' + rElm.id + '&que=tab-overview">';
	    contentPl += rElm.header;
	    contentPl += '</a>';
	    contentPl += '</li>';
	  });
	
	  paginatedPlaces.empty().html(contentPl);
	}
	
	//Function to process and show related Essays
	function relatedEssays(data) {
	  var contentES = '<div class="related-essays">';
	
	  $.each(data.descriptions, function(rInd, rElm) {
	    var monthNames = [ "January", "February", "March", "April", "May", "June",
	    "July", "August", "September", "October", "November", "December" ];
	    var createdDate = new Date(Date.parse(rElm.created_at));
	    var showDate = monthNames[createdDate.getMonth()] + ' ' + createdDate.getDate() + ', ' + createdDate.getFullYear();
	    contentES += '<h6>' + rElm.title + ' <small>by ' + rElm.author.fullname + ' (' + showDate + ')</small>' + '</h6>';
	    contentES += rElm.content;
	  });
	
	  contentES += '</div>';
	
	  $("#tab-essays").append(contentES);
	
	}
	
	//Show related page for the audio/video elements
	function showAudioVideoPage(data) {
	  var $tabAudioVideo = $('.show-related-pages');
	  $tabAudioVideo.empty();
	  var audioVideoContent = '';
	  audioVideoContent += '<h6>' + data.title + ' </h6>';
	  audioVideoContent += '<video controls class="img img-responsive">';
	  audioVideoContent += '<source src="http://cdnapi.kaltura.com/p/381832/sp/38183200/playManifest/entryId/' + (data.type == "video" ? data.field_video.und[0].entryid : data.field_audio.und[0].entryid) + '/format/url/protocol/http" type="video/mp4">'
	  audioVideoContent += '</video>';
	  $tabAudioVideo.append(audioVideoContent);
	
	  $(".content-resources a[href='#" + Drupal.settings.kmaps.hash_obj.que + "']").parent().addClass('active');
	}
	
	function processPhotos(mtext) {
	  $("ul.nav li a[href='#tab-photos'] .badge").text(mtext.match(/(\d+)/)[1]);
	  $(".content-resources ul.nav-pills li.photos").show();
	  /*$("#tab-photos").empty();
	  $("#tab-photos").append(
	    '<p>This is a new test</p>'
	  );*/
	}
	
	function processVideos(mtext) {
	  $("ul.nav li a[href='#tab-audio-video'] .badge").text(mtext.match(/(\d+)/)[1]);
	  $(".content-resources ul.nav-pills li.audio-video").show();
	  /*$("#tab-photos").empty();
	  $("#tab-photos").append(
	    '<p>This is a new test</p>'
	  );*/
	}
	
	function processTexts(mtext) {
	  $("ul.nav li a[href='#tab-texts'] .badge").text(mtext.match(/(\d+)/)[1]);
	  $(".content-resources ul.nav-pills li.texts").show();
	  /*$("#tab-photos").empty();
	  $("#tab-photos").append(
	    '<p>This is a new test</p>'
	  );*/
	}
	
	//Function to capitalize first letter
	function capitaliseFirstLetter(string)
	{
	    return string.charAt(0).toUpperCase() + string.slice(1);
	}

})(jQuery);