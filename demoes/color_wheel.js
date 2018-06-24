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
function lerp(a, b, i) {
	i = Math.max(0, i);
	return a + (b - a) * i;
}

function lerp3(a, b, i) {
	return [lerp(a[0], b[0], i), lerp(a[1], b[1], i), lerp(a[2], b[2], i)];
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
	select_circle.width          =  select_circle.height = 8;
	node.style.MozUserSelect     = "none";

	var hue_ctx = hue_select.getContext("2d");
	var tri_ctx = triangle_select.getContext("2d");
	var circle_ctx = select_circle.getContext("2d");

	var drag = false;
	var rotation = 0;
	var triangleHeightInteger = 0,
	    triangleHalfWidth = 0,
	    delta = 0;
	var tri_spot = new vec2(0,0);
	var radius = 127, innerRadius = radius * 0.75,
	    rot = 0,
	    u = 0, v = 0;

	var hue = [255, 0, 0];

	var triangle = {
		a: new vec2(0,0),
		b: new vec2(0,0),
		c: new vec2(0,0)
	};

	function draw_circle(color) {
		select_circle.width = select_circle.width;
		if(color) {
			circle_ctx.strokeStyle = "white";
		} else {
			circle_ctx.strokeStyle = "black";
		}
		circle_ctx.beginPath();
		circle_ctx.arc(4, 4, 3.5, 0, 2 * Math.PI, true);
		circle_ctx.stroke();
	}

	function redraw_hue() {
		var x = 1, y = 0, angle = 0;
		var delta = ( 1.5 / (radius * Math.PI));

		hue_ctx.translate(radius, radius);
		// generate the hue selection area from huge number of line segments
		while (angle < Math.PI / 2) {
			var a, b, a2, b2;

			var frac = (angle * 3 / Math.PI);
			frac     =  frac - Math.floor(frac);

			if(angle < Math.PI / 3) {
				a =  255;
				b =  Math.floor(frac*255);
			} else {
				a =  Math.floor(255-frac*255);
				b =  255;
			}

			// draw the green-red sector
			hue_ctx.strokeStyle = "rgb("+ a +", "+ b +", 0)";
			hue_ctx.beginPath();
			hue_ctx.moveTo(x * radius,      y * radius);
			hue_ctx.lineTo(x * innerRadius, y * innerRadius);
			hue_ctx.stroke();

			// draw the red - violet sector
			hue_ctx.strokeStyle = "rgb("+ a +", 0, "+ b +")";
			hue_ctx.beginPath();
			hue_ctx.moveTo(x * radius,      -y * radius);
			hue_ctx.lineTo(x * innerRadius, -y * innerRadius);
			hue_ctx.stroke();

			// draw the violet - cyan sector
			hue_ctx.strokeStyle = "rgb("+ (255-a) +", "+ (255-b) +", 255)";
			hue_ctx.beginPath();
			hue_ctx.moveTo(-x * radius,      -y * radius);
			hue_ctx.lineTo(-x * innerRadius, -y * innerRadius);
			hue_ctx.stroke();

			// draw the cyan - green sector
			hue_ctx.strokeStyle = "rgb("+ (255-a) +", 255, "+ (255-b) +")";
			hue_ctx.beginPath();
			hue_ctx.moveTo(-x * radius,      y * radius);
			hue_ctx.lineTo(-x * innerRadius, y * innerRadius);
			hue_ctx.stroke();

			angle += delta;
			x = Math.cos(angle);
			y = -Math.sin(angle);
		}
	}
	function redraw_tri(hueColor, rot) {
		tri_ctx.save();

		var triangleWidth = (innerRadius * 2) * Math.sin(Math.PI / 3);
		var triangleHeight = triangleWidth * Math.cos(Math.PI / 6);
		var offset = 0;

		delta = (triangleWidth / 2) / triangleHeight;
		triangleHalfWidth = Math.ceil(triangleWidth / 2);
		triangleHeightInteger = Math.ceil(triangleHeight);
		// create new buffer for the new coloring
		var imageData = tri_ctx.createImageData(2 * triangleHalfWidth, triangleHeightInteger),
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
				data[pixelIndex + 0] = lerp(startColor[0], endColor[0], lerpFactor);
				data[pixelIndex + 1] = lerp(startColor[1], endColor[1], lerpFactor);
				data[pixelIndex + 2] = lerp(startColor[2], endColor[2], lerpFactor);
				data[pixelIndex + 3] = 255;

				// draw pixel on the right side of triangle
				var pixelIndex = (offset + triangleHalfWidth + j) * 4;
				var lerpFactor = 0.5 + j / (2 * halfLineWidth);
				data[pixelIndex + 0] = lerp(startColor[0], endColor[0], lerpFactor);
				data[pixelIndex + 1] = lerp(startColor[1], endColor[1], lerpFactor);
				data[pixelIndex + 2] = lerp(startColor[2], endColor[2], lerpFactor);
				data[pixelIndex + 3] = 255;
			}
			//antialiasing
			var opacity = i*delta - Math.floor(i*delta);
			data[(offset + triangleHalfWidth-j + 1)*4 + 3] = opacity * 255;
			data[(offset + triangleHalfWidth+j - 1)*4 + 3] = opacity * 255;
		}
		// make the top most pixel completely opaque
		data[(triangleHalfWidth*3)*4 + 3] = 255;

		tri_ctx.putImageData(imageData, radius - imageData.width/ 2 - 1, (radius - innerRadius) - 1);

		tri_ctx.strokeStyle = "rgb(0, 0, 0)";
		tri_ctx.translate(radius, radius);
		tri_ctx.beginPath();
		tri_ctx.moveTo(-0.5, -radius);
		tri_ctx.lineTo(-0.5, -innerRadius);
		tri_ctx.stroke();
		tri_ctx.restore();
		rotation = rot * 180 / Math.PI;
		wheel.style.MozTransform = "rotate("+ Math.round(90+rotation) +"deg)";
		wheel.style.WebkitTransform = "rotate("+ Math.round(90 + rotation) +"deg)";
		wheel.style.transform = "rotate("+ Math.round(90 + rotation) +"deg)";

		var cosi = Math.cos(rot + Math.PI / 2),
		    sini = Math.sin(rot + Math.PI / 2);

		// compute some helper values for picking the exact color from the triangle
		triangle.a.x =  sini * innerRadius;
		triangle.a.y = -cosi * innerRadius;

		triangle.b.x =  cosi * triangleHalfWidth - sini * (triangleHeightInteger - innerRadius) - triangle.a.x;
		triangle.b.y =  sini * triangleHalfWidth + cosi * (triangleHeightInteger - innerRadius) - triangle.a.y;

		triangle.c.x = -cosi * triangleHalfWidth - sini * (triangleHeightInteger - innerRadius) - triangle.a.x;
		triangle.c.y = -sini * triangleHalfWidth + cosi * (triangleHeightInteger - innerRadius) - triangle.a.y;
	}
	function selectColor(u, v){
		var point = triangle.c.mulS(v);
		point = point.add(triangle.b.mulS(u));
		point = point.add(triangle.a);

		var cosi = Math.cos(-rotation / 180 * Math.PI - Math.PI / 2),
		    sini = Math.sin(-rotation / 180 * Math.PI - Math.PI / 2);

		tri_spot.x = cosi * point.x - sini * point.y;
		tri_spot.y = sini * point.x + cosi * point.y;
		
		select_circle.style.left = radius + tri_spot.x - (select_circle.width/2) +"px";
		select_circle.style.top  = radius + tri_spot.y - (select_circle.width/2) +"px";

		tri_spot.x2 = u+v;
		tri_spot.y2 = 0.5 + tri_spot.x / ((tri_spot.y+radius) * delta);

		rotateWheel();

		//pixel = SVtoRGB(hueColor, 1-u, 1-v);
		func(pixel);
	}
	function rotateWheel() {
		var start = [lerp(hue[0], 0,   tri_spot.x2), lerp(hue[1], 0,   tri_spot.x2), lerp(hue[2], 0,   tri_spot.x2)];
		var end   = [lerp(hue[0], 255, tri_spot.x2), lerp(hue[1], 255, tri_spot.x2), lerp(hue[2], 255, tri_spot.x2)];

		pixel = [Math.floor(lerp(start[0], end[0], tri_spot.y2)),
		         Math.floor(lerp(start[1], end[1], tri_spot.y2)),
		         Math.floor(lerp(start[2], end[2], tri_spot.y2))];
	}
	function click(e, c) {
		var coord = getCoord(hue_select);
		var x = e.clientX - coord[0] - radius,
		    y = e.clientY - coord[1] - radius;
		var dist = x*x + y*y;

		if(!c && !drag) return;

		var onHue = dist > innerRadius * innerRadius && dist < radius*radius;

		if(c && onHue) drag = 1;

		if(drag != 1) {
			// Compute vectors (source: http://www.blackpawn.com/texts/pointinpoly/default.html)
			var v = new vec2(x, y);
			v = v.sub(triangle.a);

			//console.info(triangle.a.x +","+ triangle.a.y +" "+ triangle.b.x +","+ triangle.b.y +" "+ triangle.c.x +","+ triangle.c.y);

			// Compute dot products
			var dot00 = triangle.b.dot(triangle.b);
			var dot01 = triangle.b.dot(triangle.c);
			var dot02 = triangle.b.dot(v);
			var dot11 = triangle.c.dot(triangle.c);
			var dot12 = triangle.c.dot(v);

			// Compute barycentric coordinates
			var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
			var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
			var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
	
			// Check if point is in triangle
			if(c && u >= 0 && v >= 0 && u + v < 1) {
				selectColor(u, v);
				drag = 2;
			}
			if(drag == 2) {
				if (u < 0) u = 0;
				if (v < 0) v = 0;
				if (u + v > 1) {
					var sum = (u+v);
					u = u/sum;
					v = v/sum;
				}
				selectColor(u, v);
			}

			return;
		} else if(!drag) return;

		dist = Math.sqrt(dist);
		x *= (radius-2) / dist;
		y *= (radius-2) / dist;

		hue = hue_ctx.getImageData(Math.floor(x) + radius, Math.floor(y) + radius, 1, 1).data;
		var rot = Math.atan2(y, x);
		redraw_tri(hue, rot);

		rotateWheel();
		func(pixel);
	}
	wheel.addEventListener("mousedown", function(e) {
		if(e.which == 1) {
			click(e, true);
		}
	});
	document.addEventListener("mouseup", function(e) {
		drag = false;
	});
	document.addEventListener("mousemove", click);

	var obj = {
		resize: function(size) {
			triangle_select.width = hue_select.width = size;
			triangle_select.height = hue_select.height = size;
			radius = size / 2;
			innerRadius = radius * 0.75;

			draw_circle(0);
			redraw_hue();
			redraw_tri(hue, rot);
			rotateWheel();
		},
		getValue: function() {
			return {"r": pixel[0], "g": pixel[1], "b": pixel[2]};
		},
		setValue: function(color) {
			pixel[0] = color.r;
			pixel[1] = color.g;
			pixel[2] = color.b;
		}
	};
	obj.resize(radius * 2);
	selectColor(0, 0);

	return obj;
}

var createColorWheel = color_wheel;
