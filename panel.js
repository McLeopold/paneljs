function Panel(selector, parent, options) {
	var option;

	this.children = [];
	this.selector = selector;
	this.parent = parent;
	this.element = this.get_element(selector);
	this.element.style.position = 'relative';
	for (option in options) { if (options.hasOwnProperty(option)) {
		switch (option) {
			case 'north':
			case 'south':
			case 'east':
			case 'west':
				this[option](options[option]);
				break;
			default:
				console.log("option '" + option + "' unknown");
		}
	}}
}

Panel.prototype.get_element = function (selector) {
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

// add child panel or control child element
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

// add child panel or control child element
Panel.prototype.north = function (height) {
	if (this.element) {
		this.element.style.position = 'absolute';
		this.element.style.top = 0+'px';
		this.element.style.height = height+'px';
		this.element.style.width = '100%';
	}
	return this;
}
Panel.prototype.south = function (height) {
	if (this.element) {
		this.element.style.position = 'absolute';
		this.element.style.bottom = 0+'px';
		this.element.style.height = height+'px';
		this.element.style.width = '100%';
	}
	return this;
}
Panel.prototype.east = function (width) {
	if (this.element) {
		this.element.style.position = 'absolute';
		this.element.style.left = 0+'px';
		this.element.style.width = width+'px';
		this.element.style.height = '100%';
	}
	return this;
}
Panel.prototype.west = function (width) {
	if (this.element) {
		this.element.style.position = 'absolute';
		this.element.style.right = 0+'px';
		this.element.style.width = width+'px';
		this.element.style.height = '100%';
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
Panel.prototype.fill = function () {}
Panel.prototype.collapse = function () {}
Panel.prototype.absolute = function () {}