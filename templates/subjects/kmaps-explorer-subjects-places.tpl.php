<h6>Features Associated with <?php print $title; ?></h6>
<ul class="related-places">
  <?php foreach($data->features as $aItem): ?>
    <li>
      <a href="<?php print base_path(); ?>places/<?php print $aItem->id; ?>"><?php print $aItem->header; ?></a>
    </li>
  <?php endforeach; ?>
</ul>