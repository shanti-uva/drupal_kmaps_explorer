<h6><?php print $title; ?></h6>
<ul class="related-places">
  <?php foreach($data->topic->features as $aItem): ?>
    <li>
      <span><?php print $aItem->header; ?></span>
      <span class="popover-link" data-app="places" data-id="<?php print $aItem->id; ?>">
        <span class="popover-link-tip"></span>
        <span class="icon shanticon-menu3"></span>
      </span>
    </li>
  <?php endforeach; ?>
</ul>
