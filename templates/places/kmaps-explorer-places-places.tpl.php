<h5>Places Related to <?php print $title; ?></h5><br>
<div class="places-in-places">
  <?php foreach($data->feature_relation_types as $aItem): ?>
    <h6><?php print $title; ?> <?php print $aItem->label; ?> (<?php print $aItem->count; ?>):</h6>
    <ul>
      <?php foreach($aItem->categories as $bItem): ?>
        <li>
          <?php print $bItem->header; ?> (<?php print count($bItem->features); ?>)
          <ul>
            <?php foreach($bItem->features as $cItem): ?>
              <li>
                <span><?php print $cItem->header; ?></span>
                <span class="popover-kmaps" data-app="places" data-id="<?php print $cItem->id; ?>">
                  <span class="popover-kmaps-tip"></span>
                  <span class="icon shanticon-menu3"></span>
                </span>
              </li>
            <?php endforeach; ?>
          </ul>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endforeach; ?>
</div>
