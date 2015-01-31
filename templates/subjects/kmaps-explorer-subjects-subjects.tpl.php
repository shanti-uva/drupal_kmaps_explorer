<h6><?php print $title; ?></h6>
<ul>
  <?php foreach($data->feature_relation_types as $aItem): ?>
    <li><?php print ucfirst($aItem->label); ?> (<?php print count($aItem->features); ?>):</li>
    <ul>
      <?php foreach($aItem->features as $bItem): ?>
        <li>
          <?php print shanti_sarvaka_info_popover(array(
        'label' => $bItem->header . ' (From the General Perspective)',
        'desc' => '<p>Currently no description available</p>',
        'tree' => array(
          'label' => 'Feature Types',
          'items' => array('t' => ''),
        ),
        'links' => array(
          'Full Entry' => array(
            'icon' => 'Subjects',
            'href' => 'subjects/' . $bItem->id . '/overview/nojs',
          ),
        ),
      )); ?>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endforeach; ?>
</ul>
