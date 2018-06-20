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
	}),
	newElem: (function(tag, attr) {
			var elem = document.createElementNS(SVG_NS, tag);
			for(i in attr) {
				elem.setAttributeNS(null, i, attr[i]);
			}
			return this.canvas.appendChild(elem);
	}),
	newAttr: (function(elem, attr) {
			for(i in attr) {
				elem.setAttributeNS(null, i, attr[i]);
			}
	}),
	mouseDown: (function(e) {
		if(this.toolList.length == 0) return;
		this.pointerX = e.clientX - this.draw.offsetLeft;
		this.pointerY = e.clientY - this.draw.offsetTop;
		this.eTarget = e.target;
		this.pointerDown = true;
		this.pointerDrag = false;

		this.toolList[this.tool].mouseDown();
	}),
	mouseMove: (function(e) {
		if(this.toolList.length == 0) return;
		if(this.pointerDown == true) {
			this.pointerDrag = true;

			this.pointerDragX = e.clientX - this.draw.offsetLeft;
			this.pointerDragY = e.clientY - this.draw.offsetTop;

			this.toolList[this.tool].mouseDrag();
		} else {
			this.pointerX = e.clientX - this.draw.offsetLeft;
			this.pointerY = e.clientY - this.draw.offsetTop;

			this.toolList[this.tool].mouseMove();
		}
	}),
	mouseUp: (function(e) {
		if(this.toolList.length == 0) return;
		this.pointerDown = false;
		if(this.pointerDrag = true) {
			this.pointerDragX = e.clientX - this.draw.offsetLeft;
			this.pointerDragY = e.clientY - this.draw.offsetTop;

		} else { this.pointerDragX = this.pointerDragY = undefined; }

		this.toolList[this.tool].mouseUp();
	}),
	addTool: (function(toolName, toolObj) {
		this.toolList[toolName] = toolObj;
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

nanoInk.addTool("select", {
	move: false,
	boxSelection: false,
	oldX: 0,
	oldY: 0,

	mainInit: (function() {

	}),
	init: (function() {
		this.transHelper = nanoInk.newElem("g", {"transform": "translate(0,0)"});
	}),
	uninit: (function() {

	}),
	mouseMove: (function() {
		
	}),
	mouseDrag: (function(initialize) {
		
	}),
	mouseDown: (function() {
		if(nanoInk.eTarget.tagName != "svg") {//move
			this.move = true;
			this.boxSelection = false;
			this.transHelper.appendChild(nanoInk.eTarget);
			
		} else {//select
			this.move = false;
			this.boxSelection = true;
		}
	}),
	mouseUp: (function() {
		this.move = this.boxSelection = false;
		
	})
});
