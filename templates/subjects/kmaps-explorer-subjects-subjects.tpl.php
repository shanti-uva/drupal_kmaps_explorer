<h5><?php print $title; ?></h5><br>
<ul>
  <?php foreach($data->feature_relation_types as $aItem): ?>
    <li><?php print ucfirst($aItem->label); ?> (<?php print count($aItem->features); ?>):</li>
    <ul>
      <?php foreach($aItem->features as $bItem): ?>
        <li>
          <span><?php print $bItem->header; ?> (From the General Perspective) 
          	<?php if(!empty($bItem->descendant_count)): ?>
          		&#8212; <?php print $bItem->descendant_count; ?> Subjects
          	<?php endif; ?>
          </span>
          <span class="popover-kmaps" data-app="subjects" data-id="<?php print $bItem->id; ?>">
            <span class="popover-kmaps-tip"></span>
            <span class="icon shanticon-menu3"></span>
          </span>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endforeach; ?>
</ul>
