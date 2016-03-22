(function ($) {
	Drupal.behaviors.shantiImages = {
	    attach: function (context, settings) {
            if ($("#og-grid").length > 0) {
                Grid.init();
            }
	    }
	};

	/*
	 * popupImageCenter: jQuery extension function called in grid.js when opening popup. Positions image and lightbox link centered vertically  */

    $.fn.popupImageCentering = function() {
		return this.each(function() {

	             var imght = $(this).height(),
					 cnthgt = $(this).parents('.og-fullimg').height(),
					 tmarg = (cnthgt > imght) ? -imght / 2 : -cnthgt / 2;

				 // vertically align tabs based on taller tab's actual height
				 var infohgt = $( '.og-details #info' ).actual('height') ;
				 var deschgt =  $( '.og-details #desc' ).actual('height') ;
				 var panelhgt = (infohgt > deschgt) ? infohgt : deschgt;
				 var detheight = panelhgt + 70; // account for tabs above and link below info tab

				if (detheight < cnthgt - 30) {
				 	var tmarg = ((cnthgt - detheight) / 2);
				 	$('.og-details').css('margin-top', tmarg + 'px');
				}

		});
   };

}) (jQuery);