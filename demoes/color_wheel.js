/*
    Copyright (C) 2011  Aleksi Salmela

    The JavaScript code in this file is free software: you can
    redistribute it and/or modify it under the terms of the GNU
    General Public License (GNU GPL) as published by the Free Software
    Foundation, either version 3 of the License, or (at your option)
    any later version.  The code is distributed WITHOUT ANY WARRANTY;
    without even the implied warranty of MERCHANTABILITY or FITNESS
    FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

    As additional permission under GNU GPL version 3 section 7, you
    may distribute non-source (e.g., minimized or compacted) forms of
    that code without the copy of the GNU GPL normally required by
    section 4, provided you include this license notice and a URL
    through which recipients can access the Corresponding Source.

    Changelog:

      2011-02-23 Aleksi Salmela
        * first version (1.0.0)
*/
function SVtoRGB(hue, s, v) {
	var r = 0,
	    g = 0,
	    b = 0;

	//s *= 255;
	//v *= 255;
	var min = v * (1 - s);
	var delta = v - min;

	min *= 255;
	delta *= 255;

	r = min + (hue[0]/255) * delta;
	g = min + (hue[1]/255) * delta;
	b = min + (hue[2]/255) * delta;
	//console.info(Math.floor(s*100) +" "+ Math.floor(v*100))

	return [Math.floor(r), Math.floor(g), Math.floor(b)];
}
function hueToRGB(hue) {
	if (hue < 0) hue += 1;
	hue *= 6;
	var int = Math.floor(hue);
	var fact = Math.floor((hue - int) * 255);

	switch(int) {
		case 0:  return [255,  fact,     0];
		case 1:  return [255-fact, 255,  0];
		case 2:  return [0,    255,      fact];
		case 3:  return [0,    255-fact, 255];
		case 4:  return [fact, 0,        255];
		default: return [255,  0,        255-fact];
	}
}

