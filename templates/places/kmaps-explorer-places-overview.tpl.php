<?php if (count($obj->feature->summaries) > 0): ?>
  <div class="summary-overview"><?php print $obj->feature->summaries[0]->content; ?></div>
<?php endif; ?>

<?php if (count($obj->feature->feature_types) > 0): ?>
  <p>
    <h6 class="custom-inline">FEATURE TYPE &nbsp;&nbsp;</h6>
    <?php foreach($obj->feature->feature_types as $pl_feat_type): ?>
      <?php
        $bcrumbs = array();
        foreach($pl_feat_type->ancestors->feature_type as $bItem) {
          $bcrumbs[$bItem->id] = '<a href="#">' . ucfirst($bItem->title) . '</a>';
        }

        $desc = empty($pl_feat_type->caption) ? '<p>Currently no description available</p>' : '<p>' . $pl_feat_type->caption . '</p>';
      ?>
      <?php print shanti_sarvaka_info_popover(array(
        'label' => $pl_feat_type->title,
        'desc' => $desc,
        'tree' => array(
          'label' => 'Subjects',
          'items' => $bcrumbs,
        ),
        'links' => array(
          'Full Entry' => array(
            'icon' => 'places',
            'href' => 'places/' . $pl_feat_type->id . '/overview/nojs',
          ),
        ),
      )); ?>&nbsp;
    <?php endforeach; ?>
  </p>
<?php endif; ?>

<?php print $places_overview_image; ?>

<?php if(isset($obj->feature->closest_fid_with_shapes)): ?>
  <div class="google-maps">
    <iframe frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?q=http:%2F%2Fplaces.thlib.org%2Ffeatures%2Fgis_resources%2F<?php print $obj->feature->closest_fid_with_shapes; ?>.kmz&amp;ie=UTF8&amp;t=p&amp;output=embed"></iframe>
    <div class="btn-group btn-group-gmaps">
      <button class="btn btn-default renderGmaps active">Google Map</button>
      <button class="btn btn-default renderOpenLayerMaps">Custom Map</button>
    </div>
  </div>
<?php endif; ?>

<aside class="panel-group" id="accordion">
  <section class="panel panel-default">
    <div class="panel-heading">
      <h6>
        <a href="#collapseOne" data-toggle="collapse" data-parent="#accordion" class="accordion-toggle">
          <span class="glyphicon glyphicon-plus"></span> Names
        </a>
      </h6>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
      <div class="panel-body">
        <?php print $accordionName; ?>
      </div>
    </div>
  </section>
  <?php if(!empty($accordionEtymology)): ?>
  <section class="panel panel-default">
    <div class="panel-heading">
      <h6>
        <a href="#collapseTwo" data-toggle="collapse" data-parent="#accordion" class="accordion-toggle">
          <span class="glyphicon glyphicon-plus"></span> ETYMOLOGY
        </a>
      </h6>
    </div>
    <div id="collapseTwo" class="panel-collapse collapse">
      <div class="panel-body">
        <?php print $accordionEtymology; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</aside>
