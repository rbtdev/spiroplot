function ArmSet(armSpecs, pivot, angle, canvas, toScale) {
		this.arms = [];
		this.pivot = pivot;
		this.g = canvas;
		this.toScale = toScale;
		var joint = pivot;
		for (var i = 0; i<armSpecs.length; i++) {
			this.arms[i] = new Arm(joint, armSpecs[i], angle);
			joint = this.arms[i].endPoint;
		}
};

ArmSet.prototype.turnTo = function (angle) {
		var startPoint = this.pivot;
		for (var i = 0; i<this.arms.length; i++) {
			this.arms[i].startPoint = startPoint;
			this.arms[i].turnTo(angle);
			startPoint = this.arms[i].endPoint;
		}
};



ArmSet.prototype.drawPivot = function () {

		
		var pivot = this.toScale(this.pivot);
		// center pivot
		this.g.lineWidth = 1;
		this.g.strokeStyle = "black";
		this.g.beginPath();
		this.g.arc(pivot.x, pivot.y, 8, Math.PI*2, false);
		this.g.fillStyle = "#888888";
		this.g.fill();
		this.g.stroke();
		this.g.closePath();
		
		this.g.lineWidth = 1;
		this.g.strokeStyle = "black";
		this.g.beginPath();
		this.g.arc(pivot.x, pivot.y, 6, Math.PI*2, false);
		this.g.fillStyle = "black";
		this.g.fill();
		this.g.stroke();
		this.g.closePath();
		
		this.g.lineWidth = 1;
		this.g.strokeStyle = "black";
		this.g.beginPath();
		this.g.arc(pivot.x, pivot.y, 4, Math.PI*2, false);
		this.g.fillStyle = "#aaaaaa";
		this.g.fill();
		this.g.stroke();
		this.g.closePath();
	
	},

ArmSet.prototype.draw = function (color, width) {

			var armWidth = 0;
			var jointWidth = 0;
			var startPoint;
			var endPoint;
			
			// Draw Arms
			for (var i = this.arms.length-1; i>=0; i--) {
				//if (!this.arms[i].retracted) {
					armWidth = 3*(this.arms.length-i);
					startPoint = this.toScale(this.arms[i].startPoint);
					endPoint = this.toScale(this.arms[i].endPoint);
					this.g.beginPath();
					this.g.moveTo(startPoint.x, startPoint.y);
					this.g.lineWidth = armWidth;
					this.g.lineTo(endPoint.x, endPoint.y);
					this.g.strokeStyle = "gray";
					this.g.stroke();	
					//if (i<this.arms.length-1)
					//{
						this.g.lineWidth = this.arms.length-i;
						this.g.moveTo(startPoint.x, startPoint.y);
						this.g.lineTo(endPoint.x, endPoint.y);
						this.g.strokeStyle = "black";
						this.g.stroke();	
					//}
					
					this.g.closePath();		
				//}
				if (i!=this.arms.length-1) {
					jointWidth= .5 * (this.arms.length - i) + 4;
					endPoint = this.toScale(this.arms[i].endPoint);
					this.g.lineWidth = 2;
					this.g.strokeStyle = "#555555";
					this.g.fillStyle = "silver";
					this.g.beginPath();
					this.g.arc(endPoint.x, endPoint.y, jointWidth, Math.PI*2, false);
					this.g.fill();
					this.g.stroke();
					this.g.closePath();
					
					this.g.lineWidth = 1;
					this.g.strokeStyle = "black";
					this.g.beginPath();
					this.g.arc(endPoint.x, endPoint.y, jointWidth-3, Math.PI*2, false);
					this.g.stroke();
					this.g.closePath();
				}
				else {
				// pen head
					var point = this.toScale(this.arms[this.arms.length-1].endPoint);
					this.g.lineWidth = 2;
					this.g.strokeStyle = "black";
					this.g.fillStyle = color;
					this.g.beginPath();
					this.g.arc(point.x, point.y, 6, Math.PI*2, false);
					this.g.fill(); 
					this.g.stroke();
					this.g.closePath();
				}
			}
			this.drawPivot();			
			
};

ArmSet.prototype.maxLength = function () {
		var length = 0;
		for (var i = 0; i<this.arms.length; i++) {
			length+= this.arms[i].length;
		}
		return length;
};

