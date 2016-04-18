(function ($) {
  Drupal.behaviors.kmapsExplorerCustom = {
    attach: function (context, settings) {
      var $related = $('.content-resources > ul.nav-pills > li a');
      $related.click(function () {
        $('.content-resources > ul.nav-pills > li').removeClass("active");
        $(this).parent().addClass("active");
      });

      //Include index item to breadcrumbs for normal page loads
      if (Drupal.settings.kmaps_explorer) {
        $('ol.breadcrumb li:first-child a').html(Drupal.settings.kmaps_explorer.app + ': ');
      } else {
        $('ol.breadcrumb li:first-child a').html('');
      }

      //Functionality for history popstate
      $(window).on('popstate', function(e) {
        if (!e.originalEvent.state.tag) return;
        window.location.href = location.href;
      });

      // Functionality for columnizer
      // lastNeverTallest = last column will not be tallest column
      $('.kmaps-list-columns:not(.subjects-in-places)', context).columnize({ width: 350, lastNeverTallest: true }); 
      // dontsplit = don't break these headers
      $('.places-in-places').find('.column > h6, .column > ul > li, .column ul').addClass('dontsplit');
      // dontend = don't end column with headers
      $('.places-in-places').find('.column > h6, .column > ul > li').addClass('dontend');

      //Functionality for popovers
      $('.popover-kmaps', context).each(function() {
        var $that = $(this);
        var app = $that.data("app");
        var kid = $that.data("id");
        $that.popover({
          html: true,
          title: '<span id="pop-title-' + kid + '">Loading ...</span>',
          content: '<span id="pop-content-' + kid + '">Please wait while captions and related assets load. Loading ...</span>'
        });
        $that.on('show.bs.popover', function() {
          $('#pop-title-' + kid, context).html('');
          $('#pop-content-' + kid, context).html('');
          $('div.popover').hide();
          var url = 'http://' + app + '.kmaps.virginia.edu/features/' + kid + '.json';
          $.get(url, function(data) {
            $('#pop-title-' + kid, context).html(data.feature.header);
            $('#pop-content-' + kid, context).html(populatePopover(data, app));
          });
        });
      });

      //Functionality for images to add location and id
      $('.related-photos > .modal', context).each(function() {
        var $that = $(this);
        var id = $that.attr('id');
        var pid = $that.data('place');
        $that.on('show.bs.modal', function(e) {
          var url = 'http://places.kmaps.virginia.edu/features/' + pid + '.json';
          $.get(url, function(data) {
            $('#' + id + ' .modal-body .image-modal-location .places-loc', context).html(data.feature.header);
          });
        });
      });

      function populatePopover(data, app) {
        var html = '';
        html += '<div class="popover-body">';
        html += '<div class="desc">';
        html += '<p>';
        html += data.feature.nested_captions.length > 0 ? 'Nested Captions' : 'Currently no description available';
        html += '</p>';
        html += '</div>';
        html += '<div class="parents clearfix">';
        html += '<p>';
        html += '<strong>' + app.charAt(0).toUpperCase() + app.slice(1) + '</strong>';
        var ancestors = data.feature.ancestors ? data.feature.ancestors : data.feature.perspectives[0].ancestors;
        $.each(ancestors, function(ancestorK, ancestorV) {
          html += '<a href="#">' + ancestorV.header + '</a>';
        });
        html += '</p>';
        html += '</div>';
        html += '</div>';
        html += '<div class="popover-footer">';
        html += '<div class="popover-footer-button">';
        html += '<a href="/' + app + '/' + data.feature.id + '/overview/nojs" class="icon shanticon-link-external" target="_blank">';
        html += 'Full Entry';
        html += '</a>';
        html += '</div>';
        if (data.feature.associated_resources.related_feature_count > 0) {
          html += '<div class="popover-footer-button">';
          html += '<a href="/' + app + '/' + data.feature.id + '/' + app + '/nojs" class="icon shanticon-' + app + '" target="_blank">';
          html += 'Related ' + app.charAt(0).toUpperCase() + app.slice(1) + ' (' + data.feature.associated_resources.related_feature_count + ')';
          html += '</a>';
          html += '</div>';
        }
        if (data.feature.associated_resources.subject_count > 0) {
          html += '<div class="popover-footer-button">';
          html += '<a href="/' + app + '/' + data.feature.id + '/' + 'subjects' + '/nojs" class="icon shanticon-' + 'subjects' + '" target="_blank">';
          html += 'Related ' + 'Subjects' + ' (' + data.feature.associated_resources.subject_count + ')';
          html += '</a>';
          html += '</div>';
        }
        if (data.feature.associated_resources.place_count > 0) {
          html += '<div class="popover-footer-button">';
          html += '<a href="/' + app + '/' + data.feature.id + '/' + 'places' + '/nojs" class="icon shanticon-' + 'places' + '" target="_blank">';
          html += 'Related ' + 'Places' + ' (' + data.feature.associated_resources.place_count + ')';
          html += '</a>';
          html += '</div>';
        }
        if (data.feature.associated_resources.document_count > 0) {
          html += '<div class="popover-footer-button">';
          html += '<a href="/' + app + '/' + data.feature.id + '/' + 'texts' + '/nojs" class="icon shanticon-' + 'texts' + '" target="_blank">';
          html += 'Related ' + 'Texts' + ' (' + data.feature.associated_resources.document_count + ')';
          html += '</a>';
          html += '</div>';
        }
        if (data.feature.associated_resources.picture_count > 0) {
          html += '<div class="popover-footer-button">';
          html += '<a href="/' + app + '/' + data.feature.id + '/' + 'photos' + '/nojs" class="icon shanticon-' + 'photos' + '" target="_blank">';
          html += 'Related ' + 'Photos' + ' (' + data.feature.associated_resources.picture_count + ')';
          html += '</a>';
          html += '</div>';
        }
        if (data.feature.associated_resources.video_count > 0) {
          html += '<div class="popover-footer-button">';
          html += '<a href="/' + app + '/' + data.feature.id + '/' + 'audio-video' + '/nojs" class="icon shanticon-' + 'audio-video' + '" target="_blank">';
          html += 'Related ' + 'Audio-Video' + ' (' + data.feature.associated_resources.video_count + ')';
          html += '</a>';
          html += '</div>';
        }
        html += '</div>';

        return html;
      }

      $('.transcripts-ui-search-form', context).once('transcript-search-wrapper', function() {
        var $form = $(this);
        var trid = $form.attr('data-transcripts-id');
        var base = 'transcript-search-button-' + trid;

        var element_settings = {
          url: 'http://' + window.location.hostname +  settings.basePath + settings.pathPrefix + 'system/ajax',
          event: 'click',
          progress: { type: 'throbber' },
          callback: 'transcripts_ui_ajax_hits',
        };

        Drupal.ajax[base] = new Drupal.ajax(base, this, element_settings);
        $(this).click();
      });

    }
  };

})(jQuery);
