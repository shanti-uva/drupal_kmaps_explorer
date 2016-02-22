<h5><?php print $title; ?></h5><br>
<div id="og-grid" class="og-grid clearfix">
  <?php foreach($data as $aItem): ?>
    <?php $formats = kmaps_explorer_correct_images($aItem); ?>
    <div class="item">
      <a
        href="<?php print base_path() . $type . '/' . $id . '/photos_node/' . $aItem->id; ?>"
        data-largesrc="<?php print $formats['large']->url; ?>"
        data-hugesrc="<?php print $formats['huge']->url . '::' . $formats['huge']->width . '::' . $formats['huge']->height; ?>"
        data-title="<?php print (count($aItem->captions) > 0 ? check_plain($aItem->captions[0]->title) : ''); ?>"
        data-description="<?php print (count($aItem->descriptions) > 0 ? check_plain(strip_tags($aItem->descriptions[0]->title)) : 'No description currently available.'); ?>"
        data-creator="<?php print (count($aItem->copyrights) > 0 ? check_plain($aItem->copyrights[0]->copyright_holder->title) : 'Not available'); ?>"
        data-photographer="<?php print ((isset($aItem->photographer) && isset($aItem->photographer->fullname)) ? check_plain($aItem->photographer->fullname) : 'Not available'); ?>"
        data-date="Not available"
        data-place="Not available"
        data-type="jpg"
        data-ssid="<?php print $aItem->id; ?>"
        class="thumbnail"
        data-toggle="modal"
      >
        <img src="<?php print $formats['essay']->url; ?>" alt="<?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?>">
      </a>
    </div>
  <?php endforeach; ?>
</div>

<!-- Root element of PhotoSwipe. Must have class pswp. -->
<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true">

    <!-- Background of PhotoSwipe.
         It's a separate element as animating opacity is faster than rgba(). -->
    <div class="pswp__bg"></div>

    <!-- Slides wrapper with overflow:hidden. -->
    <div class="pswp__scroll-wrap">

        <!-- Container that holds slides.
            PhotoSwipe keeps only 3 of them in the DOM to save memory.
            Don't modify these 3 pswp__item elements, data is added later on. -->
        <div class="pswp__container">
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
            <div class="pswp__item"></div>
        </div>

        <!-- Default (PhotoSwipeUI_Default) interface on top of sliding area. Can be changed. -->
        <div class="pswp__ui pswp__ui--hidden">

            <div class="pswp__top-bar">

                <!--  Controls are self-explanatory. Order can be changed. -->

                <div class="pswp__counter"></div>

                <button class="pswp__button pswp__button--close" title="Close (Esc)"></button>

                <button class="pswp__button pswp__button--share" title="Share"></button>

                <button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button>

                <button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button>

                <!-- Preloader demo http://codepen.io/dimsemenov/pen/yyBWoR -->
                <!-- element will get class pswp__preloader active when preloader is running -->
                <div class="pswp__preloader">
                    <div class="pswp__preloader__icn">
                      <div class="pswp__preloader__cut">
                        <div class="pswp__preloader__donut"></div>
                      </div>
                    </div>
                </div>
            </div>

            <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
                <div class="pswp__share-tooltip"></div>
            </div>

            <button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)">
            </button>

            <button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)">
            </button>

            <div class="pswp__caption">
                <div class="pswp__caption__center"></div>
            </div>

        </div>

    </div>

</div>
