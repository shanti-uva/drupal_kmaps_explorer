<div class="subjects-in-subjects kmaps-list-columns">
<h6><?php print $title; ?></h6>
<p>From the General Perspective:</p>
<ul>
  <?php foreach($data->feature_relation_types as $aItem): ?>
    <li style="list-style-type: none;"><h6><?php print ucfirst($aItem->label); ?></h6> (<?php print count($aItem->features); ?>):
    <ul>
      <?php foreach($aItem->features as $bItem): ?>
        <li>
          <span><?php print $bItem->header; ?>  
          	<?php if(!empty($bItem->descendant_count)): ?>
          		(<?php print $bItem->descendant_count; ?> 
          		<?php if($bItem->descendant_count == 1): ?>
          			Subcategory)
          		<?php else: ?>
          			Subcategories)
          		<?php endif; ?>
          	<?php endif; ?>
          </span>
          <span class="popover-kmaps" data-app="subjects" data-id="<?php print $bItem->id; ?>">
            <span class="popover-kmaps-tip"></span>
            <span class="icon shanticon-menu3"></span>
          </span>
        </li>
      <?php endforeach; ?>
    </ul></li>
  <?php endforeach; ?>
</ul>
</div>