function Panel(selector, parent, options) {
  var option;

  options = options || {};
  this.selector = selector;
  this.element = Panel.get_element(selector);
  this.panel = this;
  this.children = [];
  this.parent = parent;
  // contain children
  if (this.element.style.position in {'':0, 'static':0}) {
    this.element.style.position = 'relative';
  }
}
Panel.frame_width = 3;
Panel.ids = 0;

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

Panel.move_child = function (el, el_to, force) {
  var els = el_to.children
    , i
  ;
  if (!force) {
    for (i = 0, ilen = els.length; i < ilen; ++i) {
      if (el === els[i]) {
        return;
      }
    }
  }
  if (el.parentElement) {
    el.parentElement.removeChild(el);
  }
  el_to.appendChild(el);
}

Panel.prototype.split = function (panel_a, panel_b, options) {
  if (this.splitter) {
    throw new Error("panel '" + this.selector + "' already split");
  }
  this.panel_a = panel_a;
  this.panel_b = panel_b;
  Panel.move_child(panel_a, this.element);
  var splitter = document.createElement('div');
  splitter.id = "splitter_" + ++Panel.ids;
  splitter.className = "splitter";
  this.element.appendChild(splitter);
  Panel.move_child(panel_b, this.element, true);

  var attached = false;
  var bg = splitter.style.backgroundColor;
  var pointer = document.createElement('div');
  pointer.style.position = 'absolute';
  pointer.style.top = '0px';
  pointer.style.left = '0px';
  pointer.style.backgroundColor = 'black';
  pointer.style.width = '13px';
  pointer.style.height = '13px';
  var mouse_x;
  var mouse_y;
  var height;
  var width;
  var that = this;
  document.body.appendChild(pointer);
  var on_mouse_down = function (evt) {
    mouse_x = evt.x;
    mouse_y = evt.y;
    height = that.height;
    width = that.width;
    console.log('mouse down');
    if (!attached) {
      that.element.addEventListener('mousemove', on_mouse_drag);
      that.element.addEventListener('mouseup', on_mouse_up);
      splitter.style.backgroundColor = 'red';
      attached = true;
    }
  };
  var on_mouse_drag = function (evt) {
    that.height = height + evt.y - mouse_y;
    that.width = width + evt.x - mouse_x;
    that.resize();
    //pointer.style.top = evt.y+'px';
    //pointer.style.left = evt.x+'px';
  };
  var on_mouse_up = function (evt) {
    console.log('mouse up');
    on_mouse_out();
  };
  var on_mouse_out = function (evt) {
    console.log('mouse out ' + evt.target.id + ':' + evt.relatedTarget.id);
    console.log(panel_a.id, panel_b.id, splitter.id);
    if (evt.relatedTarget === panel_a
        || evt.relatedTarget === panel_b
        || evt.relatedTarget === splitter) {
      console.log('cancel');
      return;
    }
    console.log('detach');
    if (attached) {
      that.element.removeEventListener('mousemove', on_mouse_drag);
      that.element.removeEventListener('mouseup', on_mouse_up);
      splitter.style.backgroundColor = bg;
      attached = false;
    }
  }
  var on_mouse_over = function (evt) {
    //console.log('mouse over' + evt.target.id + ':' + evt.relatedTarget.id);
  }
  splitter.addEventListener('mousedown', on_mouse_down);
  this.element.addEventListener('mouseout', on_mouse_out, true);
  this.element.addEventListener('mouseover', on_mouse_over, true);
  this.splitter = splitter;
}

Panel.prototype.add_dock = function (child) {
  child = Panel.get_element(child);
  this.children.push(child);
  var panel = document.createElement('div');
  panel.id = "panel_" + ++Panel.ids;
  panel.className = "panel";
  Panel.move_children(this.element, panel);
  this.split(child, panel);
  return new Panel(panel, this);
}

Panel.prototype.add_north = function (child, height) {
  this.panel = this.panel.add_dock(child);
  this.height = height;
  this.resize = this.resize_north;
  this.resize();
  //this.panel.parent.resize_north(height);
  return this;
}

Panel.prototype.add_south = function (child, height) {
  this.panel = this.panel.add_dock(child);
  this.height = height;
  this.resize = this.resize_south;
  this.resize();
  //this.panel.parent.resize_south(height);
  return this;
}

Panel.prototype.add_east = function (child, width) {
  this.panel = this.panel.add_dock(child);
  this.width = width;
  this.resize = this.resize_east;
  this.resize();
  //this.panel.parent.resize_east(width);
  return this;
}

