const SVG_NS = "http://www.w3.org/2000/svg";

function Vector(x, y) {
	// We assume that the first argument is vector if
	// this constructor is given only one argument
	if (y === undefined) {
		var vector = x;
		this.x = +vector.x;
		this.y = +vector.y;
		return;
	}
	this.x = +x;
	this.y = +y;
}

Vector.prototype.add = function(other) {
	return new Vector(this.x + (+other.x), this.y + (+other.y));
};

Vector.prototype.sub = function(other) {
	return new Vector(this.x - other.x, this.y - other.y);
};

Vector.prototype.dot = function(other) {
	return this.x * other.x + this.y * other.y;
};

Vector.prototype.mul = function(factor) {
	return new Vector(factor * this.x, factor * this.y);
};

Vector.prototype.equals = function(other, tolerance) {
	if (tolerance === undefined) tolerance = 0.001;
	if (Math.abs(this.x - other.x) > tolerance) return false;
	return (Math.abs(this.y - other.y) < tolerance)
};

Vector.prototype.negation = function() {
	return new Vector(-this.x, -this.y);
};

Vector.prototype.distance = function(other) {
	var xDiff = this.x - other.x;
	var yDiff = this.y - other.y;
	return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

Vector.prototype.isParellel = function(other) {
	// rotate 90 degrees
	var normal = new Vector(this.y, -this.x);
	// dot product gives zero if the two vectors are perpendicular
	var cos = other.dot(normal);
	return Math.abs(cos) < 0.001;
}

Vector.prototype.join = function(separator) {
	return "" + this.x + separator + this.y;
};

Vector.prototype.swap = function(other) {
	var tempX = this.x;
	var tempY = this.y;
	this.x = +other.x;
	this.y = +other.y;
	other.x = tempX;
	other.y = tempY;
};

var templateEngine = {
	_templateKeyPrefix: "data-template-",
	_templateKeyPattern: null,

	init: (function() {
		this._templateKeyPattern = new RegExp("^" + this._templateKeyPrefix + "(.*)");
	}),
	createNodesFromTemplate: (function(parentNode, context) {
		var template = parentNode.getElementsByClassName("template")[0];
		var newToolNode = template.cloneNode(true);
		newToolNode.classList.remove("template");
		this._updateRecursively(newToolNode, context);
		parentNode.appendChild(newToolNode);
		return newToolNode;
	}),
	_updateRecursively: (function(node, context) {
		var templateAttributes = [];
		// find the template attributes
		for (var i in Object.keys(node.attributes)) {
			var attribute = node.attributes[i];
			var parts = this._templateKeyPattern.exec(attribute.name);
			if (parts) {
				templateAttributes.push(parts[1]);
			}
		}
		// update the template attributes
		for (var i in templateAttributes) {
			var attribute = templateAttributes[i];
			var templateAttribute = this._templateKeyPrefix + attribute;
			var contextKey = node.getAttribute(templateAttribute);

			node.setAttribute(attribute, context[contextKey]);
			node.removeAttribute(templateAttribute);
		}
		for (var i in Object.keys(node.children)) {
			this._updateRecursively(node.children[i], context);
		}
	})
};

var Util = {
	getNodeTranslation: (function(node) {
		var re = /translate\((-?[0-9.]+),\s*(-?[0-9.]+)\)/;
		var translate = re.exec(node.getAttributeNS(null, "transform"));
		if (!translate) {
			return new Vector(0, 0);
		}
		return new Vector(translate[1], translate[2]);
	}),
	svgTranslate: (function(vector) {
		return "translate(" + vector.x + ", " + vector.y + ")";
	})
};

var ColorPanel = {
	init: (function() {
		this.panel = document.getElementById("sidepanel");
		this.content = this.panel.querySelector(".panel-content");
		this.attribute = "fill";
		this._initTabs();
		this._initPanelResize(this.panel);
		this._initColorWidgets();
	}),
	setActive: (function(node) {
		if (node) {
			this.content.classList.remove("disabled");
			var color;
			var result = window.getComputedStyle(nanoInk.activeObject)[this.attribute];
			this.rgbaInput.text = this._colorToHex(this._parseColor(result));
			this._updateColor("hex", this.rgbaInput.text);
		} else {
			this.content.classList.add("disabled");
		}
	}),
	_parseColor: (function(colorText) {
		if (colorText == "transparent") {
			return {"r": 0, "g": 0, "b": 0, "a": 0};
		}
		var matched = /rgb\(([^,]+), *([^,]+), *([^,]+)\)/.exec(colorText);
		if (matched) {
			return {"r": +matched[1], "g": +matched[2], "b": +matched[3], "a": 255};
		}
		matched = /rgba\(([^,]+), *([^,]+), *([^,]+), *([^,]+)\)/.exec(colorText);
		if (matched) {
			return {
				"r": +matched[1], "g": +matched[2], "b": +matched[3],
				"a": Math.floor(+matched[4] * 255)
			};
		}
		// use some random color
		return {"r": 256, "g": 0, "b": 0, "a": 0};
	}),

	_initTabs: (function(panel) {
		var tabs = document.querySelectorAll(".tab");
		var that = this;
		tabs.forEach(function(tab) {
			tab.addEventListener("click", function(e) {
				var oldActiveTab = document.querySelector(".tab-active");
				if (oldActiveTab) {
					oldActiveTab.classList.remove("tab-active");
				}
				e.target.classList.add("tab-active");
				that.attribute = e.target.attributes["data-attribute"].value;

				var result = window.getComputedStyle(nanoInk.activeObject)[that.attribute];
				that.rgbaInput.text = that._colorToHex(that._parseColor(result));
				that._updateColor("hex", that.rgbaInput.text);
			});
		});
	}),
	_initPanelResize: (function(panel) {
		var divider = document.getElementById("divider");
		var startX = 0;
		var panelWidth = panelMinWidth = panel.clientWidth;
		function mouseMoveListener(e) {
			var deltaX = e.clientX - startX;
			var width = Math.floor(panelWidth - deltaX);
			var clampedWidth = Math.max(panelMinWidth, Math.min(width, 600));
			if (width < panelMinWidth * 0.75) {
				clampedWidth = 0;
			}
			panel.style["width"] = clampedWidth + "px";
		}
		function mouseUpListener(e) {
			window.removeEventListener("mousemove", mouseMoveListener);
			window.removeEventListener("mouseup", mouseUpListener);
		}
		divider.addEventListener("mousedown", function(e) {
			panelWidth = panel.clientWidth;
			startX = e.clientX;
			window.addEventListener("mousemove", mouseMoveListener);
			window.addEventListener("mouseup", mouseUpListener);
		});
	}),
	_initColorWidgets: (function() {
		var opacityInput = document.querySelector("#opacity-input")
		var rgbaInput = document.querySelector("#rgba-input")
		this.opacityInput = opacityInput;
		this.rgbaInput = rgbaInput;

		function opacityHandler(e) {
			var value = +opacityInput.value;
			value = Math.max(0, Math.min(255, value));
			if (isNaN(value)) {
				opacityInput.classList.add("invalid");
				return;
			}
			opacityInput.classList.remove("invalid");
			opacityInput.value = value;
			ColorPanel._updateColor("alpha");
		}
		opacityInput.addEventListener("input", opacityHandler);
		opacityInput.addEventListener("change", opacityHandler);

		function rgbaHandler(e) {
			var value = rgbaInput.value;
			if (!/#[0-9a-f]{3,8}/.test(value)) {
				rgbaInput.classList.add("invalid");
				return;
			}
			value = value.substring(1);
			if (value.length == 3) {
				var r = value[0], g = value[1], b = value[2];
				value = r + r + g + g + b + b + "ff";
			} else if (value.length == 6) {
				value += "ff"
			} else if (value.length != 8) {
				rgbaInput.classList.add("invalid");
				return;
			}
			rgbaInput.classList.remove("invalid");
			value = "#" + value;
			ColorPanel._updateColor("hex", value);
			return value;
		}
		rgbaInput.addEventListener("input", function(e) { rgbaHandler(e); });
		rgbaInput.addEventListener("change", function(e) {
			rgbaInput.value = rgbaHandler(e);
		});
		this.wheel = createColorWheel(document.getElementById("color-wheel"), function(c) {
			ColorPanel._updateColor("alpha");
		});
	}),

	_toHex: (function(value) {
		var str = value.toString(16);
		if (str.length == 1) return "0" + str;
		return str;
	}),

	_colorToHex: (function(color) {
		var hex = this._toHex(color.r) + this._toHex(color.g) + this._toHex(color.b) +
			this._toHex(color.a);
		return "#" + hex;
	}),

	_updateColor: (function(source, value) {
		if (!nanoInk.activeObject) return;

		if (source != "hex") {
			var color = this.wheel.getValue();
			color.a = +this.opacityInput.value;
			this.rgbaInput.value = this._colorToHex(color);
		} else {
			var color = {}
			var rgba = value;
			color.r = parseInt(rgba.substring(1,3), 16);
			color.g = parseInt(rgba.substring(3,5), 16);
			color.b = parseInt(rgba.substring(5,7), 16);
			color.a = parseInt(rgba.substring(7,9), 16);
			this.opacityInput.value = color.a;
			this.wheel.setValue(color);
		}
		if (this.attribute == "fill") {
			nanoInk.fill = this.rgbaInput.value;
		} else {
			nanoInk.stroke = this.rgbaInput.value;
		}
		nanoInk.activeObject.setAttributeNS(null, this.attribute,
			"rgba("+ color.r +", "+ color.g +", "+ color.b +", " + (color.a / 255) + ")");
	})
};

var nanoInk = {
//general
	tool: null,
	toolList: [],
	activeObject: null,

//events
	pointer: null,
	pointerStart: null,
	pointerEnd: null,
	pointerDown: false,

//styles
	fill: "transparent",
	stroke: "#000",

	init: (function() {
		templateEngine.init();
		this.toolbar = document.getElementById("toolbar");
		this.canvas = document.getElementById("canvas");
		this.statusbar = document.getElementById("statusbar");

		ColorPanel.init();

		document.body.addEventListener("mouseup", function(e) {nanoInk._mouseUp(e)});
		this.canvas.addEventListener("mousedown", function(e) {nanoInk._mouseDown(e)});
		document.body.addEventListener("mousemove", function(e) {nanoInk._mouseMove(e)});

		window.addEventListener("keypress", function(e) {nanoInk._keyDown(e)});
		window.addEventListener("keyrelease", function(e) {nanoInk._keyUp(e)});

		for(var i in this.toolList) {
			this._addToolButton(this.toolList[i]);
		}

		nanoInk.newElem("path", {
			"stroke": "#000000",
			"fill": "#008000",
			"d": "M 100.5,100.5 L 200.5,100.5 L 200.5,200.5 L 100.5,200.5 z"
		});
		nanoInk._changeTool(this.toolList[0]);
	}),
	_addToolButton: (function(tool) {
		var newToolNode = templateEngine.createNodesFromTemplate(this.toolbar, tool.meta);
		newToolNode.addEventListener("click", function() {
			nanoInk._changeTool(tool);
		});
		tool.meta.button = newToolNode;
	}),
	newElem: (function(tag, attr, parentNode) {
		var elem = document.createElementNS(SVG_NS, tag);
		for(i in attr) {
			elem.setAttributeNS(null, i, attr[i]);
		}
		if (!parentNode) {
			parentNode = this.canvas;
		}
		return parentNode.appendChild(elem);
	}),

	remElem: (function(elem) {
		if (!elem) return;
		elem.parentNode.removeChild(elem);
	}),
	newAttr: (function(elem, attr) {
		for(i in attr) {
			elem.setAttributeNS(null, i, attr[i]);
		}
	}),
	setActiveNode: (function(node) {
		var old = this.activeObject;
		this.activeObject = node;

		this.invalidateBoundingBox();
		this.emit("setActiveNode", old, node);
		ColorPanel.setActive(node);
	}),
	addTool: (function(tool) {
		this.toolList.push(tool);
		tool.mainInit();
	}),
	_changeTool: (function(tool) {
		if (this.tool) this.tool.uninit();

		for(var i in this.toolList) {
			this.toolList[i].meta.button.classList.remove("tool-active");
		}
		tool.meta.button.classList.add("tool-active");
		
		this.tool = tool;
		this.tool.init();
		this.setActiveNode(nanoInk.activeObject);
	}),

	_mouseDown: (function(e) {
		this.pointer = this.pointerStart = this._getPointerPosition(e);
		this.eTarget = e.target;

		this.emit("mouseDown", e);
	}),
	_mouseMove: (function(e) {
		if (!this.tool) return;
		this.pointer = this._getPointerPosition(e);

		if (!this._mouseEventsAreActive(e)) {
			this.statusbar.textContent = "";
			return;
		}
		this.statusbar.textContent = "X: " + this.pointer.x + ", Y: " + this.pointer.y;

		if(this._inDragMode()) {
			this.pointerEnd = this.pointer;
			this.emit("mouseDrag", e);
		} else {
			this.emit("mouseMove", e);
		}
	}),
	_isSvgElement: (function(element) {
		var parent = element;
		do {
			if (parent == this.canvas) {
				return true;
			}
			parent = parent.parentNode;
		} while (parent);
		return false;
	}),
	_mouseUp: (function(e) {
		if (!this.tool) return;
		if (!this._mouseEventsAreActive(e)) return;
		this.eTarget = e.target;
		this.pointer = this._getPointerPosition(e);
		this.pointerEnd = this.pointer;
		this.emit("mouseUp", e);
		this.pointerStart = this.pointerEnd = null;
	}),
	_mouseEventsAreActive: (function(e) {
		return this._inDragMode() || this._isSvgElement(e.target);
	}),

	_inDragMode: (function() {
		return !!this.pointerStart;
	}),

	_getPointerPosition: (function(e) {
		var canvasPosition = this.canvas.getBoundingClientRect();
		return new Vector(
			e.clientX - canvasPosition.left,
			e.clientY - canvasPosition.top
		);
	}),
	_keyDown: (function(event) {
		if (document.activeElement != document.body) return;
		var key = event.key || event.keyCode;
		this.emit("keyDown", key);
	}),
	_keyUp: (function(event) {
		if (document.activeElement != document.body) return;
		var key = event.key || event.keyCode;
		this.emit("keyUp", key);
	}),
	emit: (function(name) {
		if (!this.tool) return;
		var handler = this.tool[name];

		var args = new Array(arguments.length - 1);
		for(var i = 1; i < arguments.length; i++) {
			args[i - 1] = arguments[i];
		}

		if (handler) {
			handler.apply(this.tool, args);
		}
	}),
	invalidateBoundingBox: (function() {
		if (this.activeObject) {
			if (!this.nodeBoundingBox) {
				this.nodeBoundingBox = nanoInk.newElem("rect", {"class": "active-object"});
				this.canvas.insertBefore(this.nodeBoundingBox, this.activeObject);
			}
			this.newAttr(this.nodeBoundingBox, this._getBoundingBox(this.activeObject));
		} else {
			this.remElem(this.nodeBoundingBox);
			this.nodeBoundingBox = null;
		}
	}),
	_getBoundingBox: (function(node) {
		var area = nanoInk.canvas.getBoundingClientRect();
		var box = node.getBoundingClientRect();
		return {
			"x": box.x + 0.5 - area.x,
			"y": box.y + 0.5 - area.y,
			"height": box.height,
			"width": box.width,
		};
	})
};

window.addEventListener('load', function(e) {
	nanoInk.init();
});

//nanoInk.addTool({
//	meta: {
//		name: "text",
//		icon: "../icons/inkscape/text.png",
//	}
//});

nanoInk.addTool({
	meta: {
		name: "select",
		icon: "../icons/inkscape/select.png",
	},

	isInMovingMode: false,
	boxSelection: false,
	old: null,

	mainInit: (function() {

	}),
	init: (function() {
	}),
	uninit: (function() {
		this._setSelectMode(false);
	}),
	mouseMove: (function(e) {
		this._setSelectMode(this._isNodeNormal(e.target));
	}),

	_setSelectMode: (function(enabled) {
		if(enabled) {
			nanoInk.canvas.classList.add("select-mode");
		} else {
			nanoInk.canvas.classList.remove("select-mode");
		}
	}),

	mouseDrag: (function() {
		if (this.isInMovingMode) {
			var translation = this.old.add(nanoInk.pointerEnd).sub(nanoInk.pointerStart);
			nanoInk.newAttr(nanoInk.activeObject, {
				"transform": Util.svgTranslate(translation)
			});
			nanoInk.invalidateBoundingBox();
		} else if (this.boxSelection) {
			var minX = Math.floor(Math.min(nanoInk.pointerEnd.x, nanoInk.pointerStart.x));
			var minY = Math.floor(Math.min(nanoInk.pointerEnd.y, nanoInk.pointerStart.y));
			var maxX = Math.floor(Math.max(nanoInk.pointerEnd.x, nanoInk.pointerStart.x));
			var maxY = Math.floor(Math.max(nanoInk.pointerEnd.y, nanoInk.pointerStart.y));

			nanoInk.newAttr(this.selectionBox, {
				"width": maxX - minX,
				"height": maxY - minY,
				// make sure that the edges are middle of pixels (for crispiness)
				"x": minX + 0.5,
				"y": minY + 0.5
			});
		}
	}),
	mouseDown: (function() {
		if (this._isNodeNormal(nanoInk.eTarget)) {
			this.isInMovingMode = true;
			this.boxSelection = false;
			if (nanoInk.activeObject != nanoInk.eTarget) {
				nanoInk.setActiveNode(nanoInk.eTarget);
			}
			this.old = Util.getNodeTranslation(nanoInk.activeObject);
		} else {//select
			this.isInMovingMode = false;
			this.boxSelection = true;
			this.selectionBox = nanoInk.newElem("rect", {
				"x": nanoInk.pointer.x,
				"y": nanoInk.pointer.y,
				"height": 1, "width": 1,
				"id": "selection-box"
			});
		}
	}),
	_isNodeNormal: (function(node) {
		return nanoInk.nodeBoundingBox != node && node.tagName != "svg";
	}),
	mouseUp: (function() {
		if (this.selectionBox) {
			nanoInk.remElem(this.selectionBox);
			this.selectionBox = null;
			nanoInk.setActiveNode(null);
		}
		this.isInMovingMode = this.boxSelection = false;
	}),
	keyDown: (function(key) {
		if (nanoInk.activeObject && (key == "Delete" || key == 46)) {
			nanoInk.remElem(nanoInk.activeObject);
			nanoInk.setActiveNode(null);
		}
	}),
	setActiveNode: (function(oldValue, newValue) {
		if (!newValue) return;
	})
});