/**
 * Written by mjackson licensed under Creative Commons Attribution-ShareAlike 3.0
 *
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, l ];
}

function lerp(a, b, i) {
	i = Math.max(0, i);
	return a + (b - a) * i;
}

function lerp3(a, b, i) {
	return [lerp(a[0], b[0], i), lerp(a[1], b[1], i), lerp(a[2], b[2], i)];
}

function clamp(v, min, max) {
	return Math.max(min, Math.min(max, v));
}

function clampColor(color) {
	return [Math.floor(clamp(color[0], 0, 255)),
		Math.floor(clamp(color[1], 0, 255)),
		Math.floor(clamp(color[2], 0, 255))];
}

function vec2(x, y) {
	this.x = x;
	this.y = y;
}
vec2.prototype.assign = function(v) {
	this.x = v.x;
	this.y = v.y;
};
vec2.prototype.add = function(v) {
	return new vec2(this.x + v.x, this.y + v.y);
};
vec2.prototype.addS = function(s) {
	return new vec2(this.x + s, this.y + s);
};
vec2.prototype.sub = function(v) {
	return new vec2(this.x - v.x, this.y - v.y);
};
vec2.prototype.mulS = function(s) {
	return new vec2(this.x * s, this.y * s);
};
vec2.prototype.dot = function(v) {
	return (this.x * v.x + this.y * v.y);
};

function getCoord(node) {
	var l = t = 0;
	while(node) {
		l += node.offsetLeft;
		t += node.offsetTop;
		node = node.offsetParent;
	}
	return [l, t];
}

function color_wheel(node, func) {
	var hue_select = document.createElement("canvas");
	var wheel = document.createElement("div");
	var triangle_select = document.createElement("canvas");
	var select_circle = document.createElement("canvas");
	node.appendChild(hue_select);
	node.appendChild(wheel);
	node.style["position"] = "relative";
	node.style["overflow"] = "hidden";
	wheel.appendChild(triangle_select);
	wheel.appendChild(select_circle);

	wheel.style.display          = "inline-block";
	select_circle.style.position = "absolute";
	hue_select.style.position    = "absolute";
	select_circle.width          =  select_circle.height = 9;
	node.style.MozUserSelect     = "none";

	var hueContext = hue_select.getContext("2d");
	var triangleContext = triangle_select.getContext("2d");
	var circleContext = select_circle.getContext("2d");

	var drag = null;
	var rotation = 0;
	var tri_spot = new vec2(0,0);
	var radius, innerRadius;
	var rot = 0;
	var rotationCos, rotationSin;

	var hueColor = [255, 0, 0];

	var triangle = {
		a: new vec2(0,0),
		b: new vec2(0,0),
		c: new vec2(0,0)
	};

	function drawSelectionCircle(color) {
		select_circle.width = select_circle.width;
		if(color) {
			circleContext.strokeStyle = "white";
		} else {
			circleContext.strokeStyle = "black";
		}
		circleContext.beginPath();
		circleContext.arc(4.5, 4.5, 4, 0, 2 * Math.PI, true);
		circleContext.stroke();
	}

	function redrawHueRing() {
		var x = 1, y = 0, angle = 0;
		var delta = (1.5 / (radius * Math.PI));

		hueContext.translate(radius, radius);
		// generate the hue selection area from huge number of line segments
		while (angle < Math.PI / 2) {
			var a, b, a2, b2;

			var frac = (angle * 3 / Math.PI);
			frac     =  frac - Math.floor(frac);

			if(angle < Math.PI / 3) {
				a = 255;
				b = Math.floor(frac*255);
			} else {
				a = Math.floor(255-frac*255);
				b = 255;
			}

			// draw the green-red sector
			hueContext.strokeStyle = "rgb("+ a +", "+ b +", 0)";
			hueContext.beginPath();
			hueContext.moveTo(x * radius,      y * radius);
			hueContext.lineTo(x * innerRadius, y * innerRadius);
			hueContext.stroke();

			// draw the red - violet sector
			hueContext.strokeStyle = "rgb("+ a +", 0, "+ b +")";
			hueContext.beginPath();
			hueContext.moveTo(x * radius,      -y * radius);
			hueContext.lineTo(x * innerRadius, -y * innerRadius);
			hueContext.stroke();

			// draw the violet - cyan sector
			hueContext.strokeStyle = "rgb("+ (255-a) +", "+ (255-b) +", 255)";
			hueContext.beginPath();
			hueContext.moveTo(-x * radius,      -y * radius);
			hueContext.lineTo(-x * innerRadius, -y * innerRadius);
			hueContext.stroke();

			// draw the cyan - green sector
			hueContext.strokeStyle = "rgb("+ (255-a) +", 255, "+ (255-b) +")";
			hueContext.beginPath();
			hueContext.moveTo(-x * radius,      y * radius);
			hueContext.lineTo(-x * innerRadius, y * innerRadius);
			hueContext.stroke();

			angle += delta;
			x = Math.cos(angle);
			y = -Math.sin(angle);
		}
	}
	function rotate(x, y) {
		var newX = rotationCos * x - rotationSin * y;
		var newY = rotationSin * x + rotationCos * y;
		return new vec2(newX, newY);
	}
	function reverseRotate(x, y) {
		var newX = -rotationCos * x - rotationSin * y;
		var newY = rotationSin * x - rotationCos * y;
		return new vec2(newX, newY);
	}
	function redrawTriangle(rot) {
		hueColor = hueToRGB(-rot / (2 * Math.PI));
		triangleContext.save();

		var triangleWidth = (innerRadius * 2) * Math.sin(Math.PI / 3);
		var triangleHeight = triangleWidth * Math.cos(Math.PI / 6);
		var offset = 0;

		var delta = (triangleWidth / 2) / triangleHeight;
		var triangleHalfWidth = Math.ceil(triangleWidth / 2);
		var triangleHeightInteger = Math.ceil(triangleHeight);
		// create new buffer for the new coloring
		var imageData = triangleContext.createImageData(2 * triangleHalfWidth, triangleHeightInteger),
		    data = imageData.data;

		var i, j;
		for(i = 0; i < triangleHeightInteger; i++) {
			offset += 2 * triangleHalfWidth;
			var endLerpValue = i / triangleHeightInteger;
			startColor = lerp3(hueColor, [0, 0, 0], endLerpValue);
			endColor = lerp3(hueColor, [255, 255, 255], endLerpValue);

			var halfLineWidth = Math.ceil(i*delta);
			// draw pixel of single line in the triangle
			for(j = 0; j <= halfLineWidth; j++) {
				// draw pixel on the left side of triangle
				var pixelIndex = (offset + triangleHalfWidth - j) * 4;
				var lerpFactor = 0.5 - j / (2 * halfLineWidth);
				var pixelColor = lerp3(startColor, endColor, lerpFactor);
				data[pixelIndex + 0] = pixelColor[0];
				data[pixelIndex + 1] = pixelColor[1];
				data[pixelIndex + 2] = pixelColor[2];
				data[pixelIndex + 3] = 255;

				// draw pixel on the right side of triangle
				var pixelIndex = (offset + triangleHalfWidth + j) * 4;
				var lerpFactor = 0.5 + j / (2 * halfLineWidth);
				var pixelColor = lerp3(startColor, endColor, lerpFactor);
				data[pixelIndex + 0] = pixelColor[0];
				data[pixelIndex + 1] = pixelColor[1];
				data[pixelIndex + 2] = pixelColor[2];
				data[pixelIndex + 3] = 255;
			}
			//antialiasing
			var opacity = i*delta - Math.floor(i*delta);
			data[(offset + triangleHalfWidth-j + 1)*4 + 3] = opacity * 255;
			data[(offset + triangleHalfWidth+j - 1)*4 + 3] = opacity * 255;
		}
		// make the top most pixel completely opaque
		data[(triangleHalfWidth*3)*4 + 3] = 255;

		triangleContext.putImageData(imageData, radius - imageData.width/ 2 - 1, (radius - innerRadius) - 1);

		triangleContext.strokeStyle = "rgb(0, 0, 0)";
		triangleContext.translate(radius, radius);
		triangleContext.beginPath();
		triangleContext.moveTo(-0.5, -radius);
		triangleContext.lineTo(-0.5, -innerRadius);
		triangleContext.stroke();
		triangleContext.restore();
		var cssRotation = 90 + rot * 180 / Math.PI;
		var transform = "rotate("+ Math.round(cssRotation) +"deg)";
		wheel.style.MozTransform = transform;
		wheel.style.WebkitTransform = transform;
		wheel.style.transform = transform;

		var rotation = rot - Math.PI / 2;
		rotationCos = Math.cos(rotation);
		rotationSin = Math.sin(rotation);

		// compute some helper values for picking the exact color from the triangle
		triangle.a = rotate(0, innerRadius);
		triangle.b = rotate(-triangleHalfWidth, -triangleHeightInteger + innerRadius);
		triangle.c = rotate(triangleHalfWidth, -triangleHeightInteger + innerRadius);
	}
	function updateSelectionCircle(u, v) {
		var triangleB = triangle.b.sub(triangle.a);
		var triangleC = triangle.c.sub(triangle.a);

		// transform the point from fixed triangle space to coordinate at parent node
		var point = triangleC.mulS(v);
		point = point.add(triangleB.mulS(u));
		point = point.add(triangle.a);

		// then parent node rotates so we have to counter act it
		tri_spot = reverseRotate(point.x, point.y);

		select_circle.style.left = radius + tri_spot.x - (select_circle.width/2) +"px";
		select_circle.style.top  = radius + tri_spot.y - (select_circle.width/2) +"px";
	}
	function selectColor(u, v) {
		updateSelectionCircle(u, v);

		// compute point at the cartesian triangle space
		tri_spot.x2 = u + v;
		if (tri_spot.x2 != 0) {
			tri_spot.y2 = 1 - v / tri_spot.x2;
		} else {
			tri_spot.y2 = 0.5;
		}

		pixel = getFinalColor();
	}
	function getFinalColor() {
		var start = lerp3(hueColor, [0, 0, 0], tri_spot.x2);
		var end   = lerp3(hueColor, [255, 255, 255], tri_spot.x2);

		var color = lerp3(start, end, tri_spot.y2);
		return clampColor(color);
	}
	function clickHandler(e, isMouseDownEvent) {
		//TODO this does not work if the user has scrolled
		var coord = getCoord(hue_select);
		var x = e.clientX - coord[0] - radius,
		    y = e.clientY - coord[1] - radius;
		var dist = Math.sqrt(x*x + y*y);

		if(!isMouseDownEvent && !drag) return;
		var onHue = innerRadius < dist && dist < radius;

		if(isMouseDownEvent && onHue) drag = "hue";

		if(drag != "hue") {
			// transform the pixel from coordinate system in middle of the parent node to the fixed triangle space

			// Compute vectors (source: http://www.blackpawn.com/texts/pointinpoly/default.html)
			var pointer = new vec2(x, y);
			pointer = pointer.sub(triangle.a);


			// move the coordinates relative to the a point
			var triangleB = triangle.b.sub(triangle.a);
			var triangleC = triangle.c.sub(triangle.a);

			// Compute dot products
			var dot00 = triangleB.dot(triangleB);
			var dot01 = triangleB.dot(triangleC);
			var dot02 = triangleB.dot(pointer);
			var dot11 = triangleC.dot(triangleC);
			var dot12 = triangleC.dot(pointer);

			// Compute barycentric coordinates
			var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
			var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
			var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
	
			// Check if point is in triangle
			if(isMouseDownEvent && u >= 0 && v >= 0 && u + v < 1) {
				drag = "triangle";
			}
			if(drag == "triangle") {
				if (u < 0) u = 0;
				if (v < 0) v = 0;
				if (u + v > 1) {
					var sum = (u+v);
					u = u/sum;
					v = v/sum;
				}
				selectColor(u, v);
				func(pixel);
			}
			return;
		}

		x *= (radius-2) / dist;
		y *= (radius-2) / dist;

		rot = Math.atan2(y, x);
		redrawTriangle(rot);

		pixel = getFinalColor();
		func(pixel);
	}
	wheel.addEventListener("mousedown", function(e) {
		if(e.which == 1) {
			clickHandler(e, true);
		}
	});
	document.addEventListener("mouseup", function(e) {
		drag = false;
	});
	document.addEventListener("mousemove", clickHandler);

	var obj = {
		resize: function(size) {
			triangle_select.width = hue_select.width = size;
			triangle_select.height = hue_select.height = size;
			radius = size / 2;
			innerRadius = radius * 0.75;
			wheel.style["transform-origin"] = radius + "px " + radius + "px";

			drawSelectionCircle(0);
			redrawHueRing();
			redrawTriangle(rot);
			pixel = getFinalColor();
		},
		getValue: function() {
			return {"r": pixel[0], "g": pixel[1], "b": pixel[2]};
		},
		setValue: function(color) {
			var hsl = rgbToHsl(color.r, color.g, color.b);
			redrawTriangle(-hsl[0] * 2 * Math.PI);
			var factor;
			// compute point at the cartesian triangle space
			if (hsl[2] < 0.5) {
				factor = hsl[2] * 2;
			} else {
				factor = (1 - hsl[2]) * 2;
			}
			var y = 1 - (hsl[1] * factor);
			var x = (hsl[2] - 0.5) * 2;

			// compute the coordinate at fixed triangle space
			var u = y / 2 + x / 2;
			var v = y / 2 - x / 2;
			updateSelectionCircle(u, v);

			tri_spot.x2 = x;
			tri_spot.y2 = y;
			pixel = getFinalColor();
		}
	};
	obj.resize(256);
	selectColor(0, 0);
	func(pixel);

	return obj;
}

var createColorWheel = color_wheel;
