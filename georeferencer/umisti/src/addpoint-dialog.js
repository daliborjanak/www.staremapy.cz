goog.provide('georeferencer.umisti.AddPointDialog');
goog.provide('georeferencer.umisti.AddPointDialog.EventType');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.math');
goog.require('goog.string');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.Renderer');
goog.require('goog.ui.ac.InputHandler');

goog.require('georeferencer.umisti.EpsgMatcher');

/**
 * @constructor
 * @extends {goog.ui.Dialog}
 * @param {Element} parentElement
 */
georeferencer.umisti.AddPointDialog = function(parentElement) {
  goog.ui.Dialog.call(this);
  /**
   * @type {Element}
   * @private
   */
  this.parentElement_ = parentElement;
  /**
   * @type {goog.ui.ac.AutoComplete}
   * @private
   */
  this.ac_ = null;
  /**
   * @type {goog.ui.ac.InputHandler}
   * @private
   */
  this.inputHandler_ = null;
  this.setModal(true);
  this.setTitle('Vložiť bod. (Právě ve vývoji..)');
  this.setContent(this.generateContent_());

  goog.events.listen(this, goog.ui.Dialog.EventType.SELECT, function(e) {
    if (e.key == goog.ui.Dialog.DefaultButtonKeys.OK) {
      if (!this.validate()) {
        e.stopPropagation();
        return false;
      }
      var projParser = new RegExp(/^(\d+).*/);
      var lat = goog.dom.getElement('input-lat').value;
      var lon = goog.dom.getElement('input-lon').value;
      var proj = projParser.exec(goog.dom.getElement('input-proj').value)[1];
      var event = {};
      event.type = georeferencer.umisti.AddPointDialog.EventType.SELECT;
      event['lat'] = lat;
      event['lon'] = lon;
      event['proj'] = proj;
      this.dispatchEvent(event);
    }
    return true;
  });
}

goog.inherits(georeferencer.umisti.AddPointDialog, goog.ui.Dialog);

/**
 * @override
 */
georeferencer.umisti.AddPointDialog.prototype.enterDocument = function() {
  goog.base(this, 'enterDocument');
  this.inputHandler_ = new goog.ui.ac.InputHandler(null, null, false);
  this.ac_ = new goog.ui.ac.AutoComplete(
    new georeferencer.umisti.EpsgMatcher(),
    new goog.ui.ac.Renderer(),
    this.inputHandler_);
  this.inputHandler_.attachAutoComplete(this.ac_);
  this.inputHandler_.attachInputs(goog.dom.getElement('input-proj'));
};

/**
 * @override
 */
georeferencer.umisti.AddPointDialog.prototype.exitDocument = function() {
  this.inputHandler_.detachInput(goog.dom.getElement('input-proj'));
  this.ac_ = null;
  this.inputHandler_ = null;
  goog.base(this, 'exitDocument');
};

/**
 * @override
 */
georeferencer.umisti.AddPointDialog.prototype.render = function(parentElement) {
  if (parentElement) {
    goog.base(this, 'render', parentElement);
  } else {
    goog.base(this, 'render', this.parentElement_);
  }
}

/**
 * @override
 */
georeferencer.umisti.AddPointDialog.prototype.reposition = function() {
  var doc = this.getDomHelper().getDocument();
  var win = goog.dom.getWindow(doc) || window;
  if (goog.style.getComputedPosition(this.getElement()) == 'fixed') {
    var x = 0;
    var y = 0;
  } else {
    var scroll = this.getDomHelper().getDocumentScroll();
    var x = scroll.x;
    var y = scroll.y;
  }

  var popupSize = goog.style.getSize(this.getElement());
  var viewSize;
  if (this.parentElement_) {
    viewSize = new goog.math.Size(
      this.parentElement_.offsetWidth, this.parentElement_.offsetHeight);
  } else {
    viewSize = goog.dom.getViewportSize(win);
  }

  // Make sure left and top are non-negatives.
  var left = Math.max(x + viewSize.width / 2 - popupSize.width / 2, 0);
  var top = Math.max(y + viewSize.height / 2 - popupSize.height / 2, 0);
  goog.style.setPosition(this.getElement(), left, top);

  // We place the tab catcher at the same position as the dialog to
  // prevent IE from scrolling when users try to tab out of the dialog.
  goog.style.setPosition(this.tabCatcherElement_, left, top);
}

/**
 * @override
 */
