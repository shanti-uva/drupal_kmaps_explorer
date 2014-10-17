<div class="related-audio-video">
  <?php foreach($data as $aItem): ?>
    <div class="shanti-thumbnail video col-lg-2 col-md-3 col-sm-4 col-xs-12">
      <div class="shanti-thumbnail-image shanti-field-video">
        <a href="<?php print base_path() . 'audio-video/node/' . $aItem->nid; ?>/nojs" class="shanti-thumbnail-link use-ajax">
          <span class="overlay"><span cla;ss="icon"></span></span>
          <img src="<?php print $aItem->thumbnail; ?>/width/360/height/270/type/2/bgcolor/000000" alt="Video" typeof="foaf:Image" class="k-no-rotate">
          <i class="shanticon-video thumbtype"></i>
        </a>
      </div>
      <div class="shanti-thumbnail-info">
        <div class="body-wrap">
          <div class="shanti-thumbnail-field shanti-field-created">
            <span class="shanti-field-content">
              <?php print date('F j, Y', $aItem->created); ?>
            </span>
            <div class="shanti-thumbnail-field shanti-field-title">
              <span class="field-content">
                <a href="<?php print base_path() . 'audio-video/node/' . $aItem->nid; ?>/nojs" class="shanti-thumbnail-link use-ajax">
                  <?php print $aItem->title; ?>
                </a>
              </span>
            </div>
            <div class="shanti-thumbnail-field shanti-field-duration">
              <span class="field-content"><?php print $aItem->duration->formatted; ?></span>
            </div>
          </div>
        </div>
        <div class="footer-wrap">
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>