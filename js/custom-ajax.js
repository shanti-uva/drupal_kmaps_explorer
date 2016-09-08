(function ($) {
    Drupal.ajax.prototype.commands.insert_history = function(ajax, response, status) {

      // Get information from the response. If it is not there, default to
      // our presets.
      var wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
      var method = response.method || ajax.method;
      var effect = ajax.getEffect(response);

      // We don't know what response.data contains: it might be a string of text
      // without HTML, so don't rely on jQuery correctly iterpreting
      // $(response.data) as new HTML rather than a CSS selector. Also, if
      // response.data contains top-level text nodes, they get lost with either
      // $(response.data) or $('<div></div>').replaceWith(response.data).
      var new_content_wrapped = $('<div></div>').html(response.data);
      var new_content = new_content_wrapped.contents();

      // For legacy reasons, the effects processing code assumes that new_content
      // consists of a single top-level element. Also, it has not been
      // sufficiently tested whether attachBehaviors() can be successfully called
      // with a context object that includes top-level text nodes. However, to
      // give developers full control of the HTML appearing in the page, and to
      // enable Ajax content to be inserted in places where DIV elements are not
      // allowed (e.g., within TABLE, TR, and SPAN parents), we check if the new
      // content satisfies the requirement of a single top-level element, and
      // only use the container DIV created above when it doesn't. For more
      // information, please see http://drupal.org/node/736066.
      if (new_content.length != 1 || new_content.get(0).nodeType != 1) {
        new_content = new_content_wrapped;
      }

      // If removing content from the wrapper, detach behaviors first.
      switch (method) {
        case 'html':
        case 'replaceWith':
        case 'replaceAll':
        case 'empty':
        case 'remove':
          var settings = response.settings || ajax.settings || Drupal.settings;
          Drupal.detachBehaviors(wrapper, settings);
      }

      //Add the html5 pushstate to change the url before ajax switch
      window.history.pushState({tag: true}, null, response.url_path);

      // Add the new content to the page.
      wrapper[method](new_content);

      // Immediately hide the new content if we're using any effects.
      if (effect.showEffect != 'show') {
        new_content.hide();
      }

      // Determine which effect to use and what content will receive the
      // effect, then show the new content.
      if ($('.ajax-new-content', new_content).length > 0) {
        $('.ajax-new-content', new_content).hide();
        new_content.show();
        $('.ajax-new-content', new_content)[effect.showEffect](effect.showSpeed);
      }
      else if (effect.showEffect != 'show') {
        new_content[effect.showEffect](effect.showSpeed);
      }

      // Attach all JavaScript behaviors to the new content, if it was successfully
      // added to the page, this if statement allows #ajax['wrapper'] to be
      // optional.
      if (new_content.parents('html').length > 0) {
        // Apply any settings from the returned JSON if available.
        var settings = response.settings || ajax.settings || Drupal.settings;
        Drupal.attachBehaviors(new_content, settings);
      }
    };
})(jQuery);
