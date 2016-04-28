<div id="<?php print $ajax ? $type . '-ajax' : $type . '-main' ?>">
  <!-- Column Resources  -->
  <nav id="sidebar-first" class="col-xs-6 col-md-3 sidebar-offcanvas equal-height">
    <ul class="nav nav-pills nav-stacked">
      <li class="overview <?php print isset($overview) ? 'active' : ''; ?>"><a href="<?php print base_path() . $type . '/' . $kid; ?>/overview/nojs" class="use-ajax">
        <span class="icon shanticon-overview"></span>Overview</a>
      </li>

      <?php if($obj->feature->associated_resources->related_feature_count > 0): ?>
        <li class="<?php print $type; ?> <?php print (isset(${substr($type, 0, -1)}) && ${substr($type, 0, -1)}) ? 'active' : ''; ?>">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/<?php print $type; ?>/nojs" class="use-ajax">
            <span class="icon shanticon-<?php print $type; ?>"></span>
            <?php print ucfirst($type); ?>
            <span class="badge"><?php print $obj->feature->associated_resources->related_feature_count; ?></span>
          </a>
        </li>
      <?php endif; ?>

      <?php if($solr_text_count > 0): ?>
        <li class="essays <?php print isset($text) ? 'active' : ''; ?>">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/texts/nojs" class="use-ajax">
            <span class="icon shanticon-texts"></span>
            Texts
            <span class="badge"><?php print $solr_text_count; ?></span>
          </a>
        </li>
      <?php endif; ?>

      <?php if($obj->feature->associated_resources->{substr($reverse_type, 0, -1) . '_count'} > 0): ?>
        <li class="<?php print $reverse_type ?> <?php print (isset(${substr($reverse_type, 0, -1)}) && ${substr($reverse_type, 0, -1)}) ? 'active' : ''; ?>">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/<?php print $reverse_type; ?>/nojs" class="use-ajax">
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
        <li class="photos <?php print isset($photo) ? 'active' : ''; ?>">
          <a href="<?php print base_path() . $type . '/' . $kid; ?>/photos/nojs" class="use-ajax">
            <span class="icon shanticon-photos"></span>
            Images
            <span class="badge"><?php print $obj->feature->associated_resources->picture_count; ?></span>
          </a>
        </li>
      <?php endif; ?>

      <?php if($video_count > 0): ?>
        <li class="audio-video <?php print isset($audio_video) ? 'active' : ''; ?>">
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
  </nav>

  <!-- Column Main  -->
  <section  class="content-section col-xs-12 col-md-9 equal-height">
    <div class="tab-content">

      <article class="active" id="tab-main">
        <?php if($active_content): ?>
          <?php print $active_content; ?>
        <?php endif; ?>
      </article>

    </div><!-- END tab-content -->
  </section><!-- END content-section -->

  <!-- Edit button for Rails App -->
  <div class="fixed-action-button">
    <a href="<?php print $edit_url; ?>" class="round-btn-fixed" target="_blank">
      <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
    </a>
  </div>
</div>
