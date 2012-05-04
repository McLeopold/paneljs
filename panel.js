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
  var mouse_x;
  var mouse_y;
  var height;
  var width;
  var that = this;
  var mouse = options && options.mouse || 1;

  var on_mouse_down = function (evt) {
    mouse_x = evt.x;
    mouse_y = evt.y;
    height = that.height;
    width = that.width;
    start_split_move();
  };
  var on_mouse_drag = function (evt) {
    that.height = Math.min(that.max_height, Math.max(1, height + mouse * (evt.y - mouse_y)));
    that.width = Math.min(that.max_width, Math.max(1, width + mouse * (evt.x - mouse_x)));
    that.resize();
  };
  var on_mouse_up = function (evt) {
    stop_split_move();
  };
  var on_mouse_out = function (evt) {
    evt = evt || window.event;
    var from = evt.realtedTarget || evt.toElement;
    if (!from || from.nodeName === 'HTML') {
      stop_split_move();
    }
  }
  var start_split_move = function () {
    if (!attached) {
      document.body.addEventListener('mousemove', on_mouse_drag);
      document.body.addEventListener('mouseup', on_mouse_up);
      splitter.style.backgroundColor = 'red';
      document.body.style.webkitUserSelect = 'none';
      attached = true;
    }
  }
  var stop_split_move = function () {
    if (attached) {
      document.body.removeEventListener('mousemove', on_mouse_drag);
      document.body.removeEventListener('mouseup', on_mouse_up);
      splitter.style.backgroundColor = bg;
      document.body.style.webkitUserSelect = 'text';
      attached = false;
    }
  }
  splitter.addEventListener('mousedown', on_mouse_down);
  document.addEventListener('mouseout', on_mouse_out);
  this.splitter = splitter;
}

Panel.prototype.add_dock = function (child, mouse) {
  child = Panel.get_element(child);
  this.children.push(child);
  var panel = document.createElement('div');
  panel.id = "panel_" + ++Panel.ids;
  panel.className = "panel";
  Panel.move_children(this.element, panel);
  this.split(child, panel, {mouse: mouse});
  return new Panel(panel, this);
}

Panel.prototype.add_north = function (child, height) {
  var panel = this.panel;
  this.panel = panel.add_dock(child, 1);
  panel.height = height;
  panel.resize = panel.resize_north;
  panel.resize();
  //this.panel.parent.resize_north(height);
  return this;
}

Panel.prototype.add_south = function (child, height) {
  var panel = this.panel;
  this.panel = this.panel.add_dock(child, -1);
  panel.height = height;
  panel.resize = panel.resize_south;
  panel.resize();
  //this.panel.parent.resize_south(height);
  return this;
}

Panel.prototype.add_east = function (child, width) {
  var panel = this.panel;
  this.panel = panel.add_dock(child, 1);
  panel.width = width;
  panel.resize = panel.resize_east;
  panel.resize();
  //this.panel.parent.resize_east(width);
  return this;
}

Panel.prototype.add_west = function (child, width) {
  var panel = this.panel;
  this.panel = panel.add_dock(child, -1);
  panel.width = width;
  panel.resize = panel.resize_west;
  panel.resize();
  //this.panel.parent.resize_west(width);
  return this;
}

Panel.prototype.fill = function () {
  this.element.style.position = 'absolute';
  this.element.style.width = 'auto';
  this.element.style.height = 'auto';
  this.element.style.top = '0px';
  this.element.style.bottom = '0px';
  this.element.style.left = '0px';
  this.element.style.right = '0px';
  return this;
}

Panel.prototype.adopt = function (el_from) {
  Panel.move_siblings(this.element, this.panel.element);
  return this;
}

