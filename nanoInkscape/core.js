const SVG_NS = "http://www.w3.org/2000/svg";

function print_obj(obj) {
	var str = "";
	for(i in obj) {
		str += i +"=>"+ obj[i] +", ";
	}
	alert(str);
}

var nanoInk = {
//general
	tool: "select",
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
		this.pointerStartX = e.clientX - this.draw.offsetLeft;
		this.pointerStartY = e.clientY - this.draw.offsetTop;
		this.eTarget = e.target;
		this.pointerDown = true;
		this.pointerDrag = false;

		this.toolList[this.tool].mouseDown();
	}),
	mouseMove: (function(e) {
		if(this.toolList.length == 0) return;
		if(this.pointerDown == true) {
			this.pointerDrag = true;

			this.pointerEndX = e.clientX - this.draw.offsetLeft;
			this.pointerEndY = e.clientY - this.draw.offsetTop;

			this.toolList[this.tool].mouseDrag();
		} else {
			this.pointerX = e.clientX - this.draw.offsetLeft;
			this.pointerY = e.clientY - this.draw.offsetTop;

			this.toolList[this.tool].mouseMove();
		}
	}),
	mouseUp: (function(e) {
		if(this.toolList.length == 0) return;
		this.eTarget = e.target;
		this.pointerDown = false;
		if(this.pointerDrag = true) {
			this.pointerEndX = e.clientX - this.draw.offsetLeft;
			this.pointerEndY = e.clientY - this.draw.offsetTop;

		} else { this.pointerEndX = this.pointerEndY = undefined; }

		this.toolList[this.tool].mouseUp();
	}),
	keyDown: (function(e) {
		var handler = this.toolList[this.tool].keyDown;
		var key = event.key || event.keyCode;
		handler && handler(key);
	}),
	keyUp: (function(e) {
		var handler = this.toolList[this.tool].keyUp;
		var key = event.key || event.keyCode;
		handler && handler(key);
	}),
	addTool: (function(toolName, toolObj) {
		this.toolList[toolName] = toolObj;
		this.toolList[toolName].mainInit();
	}),
	changeTool: (function(toolName) {
		if(this.toolList.length == 0) return;
		this.toolList[this.tool].uninit();
		for(var i=0; i < this.toolbar.getElementsByTagName("button").length; i++) {
			this.toolbar.getElementsByTagName("button")[i].className = " tools";
		}
		document.getElementById("tool_"+toolName).className += " toolActive";
		
		this.tool = toolName;
		this.toolList[this.tool].init();
	}),
};

document.addEventListener('keydown', nanoInk.keyDown);
document.addEventListener('keyup', nanoInk.keyUp);

nanoInk.addTool("select", {
	move: false,
	boxSelection: false,
	oldX: 0,
	oldY: 0,

	mainInit: (function() {

	}),
	init: (function() {
	}),
	uninit: (function() {

	}),
	mouseMove: (function() {
		
	}),
	mouseDrag: (function() {
		if(this.move == true) {
			nanoInk.statusbar.textContent = (nanoInk.pointerEndX - nanoInk.pointerStartX) +", "+ (nanoInk.pointerEndY - nanoInk.pointerStartY);

			nanoInk.newAttr(nanoInk.active, {
				"transform": "translate("+ (this.oldX + nanoInk.pointerEndX - nanoInk.pointerStartX) +
				             ", "+ (this.oldY + nanoInk.pointerEndY - nanoInk.pointerStartY) +")"
			});
		}
	}),
	mouseDown: (function() {
		if(nanoInk.eTarget.tagName != "svg") {//move
			this.move = true;
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
			this.move = false;
			this.boxSelection = true;
		}
	}),
	mouseUp: (function() {
		this.move = this.boxSelection = false;
		
	})
});
