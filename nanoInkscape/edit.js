"use strict";

nanoInk.addTool("edit", {
	draggingElem: null,
	controlNodes: [],

	mainInit: (function() {
	}),

	init: (function() {
		if(nanoInk.activeObject) {
			var i;
			var controlPoints = nanoInk.activeObject.pathSegList;
			var tmpElem;
			var last = controlPoints.length-1;

			for(i = last; i >= 0; i--) {
				var point = controlPoints[i];
				var nextPoint = controlPoints[i + 1];
				switch(point.pathSegTypeAsLetter) {
					case "M":
						if(i == 0 && controlPoints[last].pathSegTypeAsLetter == "z") {
							tmpElem = this.controlNodes[0];
							tmpElem.nanoInkscapeNode2 = point;
						} else {
							tmpElem = nanoInk.newElem("rect", {
								"x": -3.5,
								"y": -3.5,
								"height": 6, "width": 6,
								"class": "node nodeCorner",
								"transform": "translate("+ point.x +
									", "+ point.y +") rotate(45)"
							});
							tmpElem.nanoInkscapeNode = point;
						}
						if(nextPoint != undefined && nextPoint.pathSegTypeAsLetter == "C") {
							tmpElem.tangent2 = nanoInk.newElem("line", {
								"stroke": "#000",
								"x1": point.x,
								"y1": point.y,
								"x2": nextPoint.x1,
								"y2": nextPoint.y1
							});
							tmpElem.controlPoint2 = nanoInk.newElem("circle", {
								"stroke": "#000",
								"fill": "transparent", "r": 4,
								"x": -2.5,
								"y": -2.5,
								"transform": "translate("+ nextPoint.x1 +
									", "+ nextPoint.y1 +")"
							});
							tmpElem.controlPoint2.nanoInkscapeType = "controlPoint2";
							tmpElem.controlPoint2.nanoInkscapeONode = tmpElem;
							tmpElem.controlPoint2.nanoInkscapeNode = nextPoint;
						}
						this.controlNodes.push(tmpElem);
						break;
					case "L":
						nanoInk.newElem("rect", {
							"x": point.x-3.5,
							"y": point.y-3.5,
							"height": 6, "width": 6,
							"class": "nodeCorner",
							"transform": "translate("+ point.x +
								", "+ point.y +") rotate(45)"
						});
						tmpElem.nanoInkscapeNode = point;
						this.controlNodes.push(tmpElem);
						break;
					case "C":
						if(i == 0 && controlPoints[last].pathSegTypeAsLetter == "z") break;
						tmpElem = nanoInk.newElem("rect", {
							"x": -3.5,
							"y": -3.5,
							"height": 6, "width": 6,
							"class": "node nodeSmooth",
							"transform": "translate("+ point.x +
								", "+ point.y +")"
						});

						if (point.x != point.x2 || point.y != point.y2) {
							tmpElem.tangent = nanoInk.newElem("line", {
								"stroke": "#000",
								"x1": point.x,
								"y1": point.y,
								"x2": point.x2,
								"y2": point.y2
							});
							tmpElem.tangent.nanoInkscapeType = "tangent1";
							tmpElem.tangent.nanoInkscapeONode = tmpElem;
							tmpElem.controlPoint = nanoInk.newElem("circle", {
								"stroke": "#000",
								"fill": "transparent", "r": 4,
								"x": -2.5,
								"y": -2.5,
								"class": "node",
								"transform": "translate("+ point.x2 +
									", "+ point.y2 +")"
							});
						} else {
							tmpElem.setAttributeNS(null, "class", "nodeCorner")
							tmpElem.controlPoint = nanoInk.newElem("rect", {
								"x": 0, "y": 0,
								"height": 0, "width": 0,
								"class": "node",
								"transform": "translate("+ point.x2 +
									", "+ point.y2 +")"
							});
						}
						tmpElem.controlPoint.nanoInkscapeType = "controlPoint1";
						tmpElem.controlPoint.nanoInkscapeONode = tmpElem;
						tmpElem.controlPoint.nanoInkscapeNode = point;

						if(nextPoint != undefined && nextPoint.pathSegTypeAsLetter == "C") {
							if (point.x != nextPoint.x1 || point.y != nextPoint.y1) {
								tmpElem.tangent2 = nanoInk.newElem("line", {
									"stroke": "#000",
									"x1": point.x,
									"y1": point.y,
									"x2": nextPoint.x1,
									"y2": nextPoint.y1
								});
								tmpElem.tangent2.nanoInkscapeType = "tangent2";
								tmpElem.tangent2.nanoInkscapeONode = tmpElem;
								tmpElem.controlPoint2 = nanoInk.newElem("circle", {
									"stroke": "#000",
									"fill": "transparent", "r": 4,
									"x": -2.5,
									"y": -2.5,
									"class": "node",
									"transform": "translate("+ nextPoint.x1 +
										", "+ nextPoint.y1 +")"
								});
							} else {
								tmpElem.setAttributeNS(null, "class", "nodeCorner")
								tmpElem.controlPoint2 = nanoInk.newElem("rect", {
									"x": 0, "y": 0,
									"height": 0, "width": 0,
									"class": "node",
									"transform": "translate("+ nextPoint.x1 +
										", "+ nextPoint.y1 +")"
								});
							}
							tmpElem.controlPoint2.nanoInkscapeType = "controlPoint2";
							tmpElem.controlPoint2.nanoInkscapeONode = tmpElem;
							tmpElem.controlPoint2.nanoInkscapeNode = nextPoint;
						}
						tmpElem.nanoInkscapeNode = point;
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
				var ctrP1 = this.draggingElem.nanoInkscapeONode.controlPoint;
				var ctrP2 = this.draggingElem.nanoInkscapeONode.controlPoint2;
				var tang1 = this.draggingElem.nanoInkscapeONode.tangent;
				var tang2 = this.draggingElem.nanoInkscapeONode.tangent2;

				if(ctrP1) {
					ctrP1.setAttributeNS(null, "transform", "translate("+ px +", "+ py +")");
					tang1.setAttributeNS(null, "x2", px);
					tang1.setAttributeNS(null, "y2", py);
					ctrP1.nanoInkscapeNode.x2 = px;
					ctrP1.nanoInkscapeNode.y2 = py;
				}
				if(ctrP2) {
					ctrP2.setAttributeNS(null, "transform", "translate("+ nX +", "+ nY +")");
					tang2.setAttributeNS(null, "x2", nX);
					tang2.setAttributeNS(null, "y2", nY);
					ctrP2.nanoInkscapeNode.x1 = nX;
					ctrP2.nanoInkscapeNode.y1 = nY;
				}
			}
			if(this.draggingElem.nanoInkscapeType == undefined) {
				this.draggingElem.setAttributeNS(null, "transform", "translate("+ px +
					", "+ py +")");
				var dx = px - this.draggingElem.nanoInkscapeNode.x,
				    dy = py - this.draggingElem.nanoInkscapeNode.y;
				this.draggingElem.nanoInkscapeNode.x = px;
				this.draggingElem.nanoInkscapeNode.y = py;
				if (this.draggingElem.nanoInkscapeNode2) {
					this.draggingElem.nanoInkscapeNode2.x = this.draggingElem.nanoInkscapeNode.x;
					this.draggingElem.nanoInkscapeNode2.y = this.draggingElem.nanoInkscapeNode.y;
				}

				var ctrP1 = this.draggingElem.controlPoint;
				var ctrP2 = this.draggingElem.controlPoint2;
				var tang1 = this.draggingElem.tangent;
				var tang2 = this.draggingElem.tangent2;

				if (tang1) {
					var t = re.exec(ctrP1.getAttributeNS(null, "transform"));
					var x = parseFloat(t[1])+dx,
					    y = parseFloat(t[2])+dy;
					ctrP1.setAttributeNS(null, "transform",
						"translate("+ x +", "+ y +")");
					tang1.setAttributeNS(null, "x1", px);
					tang1.setAttributeNS(null, "y1", py);
					tang1.setAttributeNS(null, "x2", x);
					tang1.setAttributeNS(null, "y2", y);
					ctrP1.nanoInkscapeNode.x2 = x;
					ctrP1.nanoInkscapeNode.y2 = y;
				} else if (ctrP1) {
					ctrP1.nanoInkscapeNode.x2 = px;
					ctrP1.nanoInkscapeNode.y2 = py;
				}

				if (tang2) {
					var t = re.exec(ctrP2.getAttributeNS(null, "transform"));
					var x = parseFloat(t[1])+dx,
					    y = parseFloat(t[2])+dy;
					ctrP2.setAttributeNS(null, "transform",
						"translate("+ x +", "+ y +")");
					tang2.setAttributeNS(null, "x1", px);
					tang2.setAttributeNS(null, "y1", py);
					tang2.setAttributeNS(null, "x2", x);
					tang2.setAttributeNS(null, "y2", y);
					ctrP2.nanoInkscapeNode.x1 = x;
					ctrP2.nanoInkscapeNode.y1 = y;
				} else if (ctrP2) {
					ctrP2.nanoInkscapeNode.x1 = px;
					ctrP2.nanoInkscapeNode.y1 = py;
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
