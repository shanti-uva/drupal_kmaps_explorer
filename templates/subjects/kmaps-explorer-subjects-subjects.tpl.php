<h6><?php print $title; ?></h6>
<ul>
  <?php foreach($data->feature_relation_types as $aItem): ?>
    <li><?php print ucfirst($aItem->label); ?> (<?php print $aItem->features->length; ?>):</li>
    <ul>
      <?php foreach($aItem->features as $bItem): ?>
        <li>
          <a href="<?php print base_path() . 'subjects/' . $bItem->id; ?>">
            <?php print $bItem->header; ?> (From the General Perspective)
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endforeach; ?>
</ul>