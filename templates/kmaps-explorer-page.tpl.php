<div id="<?php print $ajax ? $type . '-ajax' : $type . '-main' ?>">
  <!-- Column Resources  -->
  <aside class="content-resources col-xs-6 col-sm-3 sidebar-offcanvas equal-height">
    <ul class="nav nav-pills nav-stacked">
      <li class="overview active"><a href="<?php print base_path() . $type . '/' . $kid; ?>/overview/nojs" class="use-ajax">
        <span class="icon shanticon-overview"></span>Overview</a>
      </li>

      <?php if($obj->feature->associated_resources->related_feature_count > 0): ?>
        <li class="<?php print $type; ?>">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/<?php print $type; ?>/nojs" class="use-ajax">
            <span class="icon shanticon-<?php print $type; ?>"></span>
            <?php print ucfirst($type); ?>
            <span class="badge"><?php print $obj->feature->associated_resources->related_feature_count; ?></span>
          </a>
        </li>
      <?php endif; ?>

      <?php if($solr_text_count > 0): ?>
        <li class="essays">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/essays/nojs/solr/<?php print isset($obj->feature->descriptions) ? '/' . $obj->feature->descriptions[0]->id : ''; ?>" class="use-ajax">
            <span class="icon shanticon-essays"></span>
            Texts
            <span class="badge"><?php print $solr_text_count; ?></span>
          </a>
        </li>
      <?php elseif($obj->feature->associated_resources->description_count > 0): ?>
        <li class="essays">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/essays/nojs/nosolr<?php print isset($obj->feature->nested_descriptions) ? '/' . $obj->feature->nested_descriptions[0]->id : ''; ?>" class="use-ajax">
            <span class="icon shanticon-essays"></span>
            Texts
            <span class="badge"><?php print $obj->feature->associated_resources->description_count; ?></span>
          </a>
        </li>
      <?php endif; ?>

      <?php if($obj->feature->associated_resources->{substr($reverse_type, 0, -1) . '_count'} > 0): ?>
        <li class="<?php print $reverse_type ?>">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/<?php print $reverse_type ?>/nojs" class="use-ajax">
            <span class="icon shanticon-<?php print $reverse_type ?>"></span>
            <?php print ucfirst($reverse_type); ?>
            <span class="badge"><?php print $obj->feature->associated_resources->{substr($reverse_type, 0, -1) . '_count'}; ?></span>
          </a>
        </li>
      <?php endif; ?>

      <?php if(false): ?>
        <li class="agents"><a href="<?php print base_path() . $type . '/' . $kid; ?>/agents">
          <span class="icon shanticon-agents"></span>Agents<span class="badge"></span></a>
        </li>
      <?php endif; ?>

      <?php if(false): ?>
        <li class="events"><a href="<?php print base_path() . $type . '/' . $kid; ?>/events">
          <span class="icon shanticon-events"></span>Events<span class="badge"></span></a>
        </li>
      <?php endif; ?>

      <?php if($obj->feature->associated_resources->picture_count > 0): ?>
        <li class="photos">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/photos/nojs" class="use-ajax">
            <span class="icon shanticon-photos"></span>
            Photos
            <span class="badge"><?php print $obj->feature->associated_resources->picture_count; ?></span>
          </a>
        </li>
      <?php endif; ?>

      <?php if($video_count > 0): ?>
        <li class="audio-video">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/audio-video/nojs" class="use-ajax">
            <span class="icon shanticon-audio-video"></span>
            Audio-Video
            <span class="badge"><?php print $video_count; ?></span>
          </a>
        </li>
      <?php endif; ?>

      <?php if(false): ?>
        <li class="visuals"><a href="<?php print base_path() . $type . '/' . $kid; ?>/visuals">
          <span class="icon shanticon-visuals"></span>Visuals<span class="badge"></span></a>
        </li>
      <?php endif; ?>

      <?php if(false): ?>
        <li class="maps"><a href="<?php print base_path() . $type . '/' . $kid; ?>/maps">
          <span class="icon shanticon-maps"></span>Maps<span class="badge"></span></a>
        </li>
      <?php endif; ?>

      <?php if(false): ?>
        <li class="community"><a href="<?php print base_path() . $type . '/' . $kid; ?>/community">
          <span class="icon shanticon-community"></span>Community<span class="badge"></span></a>
        </li>
      <?php endif; ?>

      <?php if(false): ?>
        <li class="terms"><a href="<?php print base_path() . $type . '/' . $kid; ?>/terms">
          <span class="icon shanticon-terms"></span>Terms<span class="badge"></span></a>
        </li>
      <?php endif; ?>

      <?php if(false): ?>
        <li class="sources"><a href="<?php print base_path() . $type . '/' . $kid; ?>/sources">
          <span class="icon shanticon-sources"></span>Sources<span class="badge"></span></a>
        </li>
      <?php endif; ?>
    </ul>
  </aside>

  <!-- Column Main  -->
  <section  class="content-section col-xs-12 col-sm-9 equal-height">
    <div class="tab-content">

      <article class="active" id="tab-main">
        <?php if ($type == 'subjects'): ?>
          <h6><?php print $obj->feature->header; ?></h6>
          <?php if(count($obj->feature->summaries) > 0): ?>
            <?php print $obj->feature->summaries[0]->content; ?>
          <?php endif; ?>
          <?php
            if (count($obj->feature->illustrations) > 0 && $obj->feature->illustrations[0]->type != 'external') {
              $imgObj = json_decode(file_get_contents($obj->feature->illustrations[0]->url));
              print theme('kmaps_explorer_subjects_overview_image', array('data' => $imgObj));
            }
          ?>
        <?php endif; ?>

        <?php if ($type == 'places'): ?>
          <?php if (count($obj->feature->summaries) > 0): ?>
            <div class="summary-overview"><?php print $obj->feature->summaries[0]->content; ?></div>
          <?php endif; ?>

          <?php if (count($obj->feature->feature_types) > 0): ?>
            <p>
              <h6 class="custom-inline">FEATURE TYPE &nbsp;&nbsp;</h6>
              <?php foreach($obj->feature->feature_types as $pl_feat_type): ?>
                <a href="<?php print base_path() . $reverse_type . '/' . $pl_feat_type->id; ?>/overview/nojs">
                  <?php print $pl_feat_type->title; ?>
                </a>&nbsp;
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

        <?php endif; ?>
      </article>

    </div><!-- END tab-content -->
  </section><!-- END content-section -->
</div>
