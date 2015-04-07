<div class="related-photos">
  <img src="<?php print $aItem->images[4]->url; ?>" alt="<?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?>">
  <p><strong>Resource #:</strong> <?php print $aItem->id; ?></p>
  <p><strong>Description:</strong></p>
  <?php print (count($aItem->descriptions) > 0 ? $aItem->descriptions[0]->title : ''); ?>
  <p><strong>Copyright holder:</strong> <?php print (count($aItem->copyrights) > 0 ? $aItem->copyrights[0]->copyright_holder->title : ''); ?></p>
  <?php if(isset($aItem->photographer)): ?>
    <p><strong>Photographer:</strong> <?php print (isset($aItem->photographer->fullname) ? $aItem->photographer->fullname : ''); ?></p>
  <?php endif; ?>
</div>
