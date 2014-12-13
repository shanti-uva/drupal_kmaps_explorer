(function ($) {
  Drupal.behaviors.kmapsExplorerCustom = {
    attach: function (context, settings) {
      var $related = $('.content-resources > ul.nav-pills > li a');
      $related.click(function () {
        $('.content-resources > ul.nav-pills > li').removeClass("active");
        $(this).parent().addClass("active");
      });
    }
  };


})(jQuery);