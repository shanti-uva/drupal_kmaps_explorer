<h6>Photographs in <?php print $title; ?></h6>
<div class="related-photos">
  <?php foreach($data as $aItem): ?>
    <div class="each-photo">
      <a href="#pid<?php print $aItem->id; ?>" class="thumbnail" data-toggle="modal">
        <img src="<?php print $aItem->images[0]->url; ?>" alt="<?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?>">
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
            <img src="<?php print $aItem->images[4]->url; ?>" alt="<?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?>">
            <p><strong>Resource #:</strong> <?php print $aItem->id; ?></p>
            <p><strong>Description:</strong></p>
            <?php print (count($aItem->descriptions) > 0 ? $aItem->descriptions[0]->title : ''); ?>
            <p><strong>Copyright holder:</strong> <?php print (count($aItem->copyrights) > 0 ? $aItem->copyrights[0]->copyright_holder->title : ''); ?></p>
            <?php if(isset($aItem->photographer)): ?>
              <p><strong>Photographer:</strong> <?php print (isset($aItem->photographer->fullname) ? $aItem->photographer->fullname : ''); ?></p>
            <?php endif; ?>
          </div>
        </div>
      </div>
    </div>
  <?php endforeach; ?>
</div>