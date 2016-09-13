<section id="kmaps-search" role="search">
  <!-- BEGIN view section -->
  <section class="view-section">
    <!-- BEGIN Input section -->
    <section class="input-section" style="display:none;">
      <form class="form">
        <fieldset>
          <div class="search-group">
            <?php print render($search); ?>
          </div>
          <section class="search-filters">
            <?php print render($filters); ?>
          </section><!-- END seach filters -->
        </fieldset>
      </form>
    </section> <!-- END input section -->
    <ul class="nav nav-tabs">
      <li class="listview active"><a href=".listview" data-toggle="tab"><span class="icon shanticon-list"></span>Results</a></li>
      <li class="treeview"><a href=".treeview" data-toggle="tab"><span
            class="icon shanticon-tree"></span>Browse</a></li>
    </ul>
    <div class="tab-content">
      <!-- TAB - list view -->
      <div class="listview tab-pane active">
        <!-- BEGIN Input section -->
        <!-- <section class="input-section" style="display:none;">
          <form class="form">
            <fieldset>
            </fieldset>
          </form>
        </section> --> <!-- END input section -->
        <div class="view-wrap"> <!-- view-wrap controls container height -->
        </div>
      </div>
      <!-- TAB - tree view -->
      <div class="treeview tab-pane">
        <div id="tree" class="view-wrap"><!-- view-wrap controls tree container height --></div>
      </div>
    </div>
  </section><!-- END view section -->
</section><!-- END kmaps-search -->
