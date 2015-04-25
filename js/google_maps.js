(function ($) {
  Drupal.behaviors.kmapsExplorerMaps = {
    attach: function (context, settings) {
      $(window).load(function() {
        var chicago = new google.maps.LatLng(41.875696,-87.624207);
        var mapOptions = {
          zoom: 11,
          scrollwheel: false,
          center: chicago
        }

        var ctaLayer = new google.maps.KmlLayer({
          url: 'http://places.thlib.org/features/gis_resources/637.kmz'
        });

        ctaLayer.setMap(new google.maps.Map(document.getElementById('map-canvas'), mapOptions));

        //Hide the openlayer maps
        $('.openlayermap', context).hide();
      });

      //Listener functions for the map switch buttons.
      $(".renderGmaps").click(function() {
        $('.openlayermap', context).hide();
        $('#map-canvas', context).show();
        $(this).addClass('active');
        $('.renderOpenLayerMaps').removeClass('active');
      });

      $(".renderOpenLayerMaps").click(function() {
        $('#map-canvas', context).hide();
        var iframe = $('.openlayermap > iframe', context);
        iframe.attr("src", iframe.data("src"));
        $('.openlayermap', context).show();
        $(this).addClass('active');
        $('.renderGmaps').removeClass('active');
      });
    }
  };
})(jQuery);