Panel.prototype.resize_north = function (height) {
  if (this.panel_a && this.splitter && this.panel_b) {
    if (this.max_height === undefined) {
      this.max_height = this.element.offsetHeight - Panel.frame_width;
    }
    if (height === undefined) {
      if (this.height === undefined) {
        height = Math.floor(this.max_height / 2);
      } else {
        height = this.height;
      }
    }
    this.height = height;

    var border = this.panel_a.offsetHeight - this.panel_a.scrollHeight;
    this.panel_a.style.position = 'absolute';
    this.panel_a.style.overflow = 'auto';
    this.panel_a.style.top = '0px';
    this.panel_a.style.height = height-border+'px';
    this.panel_a.style.left = '0px';
    this.panel_a.style.right = '0px';

    this.panel_b.style.position = 'absolute';
    this.panel_b.style.overflow = 'auto';
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
    if (this.max_height === undefined) {
      this.max_height = this.element.offsetHeight - Panel.frame_width;
    }
    if (height === undefined) {
      if (this.height === undefined) {
        height = Math.floor(this.max_height / 2);
      } else {
        height = this.height;
      }
    }
    this.height = height;

    var border = this.panel_a.offsetHeight - this.panel_a.scrollHeight;
    this.panel_a.style.position = 'absolute';
    this.panel_a.style.overflow = 'auto';
    this.panel_a.style.height = height-border+'px';
    this.panel_a.style.bottom = '0px';
    this.panel_a.style.left = '0px';
    this.panel_a.style.right = '0px';

    this.panel_b.style.position = 'absolute';
    this.panel_b.style.overflow = 'auto';
    this.panel_b.style.bottom = height+Panel.frame_width+'px';
    this.panel_b.style.top = '0px';
    this.panel_b.style.left = '0px';
    this.panel_b.style.right = '0px';

    this.splitter.style.position = 'absolute';
    this.splitter.style.bottom = height+'px';
    this.splitter.style.height = Panel.frame_width+'px';
    this.splitter.style.left = '0px';
    this.splitter.style.right = '0px';    
    this.splitter.style.cursor = "ns-resize";
  }
  return this;
}

Panel.prototype.resize_east = function (width) {
  if (this.panel_a && this.splitter && this.panel_b) {
    if (this.max_width === undefined) {
      this.max_width = this.element.offsetWidth - Panel.frame_width;
    }
    if (width === undefined) {
      if (this.width === undefined) {
        width = Math.floor(this.max_width / 2);
      } else {
        width = this.width;
      }
    }
    this.width = width;

    var border = this.panel_a.offsetWidth - this.panel_a.scrollWidth;
    this.panel_a.style.position = 'absolute';
    this.panel_a.style.overflow = 'auto';
    this.panel_a.style.left = '0px';
    this.panel_a.style.width = width-border+'px';
    this.panel_a.style.top = '0px';
    this.panel_a.style.bottom = '0px';

    this.panel_b.style.position = 'absolute';
    this.panel_b.style.overflow = 'auto';
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
    if (this.max_width === undefined) {
      this.max_width = this.element.offsetWidth - Panel.frame_width;
    }
    if (width === undefined) {
      if (this.width === undefined) {
        width = Math.floor(this.max_width / 2);
      } else {
        width = this.width;
      }
    }
    this.width = width;

    var border = this.panel_a.offsetWidth - this.panel_a.scrollWidth;
    this.panel_a.style.position = 'absolute';
    this.panel_a.style.overflow = 'auto';
    this.panel_a.style.right = '0px';
    this.panel_a.style.width = width-border+'px';
    this.panel_a.style.top = '0px';
    this.panel_a.style.bottom = '0px';

    this.panel_b.style.position = 'absolute';
    this.panel_b.style.overflow = 'auto';
    this.panel_b.style.right = width+Panel.frame_width+'px';
    this.panel_b.style.left = '0px';
    this.panel_b.style.top = '0px';
    this.panel_b.style.bottom = '0px';

    this.splitter.style.position = 'absolute';
    this.splitter.style.right = width+'px';
    this.splitter.style.width = Panel.frame_width+'px';
    this.splitter.style.top = '0px';
    this.splitter.style.bottom = '0px';    
    this.splitter.style.cursor = "ew-resize";
  }
  return this;
}
