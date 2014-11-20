<?php foreach($data->feature_relation_types as $aItem): ?>
  <h6><?php print $title; ?> <?php print $aItem->label; ?> (<?php print $aItem->count; ?>):</h6>
  <ul>
    <?php foreach($aItem->categories as $bItem): ?>
      <li>
        <?php print $bItem->header; ?> (<?php print count($bItem->features); ?>)
        <ul>
          <?php foreach($bItem->features as $cItem): ?>
            <li>
              <a href="<?php print base_path(); ?>places/<?php print $cItem->id; ?>/overview/nojs" class="use-ajax">
                <?php print $cItem->header; ?>
              </a>
            </li>
          <?php endforeach; ?>
        </ul>
      </li>
    <?php endforeach; ?>
  </ul>
<?php endforeach; ?>