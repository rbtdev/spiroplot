//
//*****************************************************************************
//*	Copyright RBT Development (Afxano, Inc), 2011 - All Rights Reserved
//*
//*****************************************************************************
//

var Spirograph = {

    create: function (divName, height, width) {
        this.width = width;
        this.height = height;
        document.getElementById(divName).style.width = ""+this.width+"px";
        document.getElementById(divName).style.height = "" + this.height + "px";
        this.masterSpeed = 20;
        this.arm2Speed = -6;
        this.arm3Speed = 9.2;
        this.arm1Length = 1;
        this.arm2Length = .5;
        this.arm3Length = .25;
        this.penType = "round";
		this.penColor = "gradient";
		this.complexity = 1;
		this.spiro =  SpiroPlotter;
        this.spiro.create(this.width, this.height, this.spiroReady, this.dragging, this.spiroDone);
        this.initialize();
        this.spiroReady();
	},
	
	rendered: function () { 
		//this.$.versionInfo.setContent("VersionInfo: " + RBTDEV_VersionInfo.Revision);
	},
	
	selectPenType: function (penTypeList) {
	    console.log("Pen Type clicked");
	    this.penType = penTypeList.value;
		this.setCalligraphy(penTypeList.value);
	},
	
	selectPenColor: function (penColorList) {
		this.penColor = penColorList.value
		this.setPenColor(penColorList.value);
	},
	
	selectComplexity: function (complexity) {
		this.complexity = complexity;
		this.spiro.refresh();
	},

	dialChanging: function (object) {
		// console.log("dial Changed:" + value);
		var target;
		var restart = false;
		var value;
		switch (object.name) {
			case "masterSpeedDial": 
				this.setMasterSpeed(object.value);
				restart = false;
			break;
			case "angleDial": 
				this.setStartAngle(Math.round(object.value));
				restart = true;
			break;
			case "zoomDial": 
				this.setZoomLevel(object.value);
				restart = true;
			break;
			case "arm2SpeedDial":
				this.setArm2Speed(object.value);
				restart=true;
			break;
			case "arm3SpeedDial":
				this.setArm3Speed(object.value);
				restart=true;
			break;
			case "arm2LengthDial":
				this.setArm2Length(object.value);
				restart=true;
			break;
			case "arm3LengthDial":
				this.setArm3Length(object.value);
				restart=true;
			break;
			case "minPenWidthDial":
				this.setMinWidth(Math.round(object.value));
				restart=true;
			break;
			case "maxPenWidthDial":
				this.setMaxWidth(Math.round(object.value));
				restart=true;
			break;
		}
		if (restart) {
			this.spiro.refresh();
		}
	},
	
	setMasterSpeed: function (value) {
		this.masterSpeed = value;
		//this.$.masterSpeedLabel.setContent(value.toFixed(2));
		this.spiro.setSpeed(value);
		console.log("Master Speed = " + value);
	},
	

	setArm2Speed: function (value) {
		this.arm2Speed = value;
		this.spiro.setArmSpeed(1,value);
		//this.$.arm2SpeedLabel.setContent( value.toFixed(1));
	},
	
	
	setArm3Speed: function (value) {
		console.log("Arm3 Speed change");
		this.arm3Speed = value;
		this.spiro.setArmSpeed(2,value);
		//this.$.arm3SpeedLabel.setContent(value.toFixed(1));
	},
	
	setArm1Length: function (value) {
		this.spiro.setArmLength(0,value);
		this.arm1Length = value;
	},
	
	setArm2Length: function (value) {
		this.spiro.setArmLength(1,value);
		this.arm2Length = value;
	},
	
	setArm3Length: function (value) {
		this.spiro.setArmLength(2,value);
		this.arm3Length = value;
	},
	
	setMinWidth: function (value) {
		this.minWidth = value;
		//this.$.minWidthLabel.setContent(value.toFixed(2));
	},
	
	setMaxWidth: function (value) {
		this.maxWidth = value;
		//this.$.maxWidthLabel.setContent( value.toFixed(2));
	},
	
	setStartAngle: function(value) {
		this.startAngle = Math.PI*value/180;
		this.spiro.setStartAngle(this.startAngle);
		//this.$.startAngleLabel.setContent(value.toFixed(0));
	},
	
	setZoomLevel: function(value) {
		this.zoomLevel = value;
		this.spiro.setZoomLevel(this.zoomLevel);
		//this.$.zoomLevelLabel.setContent(value.toFixed(2));
	},
	setArm1StartAngle: function(value) {
		this.arm1StartAngle = value;
	},
	setArm2StartAngle: function(value) {
		this.arm2StartAngle = value;	
	},
	setArm3StartAngle: function(value) {
		this.arm3StartAngle = value;
	},
	
	stopSpiro: function () {
		this.spiro.stop();
	},
	
	spiroDone: function () {
	    window.external.Notify("done");
	},
	
	spiroReady: function () {
		this.initializeSpiro();
		console.log("Spiro Ready.");
	},

	dragging: function (drag) {
	
		switch (drag.arm) {
			case 0:
				this.arm1Length = drag.length;
				this.arm1StartAngle = drag.startAngle;
			break;
			case 1:
				this.arm2Length = drag.length;
				this.arm2StartAngle = drag.startAngle;
			break
			case 2:
				this.arm3Length = drag.length;
				this.arm3StartAngle = drag.startAngle;
			break
		}
	},

	setCalligraphy: function (value) {
		this.spiro.setCalligraphy(value);
		console.log("Calligraphy changed");
	},
	
	setPenColor: function (value) {
		this.spiro.setPenColor(value);
	},

	
	initializeSpiro: function () {	
		var armSpecs = [];
		var speed = this.masterSpeed;
		armSpecs[0] = {length: this.arm1Length, speed: 1, startAngle: this.arm1StartAngle};
		armSpecs[1] = {length: this.arm2Length, speed: this.arm2Speed, startAngle: this.arm2StartAngle};
		armSpecs[2] = {length: this.arm3Length, speed: this.arm3Speed, startAngle: this.arm3StartAngle};
		this.spiro.initialize(armSpecs,this.startAngle, this.maxWidth, this.minWidth, this.zoomLevel);
	},
	
	initialize: function () {
        
		this.setArm1Length(this.arm1Length);
		this.setArm2Length(this.arm2Length)
		this.setArm3Length(this.arm3Length);
		this.setArm2Speed (this.arm2Speed);
		this.setArm3Speed(this.arm3Speed);
		this.setMasterSpeed (this.masterSpeed);
		this.setMinWidth(2);
		this.setMaxWidth(10);
		this.setStartAngle(0);
		this.setZoomLevel(1);
		this.setArm1StartAngle(0);
		this.setArm2StartAngle(0);
		this.setArm3StartAngle(0);
		this.setCalligraphy(this.penType);
		this.setPenColor(this.penColor);
		//this.$.penTypeGroup.value = "pencil";
		//this.$.penTypeGroup.valueChanged();
	},

	start: function () {
	    //this.initializeSpiro();
	    this.spiro.stop();
	    this.resetSpiro();
		this.spiro.start();
	},
	
	resetSpiro: function () {
		this.initialize();
		this.clearSpiro();
	},
	
	hideArms: function () {
		var hidden = this.$.spiro.hideArms();
		if (hidden) {
			this.$.hideArmsButton.caption = "Show";
		}
		else {
			this.$.hideArmsButton.caption = "Hide";
		}
		//this.$.hideArmsButton.captionChanged();
	},
	
	clearSpiro: function () {
		this.spiro.clearShape();
		this.initializeSpiro();
	},

	saveImage: function () {
	    window.open(this.spiro.saveImage(),"Spirograph PNG");
	}
};