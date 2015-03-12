<?php if (count($obj->feature->summaries) > 0): ?>
  <div class="summary-overview"><?php print $obj->feature->summaries[0]->content; ?></div>
<?php endif; ?>

<?php if (count($obj->feature->feature_types) > 0): ?>
  <p>
    <h6 class="custom-inline">FEATURE TYPE &nbsp;&nbsp;</h6>
    <?php foreach($obj->feature->feature_types as $pl_feat_type): ?>
      <span><?php print $pl_feat_type->title; ?></span>
      <span class="popover-kmaps" data-app="subjects" data-id="<?php print $pl_feat_type->id; ?>">
        <span class="popover-kmaps-tip"></span>
        <span class="icon shanticon-menu3"></span>
      </span>&nbsp;
    <?php endforeach; ?>
  </p>
<?php endif; ?>

<?php print $places_overview_image; ?>

<?php if(isset($obj->feature->closest_fid_with_shapes)): ?>
  <div class="openlayermap">
    <iframe sandbox="allow-forms allow-scripts allow-same-origin" width="100%" height="600" frameborder="0" src="http://www.thlib.org/places/maps/interactive_ajax/#fid:<?php print $obj->feature->closest_fid_with_shapes; ?>">
    </iframe>
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
