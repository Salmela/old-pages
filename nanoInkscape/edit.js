"use strict";

nanoInk.addTool({
	meta: {
		name: "edit",
		icon: "../icons/inkscape/edit.png",
	},

	draggingElem: null,
	controlNodes: [],

	mainInit: (function() {
	}),

	init: (function() {
	}),

	uninit: (function() {
		this._disableSelection();
	}),
	mouseMove: (function() {
		
	}),

	mouseDrag: (function() {
		if(this.draggingElem != null) {
			var px = nanoInk.pointerEndX, py = nanoInk.pointerEndY;

			if(/tangent/.test(this.draggingElem.nanoInkscapeType)) {
				
			}
			if(/controlPoint/.test(this.draggingElem.nanoInkscapeType)) {
				var translate = this._getNodeTranslation(this.draggingElem.nanoInkscapeONode);
				var cX = translate.x, cY = translate.y;
				var nX = cX-(px-cX), nY = cY-(py-cY);
				if(this.draggingElem.nanoInkscapeType == "controlPoint2") {
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
					var t = this._getNodeTranslation(ctrP1);
					var x = parseFloat(t.x) + dx,
					    y = parseFloat(t.y) + dy;
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
					var t = this._getNodeTranslation(ctrP2);
					var x = parseFloat(t.x) + dx,
					    y = parseFloat(t.y) + dy;
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

	_getNodeTranslation: (function(node) {
		var re = /translate\((-?[0-9.]+),\s*(-?[0-9.]+)\)/;
		var translate = re.exec(node.getAttributeNS(null, "transform"));
		return new Vector(translate[1], translate[2]);
	}),

	mouseDown: (function() {
		if(nanoInk.eTarget.nanoInkscapeNode !== undefined || nanoInk.eTarget.nanoInkscapeONode !== undefined) {
			this.draggingElem = nanoInk.eTarget;
		} else if (nanoInk.eTarget.tagName != "svg" && this._isInternalNode(nanoInk.eTarget)) {
			nanoInk.setActiveNode(nanoInk.eTarget);
		}
	}),

	_isInternalNode: (function(node) {
		return node.classList.length == 0;
	}),

	mouseUp: (function() {
		this.draggingElem = null;
	}),

	setActiveNode: (function() {
		this._disableSelection();
		if (nanoInk.activeObject) {
			this._generateNodes();
		}
	}),

	_disableSelection: (function() {
		for (var i in this.controlNodes) {
			var n = this.controlNodes[i];
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
		this.controlNodes = [];
		this.controlPoint = [];
	}),

	_generateNodes: (function() {
		var i;
		var controlPoints = nanoInk.activeObject.pathSegList;
		var tmpElem;
		var last = controlPoints.length-1;
		this.firstHandleNode = null;

		for(i = last; i >= 0; i--) {
			var point = controlPoints[i];
			var nextPoint = controlPoints[i + 1];
			switch(point.pathSegTypeAsLetter) {
				case "M":
					if(i == 0 && controlPoints[last].pathSegTypeAsLetter == "z") {
						tmpElem = this.controlNodes[0];
						tmpElem.nanoInkscapeNode2 = point;
					} else {
						tmpElem = this._createNodeHandle(point, "nodeSmooth");
						tmpElem.nanoInkscapeNode = point;
						this.controlNodes.push(tmpElem);
					}
					if(nextPoint != undefined && nextPoint.pathSegTypeAsLetter == "C") {
						tmpElem.tangent2 = nanoInk.newElem("line", {
							"stroke": "#000",
							"class": "tangent",
							"x1": point.x,
							"y1": point.y,
							"x2": nextPoint.x1,
							"y2": nextPoint.y1
						}, this.firstHandleNode);
						var position = new Vector(nextPoint.x1, nextPoint.y1);
						tmpElem.controlPoint2 = this._createControlPoint(position);

						tmpElem.controlPoint2.nanoInkscapeType = "controlPoint2";
						tmpElem.controlPoint2.nanoInkscapeONode = tmpElem;
						tmpElem.controlPoint2.nanoInkscapeNode = nextPoint;
					}
					break;
				case "L":
					tmpElem = this._createNodeHandle(point, "nodeCorner");
					tmpElem.nanoInkscapeNode = point;
					this.controlNodes.push(tmpElem);
					break;
				case "C":
					if(i == 0 && controlPoints[last].pathSegTypeAsLetter == "z") break;
					tmpElem = this._createNodeHandle(point, "nodeSmooth");

					if (point.x != point.x2 || point.y != point.y2) {
						tmpElem.tangent = nanoInk.newElem("line", {
							"stroke": "#000",
							"class": "tangent",
							"x1": point.x,
							"y1": point.y,
							"x2": point.x2,
							"y2": point.y2
						}, this.firstHandleNode);
						tmpElem.tangent.nanoInkscapeType = "tangent1";
						tmpElem.tangent.nanoInkscapeONode = tmpElem;
						var position = new Vector(point.x2, point.y2);
						tmpElem.controlPoint = this._createControlPoint(position);
					} else {
						tmpElem.setAttributeNS(null, "class", "nodeCorner")
						var position = new Vector(point.x2, point.y2);
						var hidden = true;
						tmpElem.controlPoint = this._createControlPoint(position, hidden);
					}
					tmpElem.controlPoint.nanoInkscapeType = "controlPoint1";
					tmpElem.controlPoint.nanoInkscapeONode = tmpElem;
					tmpElem.controlPoint.nanoInkscapeNode = point;

					if(nextPoint != undefined && nextPoint.pathSegTypeAsLetter == "C") {
						if (point.x != nextPoint.x1 || point.y != nextPoint.y1) {
							tmpElem.tangent2 = nanoInk.newElem("line", {
								"stroke": "#000",
								"class": "tangent",
								"x1": point.x,
								"y1": point.y,
								"x2": nextPoint.x1,
								"y2": nextPoint.y1
							}, this.firstHandleNode);
							tmpElem.tangent2.nanoInkscapeType = "tangent2";
							tmpElem.tangent2.nanoInkscapeONode = tmpElem;
							var position = new Vector(nextPoint.x1, nextPoint.y1);
							tmpElem.controlPoint2 = this._createControlPoint(position);
						} else {
							tmpElem.setAttributeNS(null, "class", "nodeCorner")
							var position = new Vector(nextPoint.x1, nextPoint.y1);
							var hidden = true;
							tmpElem.controlPoint2 = this._createControlPoint(position, hidden);
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
	}),
	_createControlPoint: (function(point, hidden) {
		var node;
		if (hidden) {
			node = nanoInk.newElem("rect", {
				"x": 0, "y": 0,
				"height": 0, "width": 0,
				"class": "node control-node",
				"transform": "translate("+ point.x + ", "+ point.y +")"
			});
		} else {
			node = nanoInk.newElem("circle", {
				"r": 4,
				"x": -2.5,
				"y": -2.5,
				"class": "node control-node",
				"transform": "translate("+ point.x + ", "+ point.y +")"
			});
		}
		return this._updateFirstHandleNode(node);
	}),
	_createNodeHandle: (function(point, type) {
		return this._updateFirstHandleNode(nanoInk.newElem("rect", {
			"x": -3.5,
			"y": -3.5,
			"height": 6, "width": 6,
			"class": "node " + type,
			"transform": "translate("+ point.x + ", "+ point.y +") rotate(45)"
		}));
	}),
	_updateFirstHandleNode: (function(node) {
		// We have to keep track of the first handle node because in svg
		// the order of elements specifies the drawing order.
		// We want put all user interactable nodes after the decoration nodes.
		// TODO use svg node groups for this
		if (!this.firstHandleNode) {
			this.firstHandleNode = node;
		}
		return node;
	})
});
