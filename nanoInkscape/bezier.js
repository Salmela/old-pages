"use strict";
nanoInk.addTool("bezier", {
	oldControlPoint: undefined,
	tempCurve: "",
	doPathClosing: true,

	mainInit: (function() {
		
	}),
	init: (function() {
		nanoInk.setActiveNode(null);
		this.curveHelper = nanoInk.newElem("line", {"stroke": "#000", "style": "visibility: hidden"});
		this.curveHelper2 = nanoInk.newElem("circle", {"stroke": "#000", "fill": "transparent", "r": 4, "style": "visibility: hidden"});
	}),
	uninit: (function() {
		if(this.tempCurve != "") {
			var makeClosed = false;
			this._endPathEditing(makeClosed);
		}
		nanoInk.remElem(this.curveHelper);
		nanoInk.remElem(this.curveHelper2);
		this.tempCurve = "";
	}),
	mouseMove: (function() {
		if(this.tempCurve != "") {
			var data = this.tempCurve;
			if(this.oldControlPoint != undefined) {
				data += " C";
				data += this.oldControlPoint + " ";
				data += nanoInk.pointerX +","+ nanoInk.pointerY + " ";
				data += nanoInk.pointerX +","+ nanoInk.pointerY;
			} else {
				data += " L";
				data += nanoInk.pointerX +","+ nanoInk.pointerY;
			}
			nanoInk.activeObject.setAttributeNS(null, "d", data);
		}
	}),
	mouseDrag: (function(initialize) {
		nanoInk.newAttr(this.curveHelper, {
			"style": "visibility: visible",
			"x1": nanoInk.pointerStartX,
			"y1": nanoInk.pointerStartY,
			"x2": nanoInk.pointerEndX,
			"y2": nanoInk.pointerEndY
		});
		nanoInk.newAttr(this.curveHelper2, {
			"style": "visibility: visible",
			"cx": nanoInk.pointerEndX,
			"cy": nanoInk.pointerEndY
		});
		var data = this.tempCurve;
		if(this.oldControlPoint != undefined) {
			data += " C";
			data += this.oldControlPoint + " ";
			data += nanoInk.pointerStartX - (nanoInk.pointerEndX - nanoInk.pointerStartX) + ",";
			data += nanoInk.pointerStartY - (nanoInk.pointerEndY - nanoInk.pointerStartY) + " ";
			data += nanoInk.pointerStartX +","+ nanoInk.pointerStartY;
		} else if(this.tempCurve == "") {
			data += "M";
			data += nanoInk.pointerStartX +","+ nanoInk.pointerStartY;
			data += " L";
			data += nanoInk.pointerX +","+ nanoInk.pointerY;

		} else {
			data += " L";
			data += nanoInk.pointerX +","+ nanoInk.pointerY;
		}
		nanoInk.activeObject.setAttributeNS(null, "d", data);
	}),
	mouseDown: (function() {
		nanoInk.newAttr(this.curveHelper, {"style": "visibility: hidden"});
		nanoInk.newAttr(this.curveHelper2, {"style": "visibility: hidden"});

		if(nanoInk.eTarget === this.TailHandleNode) {
			this.doPathClosing = true;
		} else if(this.doPathClosing) {
			nanoInk.setActiveNode(nanoInk.newElem("path", {"class": "bezier"}));
			this.TailHandleNode = nanoInk.newElem("rect", {
				"x": nanoInk.pointerStartX-3.5,
				"y": nanoInk.pointerStartY-3.5,
				"height": 6, "width": 6,
				"id": "helperClosepath"
			});
			this.doPathClosing = false;
		}
	}),
	mouseUp: (function() {
		if(!nanoInk.activeObject) return;

		//data = nanoInk.activeObject.getAttributeNS(null, "d");
		if(this.doPathClosing) {
			nanoInk.pointerStartX = parseFloat(this.TailHandleNode.getAttributeNS(null, "x"))+3.5;
			nanoInk.pointerStartY = parseFloat(this.TailHandleNode.getAttributeNS(null, "y"))+3.5;
		}
		if(this.oldControlPoint != undefined) {
			this.tempCurve += " C";
			this.tempCurve += this.oldControlPoint + " ";
			this.tempCurve += nanoInk.pointerStartX - (nanoInk.pointerEndX - nanoInk.pointerStartX) + ",";
			this.tempCurve += nanoInk.pointerStartY - (nanoInk.pointerEndY - nanoInk.pointerStartY) + " ";
			this.tempCurve += nanoInk.pointerStartX +","+ nanoInk.pointerStartY;
		}
		if(this.doPathClosing) {
			var makeClosed = true;
			this._endPathEditing(makeClosed);
			return;

		} else if(this.tempCurve == "") {
			this.tempCurve += "M";
			this.tempCurve += nanoInk.pointerX +","+ nanoInk.pointerY;

		} else if(this.oldControlPoint == undefined) {
			this.tempCurve += " L";
			this.tempCurve += nanoInk.pointerEndX +","+ nanoInk.pointerEndY;
		} else {
			this.oldControlPoint = undefined;
		}
		nanoInk.activeObject.setAttributeNS(null, "d", this.tempCurve);

		if(nanoInk.pointerDrag) {
			this.oldControlPoint = nanoInk.pointerEndX +","+ nanoInk.pointerEndY;
		}
	}),
	keyDown: (function(key) {
		if (key == "Enter" || key == 13) {
			if(this.tempCurve != "") {
				var makeClosed = false;
				this._endPathEditing(makeClosed);
			}
		}
	}),
	_endPathEditing: (function(makeClosed) {
		nanoInk.newAttr(this.curveHelper, {"style": "visibility: hidden"});
		nanoInk.newAttr(this.curveHelper2, {"style": "visibility: hidden"});
		nanoInk.newAttr(nanoInk.activeObject, {
			"class": "",
			"fill": nanoInk.fill,
			"stroke": nanoInk.stroke,
			"d": makeClosed ? this.tempCurve + " z" : this.tempCurve
		});

		nanoInk.remElem(this.TailHandleNode);
		this.TailHandleNode = null;
		this.tempCurve = "";
		this.oldControlPoint = undefined;
		this.doPathClosing = true;
	})
});
