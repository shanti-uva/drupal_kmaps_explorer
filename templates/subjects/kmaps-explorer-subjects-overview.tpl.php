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
