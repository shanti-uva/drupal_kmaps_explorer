<div class="related-texts">
  <h6>Texts in <?php print $title; ?></h6>
  <?php foreach($data as $aItem): ?>
    <div class="each-text">
      <a href="#pid<?php print $aItem->id; ?>" class="thumbnail" data-toggle="modal">
        <img src="<?php print $aItem->images[1]->url; ?>" alt="<?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?>">
      </a>
    </div>
    <div class="modal fade" tabindex="-1" role="dialog" id="pid<?php print $aItem->id; ?>">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h4 class="modal-title" id="myModalLabel"><?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?></h4>
          </div>
          <div class="modal-body">
            <img src="<?php print $aItem->images[6]->url; ?>" alt="<?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?>">
            <p><strong>Resource #:</strong> <?php print $aItem->id; ?></p>
          </div>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>