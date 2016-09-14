<section id="kmaps-search" role="search">
  <!-- BEGIN Input section -->
  <section class="input-section" style="display:none;">
    <form class="form">
      <fieldset>
        <div class="search-group">
          <?php print render($search); ?>
          <div class="form-group">
            <a class="advanced-link toggle-link show-advanced" href="#">
              <span class="icon"></span>
              Advanced
            </a>
          </div>
        </div>
        <section class="advanced-view">
          <div class="search-filters">
            <?php print render($filters); ?>
          </div>
        </section>
      </fieldset>
    </form>
  </section> <!-- END input section -->
  <!-- BEGIN view section -->
  <section class="view-section">
    <ul class="nav nav-tabs">
      <li class="listview active"><a href=".listview" data-toggle="tab"><span class="icon shanticon-list"></span>Results</a>
      </li>
      <li class="treeview"><a href=".treeview" data-toggle="tab"><span
            class="icon shanticon-tree"></span>Browse Places</a></li>
    </ul>
    <div class="tab-content">
      <!-- TAB - list view -->
      <div class="listview tab-pane active">
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
