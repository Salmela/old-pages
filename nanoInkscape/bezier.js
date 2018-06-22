"use strict";
nanoInk.addTool({
	meta: {
		name: "bezier",
		icon: "../icons/inkscape/bezier.png",
	},

	oldControlPoint: null,
	tempCurve: "",
	doPathClosing: true,

	mainInit: (function() {
		
	}),
	init: (function() {
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
			if(this.oldControlPoint) {
				data += " C";
				data += this.oldControlPoint + " ";
				data += nanoInk.pointer.x +","+ nanoInk.pointer.y + " ";
				data += nanoInk.pointer.x +","+ nanoInk.pointer.y;
			} else {
				data += " L";
				data += nanoInk.pointer.x +","+ nanoInk.pointer.y;
			}
			nanoInk.activeObject.setAttributeNS(null, "d", data);
		}
	}),
	mouseDrag: (function(initialize) {
		nanoInk.newAttr(this.curveHelper, {
			"style": "visibility: visible",
			"x1": nanoInk.pointerStart.x,
			"y1": nanoInk.pointerStart.y,
			"x2": nanoInk.pointerEnd.x,
			"y2": nanoInk.pointerEnd.y
		});
		nanoInk.newAttr(this.curveHelper2, {
			"style": "visibility: visible",
			"cx": nanoInk.pointerEnd.x,
			"cy": nanoInk.pointerEnd.y
		});
		var data = this.tempCurve;
		if(this.oldControlPoint) {
			data += " C";
			data += this.oldControlPoint + " ";
			data += nanoInk.pointerStart.x - (nanoInk.pointerEnd.x - nanoInk.pointerStart.x) + ",";
			data += nanoInk.pointerStart.y - (nanoInk.pointerEnd.y - nanoInk.pointerStart.y) + " ";
			data += nanoInk.pointerStart.x +","+ nanoInk.pointerStart.y;
		} else if(this.tempCurve == "") {
			data += "M";
			data += nanoInk.pointerStart.x +","+ nanoInk.pointerStart.y;
			data += " L";
			data += nanoInk.pointer.x +","+ nanoInk.pointer.y;

		} else {
			data += " L";
			data += nanoInk.pointer.x +","+ nanoInk.pointer.y;
		}
		nanoInk.activeObject.setAttributeNS(null, "d", data);
	}),
	mouseDown: (function() {
		nanoInk.newAttr(this.curveHelper, {"style": "visibility: hidden"});
		nanoInk.newAttr(this.curveHelper2, {"style": "visibility: hidden"});

		if(nanoInk.eTarget == this.tailHandleNode) {
			this.doPathClosing = true;
			var endPoint = Util.getNodeTranslation(this.tailHandleNode);
			nanoInk.pointerStart.x = endPoint.x;
			nanoInk.pointerStart.y = endPoint.y;
		} else if(this.doPathClosing) {
			nanoInk.setActiveNode(nanoInk.newElem("path", {"class": "bezier"}));
			this.tailHandleNode = nanoInk.newElem("rect", {
				"x": -3.5,
				"y": -3.5,
				"height": 6, "width": 6,
				"transform": "translate("+ nanoInk.pointerStart.x + ", "+ nanoInk.pointerStart.y +")",
				"id": "helperClosepath"
			});
			this.doPathClosing = false;
		}
	}),
	mouseUp: (function() {
		if(!nanoInk.activeObject) return;

		if(this.doPathClosing) {
			var endPoint = Util.getNodeTranslation(this.tailHandleNode);
			nanoInk.pointerStart = endPoint;
		}
		// ignore drag if it had very small movement
		if (Math.sqrt(Math.pow(nanoInk.pointerEnd.x - nanoInk.pointerStart.x, 2) + Math.pow(nanoInk.pointerEnd.y - nanoInk.pointerStart.y, 2)) < 3) {
			nanoInk.pointerEnd = nanoInk.pointerStart;
		}
		if(this.oldControlPoint) {
			this.tempCurve += " C";
			this.tempCurve += this.oldControlPoint + " ";
			this.tempCurve += nanoInk.pointerStart.x - (nanoInk.pointerEnd.x - nanoInk.pointerStart.x) + ",";
			this.tempCurve += nanoInk.pointerStart.y - (nanoInk.pointerEnd.y - nanoInk.pointerStart.y) + " ";
			this.tempCurve += nanoInk.pointerStart.x + "," + nanoInk.pointerStart.y;
		}
		if(this.doPathClosing) {
			var makeClosed = true;
			this._endPathEditing(makeClosed);
			return;

		} else if(this.tempCurve == "") {
			this.tempCurve += "M";
			this.tempCurve += nanoInk.pointer.x +","+ nanoInk.pointer.y;

		} else if(!this.oldControlPoint) {
			this.tempCurve += " L";
			this.tempCurve += nanoInk.pointerEnd.x +","+ nanoInk.pointerEnd.y;
		} else {
			this.oldControlPoint = null;
		}
		nanoInk.activeObject.setAttributeNS(null, "d", this.tempCurve);

		if(nanoInk.pointerEnd) {
			this.oldControlPoint = nanoInk.pointerEnd.x +","+ nanoInk.pointerEnd.y;
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

		nanoInk.remElem(this.tailHandleNode);
		this.tailHandleNode = null;
		this.tempCurve = "";
		this.oldControlPoint = null;
		this.doPathClosing = true;
		nanoInk.invalidateBoundingBox();
	})
});
