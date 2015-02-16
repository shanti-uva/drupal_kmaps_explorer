<h6>Features Associated with <?php print $title; ?></h6>
<ul class="related-places">
  <?php foreach($data->topic->features as $aItem): ?>
    <?php
      $bcrumbs = array();
      foreach($aItem->ancestors as $bItem) {
        $bcrumbs[$bItem->id] = '<a href="#">' . ucfirst($bItem->header) . '</a>';
      }

      $desc = empty($aItem->caption) ? '<p>Currently no description available</p>' : '<p>' . $aItem->caption . '</p>';

      $links = array(
        'Full Entry' => array(
          'icon' => 'link-external',
          'href' => 'places/' . $aItem->id . '/overview/nojs',
        ),
      );

      $links += kmaps_explorer_retrieve_counts('places', $aItem->id);
    ?>
    <li>
      <?php print shanti_sarvaka_info_popover(array(
        'label' => $aItem->header,
        'desc' => $desc,
        'tree' => array(
          'label' => 'Places',
          'items' => $bcrumbs,
        ),
        'links' => $links,
      )); ?>
    </li>
  <?php endforeach; ?>
</ul>
