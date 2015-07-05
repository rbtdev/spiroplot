

function RotaryDial(title,parent,name, min,max, step, size, onChanging, onChanged)
{
    var _this = this;
    this.dialImage = new Image();
    this.dialImage.onload = function () {
        _this.create(title, parent, name, min, max, step, size, onChanging, onChanged);
    }
    this.dialImage.src = "./images/knob.png";
};

RotaryDial.prototype.create = function(title,parent,name,min, max, step,size,onChanging, onChanged) {
		this.title = title;
		this.name = name;
		this.minimum = min;
		this.maximum = max;
		this.size = size;
        this.digits = step;
        this.rotation = 0;
		this.parentDiv = document.getElementById(parent);
		this.doChanging = onChanging;
		this.doChanged = onChanged;
        
		this.initialized = false;
		this.initCanvas();
	};
	
RotaryDial.prototype.initCanvas = function () {
		// console.log("Initializing canvas...");
		this.canvasShape = document.createElement("CANVAS");
		this.canvasShape.setAttribute("class","dialShape");
		this.canvasBack = document.createElement("CANVAS");
		this.canvasBack.setAttribute("class","dialBack");
		this.canvasMoving = document.createElement("CANVAS");
		this.canvasMoving.setAttribute("class","dialMoving");
		this.canvasMoving.addEventListener('mousedown',this.canvasMouseDown.bind(this) , false);
		this.canvasMoving.addEventListener('touchstart',this.canvasTouch.bind(this) , false);
		this.canvasMoving.addEventListener('mousemove',this.canvasMouseDrag.bind(this), false);
		this.canvasMoving.addEventListener('touchmove',this.canvasTouchDrag.bind(this), false);
		this.canvasMoving.addEventListener('click',this.canvasClick.bind(this) , false);

		this.canvasFrame = document.createElement("CANVAS");
		this.canvasFrame.setAttribute("class","dialFrame");
	
		this.parentDiv.appendChild(this.canvasShape);
		this.parentDiv.appendChild(this.canvasBack);
		this.parentDiv.appendChild(this.canvasMoving);
		this.parentDiv.appendChild(this.canvasFrame);
			
		if (!this.canvasShape || !this.canvasBack || !this.canvasMoving) {
			setTimeout(this.initCanvas.bind(this), 100);
		}
		else {
			if (this.size == undefined) this.size = 100;
			if (this.minimum == undefined) this.minimum = 0;
			if (this.maximum == undefined) this.maximum = 1;
			if (this.maxPosition == undefined) this.maxPosition = Math.PI*1.75;
			else this.maxPosition = ((this.maxPosition*Math.PI)/180)%(Math.PI*2);
			if (this.minPosition == undefined) this.minPosition = Math.PI*1.25;
			else this.minPosition = ((this.minPosition*Math.PI)/180)%(Math.PI*2);
			if (this.position == undefined) {this.position = this.minPosition}
			this.position = (this.position*Math.PI)/180;
			this.dialRange = (this.minPosition - this.maxPosition + (Math.PI*2))%(Math.PI*2);
			if (this.dialRange == 0) {
				this.dialRange = Math.PI*2;
			}
			this.value = this.dialValue(this.position);
			// console.log("Initial Value: ", this.value);
			this.width = this.size;
			this.height = this.size;
			this.canvasFrame.width = this.width;
			this.canvasFrame.height = this.height;
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
			//this.canvasBack.show();
			//this.canvasShape.show();
			//this.canvasMoving.show();	
			this.initialized = true;
			this.setBounds(-100, 100, -100, 100, 1);
			this.rotationStop = false;
			this.grabPoint = this.circlePoint(this.position);
            this.grabRadius = (100);

			this.drawDial({x:0, y:0});
		}
	};

RotaryDial.prototype.setStep = function (step) {
    this.digits = step;
};

