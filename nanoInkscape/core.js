const SVG_NS = "http://www.w3.org/2000/svg";

function Vector(x, y) {
	this.x = +x;
	this.y = +y;
}

Vector.prototype.add = function(another) {
	return new Vector(this.x + (+another.x), this.y + (+another.y));
};

Vector.prototype.sub = function(another) {
	return new Vector(this.x - another.x, this.y - another.y);
};

Vector.prototype.mul = function(factor) {
	return new Vector(factor * this.x, factor * this.y);
};

Vector.prototype.distance = function(other) {
	var xDiff = this.x - other.x;
	var yDiff = this.y - other.y;
	return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
};

Vector.prototype.join = function(separator) {
	return "" + this.x + separator + this.y;
};

Vector.prototype.swap = function(another) {
	var tempX = this.x;
	var tempY = this.y;
	this.x = another.x;
	this.y = another.y;
	another.x = tempX;
	another.y = tempY;
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
		this.draw = document.getElementById("drawDiv");
		this.statusbar = document.getElementById("statusbar");

		var inputNode = document.getElementById("fill_color");
		inputNode.addEventListener("change", function() {
			nanoInk.fill = this.value;
			if (nanoInk.activeObject) {
				nanoInk.activeObject.setAttributeNS(null, "fill", this.value);
			}
		});
		nanoInk.fill = inputNode.value;

		var inputNode = document.getElementById("stroke_color");
		inputNode.addEventListener("change", function() {
			nanoInk.stroke = this.value;
			if (nanoInk.activeObject) {
				nanoInk.activeObject.setAttributeNS(null, "stroke", this.value);
			}
		});
		nanoInk.stroke = inputNode.value;

		this.canvas.addEventListener("mouseup", function(e) {nanoInk._mouseUp(e)});
		this.canvas.addEventListener("mousedown", function(e) {nanoInk._mouseDown(e)});
		this.canvas.addEventListener("mousemove", function(e) {nanoInk._mouseMove(e)});

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
	}),
	addTool: (function(tool) {
		this.toolList.push(tool);
		tool.mainInit();

		// initialize active tool to the first tool
		if (!this.tool) this.tool = tool;
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

		this.emit("mouseDown");
	}),
	_mouseMove: (function(e) {
		if(this.toolList.length == 0) return;
		this.pointer = this._getPointerPosition(e);
		this.statusbar.textContent = this.pointer.join(", ");

		if(this.pointerStart) {
			this.pointerEnd = this.pointer;
			this.emit("mouseDrag");
		} else {
			this.emit("mouseMove", e);
		}
	}),
	_mouseUp: (function(e) {
		if(this.toolList.length == 0) return;
		this.eTarget = e.target;
		this.pointer = this._getPointerPosition(e);
		this.pointerEnd = this.pointer;
		this.emit("mouseUp");
		this.pointerStart = this.pointerEnd = null;
	}),
	_getPointerPosition: (function(e) {
		var canvasPosition = this.canvas.getBoundingClientRect();
		return new Vector(
			e.clientX - canvasPosition.left,
			e.clientY - canvasPosition.top
		);
	}),
	_keyDown: (function(event) {
		var key = event.key || event.keyCode;
		this.emit("keyDown", key);
	}),
	_keyUp: (function(event) {
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

	}),
	mouseMove: (function(e) {
		if(this._isNodeNormal(e.target)) {
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
			if(nanoInk.activeObject.hasAttributeNS(null, "transform")) {
				this.old = Util.getNodeTranslation(nanoInk.activeObject);
			} else {
				this.old.y = this.old.y = 0;
			}	
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
