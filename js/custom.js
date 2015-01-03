(function ($) {
  Drupal.behaviors.kmapsExplorerCustom = {
    attach: function (context, settings) {
      var $related = $('.content-resources > ul.nav-pills > li a');
      $related.click(function () {
        $('.content-resources > ul.nav-pills > li').removeClass("active");
        $(this).parent().addClass("active");
      });

      //Include index item to breadcrumbs for normal page loads
      $('ol.breadcrumb li:first-child a').html(Drupal.settings.kmaps_explorer.app + ': ');
    }
  };


})(jQuery);
