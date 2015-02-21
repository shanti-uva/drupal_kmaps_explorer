<?php if (count($obj->feature->summaries) > 0): ?>
  <div class="summary-overview"><?php print $obj->feature->summaries[0]->content; ?></div>
<?php endif; ?>

<?php if (count($obj->feature->feature_types) > 0): ?>
  <p>
    <h6 class="custom-inline">FEATURE TYPE &nbsp;&nbsp;</h6>
    <?php foreach($obj->feature->feature_types as $pl_feat_type): ?>
      <span><?php print $pl_feat_type->title; ?></span>
      <span class="popover-kmaps" data-app="subjects" data-id="<?php print $pl_feat_type->id; ?>">
        <span class="popover-kmaps-tip"></span>
        <span class="icon shanticon-menu3"></span>
      </span>&nbsp;
    <?php endforeach; ?>
  </p>
<?php endif; ?>

<?php print $places_overview_image; ?>

<?php if(isset($obj->feature->closest_fid_with_shapes)): ?>
  <div class="openlayermap">


   <!-- begin content -->
   <div id="content">
   <div class="shell-1">

  <div>

    <div id="controlPanelWrapper">
      <div id="controlPanelAbove" class="controlPanel"></div>
    </div>

    <div id="interface_wrapper" style="position: relative;">
      <div id="map_wrapper">
        <div id="sidebar_wrapper">
          <div id="sidebar_toggle"></div>
          <div id="sidebar_content">
            <div>
              <h4>Search</h4>
              <div id="sidebar_section_feature_search">
                <form id="feature_search_form" onsubmit="return feature_search();" method="get" action="">
                  Feature:<br />
                  <input type="text" name="q" id="feature_search_q" />
                  <a href="#" id="show_advanced_search" style="float: right;">Advanced Search</a>
                  <div id="advanced_search" style="display: none; margin-top: 20px;">
                    <div>
                      <input type="radio" id="scope_full_text" name="scope" value="full_text" /> All Text
                      <input type="radio" id="scope_name" name="scope" value="name" checked="checked" /> Name
                    </div>
                    <div id="subjects_category_selector"></div>
                    <div id="characteristic_selector"></div>
                  </div>
                  <input type="submit" value="Search" style="margin-top: 4px;" />
                  <input type="button" value="Clear" id="clear_search_form" style="margin-top: 4px;" />
                </form>
              </div>
            </div>
            <div>
              <h4>Results</h4>
              <div id="sidebar_section_feature_search_results">
                Please use the search box above to search for features.
              </div>
            </div>
            <div>
              <h4>Go To</h4>
              <div id="sidebar_section_go_to">
                <form onsubmit="return go_to_thl_id(this);">
                  THL ID: <input type="text" name="thl_id" style="width: 40px" /> <input type="submit" value="Go" />
                </form>
                <form onsubmit="return go_to_lon_lat(this);">
                  Lon/Lat: <input type="text" name="lon" style="width: 50px" /> <input type="text" name="lat" style="width: 50px" /> <input type="submit" value="Go" onclick="" />
                </form>
              </div>
            </div>
            <div>
              <h4>Options</h4>
              <div id="sidebar_section_options"></div>
            </div>
            <div>
              <h4>Browse</h4>
              <div id="sidebar_section_feature_types"></div>
            </div>
            <div>
              <h4>Map Layers</h4>
              <div id="sidebar_section_map_layers"></div>
            </div>
            <div>
              <h4>Active Layers</h4>
              <div id="sidebar_section_active_layers" class="olControlGroupedLayerSwitcher"></div>
            </div>
            <div>
              <h4 id="sidebar_section_help" class="no-accordion">
                <a href="/access/wiki/site/c06fa8cf-c49c-4ebc-007f-482de5382105/thl%20interactive%20maps.html" class="thl-pop wiki new-window">Help</a>
              </h4>
            </div>
          </div>
        </div>
        <div id="map"></div>
      </div>
    </div>

  </div>

    <div style="clear: both"></div>

    <div id="link_popup">
      You can bookmark this map as:
      <br />
      <input type="text" readonly="readonly" class="map_link" style="display: inline;" value="" />
      <br />
      Please note that layers projected using the "draw an area" buttons will not be preserved in the URL.  Layers projected via the "Feature Types" menu will be.
    </div>
    <div id="find_features_loading"><img src="img/ajax-loader.gif" alt="Loading features..." /></div>

    <div id="drawn_area_feature_type_popup">
      <div style="width: 250px;">Begin typing to choose which feature type to find in this area:</div>
      <form method="get" action="" onsubmit="return selected_area_feature_type_search();">
        <input type="text" id="drawn_area_feature_type_input" autocomplete="off" />
        <input type="hidden" id="drawn_area_feature_type_value" />
        <input type="submit" value="Search" />
        <input type="button" value="Cancel" onclick="return cancel_selected_area_feature_type();" />
      </form>
      Or <a class="thl-content no-view-alone" id="selected_area_feature_type_search_button" href="#thl-popup=/places/maps/interactive/selected_area_feature_types.php">select multiple feature types</a>.
    </div>

    <div id="save_as_popup">
      <dl>
        <dt>Image</dt>
        <dd><a href="#" onclick="return render_map('save', 'gif');">GIF</a>
        <br/><a href="#" onclick="return render_map('save', 'jpeg');">JPEG</a>
        <br/><a href="#" onclick="return render_map('save', 'png');">PNG</a>
        </dd>
        <dt>GIS</dt>
        <dd>
          <a href="#" onclick="return render_map('save', 'gml');">GML</a><br />
          <a href="#" onclick="return render_map('save', 'kml');">KML</a><br/>
          <a href="#" onclick="return render_map('save', 'shp');">Shapefile</a>
        </dd>
        <dt>Other</dt>
        <dd>
          <a href="#" onclick="return render_map('save', 'pdf');">PDF</a>
        </dd>
      </dl>
    </div>

    <div id="lon_lat_popup">
      <div>
        <span class="lon_lat_popup_label">Longitude:</span> <span id="lon_lat_popup_lon" class="lon_lat_popup_label_value"></span>
      </div>
      <div>
        <span class="lon_lat_popup_label">Latitude:</span> <span id="lon_lat_popup_lat" class="lon_lat_popup_label_value"></span>
      </div>
    </div>

   </div>
   </div>
   <!-- end content -->

  </div>
<?php endif; ?>

<aside class="panel-group" id="accordion">
  <section class="panel panel-default">
    <div class="panel-heading">
      <h6>
        <a href="#collapseOne" data-toggle="collapse" data-parent="#accordion" class="accordion-toggle">
          <span class="glyphicon glyphicon-plus"></span> Names
        </a>
      </h6>
    </div>
    <div id="collapseOne" class="panel-collapse collapse">
      <div class="panel-body">
        <?php print $accordionName; ?>
      </div>
    </div>
  </section>
  <?php if(!empty($accordionEtymology)): ?>
  <section class="panel panel-default">
    <div class="panel-heading">
      <h6>
        <a href="#collapseTwo" data-toggle="collapse" data-parent="#accordion" class="accordion-toggle">
          <span class="glyphicon glyphicon-plus"></span> ETYMOLOGY
        </a>
      </h6>
    </div>
    <div id="collapseTwo" class="panel-collapse collapse">
      <div class="panel-body">
        <?php print $accordionEtymology; ?>
      </div>
    </div>
  </section>
  <?php endif; ?>
</aside>
