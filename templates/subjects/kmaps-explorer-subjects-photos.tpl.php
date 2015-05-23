<h5><?php print $title; ?></h5><br>
<div class="related-photos">
  <?php foreach($data as $aItem): ?>
    <div class="each-photo">
      <a href="#pid<?php print $aItem->id; ?>" class="thumbnail" data-toggle="modal">
        <img src="<?php print $aItem->images[0]->url; ?>" alt="<?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?>">
      </a>
    </div>
    <div class="modal fade" tabindex="-1" role="dialog" id="pid<?php print $aItem->id; ?>" data-place="<?php print $aItem->locations[0]; ?>">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <p class="modal-title" id="myModalLabel"><?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?></p>
          </div>
          <div class="modal-body">
            <img src="<?php print $aItem->images[4]->url; ?>" class="img-responsive" alt="<?php print (count($aItem->captions) > 0 ? $aItem->captions[0]->title : ''); ?>">
            <p><strong>Id:</strong> <?php print $aItem->id; ?></p>
            <p class="image-modal-location"><strong>Location: </strong><span class="places-loc"></span></p>
            <?php if(count($aItem->descriptions) > 0): ?>
            <p><strong>Description: </strong>
            <?php print strip_tags($aItem->descriptions[0]->title); ?></p>
            <?php endif; ?>
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
