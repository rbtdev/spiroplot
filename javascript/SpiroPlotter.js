//
//*****************************************************************************
//*	Copyright RBT Development (Afxano, Inc), 2011 - All Rights Reserved
//*
//*****************************************************************************
//

var SpiroPlotter = {

	create: function (container, width, height, onReady, onDragging, onDone) {
		this.width = width;
		this.height = height;
		this.doDragging = onDragging.bind(this);
		this.doReady = onReady.bind(this);
		this.doDone = onDone.bind(this);
		this.drawingSpeed = 1;
		this.deltaT = .001;
		this.maxTurns = 100;
		this.initialized = false;
		this.frameDelay = 1000 / 30;
		this.initCanvas(container);
	},

	initCanvas: function (container) {
		// console.log("Initializing canvas...");
		this.canvasShape = document.createElement('canvas');
		this.canvasShape.setAttribute("id", "canvasShape");
		this.canvasBack = document.createElement('canvas');
		this.canvasBack.setAttribute("id", "canvasBack");
		this.canvasMoving = document.createElement('canvas');
		this.canvasMoving.setAttribute("id", "canvasMoving");
		container.appendChild(this.canvasShape);
		container.appendChild(this.canvasMoving);
		container.appendChild(this.canvasBack);
		this.canvasShape.width = this.width;
		this.canvasShape.height = this.height;
		this.canvasMoving.width = this.width;
		this.canvasMoving.height = this.height;
		this.canvasBack.width = this.width;
		this.canvasBack.height = this.height;
		this.canvasWidth = this.canvasShape.width;
		this.canvasHeight = this.canvasShape.height;
		this.gShape = this.canvasShape.getContext('2d');
		this.gMoving = this.canvasMoving.getContext('2d');
		this.gBack = this.canvasBack.getContext('2d');
		// Fill background with gradient
		//var grd = this.gBack.createRadialGradient(this.width / 2, this.height / 2, 0.4 * this.width, this.width / 2, this.height / 2, 0.6 * this.width);
		//var grd = this.gBack.createRadialGradient(this.width / 2, this.height / 2, 0.4 * this.width, this.width / 2, this.height / 2,this.width);
		var grd = this.gBack.createRadialGradient(this.width / 2, this.height / 2, 0.4 * this.width, this.width / 2, this.height / 2, this.width);
		grd.addColorStop(0, "#EDE2B2");
		grd.addColorStop(1, "#BDA126");

		//grd.addColorStop(0, "#AFC3C7");
		//grd.addColorStop(1, "#222222");

		this.gBack.fillStyle = grd;
		this.gBack.fillRect(0, 0, this.width, this.height);




		//this.canvasBack.show();
		//this.canvasShape.show();
		//this.canvasMoving.show();	
		this.initialized = true;
		this.dragging = {
			arm: -1,
			distance: 0
		};
	},


	initialize: function (armSpecs, startAngle, maxPenWidth, minPenWidth, zoomLevel) {

		this.stop();
		this.movingHidden = false;
		this.minPenWidth = minPenWidth;
		this.maxPenWidth = maxPenWidth;
		this.startAngle = startAngle;
		this.zoomLevel = zoomLevel;
		this.armSet = new ArmSet(armSpecs, {
			x: 0,
			y: 0
		}, 0, this.gMoving, this.toLocal.bind(this));
		this.refresh();
	},

	refresh: function () {
		this.stop();
		this.setBounds(-this.armSet.maxLength(), this.armSet.maxLength(), -this.armSet.maxLength(), this.armSet.maxLength(), this.zoomLevel);
		this.clear(this.gMoving);
		this.armSet.turnTo(0);
		this.armSet.draw("gray", 4);
	},

	restart: function () {
		this.stop();
		this.start();
	},


	clearShape: function () {
		this.clear(this.gShape);

	},

	hideArms: function () {
		if (this.movingHidden) {
			//this.$.canvasMoving.show();
			this.movingHidden = false;
		} else {
			//this.$.canvasMoving.hide();
			this.movingHidden = true;
		}
		return (this.movingHidden);
	},


	movePoint: function (point, dx, dy) {

		return ({
			x: point.x + dx,
			y: point.y + dy
		});
	},

	canvasDoubleClick: function (event) {
		console.log("Double click...");
		//this.stop();
		var mouseClick = {
			x: event.offsetX,
			y: event.offsetY
		};
		var dragObj = this.armSet.retractArm(mouseClick);
		if (dragObj.arm != -1) {
			this.clear(this.gMoving);
			this.armSet.draw("gray", 4);
			this.doDragging(dragObj);
			this.refresh();
		}
	},

	canvasClick: function (event) {

		if (this.dragging.arm != -1) {
			this.refresh();
			console.log("Dragging complete - new arm lenth = " + this.dragging.length);
			this.dragging.arm = -1;
		} else {
			console.log("Canvas Clicked at (" + event.offsetX + "," + event.offsetY + ")");
		}
		this.canvasMoving.onmousemove = null;
	},

	canvasMouseDown: function (event) {
		this.stop();
		this.mouseDown = {
			x: event.offsetX,
			y: event.offsetY
		};
		//this.dragging.arm = -1;
		this.dragging.arm = this.armSet.grabArm(this.mouseDown);
		this.canvasMoving.onmousemove = this.canvasDrag.bind(this);
	},

	canvasDrag: function (event) {
		var dist = Math.pow(Math.pow((event.dx), 2) + Math.pow((event.dy), 2), .5);
		if (this.dragging.arm != -1) {
			// console.log("Dragging arm " + this.dragging.arm);
			// console.log("Draging Distance: " + dist/this.xScale);
			this.dragging.armMoved = true;
			var newArmPosition = this.toScaled(this.movePoint(this.mouseDown, event.dx, event.dy));
			this.dragging = this.armSet.dragArm(this.dragging.arm, newArmPosition);
			this.clear(this.gMoving);
			this.armSet.draw("gray", 4);
			this.doDragging(this.dragging);
		}

	},




	canvasDragEnd: function (event) {
		var dist = Math.pow(Math.pow((event.dx), 2) + Math.pow((event.dy), 2), .5);

		// console.log("Drag End Distance: " + dist);
	},

	setBounds: function (xMin, xMax, yMin, yMax, zoomLevel) {
		// console.log("SetBounds: zoomLevel = " + zoomLevel);
		this.xMin = xMin * zoomLevel;
		this.xMax = xMax * zoomLevel;
		this.yMin = yMin * zoomLevel;
		this.yMax = yMax * zoomLevel;
		this.xPad = 10;
		this.yPad = 10;
		this.scaleWidth = Math.abs(this.xMax - this.xMin);
		this.scaleHeight = Math.abs(this.yMax - this.yMin);
		this.xScale = (this.canvasWidth - (this.xPad * 2)) / this.scaleWidth;
		this.yScale = (this.canvasHeight - (this.yPad * 2)) / this.scaleHeight;
		this.scale = Math.min(this.xScale, this.yScale);
		this.xStep = 1 / this.xScale;
		this.yStep = 1 / this.yScale;
		this.step = 1 / this.scale;

	},
	distance: function (p1, p2) {
		return Math.pow(Math.pow((p1.x - p2.x), 2) + Math.pow((p1.y - p2.y), 2), .5);
	},

	done: function () {
		//this.$.canvasMoving.hide();
		//this.$.canvasBack.hide();
		this.clear(this.gMoving);
		this.armSet.turnTo(0);
		this.armSet.draw("gray", 4);
		//this.imageData = this.gShape.getImageData(0,0,this.width, this.height);
		this.doDone();
	},

	getImagePixel: function (x, y, imageData) {

		var index = (x * 4) * imageData.width + (y * 4);
		return ({
			r: imageData[index],
			g: imageData[index + 1],
			b: imageData[index + 2],
			a: imageData[index + 3]
		})
	},

	putImage: function () {
		// Loop through data
		var picLength = this.imageData.width * this.imageData.height * 4
		for (var i = 0; i < picLength; i += 4) {
			this.imageData.data[i] = 255 - this.imageData.data[i];
			this.imageData.data[i + 1] = 255 - this.imageData.data[i + 1];
			this.imageData.data[i + 2] = 255 - this.imageData.data[i + 2];
			this.imageData.data[i + 3] = 255 - this.imageData.data[i + 3];
		}
		this.gShape.putImageData(this.imageData, 0, 0);
	},

	saveImage: function () {
		var flattened = document.createElement('canvas')
		flattened.width = this.canvasShape.width;
		flattened.height = this.canvasShape.height;
		flattened.getContext('2d').drawImage(this.canvasBack, 0, 0);
		flattened.getContext('2d').drawImage(this.canvasShape, 0, 0);

		var image = flattened.toDataURL("image/png");
		//.replace("image/png", "image/octet-stream");
		//window.external.Notify(image);
		return image;
	},

	stop: function () {
		this.drawing = false;
		clearInterval(this.frameInterval);
	},

	setArmSpeed: function (arm, speed) {
		if (this.armSet) {
			this.stop();
			this.armSet.arms[arm].speed = speed;
			this.refresh();
		}
	},

	setArmLength: function (arm, length) {
		if (this.armSet) {
			this.stop();
			this.armSet.arms[arm].length = length;
			this.refresh();
		}
	},

	setStartAngle: function (angle) {
		this.startAngle = angle;
	},

	setZoomLevel: function (zoom) {
		this.zoomLevel = zoom;
	},

	setSpeed: function (speed) {
		if (speed > 0) {
			this.drawingSpeed = speed;
			// console.log("Changed speed: " + this.drawingSpeed);
		}
	},

	getSpeed: function () {
		return this.drawingSpeed;
	},

	setCalligraphy: function (value) {
		this.calligraphy = value;
		// console.log("Calligraphy value = " + value);
	},

	setPenColor: function (value) {
		this.penColor = value;
	},

	start: function () {
		if (this.initialized) {
			var points = this.computeSpiro(this.armSet);
			this.drawSpiro(points, this.armSet);
		} else {
			// console.log("Siro not initialized.");
		}
	},

	calcSize: function () {
		var size = this.armSet.maxLength();
		return size;
	},


	computeSpiro: function (armSet) {

		var speeds = [];
		for (var i = 0; i < armSet.arms.length; i++) {
			speeds[i] = Math.abs(armSet.arms[i].speed);
		}
		var maxTurns = Math.min(speeds[0] / this.gcd(speeds), this.maxTurns);
		var maxTime = maxTurns * 2 * Math.PI;
		//// console.log("Max Turns = " + maxTurns + "(Time = " + maxTime);		
		var points = [];
		var i = 0;
		var speed = 0;
		this.maxSpeed = 0;
		this.minSpeed = Infinity;
		this.deltaT = .001;
		for (var t = 0; t <= maxTime + this.deltaT; t += this.deltaT) {
			var point = this.spiroPoint(t, armSet);
			speed = Math.pow(Math.pow(point.dx, 2) + Math.pow(point.dy, 2), .5);
			if (speed > this.maxSpeed) {
				this.maxSpeed = speed;
			}
			if (speed < this.minSpeed) {
				this.minSpeed = speed;
			}
			points[i] = {
				point: point,
				t: t,
				speed: speed
			};
			i++;
		}
		// console.log("Points Length : " + points.length);
		return points;
	},

	spiroPoint: function (t, armSet) {
		var x = 0;
		var y = 0;
		var dx = 0;
		var dy = 0;
		var angle = 0;
		for (var i = 0; i < armSet.arms.length; i++) {
			// Compute the next point on the circle for each arm (add each arm position to get the final point)
			x += armSet.arms[i].length * Math.cos(armSet.arms[i].startAngle + (armSet.arms[i].speed * t));
			y += armSet.arms[i].length * Math.sin(armSet.arms[i].startAngle + (armSet.arms[i].speed * t));
			// Derivative of f(t) = velocity at each point
			dx -= armSet.arms[i].speed * armSet.arms[i].length * Math.sin(armSet.arms[i].startAngle + (armSet.arms[i].speed * t));
			dy += armSet.arms[i].speed * armSet.arms[i].length * Math.cos(armSet.arms[i].startAngle + (armSet.arms[i].speed * t));
			angle = this.armSet.findAngleByDelta(dx, dy);
		}
		// return the point
		return ({
			x: x,
			y: y,
			dx: dx,
			dy: dy,
			angle: angle
		});
	},

	drawSpiro: function (points, armSet) {

		// console.log("Points Length : " + points.length);
		// if we have points to draw
		if (points.length > 0) {

			// lpoint is the "last point drawn" initialy its the first point
			var lpoint = this.toLocal(points[0].point);
			var i = 1;

			// used for frames per second calculation 
			var frameCount = 0;
			var startTime = new Date();
			var fps = 0;

			// used for pen width calculations
			var speedRange = this.maxSpeed - this.minSpeed;
			var widthMax = this.maxPenWidth;
			var widthMin = this.minPenWidth;
			////var speedScale = 1;
			var color = "";
			var rgb = {};
			var point = {};
			var width = 1;
			var brush = "round";

			// initialize color gradients -- TODO: think about moving this out of here.
			var colorFreq = 2 * Math.PI / points.length;
			//colors = this.makeColorGradient(colorFreq,colorFreq,colorFreq,2,4,8,128,127,points.length)
			colors = this.makeColorGradient(colorFreq, colorFreq, colorFreq, 0, 2, 4, 128, 127, points.length)
			//colors = this.makeColorGradient(colorFreq,colorFreq,colorFreq,0,2,8,128,127,points.length)
			//colors = this.makeColorGradient(colorFreq,colorFreq,colorFreq,2,4,8,128,127,points.length)
			// if (speedRange < .000001) {
			// speedScale = widthMax/2;
			// }
			// else {
			//speedScale = (widthMax-widthMin)/speedRange;
			////speedScale = 1/speedRange;
			//}

			// Start the animation timer
			this.drawing = true;
			window.requestAnimationFrame(drawFrame.bind(this))

			// Execute this function every frame
			function drawFrame() {
				frameCount++;

				// if we're done drawing the points, stop and send a message that we're done.
				if (i >= points.length && this.drawing) {
					fps = frameCount / ((new Date() - startTime) / 1000);
					console.log("FPS = " + fps);
					this.stop();
					delete points;
					this.done();
					// console.log("Done!");
				}

				// otherwise, draw the set of points based on the current speed setting
				else {
					var speed = this.getSpeed();

					// get the color for this segment of points
					if (this.penColor == "gradient") {
						rgb = colors[i];
					}
					if (this.penColor == "black") {
						rgb = {
							r: 0,
							g: 0,
							b: 0
						};
					}

					// clear the arm canvas
					this.clear(this.gMoving);

					// draw the set of points for this interval
					for (j = 0; j < speed && i < points.length; j++) {

						// set the brush color and width based on the selected pen type
						switch (this.calligraphy) {
							case "angle":
								width = widthMin + Math.abs(Math.sin(points[i].point.angle) * widthMax);
								brush = "bevel";
								color = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",1.0)";
								break;
							case "pencil":
								width = 1;
								brush = "bevel";
								color = "rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")";
								break;
							case "flat":
								brush = "bevel";
								if (speedRange < .0000001) {
									width = (widthMax + widthMin) / 2;
								} else {
									width = widthMax - (widthMin + (widthMax - widthMin) * (points[i].speed - this.minSpeed) / speedRange) + widthMin;
								}
								color = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + width / widthMax + ")";
								break;
							case "round":
								brush = "round";
								if (speedRange < .0000000001) {
									width = (widthMax + widthMin) / 2;
								} else {
									width = (widthMax - (widthMin + (widthMax - widthMin) * (points[i].speed - this.minSpeed) / speedRange) + widthMin);
								}
								//color  = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + (1.0- (width/widthMax)) + ")";
								//color  = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + (1 - .75*(width/widthMax)) + ")";
								//color  = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + 1 + ")";
								color = "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ", 0.05)";
								break;
						}

						// do the canvas drawing for this frame
						this.gShape.beginPath();
						this.gShape.moveTo(lpoint.x, lpoint.y);
						lpoint = this.toLocal(points[i].point);
						this.gShape.lineTo(lpoint.x, lpoint.y);
						this.gShape.strokeStyle = color;
						this.gShape.lineWidth = width;
						this.gShape.lineJoin = brush;
						this.gShape.lineCap = "square";
						if (this.drawing) {
							this.gShape.stroke();
						}
						point = points[i];
						i++;
					}
					this.armSet.turnTo(point.t);
					this.armSet.draw("rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")", width);
					window.requestAnimationFrame(drawFrame.bind(this))
				}
			}
		}
	},

	toScaled: function (point) {
		var x = point.x;
		var y = point.y;
		var sx = ((x - this.xPad) / this.xScale) + this.xMin;
		var sy = ((this.canvasHeight - y - this.yPad) / this.yScale) + this.yMin;
		x = sx * Math.cos(-this.startAngle) - sy * Math.sin(-this.startAngle);
		y = sx * Math.sin(-this.startAngle) + sy * Math.cos(-this.startAngle);
		return ({
			x: x,
			y: y
		});
	},

	toLocal: function (point) {

		var x = point.x * Math.cos(this.startAngle) - point.y * Math.sin(this.startAngle);
		var y = point.x * Math.sin(this.startAngle) + point.y * Math.cos(this.startAngle);
		var lx = this.xPad + this.xScale * (x - this.xMin);
		var ly = (this.canvasHeight) - (this.yScale * (y - this.yMin)) - this.yPad;
		return ({
			x: lx,
			y: ly
		});
	},

	gcd: function (nums) {
		//// console.log("Calling gcd["+ nums.toString() +"]");
		if (nums.length < 2) {
			// console.log("Less than two numbers given");
			return (0);
		}
		if (nums.length == 2) {
			if (nums[1] < 0.0000000001) {
				return nums[0];
			} else {
				return this.gcd([nums[1], nums[0] % nums[1]]);
			}
		} else {
			return this.gcd([this.gcd(nums.slice(1)), nums[0]]);
		}
	},


	clear: function (g) {
		g.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
	},

	getColor: function (time, maxTime, colors) {
		var colorIndex = Math.floor(time / (maxTime / colors.length)) % colors.length;
		return ({
			r: colors[colorIndex].r,
			g: colors[colorIndex].g,
			b: colors[colorIndex].b
		});
	},


	makeColorGradient: function (frequency1, frequency2, frequency3, phase1, phase2, phase3, center, width, len) {
		var colors = [];
		if (len == undefined) len = 50;
		if (center == undefined) center = 128;
		if (width == undefined) width = 127;
		for (var i = 0; i < len; ++i) {
			var red = Math.floor(Math.sin(frequency1 * i + phase1) * width + center);
			var grn = Math.floor(Math.sin(frequency2 * i + phase2) * width + center);
			var blu = Math.floor(Math.sin(frequency3 * i + phase3) * width + center);
			colors[i] = {
				r: red,
				g: grn,
				b: blu
			};
		}
		return colors;
	},
};