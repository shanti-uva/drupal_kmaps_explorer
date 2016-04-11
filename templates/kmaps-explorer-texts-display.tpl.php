<h6><?php print $title; ?></h6>
<ul class="texts-list">
<?php foreach($data->doclist->docs as $aItem): ?>
  <li>
    <a href="<?php print base_path() . $app . '/' . $sid . '/' . 'text_node/' . $aItem->id . '/nojs'; ?>" class="use-ajax">
      <?php print $aItem->caption; ?>
    </a>
  </li>
<?php endforeach; ?>
</ul>