ArmSet.prototype.grabArm = function (clickPoint) {
	var grabbed = false;
	var arm = -1;
	for (var i = this.arms.length-1; i>=0 && !grabbed; i--) {
		if (!this.arms[i].retracted && this.distance(clickPoint, this.toScale(this.arms[i].endPoint)) < 30) {
			console.log("Arm " + i + " grabbed.");
			grabbed = true;
			arm = i;
		}
	}
	return arm;
};

ArmSet.prototype.retractArm = function (clickPoint) {
	var clicked = false;
	var arm = -1;
	var gragObj = {arm:-1};
	for (var i = 0; i < this.arms.length && !clicked; i++) {
			if (this.distance(clickPoint, this.toScale(this.arms[i].startPoint)) < 10) {
				console.log("Arm " + i + " clicked.");
				if (this.arms[i].retracted) {
					console.log("Expanding Arm...");
					this.arms[i].retracted = false;
					this.arms[i].length = this.arms[i].saveLength;
					this.arms[i].turnTo(this.arms[i].startAngle);
				}
				else {
					console.log("Retracting Arm...");
					this.arms[i].retracted = true;
					this.arms[i].saveLength = this.arms[i].length;
					this.arms[i].length = 0;
					this.arms[i].turnTo(this.arms[i].startAngle);
				}
				for (var j=i+1; j < this.arms.length; j++) {
					console.log("adjusting arm: " + i);
					this.arms[j].startPoint = this.arms[i].endPoint;
					this.arms[j].turnTo(this.arms[j].startAngle);
				}
				clicked = true;
				dragObj = {startAngle:this.arms[i].startAngle, length: this.arms[i].length, arm:i};
			}
	}
	return(dragObj);
};

ArmSet.prototype.dragArm = function (arm, currentMousePos) {
		
	var dragInfo = {};
	dragInfo.arm = arm;
	var dy = currentMousePos.y -this.arms[arm].endPoint.y;
	var dx = currentMousePos.x -this.arms[arm].endPoint.x;
	this.arms[arm].endPoint = currentMousePos;
	this.arms[arm].length = this.distance(this.arms[arm].startPoint, this.arms[arm].endPoint);
	this.arms[arm].startAngle = this.findAngle(this.arms[arm].endPoint,this.arms[arm].startPoint);
	dragInfo.startAngle = this.arms[arm].startAngle;
	dragInfo.length = this.arms[arm].length;
	for (var i=arm+1; i <= this.arms.length-1; i++) {
		console.log("adjusting arm: " + i);
		this.arms[i].startPoint = this.arms[i-1].endPoint;
		this.arms[i].endPoint.x += dx;
		this.arms[i].endPoint.y += dy;
	}
	console.log("Dragging arm " + dragInfo.arm + " - new length = " + dragInfo.length + " - new angle = " + dragInfo.startAngle);
	return (dragInfo);
};

ArmSet.prototype.findAngle = function (p1,p2) {
	var dy = p1.y - p2.y;
	var dx = p1.x - p2.x;
	return this.findAngleByDelta(dx,dy);
};

ArmSet.prototype.findAngleByDelta = function(dx,dy) {
	var angle;
	var length = Math.pow(Math.pow(dx, 2)+Math.pow(dy,2),.5);
	if (length == 0) {
		angle = 0;
	}
	else {
		angle = Math.asin(dy/length);
		if (dx< 0) angle = Math.PI - angle;
	}		
	return angle;
};

ArmSet.prototype.distance = function (point1, point2) {
	return Math.pow(Math.pow(point1.x-point2.x, 2)+Math.pow(point1.y-point2.y,2),.5);
};

ArmSet.prototype.penAngle = function (t) {
	return this.arms[this.arms.length-1].startAngle + (this.arms[this.arms.length-1].speed*t);
};
	
function Arm(startPoint, specs, angle) {
	this.length = specs.length;
	this.speed = specs.speed;
	this.startAngle = specs.startAngle;
	this.startPoint = startPoint;
	this.retracted = false;
	this.angle = this.startAngle;
	this.turnTo(this.angle);
};
		
Arm.prototype.turnTo = function (angle) {
	this.angle = this.startAngle+(angle*this.speed)
	this.endPoint = {
			x:this.startPoint.x + this.length*Math.cos(this.angle),
			y:this.startPoint.y + this.length*Math.sin(this.angle)
		}
	return (this.endPoint);
};