(function ($) {
  Drupal.behaviors.kmapsExplorer = {
    attach: function (context, settings) {
      var $selected_li = $('#carousel-feature-slides > li');
      $selected_li.children('a').bind('click', function (e) {
          e.preventDefault();
          $selected_li.removeClass('active');
          $(this).parent().addClass('active');
      });

      $('.bxslider').bxSlider({
        slideMargin:10,
        pager:true,
        controls:true,
        autoReload: true,
        moveSlides: 1,
        infiniteLoop: false,
        breaks: [{screen:0, slides:1, pager:false},{screen:380, slides:1},{screen:450, slides:2},{screen:768, slides:3},{screen:1200, slides:4}]
      });
    }
  };
})(jQuery);