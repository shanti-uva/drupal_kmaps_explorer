/**
 * Created by edwardjgarrett on 6/12/16.
 */

(function ($) {

    $.fn.overlayMask = function (action) {
        var mask = this.find('.overlay-mask');
        // Create the required mask
        if (!mask.length) {
            mask = $('<div class="overlay-mask"><div class="loading-container"><div class="loading"></div><div id="loading-text">Searching&#133;</div></div></div>');
            mask.css({
                position: 'absolute',
                width: '100%',
                height: '100%',
                top: '0px',
                left: '0px',
                zIndex: 100,
                opacity: 9,
                backgrogroundColor: 'white'
            }).appendTo(this).fadeTo(0, 0.5).find('div').position({
                my: 'center center',
                at: 'center center',
                of: '.overlay-mask'
            })
        }

        // Act based on params
        if (!action || action === 'show') {
            mask.show();
        } else if (action === 'hide') {
            mask.hide();
        }
        return this;
    };

    Drupal.behaviors.explorer_block = {
        attach: function (context, settings) {
            var admin = settings.shanti_kmaps_admin;
            //console.dir(settings);
            //console.log(JSON.stringify(settings, undefined, 2));
            var domain = (settings.kmaps_explorer) ? settings.kmaps_explorer.app : 'places';
            var root_kmap_path = domain == 'subjects' ? admin.shanti_kmaps_admin_root_subjects_path : admin.shanti_kmaps_admin_root_places_path;
            var base_url = domain == 'subjects' ? admin.shanti_kmaps_admin_server_subjects : admin.shanti_kmaps_admin_server_places;
            var root_kmapid = domain == 'subjects' ? admin.shanti_kmaps_admin_root_subjects_id : admin.shanti_kmaps_admin_root_places_id;

            $('#kmaps-search', context).once('kmaps-explorer').each(function () {

                var $typeahead = $('#kmaps-explorer-search-term', this);
                var search = $typeahead.hasClass('kmap-no-search') ? false : true;
                var search_key = '';
                var $tree = $('#tree');

                ////   RECONFIGURE HERE!

                $tree.kmapsTree({
                    termindex_root: admin.shanti_kmaps_admin_server_solr_terms,
                    kmindex_root: admin.shanti_kmaps_admin_server_solr,
                    type: domain,
                    root_kmap_path: root_kmap_path,
                    baseUrl: base_url
                }).on('useractivate', function (ev, data) {
                    var domain = (Drupal.settings.kmaps_explorer) ? Drupal.settings.kmaps_explorer.app : "places";
                    console.dir(ev);
                    console.dir(data);
                    console.log(root_kmapid);
                    Drupal.ajax["ajax-id-" + root_kmapid].createAction(data.key, domain);
                    ev.stopImmediatePropagation();
                    return false;
                });

                if (search) {
                    $typeahead.kmapsTypeahead({
                        menu: $('.listview > .view-wrap'),
                        term_index: admin.shanti_kmaps_admin_server_solr_terms,
                        domain: domain,
                        root_kmapid: root_kmapid,
                        max_terms: 20,
                        min_chars: 0,
                        pager: 'on',
                        empty_query: '*:*',
                        empty_limit: 20,
                        empty_sort: 'header_ssort ASC', // sortable header field
                        sort: 'header_ssort ASC', // sort even when there's a search term
                        filters: admin.shanti_kmaps_admin_solr_filter_query ? admin.shanti_kmaps_admin_solr_filter_query : ''
                    }).kmapsTypeahead('onSuggest',
                      function () {
                        $('a[href=".listview"]').tab('show');
                      }
                    ).kmapsTypeahead('onFilterChange',
                      function (filters) {
                        Drupal.ShantiSarvaka.searchTabHeightKMaps();
                      }
                    /*).kmapsTypeahead('onSuggest',
                        function (suggestions) {
                            if (suggestions.length == 0) {
                                $tree.kmapsTree('reset', function () {
                                    $tree.fancytree('getTree').getNodeByKey(root_kmapid).scrollIntoView(true);
                                });
                            }
                            else {
                                var re = $typeahead.kmapsTypeahead('getResponse');
                                if (re.response.start == 0) { // don't page the tree
                                    $tree.kmapsTree('showPaths',
                                        $.map(KMapsUtil.getLevelFacetResults($typeahead.kmapsTypeahead('getResponse').facet_counts.facet_fields), function (val) {
                                            return '/' + val.path;
                                        }),
                                        function () {
                                            // scroll to top - doesn't work
                                            $tree.fancytree('getTree').getNodeByKey(root_kmapid).scrollIntoView(true);
                                        }
                                    );
                                }
                            }
                        }
                    */).kmapsTypeahead('mergeParams', {
                            'facet': true,
                            'facet.field': KMapsUtil.getLevelFacetParams(root_kmapid, 2)
                        }
                    ).bind('typeahead:asyncrequest',
                        function () {
                            search_key = $typeahead.typeahead('val'); //get search term
                        }
                    ).bind('typeahead:select',
                        function (ev, sel) {
                            var id = sel.doc.id.substring(sel.doc.id.indexOf('-') + 1);
                            // console.log(JSON.stringify(sel, undefined, 2));
                            $typeahead.typeahead('val', search_key); // revert back to search key
                            Drupal.ajax["ajax-id-" + root_kmapid].createAction(id, domain);
                        }
                    ).on('input',
                        function () {
                            if (this.value == '') {
                                search_key = '';
                                $tree.kmapsTree('reset', function () {
                                    $tree.fancytree('getTree').getNodeByKey(root_kmapid).scrollIntoView(true);
                                });
                            }
                        }
                    );
                }
                $('.advanced-link').click(function () {
                    $(this).toggleClass("show-advanced", 'fast');
                    $(".advanced-view").slideToggle('fast', function() {
                      Drupal.ShantiSarvaka.searchTabHeightKMaps();
                    });
                    $(".advanced-view").toggleClass("show-options");
                    $(".view-wrap").toggleClass("short-wrap"); // ----- toggle class for managing view-section height
                });

                $("#searchbutton").on('click', function () {
                    console.log("triggering doSearch!");
                    $("#kmaps-explorer-search-term").trigger('doSearch');
                });

                $('#kmaps-explorer-search-term').attr('autocomplete', 'off'); // turn off browser autocomplete

                $('.listview').on('shown.bs.tab', function () {

                    if ($('div.listview div div.table-responsive table.table-results tr td').length == 0) {
                        notify.warn("warnnoresults", "Enter a search above.");
                    }

                    var header = (location.pathname.indexOf('subjects') !== -1) ? "<th>Name</th><th>Root Category</th>" : "<th>Name</th><th>Feature Type</th>";
                    $('div.listview div div.table-responsive table.table-results tr:has(th):not(:has(td))').html(header);
                    $("table.table-results tbody td span").trunk8({tooltip: false});

                    if ($('.row_selected')[0]) {
                        if ($('.listview')) {
                            var me = $('div.listview').find('.row_selected');
                            var myWrapper = me.closest('.view-wrap');
                            var scrollt = me.offset().top;

                            myWrapper.animate({
                                scrollTop: scrollt
                            }, 2000);
                        }
                    }
                    //});

                });

                // Run when switching to tree view
                $('.treeview').on('shown.bs.tab', function () {
                    var activeNode = $('#tree').fancytree("getTree").getActiveNode();
                    if (activeNode) {
                        activeNode.makeVisible();
                    }
                });


                function maskSearchResults(isMasked) {
                    var showhide = (isMasked) ? 'show' : 'hide';
                    $('.view-section>.tab-content').overlayMask(showhide);
                }

                function maskTree(isMasked) {
                    var showhide = (isMasked) ? 'show' : 'hide';
                    $('#tree').overlayMask(showhide);
                }

                function decorateElementWithPopover(elem, key, title, path, caption) {
                    //console.log("decorateElementWithPopover: "  + elem);
                    if (jQuery(elem).popover) {
                        jQuery(elem).attr('rel', 'popover');

                        //console.log("caption = " + caption);
                        jQuery(elem).popover({
                                html: true,
                                content: function () {
                                    caption = ((caption) ? caption : "");
                                    var popover = "<div class='kmap-path'>/" + path + "</div>" + "<div class='kmap-caption'>" + caption + "</div>" +
                                        "<div class='info-wrap' id='infowrap" + key + "'><div class='counts-display'>...</div></div>";
                                    //console.log("Captioning: " + caption);
                                    return popover;
                                },
                                title: function () {
                                    return title + "<span class='kmapid-display'>" + key + "</span>";
                                },
                                trigger: 'hover',
                                placement: 'left',
                                delay: {hide: 5},
                                container: 'body'
                            }
                        );

                        jQuery(elem).on('shown.bs.popover', function (x) {
                            $("body > .popover").removeClass("related-resources-popover"); // target css styles on search tree popups
                            $("body > .popover").addClass("search-popover"); // target css styles on search tree popups

                            var countsElem = $("#infowrap" + key + " .counts-display");

                            // highlight matching text (if/where they occur).
                            var txt = $('#kmaps-explorer-search-term').val();
                            $('.popover-caption').highlight(txt, {element: 'mark'});

                            $.ajax({
                                type: "GET",
                                url: settings.baseUrl + "/features/" + key + ".xml",
                                dataType: "xml",
                                timeout: 90000,
                                beforeSend: function () {
                                    countsElem.html("<span class='assoc-resources-loading'>loading...</span>");
                                },
                                error: function (e) {
                                    countsElem.html("<i class='glyphicon glyphicon-warning-sign' title='" + e.statusText);
                                },
                                success: function (xml) {
                                    settings.type = (Drupal.settings.kmaps_explorer) ? Drupal.settings.kmaps_explorer.app : "places";

                                    // force the counts to be evaluated as numbers.
                                    var related_count = Number($(xml).find('related_feature_count').text());
                                    var description_count = Number($(xml).find('description_count').text());
                                    var place_count = Number($(xml).find('place_count').text());
                                    var picture_count = Number($(xml).find('picture_count').text());
                                    var video_count = Number($(xml).find('video_count').text());
                                    var document_count = Number($(xml).find('document_count').text());
                                    var subject_count = Number($(xml).find('subject_count').text());

                                    if (settings.type === "places") {
                                        place_count = related_count;
                                    } else if (settings.type === "subjects") {
                                        subject_count = related_count;
                                    }
                                    countsElem.html("");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-audio-video'></i><span class='badge' >" + video_count + "</span></span>");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-photos'></i><span class='badge' >" + picture_count + "</span></span>");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-places'></i><span class='badge' >" + place_count + "</span></span>");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-subjects'></i><span class='badge' >" + subject_count + "</span></span>");
                                    countsElem.append("<span style='display: none' class='associated'><i class='icon shanticon-texts'></i><span class='badge' >" + description_count + "</span></span>");

                                },
                                complete: function () {

                                    var fq = Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_solr_filter_query;

                                    var project_filter = (fq) ? ("&" + fq) : "";
                                    var kmidxBase = Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_server_solr;
                                    if (!kmidxBase) {
                                        kmidxBase = 'http://kidx.shanti.virginia.edu/solr/kmindex';
                                        console.error("Drupal.settings.shanti_kmaps_admin.shanti_kmaps_admin_server_solr not defined. using default value: " + kmidxBase);
                                    }
                                    var solrURL = kmidxBase + '/select?q=kmapid:' + settings.type + '-' + key + project_filter + '&start=0&facets=on&group=true&group.field=asset_type&group.facet=true&group.ngroups=true&group.limit=0&wt=json&json.wrf=?';
                                    // console.log ("solrURL = " + solrURL);
                                    $.get(solrURL, function (data) {
                                        //console.log(data);
                                        var updates = {};
                                        $.each(data.grouped.asset_type.groups, function (x, y) {
                                            var asset_type = y.groupValue;
                                            var asset_count = y.doclist.numFound;
                                            updates[asset_type] = asset_count;
                                        });
                                        //console.log(key + "(" + title + ") : " + JSON.stringify(updates));
                                        update_counts(countsElem, updates)
                                    }, 'jsonp');
                                }
                            });
                        });
                    }


                    function update_counts(elem, counts) {

                        var av = elem.find('i.shanticon-audio-video ~ span.badge');
                        if (typeof(counts["audio-video"]) != "undefined") {
                            (counts["audio-video"]) ? av.html(counts["audio-video"]).parent().show() : av.parent().hide();
                        }
                        if (Number(av.text()) > 0) {
                            av.parent().show()
                        }

                        var photos = elem.find('i.shanticon-photos ~ span.badge');
                        if (typeof(counts.photos) != "undefined") {
                            photos.html(counts.photos)
                        }
                        (Number(photos.text()) > 0) ? photos.parent().show() : photos.parent().hide();

                        var places = elem.find('i.shanticon-places ~ span.badge');
                        if (typeof(counts.places) != "undefined") {
                            places.html(counts.places)
                        }
                        if (Number(places.text()) > 0) {
                            places.parent().show()
                        }

                        var essays = elem.find('i.shanticon-texts ~ span.badge');
                        if (typeof(counts.texts) != "undefined") {
                            essays.html(counts["texts"])
                        }
                        if (Number(essays.text()) > 0) {
                            essays.parent().show()
                        }

                        var subjects = elem.find('i.shanticon-subjects ~ span.badge');
                        if (typeof(counts.subjects) != "undefined") {
                            subjects.html(counts.subjects)
                        }
                        if (Number(subjects.text()) > 0) {
                            subjects.parent().show()
                        }
                        elem.find('.assoc-resources-loading').hide();

                    }


                    return elem;
                };

                var searchUtil = {
                    clearSearch: function () {
                        //        console.log("BANG: searchUtil.clearSearch()");
                        if ($('#tree').fancytree('getActiveNode')) {
                            $('#tree').fancytree('getActiveNode').setActive(false);
                        }
                        $('#tree').fancytree('getTree').clearFilter();
                        $('#tree').fancytree("getRootNode").visit(function (node) {
                            node.setExpanded(false);
                        });
                        //        $('div.listview div div.table-responsive table.table-results').dataTable().fnDestroy();


                        $('div.listview div div.table-responsive table.table-results tr').not(':first').remove();
                        //        $('div.listview div div.table-responsive table.table-results').dataTable();

                        // "unwrap" the <mark>ed text
                        $('span.fancytree-title').each(
                            function () {
                                $(this).text($(this).text());
                            }
                        );

                    }
                };

                var notify = {
                    warn: function (warnid, warnhtml) {
                        var wonk = function () {
                            if ($('div#' + warnid).length) {
                                $('div#' + warnid).fadeIn();
                            } else {
                                jQuery('<div id="' + warnid + '" class="alert alert-danger fade in"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + warnhtml + '</div>').fadeIn().appendTo('#notification-wrapper');
                            }
                        };

                        if ($('#notification-wrapper div#' + warnid).length) {
                            $('#notification-wrapper div#' + warnid).fadeOut('slow', wonk);
                        } else {
                            wonk();
                        }
                    },

                    clear: function (warnid) {

                        if (warnid) {
                            $('#notification-wrapper div#' + warnid).fadeOut('slow').remove()
                        } else {
                            $('#notification-wrapper div').fadeOut('slow').remove()
                        }
                    }
                };
                // SOLR AJAX
                //

                // --- close and clear all
                //  searchUtil.clearSearch();
                //  $('#tree').fancytree("getTree").clearFilter();

                // If there is a error node in fancytree.  Then you can click it to retry.
                $('#tree').on('click', '.fancytree-statusnode-error', function () {
                    $('#tree').fancytree();
                });

                // iCheck fixup -- added by gketuma
                $('nav li.form-group input[name=option2]').on('ifChecked', function (e) {
                    var newSource = settings.baseUrl + "/features/fancy_nested.json?view_code=" + $('nav li.form-group input[name=option2]:checked').val();
                    $("#tree").fancytree("option", "source.url", newSource);
                });

                // kludge, to prevent regular form submission.
                $('#kmaps-search form').on('submit', function (event, target) {
                    event.preventDefault();
                    return false;
                });
            }); // end of once
        }

        //end of attach
    };


    // Custom method to execute this ajax action...
    Drupal.ajax.prototype.executeAction = function () {
        var ajax = this;


        // return false;

        // hey buzz off, we're already busy!
        if (ajax.ajaxing) {
            //console.log("WE ARE ALREADY EXECUTING")
            return false;
        }

        try {
            //console.log("WE ARE AJAXING")
            $.ajax(ajax.options);
        }
        catch (err) {
            console.error("Could not process process: " + ajax.options.url);
            console.dir(ajax.options);
            return false;
        }

        return false;
    };

    // Create the custom actions and execute it

    Drupal.ajax.prototype.createAction = function ($id, $app) {
        var admin = Drupal.settings.shanti_kmaps_admin;
        var domain = (Drupal.settings.kmaps_explorer) ? Drupal.settings.kmaps_explorer.app : "places";
        var baseUrl = Drupal.settings.basePath;

        // append terminal slash if there isn't one.
        if (!/\/$/.test(baseUrl)) {
            baseUrl += "/";
        }

        // probably should prevent regenerating an ajax action that already exists... Maybe using . once()?
        var settings = {
            url: baseUrl + $app + '/' + $id + '/overview/ajax',
            event: 'click',
            keypress: false,
            prevent: false
        }

        if (!Drupal.ajax['navigate-' + $app + '-' + $id]) {
            //console.error("Adding ajax to navigate-" + $app + '-' + $id);
            Drupal.ajax['navigate-' + $app + '-' + $id] = new Drupal.ajax(null, $('<br/>'), settings);
        }
        //console.error("Executing action navigate-" + $app + '-' + $id);
        Drupal.ajax['navigate-' + $app + '-' + $id].executeAction();
    };


})(jQuery);
