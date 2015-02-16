<h6><?php print $title; ?></h6>
<ul>
  <?php foreach($data->feature_relation_types as $aItem): ?>
    <li><?php print ucfirst($aItem->label); ?> (<?php print count($aItem->features); ?>):</li>
    <ul>
      <?php foreach($aItem->features as $bItem): ?>
        <?php
          $bcrumbs = array();
          foreach($bItem->ancestors as $cItem) {
            $bcrumbs[$cItem->id] = '<a href="#">' . ucfirst($cItem->header) . '</a>';
          }

          $desc = empty($bItem->caption) ? '<p>Currently no description available</p>' : '<p>' . $bItem->caption . '</p>';

          $links = array(
            'Full Entry' => array(
              'icon' => 'link-external',
              'href' => 'subjects/' . $bItem->id . '/overview/nojs',
            ),
          );

          $links += kmaps_explorer_retrieve_counts('subjects', $bItem->id);

        ?>
        <li>
        <?php print shanti_sarvaka_info_popover(array(
          'label' => $bItem->header . ' (From the General Perspective)',
          'desc' => $desc,
          'tree' => array(
            'label' => 'Subjects',
            'items' => $bcrumbs,
          ),
          'links' => $links,
        )); ?>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endforeach; ?>
</ul>
