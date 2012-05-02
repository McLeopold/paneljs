function Panel(selector, parent, options) {
  var option;

  this.panel = this;
  this.children = [];
  this.selector = selector;
  this.element = Panel.get_element(selector);
  if (this.element === this.selector) {
    this.selector = "split";
  }
  if (parent) {
    this.parent = parent;
    Panel.move_child(this.element, parent.panel.element);
  }
  this.element.style.position = 'relative';
  for (option in options) { if (options.hasOwnProperty(option)) {
    switch (option) {
      case 'north':
      case 'south':
      case 'east':
      case 'west':
        parent.panel = this.split_panel()
        this[option](options[option]);
        break;
      case 'fill':
        this[option](options[option]);
        break;
      default:
        console.log("option '" + option + "' unknown");
    }
  }}
}

Panel.get_element = function (selector) {
  if (selector instanceof HTMLElement) {
    return selector;
  }
  var e;
  if (typeof document !== 'undefined') {
    // find by jquery
    if (typeof $ !== 'undefined') {
      e = $(selector)[0];
      if (e) return e;
    }
    // find by id
    if (selector.charAt(0) === '#') {
      var id = selector.slice(1);
      var e = document.getElementById(id);
      if (e) return e;
    }
    // create new div
    var d = document.createElement('div');
    d.id = id;
    if (this.parent) {
      this.parent.element.appendChild(d);
    }
    return d;
  }
}

Panel.move_children = function (el_from, el_to) {
  var els = el_from.children
    , el
    , c
  ;
  for (c = els.length; c > 0; --c) {
    el = els[0];
    el_from.removeChild(el);
    el_to.appendChild(el);
  }
}

Panel.move_siblings = function (el, el_to) {
  var els = el.parentElement.children
    , i = 0
    , c
    , sib
  ;
  for (c = els.length; c > 0; --c) {
    sib = els[i];
    if (sib === el) {
      i = 1;
    } else {
      el.parentElement.removeChild(sib);
      el_to.appendChild(sib);
    }
  }
}

Panel.move_child = function (el, el_to) {
  var els = el_to.children
    , i
  ;
  for (i = 0, ilen = els.length; i < ilen; ++i) {
    if (el === els[i]) {
      return;
    }
  }
  el.parentElement.removeChild(el);
  el_to.appendChild(el);
}

// add child panel or control child element
Panel.prototype.split_panel = function (parent) {
  var d = document.createElement('div');
  Panel.move_siblings(this.element, d);
  this.element.parentElement.appendChild(d);
  this.split = new Panel(d);
  return this.split;
}
Panel.prototype.add_north = function (child, height) {
  this.children.push(new Panel(child, this, {north: height}));
  return this;
}
Panel.prototype.add_south = function (child, height) {
  this.children.push(new Panel(child, this, {south: height}));
  return this;
}
Panel.prototype.add_east = function (child, width) {
  this.children.push(new Panel(child, this, {east: width}));
  return this;
}
Panel.prototype.add_west = function (child, width) {
  this.children.push(new Panel(child, this, {west: width}));
  return this;
}
Panel.prototype.add = function (child) {
  this.children.push(new Panel(child, this, {fill: true}));
  return this;
}

// add child panel or control child element
Panel.prototype.north = function (height) {
  if (this.element) {
    this.element.style.position = 'absolute';
    this.element.style.top = '0px';
    this.element.style.height = height+'px';
    this.element.style.left = '0px';
    this.element.style.right = '0px';
  }
  if (this.split.element) {
    this.split.element.style.position = 'absolute';
    this.split.element.style.top = height+'px';
    this.split.element.style.bottom = '0px';
    this.split.element.style.left = '0px';
    this.split.element.style.right = '0px';
  }
  return this;
}
Panel.prototype.south = function (height) {
  if (this.element) {
    this.element.style.position = 'absolute';
    this.element.style.bottom = '0px';
    this.element.style.height = height+'px';
    this.split.element.style.left = '0px';
    this.split.element.style.right = '0px';
  }
  if (this.split.element) {
    this.split.element.style.position = 'absolute';
    this.split.element.style.top = '0px';
    this.split.element.style.bottom = height+'px';
    this.split.element.style.left = '0px';
    this.split.element.style.right = '0px';    
  }
  return this;
}
Panel.prototype.east = function (width) {
  if (this.element) {
    this.element.style.position = 'absolute';
    this.element.style.left = '0px';
    this.element.style.width = width+'px';
    this.element.style.top = '0px';
    this.element.style.bottom = '0px';
  }
  if (this.split.element) {
    this.split.element.style.position = 'absolute';
    this.split.element.style.top = '0px';
    this.split.element.style.bottom = '0px';
    this.split.element.style.left = width+5+'px';
    this.split.element.style.right = '0px';    
  }
  return this;
}
Panel.prototype.west = function (width) {
  if (this.element) {
    this.element.style.position = 'absolute';
    this.element.style.right = '0px';
    this.element.style.width = width+'px';
    this.element.style.top = '0px';
    this.element.style.bottom = '0px';
  }
  if (this.split.element) {
    this.split.element.style.position = 'absolute';
    this.split.element.style.top = '0px';
    this.split.element.style.bottom = '0px';
    this.split.element.style.left = '0px';
    this.split.element.style.right = width+'px';    
  }
  return this;
}
Panel.prototype.fill = function () {
  if (this.element) {
    this.element.style.position = 'absolute';
    this.element.style.top = '0px';
    this.element.style.bottom = '0px';
    this.element.style.left = '0px';
    this.element.style.right = '0px';        
  }
  return this;
}

// size and position
Panel.prototype.width = function () {}
Panel.prototype.height = function () {}
Panel.prototype.top = function () {}
Panel.prototype.bottom = function () {}
Panel.prototype.left = function () {}
Panel.prototype.right = function () {}
//
Panel.prototype.collapse = function () {}
Panel.prototype.absolute = function () {}