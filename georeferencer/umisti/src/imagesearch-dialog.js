goog.provide('georeferencer.imagesearch.Dialog');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.html.SafeHtml');
goog.require('goog.ui.Component.EventType');
goog.require('goog.ui.Checkbox');
goog.require('goog.ui.Dialog');
goog.require('goog.html.legacyconversions');

/**
 * @constructor
 * @extends {goog.ui.Dialog}
 * @param {!Array<Object>} data
 */
georeferencer.imagesearch.Dialog = function(data) {
  goog.ui.Dialog.call(this);

  /**
   * @type {goog.ui.Checkbox}
   * @private
   */
  this.georeferencedFilter_ = null;

  this.setButtonSet(null);
  this.setModal(true);
  this.setTitle('Najít podobnou mapu.');
  this.setContent(this.generateContent_(data));
}

goog.inherits(georeferencer.imagesearch.Dialog, goog.ui.Dialog);

/**
 * @override
 */
georeferencer.imagesearch.Dialog.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');

  this.georeferencedFilter_ = new goog.ui.Checkbox();
  this.georeferencedFilter_.decorate(goog.dom.getElement('imagesearch-dialog-georeferenced'));

  goog.events.listen(this.georeferencedFilter_, goog.ui.Component.EventType.ACTION, function(e) {
    var checkbox = e.target;
    if (!checkbox.getChecked()) {
      var elements = goog.dom.getElementsByClass('imagesearch-result-nongeoreferenced');
      goog.array.forEach(elements, function(item, i, arr) {
        item.style.display = 'none';
      });
    } else {
      var elements = goog.dom.getElementsByClass('imagesearch-result-nongeoreferenced');
      goog.array.forEach(elements, function(item, i, arr) {
        item.style.display = 'inline-block';
      });
    }
  });

  goog.array.forEach(goog.dom.getElementsByClass('imagesearch-result-wrapper'), function(element, i, a) {
    goog.events.listen(element, 'mouseover', function(e) {
      window.console.log('mouseover');
    });
    goog.events.listen(element, 'mouseout', function(e) {
      window.console.log('mouseout');
    });
  })

  this.georeferencedFilter_.setChecked(true);
};

/**
 * @param {!Array<Object>} data
 * @return {string}
 */
georeferencer.imagesearch.Dialog.prototype.generateContent_ = function(data) {
  var dialogContent = goog.dom.createElement('DIV');

  var header = goog.dom.createElement('DIV');
  var georeferencedFilter = goog.dom.createElement('SPAN');
  georeferencedFilter.id = 'imagesearch-dialog-georeferenced';
  goog.dom.classlist.add(georeferencedFilter, 'goog-checkbox');
  var georeferencedFilterLabel = goog.dom.createElement('SPAN');
  goog.dom.setTextContent(georeferencedFilterLabel, 'Georeferencované');

  var container = this.generateResult_(data);
  container.id = 'imagesearch-dialog-container';

  goog.dom.appendChild(dialogContent, header);
  goog.dom.appendChild(dialogContent, container);
  goog.dom.appendChild(header, georeferencedFilter);
  goog.dom.appendChild(header, georeferencedFilterLabel);

  return goog.dom.getOuterHtml(dialogContent);
}

/**
 * @param {!Array<Object>} data
 * @return {!Element}
 */
georeferencer.imagesearch.Dialog.prototype.generateResult_ = function(data) {
  var result = goog.dom.createElement('DIV');

  goog.array.forEach(data, function(item, i, arr) {
    var wrapper = goog.dom.createElement('DIV');
    goog.dom.classlist.add(wrapper, 'imagesearch-result-wrapper');
    var overlay = goog.dom.createElement('DIV');
    goog.dom.classlist.add(overlay, 'imagesearch-result-overlay');

    var overlayOpen = goog.dom.createElement('SPAN');
    goog.dom.classlist.add(overlayOpen, 'imagesearch-result-overlay-open');
    goog.dom.classlist.add(overlayOpen, 'icon-folder-open');

    goog.dom.appendChild(overlay, overlayOpen);
    if (item['record']['metadata']['georeferenced']) {
      var overlayAutogeoref = goog.dom.createElement('SPAN');
      goog.dom.classlist.add(overlayAutogeoref, 'imagesearch-result-overlay-autogeoref');
      goog.dom.classlist.add(overlayAutogeoref, 'icon-target');
      goog.dom.appendChild(overlay, overlayAutogeoref);
    }

    // var a = goog.dom.createElement('A');
    // a.href = 'http://staremapy.georeferencer.cz/map/' + item['record']['id'];
    var img = goog.dom.createElement('IMG');
    img.src = item['record']['thumbnail'];
    if (!item['record']['metadata']['georeferenced']) {
      goog.dom.classlist.add(wrapper, 'imagesearch-result-nongeoreferenced');
    }
    goog.dom.appendChild(result, wrapper);
    goog.dom.appendChild(wrapper, overlay);
    goog.dom.appendChild(wrapper, img);
    //goog.dom.appendChild(a, img);
  });
  return result;
}

georeferencer.imagesearch.Dialog.itemOnMouseMove = function() {
  window.console.log('onmousemove');
}

georeferencer.imagesearch.Dialog.itemOnMouseOut = function() {
  window.console.log('onmouseout');
}
