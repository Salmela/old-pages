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
		if(!this.draggingElem) return;
		var translate = Util.getNodeTranslation(nanoInk.activeObject);
		var absPointer = nanoInk.pointerEnd;
		var ptr = absPointer.sub(translate);

		if(/tangent/.test(this.draggingElem.nanoInkscapeType)) {
			return;
		}
		if(/controlPoint/.test(this.draggingElem.nanoInkscapeType)) {
			var translate = Util.getNodeTranslation(this.draggingElem.nanoInkscapeONode);
			var currentControlPoint = ptr;
			var previousControlPoint = translate.mul(2).sub(ptr);

			if(this.draggingElem.nanoInkscapeType == "controlPoint2") {
				previousControlPoint.swap(currentControlPoint);
			}

			function moveVisualHandle(control, tangent, newPosition, isBefore) {
				control.setAttributeNS(null, "transform",
					Util.svgTranslate(newPosition));
				if (tangent) {
					tangent.setAttributeNS(null, "x2", newPosition.x);
					tangent.setAttributeNS(null, "y2", newPosition.y);
				}
				var handle = control.nanoInkscapeNode;
				var parameterIndex = isBefore ? "2" : "1";
				handle["x" + parameterIndex] = newPosition.x;
				handle["y" + parameterIndex] = newPosition.y;
			}
			var active = this.draggingElem.nanoInkscapeONode;
			if (active.controlPoint) {
				moveVisualHandle(active.controlPoint, active.tangent, currentControlPoint, true);
			}
			if (active.controlPoint2) {
				moveVisualHandle(active.controlPoint2, active.tangent2, previousControlPoint, false);
			}
		}
		if(this.draggingElem.nanoInkscapeType == undefined) {
			this.draggingElem.setAttributeNS(null, "transform", Util.svgTranslate(ptr));
			var positionDelta = ptr.sub(this.draggingElem.nanoInkscapeNode);
			this.draggingElem.nanoInkscapeNode.x = ptr.x;
			this.draggingElem.nanoInkscapeNode.y = ptr.y;
			if (this.draggingElem.nanoInkscapeNode2) {
				this.draggingElem.nanoInkscapeNode2.x = ptr.x;
				this.draggingElem.nanoInkscapeNode2.y = ptr.y;
			}

			function moveHandle(control, tangent, isBefore) {
				var svgHandle = ptr;
				if (tangent) {
					var endPoint = Util.getNodeTranslation(control).add(positionDelta);
					control.setAttributeNS(null, "transform",
						Util.svgTranslate(endPoint));
					tangent.setAttributeNS(null, "x1", ptr.x);
					tangent.setAttributeNS(null, "y1", ptr.y);
					tangent.setAttributeNS(null, "x2", endPoint.x);
					tangent.setAttributeNS(null, "y2", endPoint.y);
					svgHandle = endPoint;
				}
				if (control) {
					var handle = control.nanoInkscapeNode;
					var parameterIndex = isBefore ? "2" : "1";
					handle["x" + parameterIndex] = svgHandle.x;
					handle["y" + parameterIndex] = svgHandle.y;
				}
			}

			var active = this.draggingElem;
			moveHandle(active.controlPoint, active.tangent, true);
			moveHandle(active.controlPoint2, active.tangent2, false);
		}
		nanoInk.invalidateBoundingBox();
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
		var controlPoints = nanoInk.activeObject.pathSegList;
		var translation = Util.getNodeTranslation(nanoInk.activeObject);
		var last = controlPoints.length-1;

		this.decorations = nanoInk.newElem("g", {
			"transform": Util.svgTranslate(translation)
		});
		this.interactingNodes = nanoInk.newElem("g", {
			"transform": Util.svgTranslate(translation)
		});

		for(var i = last; i >= 0; i--) {
			var tmpElem;
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
						}, this.decorations);
						tmpElem.tangent2.nanoInkscapeType = "tangent2";

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
						}, this.decorations);
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
							}, this.decorations);
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
		if (hidden) {
			return nanoInk.newElem("rect", {
				"x": 0, "y": 0,
				"height": 0, "width": 0,
				"class": "node control-node",
				"transform": Util.svgTranslate(point)
			}, this.interactingNodes);
		} else {
			return nanoInk.newElem("circle", {
				"r": 4,
				"x": -2.5,
				"y": -2.5,
				"class": "node control-node",
				"transform": Util.svgTranslate(point)
			}, this.interactingNodes);
		}
	}),
	_createNodeHandle: (function(point, type) {
		return nanoInk.newElem("rect", {
			"x": -3.5,
			"y": -3.5,
			"height": 6, "width": 6,
			"class": "node " + type,
			"transform": Util.svgTranslate(point) + " rotate(45)"
		}, this.interactingNodes);
	})
});
