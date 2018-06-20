nanoInk.addTool("bezier", {
	oldCurve: undefined,

	mainInit: (function() {

	}),
	init: (function() {
		this.curveHelper = nanoInk.newElem("line", {"stroke": "#000", "style": "visibility: hidden"});
		this.curveHelper2 = nanoInk.newElem("circle", {"stroke": "#000", "fill": "transparent", "r": 4, "style": "visibility: hidden"});
	}),
	uninit: (function() {

	}),
	mouseMove: (function() {
		
	}),
	mouseDrag: (function(initialize) {
		nanoInk.newAttr(this.curveHelper, {
			"style": "visibility: visible",
			"x1": nanoInk.pointerX,
			"y1": nanoInk.pointerY,
			"x2": nanoInk.pointerDragX,
			"y2": nanoInk.pointerDragY
		});
		nanoInk.newAttr(this.curveHelper2, {
			"style": "visibility: visible",
			"cx": nanoInk.pointerDragX,
			"cy": nanoInk.pointerDragY
		});
	}),
	mouseDown: (function() {
		nanoInk.newAttr(this.curveHelper, {"style": "visibility: hidden"});
		nanoInk.newAttr(this.curveHelper2, {"style": "visibility: hidden"});
		if(nanoInk.eTarget === this.zHelper) {
			data = nanoInk.active.getAttributeNS(null, "d");

			nanoInk.newAttr(nanoInk.active, {
				"class": "",
				"fill": nanoInk.fill, 
				"stroke": nanoInk.stroke,
				"d": data +" z"
			});

			nanoInk.active = undefined;
			nanoInk.canvas.removeChild(this.zHelper);

		} else if(nanoInk.active == undefined || nanoInk.active.tagName != "path") {
			nanoInk.active = nanoInk.newElem("path", {"class": "bezier"});
			this.zHelper = nanoInk.newElem("rect", {
				"x": nanoInk.pointerX-3.5,
				"y": nanoInk.pointerY-3.5,
				"height": 6, "width": 6,
				"id": "helperClosepath"
			});
		}
	}),
	mouseUp: (function() {
		if(nanoInk.active == undefined) return;

		data = nanoInk.active.getAttributeNS(null, "d");
		if(data == "") {
			data += "M";
			data += nanoInk.pointerX +","+ nanoInk.pointerY;

		} else if(this.oldCurve != undefined) {
			data += " C";
			data += this.oldCurve + " ";
			data += nanoInk.pointerX - (nanoInk.pointerDragX - nanoInk.pointerX) + ",";
			data += nanoInk.pointerY - (nanoInk.pointerDragY - nanoInk.pointerY) + " ";
			data += nanoInk.pointerX +","+ nanoInk.pointerY;
			this.oldCurve = undefined;

		} else {
			data += " L";
			data += nanoInk.pointerDragX +","+ nanoInk.pointerDragY;
		}
		nanoInk.active.setAttributeNS(null, "d", data);

		if(nanoInk.pointerDrag) {
			this.oldCurve = nanoInk.pointerX +","+ nanoInk.pointerY;
		}
	})
});
