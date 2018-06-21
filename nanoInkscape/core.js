const SVG_NS = "http://www.w3.org/2000/svg";

var nanoInk = {
//general
	tool: null,
	toolList: {},
	active: undefined,

//events
	pointerX: 0,
	pointerY: 0,
	pointerDragX: 0,
	pointerDragY: 0,
	pointerDown: false,
	pointerDrag: false,

//styles
	fill: "transparent",
	stroke: "#000",
	
//methods
	init: (function() {
		this.toolbar = document.getElementById("toolbar");
		this.canvas = document.getElementById("canvas");
		this.draw = document.getElementById("drawDiv");
		this.statusbar = document.getElementById("statusbar");
		document.querySelector("#fill_color").addEventListener("change", function() {
			nanoInk.fill = this.value;
		});
		document.querySelector("#stroke_color").addEventListener("change", function() {
			nanoInk.stroke = this.value;
		});
	}),
	newElem: (function(tag, attr) {
		var elem = document.createElementNS(SVG_NS, tag);
		for(i in attr) {
			elem.setAttributeNS(null, i, attr[i]);
		}
		return this.canvas.appendChild(elem);
	}),
	remElem: (function(elem) {
		this.canvas.removeChild(elem);
	}),
	newAttr: (function(elem, attr) {
		for(i in attr) {
			elem.setAttributeNS(null, i, attr[i]);
		}
	}),
	mouseDown: (function(e) {
		if(this.toolList.length == 0) return;
		var position = this._getPointerPosition(e);
		this.pointerStartX = position.x;
		this.pointerStartY = position.y;
		this.eTarget = e.target;
		this.pointerDown = true;
		this.pointerDrag = false;

		this.tool.mouseDown();
	}),
	mouseMove: (function(e) {
		if(this.toolList.length == 0) return;
		var position = this._getPointerPosition(e);
		if(this.pointerDown == true) {
			this.pointerDrag = true;

			this.pointerEndX = position.x;
			this.pointerEndY = position.y;

			this.tool.mouseDrag();
		} else {
			this.pointerX = position.x;
			this.pointerY = position.y;

			this.tool.mouseMove(e);
		}
	}),
	mouseUp: (function(e) {
		if(this.toolList.length == 0) return;
		this.eTarget = e.target;
		this.pointerDown = false;
		if(this.pointerDrag = true) {
			var position = this._getPointerPosition(e);
			this.pointerEndX = position.x;
			this.pointerEndY = position.y;

		} else { this.pointerEndX = this.pointerEndY = undefined; }

		this.tool.mouseUp();
	}),
	_getPointerPosition: (function(e) {
		var canvasPosition = this.canvas.getBoundingClientRect();
		return {
			x: e.clientX - canvasPosition.left,
			y: e.clientY - canvasPosition.top
		};
	}),
	keyDown: (function(event) {
		var handler = this.tool.keyDown;
		var key = event.key || event.keyCode;
		handler && handler.call(this.tool, key);
	}),
	keyUp: (function(event) {
		var handler = this.tool.keyUp;
		var key = event.key || event.keyCode;
		handler && handler.call(this.tool, key);
	}),
	addTool: (function(toolName, toolObj) {
		this.toolList[toolName] = toolObj;
		toolObj.mainInit();
		if (toolName == "select") this.tool = toolObj;
	}),
	changeTool: (function(toolName) {
		if(this.toolList.length == 0) return;
		this.tool.uninit();
		for(var i=0; i < this.toolbar.getElementsByTagName("button").length; i++) {
			this.toolbar.getElementsByTagName("button")[i].className = " tools";
		}
		document.getElementById("tool_"+toolName).className += " toolActive";
		
		this.tool = this.toolList[toolName];
		this.tool.init();
	}),
};

window.addEventListener('keydown', function(e) {nanoInk.keyDown(e)});
window.addEventListener('keyup', function(e) {nanoInk.keyUp(e)});

nanoInk.addTool("select", {
	isInMovingMode: false,
	boxSelection: false,
	oldX: 0,
	oldY: 0,

	mainInit: (function() {

	}),
	init: (function() {
	}),
	uninit: (function() {

	}),
	mouseMove: (function(e) {
		if(e.target.tagName != "svg") {
			nanoInk.canvas.classList.add("select-mode");
		} else {
			nanoInk.canvas.classList.remove("select-mode");
		}
	}),
	mouseDrag: (function() {
		if (this.isInMovingMode) {
			nanoInk.statusbar.textContent = (nanoInk.pointerEndX - nanoInk.pointerStartX) +", "+ (nanoInk.pointerEndY - nanoInk.pointerStartY);

			nanoInk.newAttr(nanoInk.active, {
				"transform": "translate("+ (this.oldX + nanoInk.pointerEndX - nanoInk.pointerStartX) +
				             ", "+ (this.oldY + nanoInk.pointerEndY - nanoInk.pointerStartY) +")"
			});
		} else if (this.boxSelection) {
			var minX = Math.floor(Math.min(nanoInk.pointerEndX, nanoInk.pointerStartX));
			var minY = Math.floor(Math.min(nanoInk.pointerEndY, nanoInk.pointerStartY));
			var maxX = Math.floor(Math.max(nanoInk.pointerEndX, nanoInk.pointerStartX));
			var maxY = Math.floor(Math.max(nanoInk.pointerEndY, nanoInk.pointerStartY));

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
		if(nanoInk.eTarget.tagName != "svg") {
			this.isInMovingMode = true;
			this.boxSelection = false;
			nanoInk.active = nanoInk.eTarget;
			if(nanoInk.active.hasAttributeNS(null, "transform")) {
				var oldValues = /translate\(([^,]*), ([^)]*)\)/.exec(nanoInk.active.getAttributeNS(null, "transform"));
				//alert(nanoInk.active.getAttributeNS(null, "transform"));
				this.oldX = parseFloat(oldValues[1]);
				this.oldY = parseFloat(oldValues[2]);
			} else {
				this.oldX = this.oldY = 0;
			}	
		} else {//select
			this.isInMovingMode = false;
			this.boxSelection = true;
			this.selectionBox = nanoInk.newElem("rect", {
				"x": nanoInk.pointerX,
				"y": nanoInk.pointerY,
				"height": 1, "width": 1,
				"id": "selection-box"
			});
		}
	}),
	mouseUp: (function() {
		if (this.selectionBox) {
			nanoInk.remElem(this.selectionBox);
		}
		this.isInMovingMode = this.boxSelection = false;
	})
});
