<ul id="photo-pagination" class="pager">
  <li class="first-page pager-first first"><a href="<?php print $first_link; ?>" class="use-ajax"><i class="icon"></i></a></li>
  <li class="previous-page pager-previous"><a href="<?php print $previous_link; ?>" class="use-ajax"><i class="icon"></i></a></li>
  <li>PAGE</li>
  <li class="pager-current widget"><?php print $input_el; ?></li>
  <li>OF <?php print $total_pages; ?></li>
  <li class="next-page pager-next"><a href="<?php print $next_link; ?>" class="use-ajax"><i class="icon"></i></a></li>
  <li class="last-page pager-last last"><a href="<?php print $last_link; ?>" class="use-ajax"><i class="icon"></i></a></li>
</ul>