<?php if(count($data->feature->feature_types) > 0): ?>
  <h6>FEATURE TYPES:</h6>
  <ul>
    <?php foreach($data->feature->feature_types as $aItem): ?>
      <li>
        <span><?php print $aItem->title; ?></span>
        <span class="popover-kmaps" data-app="subjects" data-id="<?php print $aItem->id; ?>">
          <span class="popover-kmaps-tip"></span>
          <span class="icon shanticon-menu3"></span>
        </span>
      </li>
    <?php endforeach; ?>
  </ul>
<?php endif; ?>

<?php if(count($data->feature->category_features) > 0): ?>
  <div>
    <h6>SUBJECTS</h6>
    <ul>
      <?php foreach($data->feature->category_features as $aItem): ?>
        <li>
          <?php print $aItem->root->title; ?> &gt;
          <a href="<?php print base_path(); ?>subjects/<?php print $aItem->category->id; ?>/overview/nojs" class="use-ajax">
            <?php print $aItem->category->title; ?>
          </a>
          <?php if(isset($aItem->numeric_value)): ?>
            : <?php print $aItem->numeric_value; ?>
          <?php endif; ?>
          <?php if(isset($aItem->string_value)): ?>
            : <?php print $aItem->string_value; ?>
          <?php endif; ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
<?php endif; ?>
