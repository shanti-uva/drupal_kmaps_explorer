<h6>Features Associated with <?php print $title; ?></h6>
<ul class="related-places">
  <?php foreach($data->features as $aItem): ?>
    <li>
      <?php print shanti_sarvaka_info_popover(array(
        'label' => $aItem->header,
        'desc' => 'Currently no description available',
        'tree' => array(
          'label' => 'Feature Types',
          'items' => array('t' => ucfirst($aItem->feature_types[0]->title)),
        ),
        'links' => array(
          'Full Entry' => array(
            'icon' => 'places',
            'href' => 'places/' . $aItem->id . '/overview/nojs',
          ),
        ),
      )); ?>
    </li>
  <?php endforeach; ?>
</ul>