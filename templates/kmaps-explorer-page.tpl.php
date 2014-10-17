<!-- Column Resources  -->              
<aside class="content-resources col-xs-6 col-sm-3 sidebar-offcanvas equal-height">
  <ul class="nav nav-pills nav-stacked">
    <li class="overview"><a href="<?php print base_path() . $type . '/' . $kid; ?>/overview">
      <i class="icon shanticon-overview"></i>Overview</a>
    </li>

    <?php if($obj->feature->associated_resources->related_feature_count > 0): ?>
      <li class="<?php print $type; ?>">
        <a href="<?php print base_path() . $type . '/' . $kid; ?>/<?php print $type; ?>/nojs" class="use-ajax">
          <i class="icon shanticon-<?php print $type; ?>"></i>
          <?php print ucfirst($type); ?>
          <span class="badge"><?php print $obj->feature->associated_resources->related_feature_count; ?></span>
        </a>
      </li>
    <?php endif; ?>

    <?php if($obj->feature->associated_resources->description_count > 0): ?>
      <li class="essays">
        <a href="<?php print base_path() . $type . '/' . $kid; ?>/essays/nojs" class="use-ajax">
          <i class="icon shanticon-essays"></i>
          Essays
          <span class="badge"><?php print $obj->feature->associated_resources->description_count; ?></span>
        </a>
      </li>
    <?php endif; ?>

    <?php if($obj->feature->associated_resources->{substr($reverse_type, 0, -1) . '_count'} > 0): ?>
      <li class="<?php print $reverse_type ?>">
        <a href="<?php print base_path() . $type . '/' . $kid; ?>/<?php print $reverse_type ?>/nojs" class="use-ajax">
          <i class="icon shanticon-<?php print $reverse_type ?>"></i>
          <?php print ucfirst($reverse_type); ?>
          <span class="badge"><?php print $obj->feature->associated_resources->{substr($reverse_type, 0, -1) . '_count'}; ?></span>
        </a>
      </li>
    <?php endif; ?>

    <?php if(false): ?>
      <li class="agents"><a href="<?php print base_path() . $type . '/' . $kid; ?>/agents">
        <i class="icon shanticon-agents"></i>Agents<span class="badge"></span></a>
      </li>
    <?php endif; ?>

    <?php if(false): ?>
      <li class="events"><a href="<?php print base_path() . $type . '/' . $kid; ?>/events">
        <i class="icon shanticon-events"></i>Events<span class="badge"></span></a>
      </li>
    <?php endif; ?>

    <?php if($obj->feature->associated_resources->picture_count > 0): ?>
      <li class="photos">
        <a href="<?php print base_path() . $type . '/' . $kid; ?>/photos/nojs" class="use-ajax">
          <i class="icon shanticon-photos"></i>
          Photos
          <span class="badge"><?php print $obj->feature->associated_resources->picture_count; ?></span>
        </a>
      </li>
    <?php endif; ?>

    <?php if($video_count > 0): ?>
      <li class="audio-video">
        <a href="<?php print base_path() . $type . '/' . $kid; ?>/audio-video/nojs" class="use-ajax">
          <i class="icon shanticon-audio-video"></i>
          Audio-Video
          <span class="badge"><?php print $video_count; ?></span>
        </a>
      </li>
    <?php endif; ?>

    <?php if(false): ?>
      <li class="visuals"><a href="<?php print base_path() . $type . '/' . $kid; ?>/visuals">
        <i class="icon shanticon-visuals"></i>Visuals<span class="badge"></span></a>
      </li>
    <?php endif; ?>

    <?php if($obj->feature->associated_resources->document_count > 0): ?>
      <li class="texts">
        <a href="<?php print base_path() . $type . '/' . $kid; ?>/texts/nojs" class="use-ajax">
          <i class="icon shanticon-texts"></i>
          Texts
          <span class="badge"><?php print $obj->feature->associated_resources->document_count; ?></span>
        </a>
      </li>
    <?php endif; ?>

    <?php if(false): ?>
      <li class="maps"><a href="<?php print base_path() . $type . '/' . $kid; ?>/maps">
        <i class="icon shanticon-maps"></i>Maps<span class="badge"></span></a>
      </li>
    <?php endif; ?>

    <?php if(false): ?>
      <li class="community"><a href="<?php print base_path() . $type . '/' . $kid; ?>/community">
        <i class="icon shanticon-community"></i>Community<span class="badge"></span></a>
      </li>
    <?php endif; ?>

    <?php if(false): ?>
      <li class="terms"><a href="<?php print base_path() . $type . '/' . $kid; ?>/terms">
        <i class="icon shanticon-terms"></i>Terms<span class="badge"></span></a>
      </li>
    <?php endif; ?>

    <?php if(false): ?>
      <li class="sources"><a href="<?php print base_path() . $type . '/' . $kid; ?>/sources">
        <i class="icon shanticon-sources"></i>Sources<span class="badge"></span></a>
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
                  <a href="<?php print base_path() . $reverse_type . '/' . $pl_feat_type->id; ?>">
                    <?php print $pl_feat_type->title; ?>
                  </a>; 
                <?php endforeach; ?>
              </p>
            <?php endif; ?>
          <?php endif; ?>
        </article>
      
  </div><!-- END tab-content -->
</section><!-- END content-section -->