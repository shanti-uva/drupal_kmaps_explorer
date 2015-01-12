<li>
  <a href="<?php print base_path() . $app; ?>"><?php print ucfirst($app); ?>: </a>
</li>
<?php foreach($data as $aItem): ?>
  <li>
    <a href="<?php print base_path(); ?><?php print $app; ?>/<?php print $aItem->id; ?>/overview/nojs" class="use-ajax"><?php print $aItem->header; ?></a>
    <span class="icon shanticon-arrow3-right"></span>
  </li>
<?php endforeach; ?>