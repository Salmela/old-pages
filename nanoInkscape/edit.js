"use strict";
nanoInk.addTool("edit", {
	draggingElem: null,
	controlNodes: [],

	mainInit: (function() {
		
	}),
	init: (function() {
		if(nanoInk.active != undefined) {
			var i;
			var controlPoints = nanoInk.active.pathSegList;
			var tmpElem;
			var last = controlPoints.length-1;

			for(i = last; i >= 0; i--) {
				switch(controlPoints[i].pathSegTypeAsLetter) {
					case "M":
						if(i == 0 && controlPoints[last].pathSegTypeAsLetter == "z") break;
						tmpElem = nanoInk.newElem("rect", {
							"x": -3.5,
							"y": -3.5,
							"height": 6, "width": 6,
							"id": "nodeCorner",
							"transform": "translate("+ controlPoints[i].x
							            +", "+ controlPoints[i].y +") rotate(45)"
						});
						if(controlPoints[i+1] != undefined && controlPoints[i+1].pathSegTypeAsLetter == "C") {
							tmpElem.tangent2 = nanoInk.newElem("line", {
								"stroke": "#000",
								"x1": controlPoints[i].x,
								"y1": controlPoints[i].y,
								"x2": controlPoints[i+1].x1,
								"y2": controlPoints[i+1].y1
							});
							tmpElem.controlPoint2 = nanoInk.newElem("circle", {
								"stroke": "#000",
								"fill": "transparent", "r": 4,
								"x": -2.5,
								"y": -2.5,
								"transform": "translate("+ controlPoints[i+1].x1
									    +", "+ controlPoints[i+1].y1 +")"
							});
						}
						tmpElem.nanoInkscapeNode = controlPoints[i];
						this.controlNodes.push(tmpElem);
						break;
					case "L":
						nanoInk.newElem("rect", {
							"x": controlPoints[i].x-3.5,
							"y": controlPoints[i].y-3.5,
							"height": 6, "width": 6,
							"id": "nodeCorner",
							"transform": "translate("+ controlPoints[i].x
							            +", "+ controlPoints[i].y +") rotate(45)"
						});
						tmpElem.nanoInkscapeNode = controlPoints[i];
						this.controlNodes.push(tmpElem);
						break;
					case "C":
						if(i == 0 && controlPoints[last].pathSegTypeAsLetter == "z") break;
						tmpElem = nanoInk.newElem("rect", {
							"x": -3.5,
							"y": -3.5,
							"height": 6, "width": 6,
							"id": "nodeSmooth",
							"transform": "translate("+ controlPoints[i].x
							            +", "+ controlPoints[i].y +")"
						});

						tmpElem.tangent = nanoInk.newElem("line", {
							"stroke": "#000",
							"x1": controlPoints[i].x,
							"y1": controlPoints[i].y,
							"x2": controlPoints[i].x2,
							"y2": controlPoints[i].y2
						});
						tmpElem.tangent.nanoInkscapeType = "tangent1";
						tmpElem.tangent.nanoInkscapeONode = tmpElem;
						tmpElem.controlPoint = nanoInk.newElem("circle", {
							"stroke": "#000",
							"fill": "transparent", "r": 4,
							"x": -2.5,
							"y": -2.5,
							"transform": "translate("+ controlPoints[i].x2
							            +", "+ controlPoints[i].y2 +")"
						});
						tmpElem.controlPoint.nanoInkscapeType = "controlPoint1";
						tmpElem.controlPoint.nanoInkscapeONode = tmpElem;
						tmpElem.controlPoint.nanoInkscapeNode = controlPoints[i];

						if(controlPoints[i+1] != undefined && controlPoints[i+1].pathSegTypeAsLetter == "C") {
							tmpElem.tangent2 = nanoInk.newElem("line", {
								"stroke": "#000",
								"x1": controlPoints[i].x,
								"y1": controlPoints[i].y,
								"x2": controlPoints[i+1].x1,
								"y2": controlPoints[i+1].y1
							});
							tmpElem.tangent2.nanoInkscapeType = "tangent2";
							tmpElem.tangent2.nanoInkscapeONode = tmpElem;
							tmpElem.controlPoint2 = nanoInk.newElem("circle", {
								"stroke": "#000",
								"fill": "transparent", "r": 4,
								"x": -2.5,
								"y": -2.5,
								"transform": "translate("+ controlPoints[i+1].x1
									    +", "+ controlPoints[i+1].y1 +")"
							});
							tmpElem.controlPoint2.nanoInkscapeType = "controlPoint2";
							tmpElem.controlPoint2.nanoInkscapeONode = tmpElem;
							tmpElem.controlPoint2.nanoInkscapeNode = controlPoints[i+1];
							
							tmpElem.nanoInkscapeNode2 = controlPoints[i+1];
						}
						tmpElem.nanoInkscapeNode = controlPoints[i];
						this.controlNodes.push(tmpElem);
						break;
				}
			}
		} 
	}),
	uninit: (function() {
		while(this.controlNodes.length != 0) {
			var n = this.controlNodes.pop();

			if(n.tangent && n.controlPoint) {
				nanoInk.remElem(n.tangent);
				nanoInk.remElem(n.controlPoint);
			}
			if(n.tangent2 && n.controlPoint2) {
				nanoInk.remElem(n.tangent2);
				nanoInk.remElem(n.controlPoint2);
			}
			nanoInk.remElem(n);
		}
		this.controlPoint = [];
	}),
	mouseMove: (function() {
		
	}),
	mouseDrag: (function() {
		if(this.draggingElem != null) {
			var px = nanoInk.pointerEndX, py = nanoInk.pointerEndY;
			var re = /translate\(([0-9.]+),\s*([0-9.]+)\)/;

			if(/tangent/.test(this.draggingElem.nanoInkscapeType)) {
				
			}
			if(/controlPoint/.test(this.draggingElem.nanoInkscapeType)) {
				var translate = re.exec(this.draggingElem.nanoInkscapeONode.getAttributeNS(null,
				                        "transform"));

				var cX = translate[1], cY = translate[2];
				var nX = cX-(px-cX), nY = cY-(py-cY);
				if(this.draggingElem.nanoInkscapeType.substr(-1) == "2") {
					var i = [nX, nY];
					nX = px; nY = py;
					px = i[0]; py = i[1];
				}
				var ctrP1 = this.draggingElem.nanoInkscapeONode.controlPoint2;
				var ctrP2 = this.draggingElem.nanoInkscapeONode.controlPoint;
				var tang1 = this.draggingElem.nanoInkscapeONode.tangent;
				var tang2 = this.draggingElem.nanoInkscapeONode.tangent2;

				if(ctrP1) {
					ctrP1.setAttributeNS(null, "transform", "translate("+ nX +", "+ nY +")");
					tang1.setAttributeNS(null, "x2", nX);
					tang1.setAttributeNS(null, "y2", nY);
					ctrP1.nanoInkscapeNode.x1 = nX;
					ctrP1.nanoInkscapeNode.y1 = nY;
				} if(ctrP2) {
					ctrP2.setAttributeNS(null, "transform", "translate("+ px +", "+ py +")");
					tang2.setAttributeNS(null, "x2", px);
					tang2.setAttributeNS(null, "y2", py);
					ctrP2.nanoInkscapeNode.x2 = px;
					ctrP2.nanoInkscapeNode.y2 = py;
				}
			}
			if(this.draggingElem.nanoInkscapeType == undefined) {
				this.draggingElem.setAttributeNS(null, "transform", "translate("+ px
				                               +", "+ py +")");
				var dx = px - this.draggingElem.nanoInkscapeNode.x,
				    dy = py - this.draggingElem.nanoInkscapeNode.y;
				this.draggingElem.nanoInkscapeNode.x = px;
				this.draggingElem.nanoInkscapeNode.y = py;

				var ctrP1 = this.draggingElem.controlPoint2;
				var ctrP2 = this.draggingElem.controlPoint;
				var tang1 = this.draggingElem.tangent;
				var tang2 = this.draggingElem.tangent2;

				if(tang1) {
					var t = re.exec(ctrP1.getAttributeNS(null, "transform"));
					var x = parseFloat(t[1])+dx,
					    y = parseFloat(t[2])+dy;
					ctrP1.setAttributeNS(null, "transform",
					      "translate("+ x +", "+ y +")");
					tang1.setAttributeNS(null, "x1", px);
					tang1.setAttributeNS(null, "y1", py);
					tang1.setAttributeNS(null, "x2", x);
					tang1.setAttributeNS(null, "y2", y);
					ctrP1.nanoInkscapeNode.x1 = x;
					ctrP1.nanoInkscapeNode.y1 = y;
				}
				if(tang2) {
					var t = re.exec(ctrP2.getAttributeNS(null, "transform"));
					var x = parseFloat(t[1])+dx,
					    y = parseFloat(t[2])+dy;
					ctrP2.setAttributeNS(null, "transform",
					      "translate("+ x +", "+ y +")");
					tang2.setAttributeNS(null, "x1", px);
					tang2.setAttributeNS(null, "y1", py);
					tang2.setAttributeNS(null, "x2", x);
					tang2.setAttributeNS(null, "y2", y);
					ctrP2.nanoInkscapeNode.x2 = x;
					ctrP2.nanoInkscapeNode.y2 = y;
				}
			}
		}
	}),
	mouseDown: (function() {
		if(nanoInk.eTarget.nanoInkscapeNode !== undefined || nanoInk.eTarget.nanoInkscapeONode !== undefined) {
			this.draggingElem = nanoInk.eTarget;
		}
	}),
	mouseUp: (function() {
		this.draggingElem = null;
	})
});
