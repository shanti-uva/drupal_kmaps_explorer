(function ($) {
  Drupal.behaviors.kmapsExplorer = {
    attach: function (context, settings) {
      var $selected_li = $('#carousel-feature-slides > li');
      $selected_li.children('a').bind('click', function (e) {
          e.preventDefault();
          $selected_li.removeClass('active');
          $(this).parent().addClass('active');
      });

      $('#carousel-feature-slides.large-slides').bxSlider({
        slideMargin:10,
        pager:true,
        controls:true,
        autoReload: true,
        moveSlides: 1,
        infiniteLoop: false,
				hideControlOnEnd: true,
        breaks: [{screen:0, slides:1, pager:false},{screen:380, slides:1},{screen:450, slides:2},{screen:768, slides:3},{screen:1200, slides:4}]
      });

      $('#carousel-feature-slides.small-slides').bxSlider({
        slideMargin:10,
        pager:true,
        controls:true,
        autoReload: true,
        moveSlides: 1,
        infiniteLoop: false,
				hideControlOnEnd: true,
			  breaks: [{screen:0, slides:1, pager:false},{screen:400, slides:2},{screen:550, slides:3},{screen:768, slides:4},{screen:1050, slides:5}]
      });

    }
  };
})(jQuery);