Panel.prototype.add_west = function (child, width) {
  this.panel = this.panel.add_dock(child);
  this.width = width;
  this.resize = this.resize_west;
  this.resize();
  //this.panel.parent.resize_west(width);
  return this;
}

Panel.prototype.resize_north = function (height) {
  if (this.panel_a && this.splitter && this.panel_b) {
    height = height || this.height || this.element.offsetHeight / 2;
    this.height = height;
    var a_border = this.panel_a.offsetHeight - this.panel_a.scrollHeight
      , b_border = this.panel_b.offsetHeight - this.panel_b.scrollHeight
      , s_border = this.splitter.offsetHeight - this.splitter.scrollHeight
    ;
    this.panel_a.style.position = 'absolute';
    this.panel_a.style.top = '0px';
    this.panel_a.style.height = height-a_border+'px';
    this.panel_a.style.left = '0px';
    this.panel_a.style.right = '0px';

    this.panel_b.style.position = 'absolute';
    this.panel_b.style.top = height+Panel.frame_width+'px';
    this.panel_b.style.bottom = '0px';
    this.panel_b.style.left = '0px';
    this.panel_b.style.right = '0px';

    this.splitter.style.position = 'absolute';
    this.splitter.style.top = height+'px';
    this.splitter.style.height = Panel.frame_width+'px';
    this.splitter.style.left = '0px';
    this.splitter.style.right = '0px';    
    this.splitter.style.cursor = "ns-resize";
  }
  return this;
}

Panel.prototype.resize_south = function (height) {
  if (this.panel_a && this.splitter && this.panel_b) {
    height = height || this.height || this.element.offsetHeight / 2;
    this.height = height;
    this.panel_a.style.position = 'absolute';
    this.panel_a.style.bottom = '0px';
    this.panel_a.style.height = height+'px';
    this.panel_a.style.left = '0px';
    this.panel_a.style.right = '0px';

    this.panel_b.style.position = 'absolute';
    this.panel_b.style.bottom = height+Panel.frame_width+'px';
    this.panel_b.style.top = '0px';
    this.panel_b.style.left = '0px';
    this.panel_b.style.right = '0px';

    this.splitter.style.position = 'absolute';
    this.splitter.style.bottom = height + Panel.frame_width+'px';
    this.splitter.style.height = Panel.frame_width+'px';
    this.splitter.style.left = '0px';
    this.splitter.style.right = '0px';    
    this.splitter.style.cursor = "ns-resize";
  }
  return this;
}

Panel.prototype.resize_east = function (width) {
  if (this.panel_a && this.splitter && this.panel_b) {
    width = width || this.width || this.element.offsetWidth / 2;
    this.width = width;
    this.panel_a.style.position = 'absolute';
    this.panel_a.style.left = '0px';
    this.panel_a.style.width = width+'px';
    this.panel_a.style.top = '0px';
    this.panel_a.style.bottom = '0px';

    this.panel_b.style.position = 'absolute';
    this.panel_b.style.left = width+Panel.frame_width+'px';
    this.panel_b.style.right = '0px';
    this.panel_b.style.top = '0px';
    this.panel_b.style.bottom = '0px';

    this.splitter.style.position = 'absolute';
    this.splitter.style.left = width+'px';
    this.splitter.style.width = Panel.frame_width+'px';
    this.splitter.style.top = '0px';
    this.splitter.style.bottom = '0px';    
    this.splitter.style.cursor = "ew-resize";
  }
  return this;
}

Panel.prototype.resize_west = function (width) {
  if (this.panel_a && this.splitter && this.panel_b) {
    width = width || this.width || this.element.offsetWidth / 2;
    this.width = width;
    this.panel_a.style.position = 'absolute';
    this.panel_a.style.right = '0px';
    this.panel_a.style.width = width+'px';
    this.panel_a.style.top = '0px';
    this.panel_a.style.bottom = '0px';

    this.panel_b.style.position = 'absolute';
    this.panel_b.style.right = width+Panel.frame_width+'px';
    this.panel_b.style.left = '0px';
    this.panel_b.style.top = '0px';
    this.panel_b.style.bottom = '0px';

    this.splitter.style.position = 'absolute';
    this.splitter.style.right = width + Panel.frame_width+'px';
    this.splitter.style.width = Panel.frame_width+'px';
    this.splitter.style.top = '0px';
    this.splitter.style.bottom = '0px';    
    this.splitter.style.cursor = "ew-resize";
  }
  return this;
}
