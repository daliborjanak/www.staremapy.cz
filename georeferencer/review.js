var georeferencer = georeferencer || {};
georeferencer.review = georeferencer.review || {};

georeferencer.review.labelMap = function(id, value) {
  alert(id + ': ' + value);
};

georeferencer.review.createButton = function(label, id, value) {
  var button = document.createElement('BUTTON');
  button.value = label;
  button.onclick = function() { georeferencer.review.labelMap(id, value); };
  return button;
};

georeferencer.review.main = function() {
  var form = document.getElementById('review-form');
  var buttons = null;
  for (var i = 0; i < form.childNodes.length; i++) {
    var element = form.childNodes[i];
    if (element.className == 'buttons') {
      buttons = element;
      break;
    }
  }
  console.log(form);
  console.log(buttons);
  var id = georef.name + '/' + georef.version;

  buttons.appendChild(georeferencer.review.createButton('Více map', id, 'vicemap'));
  buttons.appendChild(georeferencer.review.createButton('Rozřezaná', id, 'rozrezana'));
  buttons.appendChild(georeferencer.review.createButton('Nelze umístit', id, 'nelzeumistit'));
};

georeferencer.review.main();
