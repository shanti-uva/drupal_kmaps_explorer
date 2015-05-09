<h6><?php print $obj->feature->header; ?></h6>
<?php

if(count($obj->feature->summaries) > 0) {
  print $obj->feature->summaries[0]->content;
}

if (count($obj->feature->illustrations) > 0 && $obj->feature->illustrations[0]->type != 'external') {
  $imgObj = json_decode(file_get_contents($obj->feature->illustrations[0]->url));
  print theme('kmaps_explorer_subjects_overview_image', array('data' => $imgObj));
}

?>

<aside class="panel-group" id="accordion" style="margin-top:1em; clear:both;">
  <section class="panel panel-default">
    <div class="panel-heading">
      <h6>
        <a href="#collapseOne" data-toggle="collapse" data-parent="#accordion" class="accordion-toggle">
          <span class="glyphicon glyphicon-plus"></span>Names
        </a>
      </h6>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
      <div class="panel-body">
        <?php foreach($accordionNameContent as $name): ?>
            <div><?php print $name; ?></div>
        <?php endforeach; ?>
      </div>
    </div>
  </section>
  <section class="panel panel-default">
    <div class="panel-heading">
      <h6>
        <a href="#collapseTwo" data-toggle="collapse" data-parent="#accordion" class="accordion-toggle">
          <span class="glyphicon glyphicon-plus"></span>IDs
        </a>
      </h6>
    </div>
    <div id="collapseTwo" class="panel-collapse collapse">
      <div class="panel-body">
        <div>
          Subject ID: S<?php print $obj->feature->id; ?>
        </div>
      </div>
    </div>
  </section>
</aside>
