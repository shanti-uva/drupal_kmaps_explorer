<ul id="photo-pagination" class="pager">
  <li class="pager-first first"><a href="<?php print $first_link; ?>" class="use-ajax"><span class="icon"></span></a></li>
  <li class="pager-previous"><a href="<?php print $previous_link; ?>" class="use-ajax"><span class="icon"></span></a></li>
  <li class="pager-item">PAGE</li>
  <li class="pager-item widget"><?php print $input_el; ?></li>
  <li class="pager-item">OF <?php print $total_pages; ?></li>
  <li class="pager-next"><a href="<?php print $next_link; ?>" class="use-ajax"><span class="icon"></span></a></li>
  <li class="pager-last last"><a href="<?php print $last_link; ?>" class="use-ajax"><span class="icon"></span></a></li>
</ul>