RotaryDial.prototype.drawDial = function (center) {

    var lcenter = this.toLocal(center);
    var context = this.gMoving;
    var x = lcenter.x;
    var y = lcenter.y;
    var width = this.size;
    var height = this.size;
    var rotation = -this.rotation+(Math.PI/2);

    context.translate(x, y);
    context.rotate(rotation);
    context.drawImage(this.dialImage, -width / 2, -height / 2, width, height);
    context.rotate(-rotation);
    context.translate(-x, -y);
};
	
	
RotaryDial.prototype.canvasClick = function (oevent) {	
    // console.log ("Canvas Clicked at (" + event.offsetX + "," + event.offsetY + ")");
    this.dialGrabbed = false;
    this.drawDial({x:0, y:0});
    if (this.doChanged != null) this.doChanged(this);
};
	
RotaryDial.prototype.canvasTouch = function (event) {
	this.mouseMove(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
	event.preventDefault();
};
RotaryDial.prototype.canvasMouseDown = function (event) {
	this.mouseMove(event.pageX, event.pageY);
};

RotaryDial.prototype.mouseMove= function(x,y) {
	var offsetX = x -this.canvasMoving.offsetLeft;
	var offsetY = y -this.canvasMoving.offsetTop;
    this.mouseDown = {x: offsetX, y: offsetY};
    // console.log ("Canvas Mouse Down at (" + this.mouseDown.x+ "," + this.mouseDown.y + ")");
    if (this.grabDial(this.mouseDown)) {
        // console.log("Grabbing dial...");
        this.grabPoint = this.moveGrabPoint(this.mouseDown);
        this.drawDial({x:0, y:0});
    }
};

RotaryDial.prototype.canvasTouchDrag = function (event) {
    if (this.dialGrabbed) {
		var dx = this.mouseDown.x - event.changedTouches[0].pageX+this.canvasMoving.offsetLeft;
		var dy = this.mouseDown.y - event.changedTouches[0].pageY+this.canvasMoving.offsetTop;
        this.moveDial(-dx,-dy);
        this.drawDial({x:0, y:0});
    }
	event.preventDefault();
};

RotaryDial.prototype.canvasMouseDrag = function (event) {
    if (this.dialGrabbed) {
		var dx = this.mouseDown.x - event.pageX+this.canvasMoving.offsetLeft;
		var dy = this.mouseDown.y - event.pageY+this.canvasMoving.offsetTop;
        this.moveDial(-dx,-dy);
        this.drawDial({x:0, y:0});
    }
};


	
RotaryDial.prototype.moveGrabPoint = function (mousePoint) {
    this.rotation  = this.findAngle(this.toLocal({x:0,y:0}),mousePoint);
    var newGrabPoint = this.circlePoint(this.rotation);
    var movement = this.getMovement(this.grabPoint, newGrabPoint);
    var normalized = (this.minPosition - this.rotation + (Math.PI*2))%(Math.PI*2);
    if (normalized > this.dialRange) { // invalid range
        if (movement.direction == 1) {
            this.rotation = this.maxPosition;
        }
        else  { // counterclockwise
            this.rotation = this.minPosition;
        }
        newGrabPoint = this.circlePoint(this.rotation);
    }
    newGrabPoint.value = this.dialValue(this.rotation);
    return newGrabPoint;
};
	
RotaryDial.prototype.circlePoint = function (rotation) {
    return({x:75*Math.cos(rotation), y: 75*Math.sin(rotation), rotation: rotation});
}; 
	
RotaryDial.prototype.moveDial = function (dx, dy) {
    var currentPoint = {x:this.mouseDown.x+dx, y: this.mouseDown.y+dy};
    if (this.grabDial(currentPoint)) {
        // console.log("Moving grab point");
        this.grabPoint = this.moveGrabPoint(currentPoint);
        if (this.value != this.grabPoint.value) {
            this.value = this.grabPoint.value;
            if (this.doChanging != null) {
                this.doChanging(this);
            } 
        }
    }
};
	
RotaryDial.prototype.getMovement = function (p1,p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    //// console.log ("dx,dy = " + dx + "," + dy);
    var direction = 0;
    var quadrant = 0
    if (p2.x >= 0 && p2.y >=0) { // QUAD 1
        quadrant = 1;
        if (dx > 0) direction = 1;
        else direction = -1;
    }
    else if (p2.x <0 && p2.y >=0) { // Quad 2
        quadrant = 2;
        if (dx >= 0) direction =1;
        else direction = -1;
    }
    else if (p2.x < 0 && p2.y < 0) { //Quad 3
        quadrant = 3;
        if (dx >= 0) direction = -1;
        else direction = 1;
    }
    else if (p2.x >=0 && p2.y<0) { //Quad 4
        quadrant = 4;
        if (dx >= 0) direction = -1;
        else direction = 1;
    }
    return {direction:direction, quadrant: quadrant}
};
	
RotaryDial.prototype.grabDial = function (point) {
    var mousePoint = this.toScaled(point);
    if (this.dialGrabbed) {
        if (this.distance(mousePoint, this.grabPoint) > 100) {
            this.dialGrabbed = false;
        }
    }
    else {
        if (this.distance(mousePoint, this.grabPoint) < this.grabRadius*3) {
            this.dialGrabbed = true;
            // console.log ("Dial Grabbed...");
        }
    }
    return (this.dialGrabbed);
};

RotaryDial.prototype.dialValue = function (rotation) {
		
    var valueRange = this.maximum-this.minimum;
    var normalized = (this.minPosition - rotation+(Math.PI*2))%(Math.PI*2);
    // console.log("Value Range: " + valueRange);
    var scaled = (normalized/this.dialRange)*valueRange + this.minimum
    if (this.digits !== null) {
        console.log("step = " + this.digits)
        scaled = parseFloat(scaled.toFixed(this.digits));
    }
    return scaled;
};
	
RotaryDial.prototype.setBounds =  function (xMin, xMax, yMin, yMax, zoomLevel) {
    // console.log("SetBounds: zoomLevel = " + zoomLevel);
    this.xMin = xMin*zoomLevel;
    this.xMax = xMax*zoomLevel;
    this.yMin = yMin*zoomLevel;
    this.yMax = yMax*zoomLevel;
    this.xPad = 5;
    this.yPad = 5;
    this.scaleWidth = Math.abs(this.xMax - this.xMin);
    this.scaleHeight = Math.abs(this.yMax - this.yMin);
    this.xScale = (this.canvasWidth-(this.xPad*2))/this.scaleWidth;
    this.yScale = (this.canvasHeight-(this.yPad*2))/this.scaleHeight;	
    this.scale = Math.min(this.xScale, this.yScale);
    this.xStep = 1/this.xScale;
    this.yStep = 1/this.yScale;
    this.step = 1/this.scale;
};

RotaryDial.prototype.toScaled = function (point) {
    var x = point.x;
    var y = point.y;
    var angle = 0;
    var sx = ((x-this.xPad)/this.xScale) + this.xMin;
    var sy = ((this.canvasHeight-y-this.yPad)/this.yScale) + this.yMin;
    x = sx*Math.cos(-(angle))-sy*Math.sin(-(angle));
    y = sx*Math.sin(-(angle))+sy*Math.cos(-(angle));
    return ({x:x, y:y});
};
	
RotaryDial.prototype.toLocal = function (point) {
    var angle = 0;
    var x = point.x*Math.cos(angle)-point.y*Math.sin(angle);
    var y = point.x*Math.sin(angle)+point.y*Math.cos(angle);
    var lx = this.xPad + this.xScale*(x-this.xMin);
    var ly =  (this.canvasHeight) - (this.yScale*(y-this.yMin)) - this.yPad;
    return ({x:lx, y:ly});
};
	
RotaryDial.prototype.distance = function (p1, p2) {
    return Math.pow(Math.pow((p1.x-p2.x),2) + Math.pow((p1.y - p2.y),2),.5);
};
	
RotaryDial.prototype.findAngle = function (p1,p2, rotation) {
    if (!rotation) rotation = 0;
    var dy = -(p2.y - p1.y);
    var dx = p2.x - p1.x;
    var angle;
    var length = this.distance(p1,p2);
    if (length < .0000000001) {
        angle = 0;
    }
    else {
        angle = Math.asin(dy/length)
        if (dx< 0 ) angle = Math.PI - angle;
    }		
    //// console.log("findAngle: " + angle);
    angle = ((Math.PI*2) + angle - rotation) % (Math.PI*2);
    //// console.log("findAngle: " + angle);
    return (angle)
};

	