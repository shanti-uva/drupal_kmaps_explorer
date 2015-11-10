<div class="subjects-overview-image">
  <figure class="cap-bot">
    <img src="<?php print $data->picture->images[3]->url; ?>" class="img-responsive img-thumbnail" 
    alt="<?php print (count($data->picture->captions) > 0 ? $data->picture->captions[0]->title : ''); ?>">
    <figcaption>
      <?php if(count($data->picture->captions) > 0): ?>
        <div class="center-caption"><?php print $data->picture->captions[0]->title; ?></div>
      <?php endif; ?>
      <?php if(count($data->picture->descriptions) > 0): ?>
        <?php print $data->picture->descriptions[0]->title; ?>
      <?php endif; ?>
    </figcaption>
  </figure>
</div>