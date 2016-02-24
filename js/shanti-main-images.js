(function ($) {
	Drupal.behaviors.shantiImages = {
	    attach: function (context, settings) {
            if ($("#og-grid", context).length > 0) {
                Grid.init();
            }
	    }
	};

	/*
	 * popupImageCenter: jQuery extension function called in grid.js when opening popup. Positions image and lightbox link centered vertically  */

    $.fn.popupImageCentering = function() {
		return this.each(function() {

			// Adjust top margin
			/*
			var 	wrapper = $(this).parents('.og-img-wrapper'), // get wrapper
				 	imght = $(this).height(),
					cnthgt = $(this).parents('.og-fullimg').height(),
					tmarg = (cnthgt > imght) ? -imght / 2 : -cnthgt / 2;

			wrapper.css("margin-top",  tmarg  + "px" );
			*/
			//console.log("tmarg: " + tmarg);

			// Adjust left margin
			/*
			var 	imgwdt = $(this).width(),
					cntwdt = $(this).parents('.og-fullimg').width(),
					lmarg = (cntwdt > imgwdt) ? -imgwdt / 2 : -cntwdt / 2;
			wrapper.css("margin-left",  lmarg  + "px" );
			*/
			//console.log("imgwdt: " + imgwdt);
			//console.log("cntwdt: " + cntwdt);
			//console.log("lmarg: " + lmarg);*

			// if ($(".og-img-wrapper").css("padding-bottom") == "0" ){

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

			// }

		});
   };




}) (jQuery);