georeferencer.umisti.AddPointDialog.prototype.onShow = function() {
  goog.base(this, 'onShow');
  var inputLat = goog.dom.getElement('input-lat');
  var inputLon = goog.dom.getElement('input-lon');
  var inputProj = goog.dom.getElement('input-proj');
  inputLat.value = '';
  inputLon.value = '';
  goog.dom.classes.remove(inputLat, 'goog-error-empty', 'goog-error-format');
  goog.dom.classes.remove(inputLon, 'goog-error-empty', 'goog-error-format');
  goog.dom.classes.remove(inputProj, 'goog-error-empty', 'goog-error-format');
}

georeferencer.umisti.AddPointDialog.prototype.validate = function() {
  var inputLat = goog.dom.getElement('input-lat');
  var inputLon = goog.dom.getElement('input-lon');
  var inputProj = goog.dom.getElement('input-proj');
  var valid = true;
  var decimalNumFormat = new RegExp(/^\d+([.,]\d+)?$/);
  var projFormat = new RegExp(/^\d+/);

  goog.dom.classes.remove(inputLat, 'goog-error-empty', 'goog-error-format');
  goog.dom.classes.remove(inputLon, 'goog-error-empty', 'goog-error-format');
  goog.dom.classes.remove(inputProj, 'goog-error-empty', 'goog-error-format');

  if (goog.string.isEmptySafe(inputLat.value)) {
    valid = false;
    goog.dom.classes.add(inputLat, 'goog-error-empty');
  }
  if (goog.string.isEmptySafe(inputLon.value)) {
    valid = false;
    goog.dom.classes.add(inputLon, 'goog-error-empty');
  }
  if (goog.string.isEmptySafe(inputProj.value)) {
    valid = false;
    goog.dom.classes.add(inputProj, 'goog-error-empty');
  }
  if (!goog.string.isEmptySafe(inputLat.value)
      && !decimalNumFormat.test(inputLat.value)) {
    valid = false;
    goog.dom.classes.add(inputLat, 'goog-error-format');
  }
  if (!goog.string.isEmptySafe(inputLon.value)
      && !decimalNumFormat.test(inputLon.value)) {
    valid = false;
    goog.dom.classes.add(inputLon, 'goog-error-format');
  }
  if (!goog.string.isEmptySafe(inputProj.value)
      && !projFormat.test(inputProj.value)) {
    valid = false;
    goog.dom.classes.add(inputProj, 'goog-error-format');
  }

  return valid;
};

/**
 * @protected
 * @return {!string}
 */
georeferencer.umisti.AddPointDialog.prototype.generateContent_ = function() {
  var table = goog.dom.createElement('table');
  var trLat = goog.dom.createElement('tr');
  var thLat = goog.dom.createElement('th');
  var tdLat = goog.dom.createElement('td');
  var inputLat = goog.dom.createElement('input');
  var trLon = goog.dom.createElement('tr');
  var thLon = goog.dom.createElement('th');
  var tdLon = goog.dom.createElement('td');
  var inputLon = goog.dom.createElement('input');
  var trProj = goog.dom.createElement('tr');
  var thProj = goog.dom.createElement('th');
  var tdProj = goog.dom.createElement('td');
  var inputProj = goog.dom.createElement('input');

  goog.dom.appendChild(table, trLat);
  goog.dom.appendChild(table, trLon);
  goog.dom.appendChild(table, trProj);

  goog.dom.appendChild(trLat, thLat);
  goog.dom.appendChild(trLat, tdLat);
  goog.dom.appendChild(trLon, thLon);
  goog.dom.appendChild(trLon, tdLon);
  goog.dom.appendChild(trProj, thProj);
  goog.dom.appendChild(trProj, tdProj);

  goog.dom.setTextContent(thLat, 'Zeměpisná šířka:');
  goog.dom.setTextContent(thLon, 'Zeměpisná délka:');
  goog.dom.setTextContent(thProj, 'Kartografická projekce:');

  goog.dom.appendChild(tdLat, inputLat);
  goog.dom.appendChild(tdLon, inputLon);
  goog.dom.appendChild(tdProj, inputProj);

  inputLat.id = 'input-lat';
  inputLon.id = 'input-lon';
  inputProj.id = 'input-proj';

  return goog.dom.getOuterHtml(table);
}

/**
 * Events dispatched by dialog.
 * @enum {string}
 */
georeferencer.umisti.AddPointDialog.EventType = {
  SELECT: 'georeferencer.umisti.AddPointDialog.EventType.SELECT'
};
