goog.provide('georeferencer.umisti.AddPointDialog');
goog.provide('georeferencer.umisti.AddPointDialog.EventType');

goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.events');
goog.require('goog.math');
goog.require('goog.string');
goog.require('goog.ui.Dialog');
goog.require('goog.ui.LabelInput');
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
  this.setTitle('Zadat vlicovací bod pomocí číselných souřadnic.');
  this.setContent(this.generateContent_());

  goog.events.listen(this, goog.ui.Dialog.EventType.SELECT, function(e) {
    if (e.key == goog.ui.Dialog.DefaultButtonKeys.OK) {
      if (!this.validate()) {
        e.stopPropagation();
        return false;
      }
      var projParser = new RegExp(/^(\d+).*/);
      var north = goog.dom.getElement('input-north').value;
      var east = goog.dom.getElement('input-east').value;
      var proj = projParser.exec(goog.dom.getElement('input-proj').value)[1];
      var event = {};
      event.type = georeferencer.umisti.AddPointDialog.EventType.SELECT;
      event['north'] = georeferencer.umisti.AddPointDialog.coorStrToNum(north).toString();
      event['east'] = georeferencer.umisti.AddPointDialog.coorStrToNum(east).toString();
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
  var northLabelInput = new goog.ui.LabelInput("'49.5' nebo '49 30' nebo '49 30.5' nebo '49 30 30'");
  var eastLabelInput = new goog.ui.LabelInput("'49.5' nebo '49 30' nebo '49 30.5' nebo '49 30 30'");
  var projLabelInput = new goog.ui.LabelInput("'WGS84' nebo '4326' nebo 'jtsk' nebo 'czech'");
  northLabelInput.decorate(goog.dom.getElement('input-north'));
  eastLabelInput.decorate(goog.dom.getElement('input-east'));
  projLabelInput.decorate(goog.dom.getElement('input-proj'));

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
  var inputNorth = goog.dom.getElement('input-north');
  var inputEast = goog.dom.getElement('input-east');
  var inputProj = goog.dom.getElement('input-proj');
  inputNorth.value = '';
  inputEast.value = '';
  goog.dom.classes.remove(inputNorth, 'goog-error-empty', 'goog-error-format');
  goog.dom.classes.remove(inputEast, 'goog-error-empty', 'goog-error-format');
  goog.dom.classes.remove(inputProj, 'goog-error-empty', 'goog-error-format');
}

georeferencer.umisti.AddPointDialog.prototype.validate = function() {
  var inputNorth = goog.dom.getElement('input-north');
  var inputEast = goog.dom.getElement('input-east');
  var inputProj = goog.dom.getElement('input-proj');
  var valid = true;
  var coorFormat = new RegExp(/^\s*\d+(\.\d+)?(\s+\d+(\.\d+)?)?(\s+\d+(\.\d+)?)?\s*$/);
  var projFormat = new RegExp(/^\d+/);

  goog.dom.classes.remove(inputNorth, 'goog-error-empty', 'goog-error-format');
  goog.dom.classes.remove(inputEast, 'goog-error-empty', 'goog-error-format');
  goog.dom.classes.remove(inputProj, 'goog-error-empty', 'goog-error-format');

  if (goog.string.isEmptySafe(inputNorth.value)) {
    valid = false;
    goog.dom.classes.add(inputNorth, 'goog-error-empty');
  }
  if (goog.string.isEmptySafe(inputEast.value)) {
    valid = false;
    goog.dom.classes.add(inputEast, 'goog-error-empty');
  }
  if (goog.string.isEmptySafe(inputProj.value)) {
    valid = false;
    goog.dom.classes.add(inputProj, 'goog-error-empty');
  }
  if (!goog.string.isEmptySafe(inputNorth.value)
      && !coorFormat.test(inputNorth.value)) {
    valid = false;
    goog.dom.classes.add(inputNorth, 'goog-error-format');
  }
  if (!goog.string.isEmptySafe(inputEast.value)
      && !coorFormat.test(inputEast.value)) {
    valid = false;
    goog.dom.classes.add(inputEast, 'goog-error-format');
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
  var trNorth = goog.dom.createElement('tr');
  var thNorth = goog.dom.createElement('th');
  var tdNorth = goog.dom.createElement('td');
  var inputNorth = goog.dom.createElement('input');
  var trEast = goog.dom.createElement('tr');
  var thEast = goog.dom.createElement('th');
  var tdEast = goog.dom.createElement('td');
  var inputEast = goog.dom.createElement('input');
  var trProj = goog.dom.createElement('tr');
  var thProj = goog.dom.createElement('th');
  var tdProj = goog.dom.createElement('td');
  var inputProj = goog.dom.createElement('input');

  goog.dom.appendChild(table, trNorth);
  goog.dom.appendChild(table, trEast);
  goog.dom.appendChild(table, trProj);

  goog.dom.appendChild(trNorth, thNorth);
  goog.dom.appendChild(trNorth, tdNorth);
  goog.dom.appendChild(trEast, thEast);
  goog.dom.appendChild(trEast, tdEast);
  goog.dom.appendChild(trProj, thProj);
  goog.dom.appendChild(trProj, tdProj);

  goog.dom.setTextContent(thNorth, 'Sever:');
  goog.dom.setTextContent(thEast, 'Východ:');
  goog.dom.setTextContent(thProj, 'Souřadnicový systém:');

  goog.dom.appendChild(tdNorth, inputNorth);
  goog.dom.appendChild(tdEast, inputEast);
  goog.dom.appendChild(tdProj, inputProj);

  inputNorth.id = 'input-north';
  inputEast.id = 'input-east';
  inputProj.id = 'input-proj';

  return goog.dom.getOuterHtml(table);
}

/**
 * @param {string} coor
 * @return {number}
 */
georeferencer.umisti.AddPointDialog.coorStrToNum = function(coor) {
  var re = new RegExp(/\s*(\d+(\.\d+)?)(\s+(\d+(\.\d+)?))?(\s+(\d+(\.\d+)?))?/);
  var matches = re.exec(coor);
  var grad = goog.string.toNumber(matches[1]);
  var min = goog.string.toNumber(matches[4]);
  var sec = goog.string.toNumber(matches[7]);
  min = min || 0;
  sec = sec || 0;
  return grad + min / 60.0 + sec / 3600.0;
}

/**
 * Events dispatched by dialog.
 * @enum {string}
 */
georeferencer.umisti.AddPointDialog.EventType = {
  SELECT: 'georeferencer.umisti.AddPointDialog.EventType.SELECT'
};
