"use strict";
nanoInk.addTool({
	meta: {
		name: "bezier",
		icon: "../icons/inkscape/bezier.png",
	},

	oldPoint: null,
	oldControlPoint: null,
	currentControlPoint: null,
	tempCurve: "",
	doPathClosing: true,

	mainInit: (function() {
		
	}),
	init: (function() {
		this.curveHelper = nanoInk.newElem("line", {
			"class": "tangent",
			"style": "visibility: hidden"
		});
		this.curveHelper2 = nanoInk.newElem("circle", {
			"r": 4,
			"class": "control-node",
			"style": "visibility: hidden"
		});
		this.curveHelper3 = nanoInk.newElem("path", {
			"id": "curve-helper",
			"style": "visibility: hidden"
		});
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
	mouseMove: (function(e) {
		if(e.target == this.tailHandleNode) {
			nanoInk.pointer = Util.getNodeTranslation(this.tailHandleNode);
		}
		if(this.oldPoint) {
			var data = "M";
			data += this.oldPoint.join(",");
			if(this.oldControlPoint) {
				data += " C";
				data += this.oldControlPoint.join(",") + " ";
				data += nanoInk.pointer.join(",") + " ";
				data += nanoInk.pointer.join(",");
			} else {
				data += " L";
				data += nanoInk.pointer.join(",");
			}
			this.curveHelper3.setAttributeNS(null, "d", data);
		}
	}),
	mouseDrag: (function(event) {
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
		if (event.shiftKey) {
			return;
		}
		if (this.oldPoint) {
			this.currentControlPoint = nanoInk.pointerStart.mul(2).sub(nanoInk.pointerEnd);
			var data = "M";
			data += this.oldPoint.join(",");

			data += "C";
			if(this.oldControlPoint) {
				data += this.oldControlPoint.join(",") + " ";
			} else {
				data += this.oldPoint.join(",") + " ";
			}
			data += this.currentControlPoint.join(",") + " ";
			data += nanoInk.pointerStart.join(",");
			this.curveHelper3.setAttributeNS(null, "d", data);
		}
	}),
	mouseDown: (function(e) {
		nanoInk.newAttr(this.curveHelper3, {
			"style": "visibility: visible"
		});

		if(nanoInk.eTarget == this.tailHandleNode) {
			this.doPathClosing = true;
			var endPoint = Util.getNodeTranslation(this.tailHandleNode);
			nanoInk.pointerStart = endPoint;
		} else if(this.doPathClosing) {
			// there is no active bezier, lets create one
			nanoInk.setActiveNode(nanoInk.newElem("path", {"class": "bezier"}));
			this.tailHandleNode = nanoInk.newElem("rect", {
				"x": -3.5,
				"y": -3.5,
				"height": 6, "width": 6,
				"transform": Util.svgTranslate(nanoInk.pointerStart),
				"id": "helperClosepath"
			});
			this.doPathClosing = false;
			this.currentControlPoint = null;
		}
	}),
	mouseUp: (function() {
		if(!nanoInk.activeObject) return;

		if(this.doPathClosing) {
			nanoInk.pointerStart = Util.getNodeTranslation(this.tailHandleNode);
		}

		// do not create control points if the tangent would be small
		if (nanoInk.pointerEnd.distance(nanoInk.pointerStart.x) < 3) {
			nanoInk.pointerEnd = nanoInk.pointerStart;
		}
		if(this.oldControlPoint || this.currentControlPoint) {
			if (!this.oldControlPoint) {
				this.oldControlPoint = this.oldPoint;
			}
			if (!this.currentControlPoint) {
				this.currentControlPoint = nanoInk.pointerStart;
			}
			this.tempCurve += " C";
			this.tempCurve += this.oldControlPoint.join(",") + " ";
			this.tempCurve += this.currentControlPoint.join(",") + " ";
			this.tempCurve += nanoInk.pointerStart.join(",");
		}
		if(this.doPathClosing) {
			var makeClosed = true;
			this._endPathEditing(makeClosed);
			return;

		} else if(this.tempCurve == "") {
			this.tempCurve += "M";
			this.tempCurve += nanoInk.pointerStart.join(",");

		} else if(!this.oldControlPoint) {
			this.tempCurve += " L";
			this.tempCurve += nanoInk.pointerStart.join(",");
		}
		nanoInk.activeObject.setAttributeNS(null, "d", this.tempCurve);

		this.currentControlPoint = null;
		this.oldControlPoint = null;
		this.oldPoint = nanoInk.pointerStart;
		if(nanoInk.pointerEnd && !nanoInk.pointerEnd.equals(this.oldPoint)) {
			this.oldControlPoint = nanoInk.pointerEnd;
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
		nanoInk.newAttr(this.curveHelper3, {"style": "visibility: hidden"});
		nanoInk.newAttr(nanoInk.activeObject, {
			"class": "",
			"fill": nanoInk.fill,
			"stroke": nanoInk.stroke,
			"d": makeClosed ? this.tempCurve + " z" : this.tempCurve
		});

		nanoInk.remElem(this.tailHandleNode);
		this.tailHandleNode = null;
		this.tempCurve = "";
		this.oldPoint = null;
		this.oldControlPoint = null;
		this.doPathClosing = true;
		nanoInk.invalidateBoundingBox();
	})
});
