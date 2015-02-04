<?php foreach($data->feature_relation_types as $aItem): ?>
  <h6><?php print $title; ?> <?php print $aItem->label; ?> (<?php print $aItem->count; ?>):</h6>
  <ul>
    <?php foreach($aItem->categories as $bItem): ?>
      <li>
        <?php print $bItem->header; ?> (<?php print count($bItem->features); ?>)
        <ul>
          <?php foreach($bItem->features as $cItem): ?>
            <?php
              $bcrumbs = array();
              foreach($cItem->ancestors as $dItem) {
                $bcrumbs[$dItem->id] = '<a href="#">' . ucfirst($dItem->header) . '</a>';
              }

              $desc = empty($cItem->caption) ? '<p>Currently no description available</p>' : '<p>' . $cItem->caption . '</p>';
            ?>
            <li>
              <?php print shanti_sarvaka_info_popover(array(
                'label' => $cItem->header,
                'desc' => $desc,
                'tree' => array(
                  'label' => 'Places',
                  'items' => $bcrumbs,
                ),
                'links' => array(
                  'Full Entry' => array(
                    'icon' => 'places',
                    'href' => 'places/' . $cItem->id . '/overview/nojs',
                  ),
                ),
              )); ?>
            </li>
          <?php endforeach; ?>
        </ul>
      </li>
    <?php endforeach; ?>
  </ul>
<?php endforeach; ?>
