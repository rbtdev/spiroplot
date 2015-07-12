function LCD(container, name)
{
	var container = document.getElementById(container);
	var display = document.createElement('div');
	display.className = 'lcd';
	var background = document.createElement('div');
	background.className = 'lcd-background';
	var backgroundValue = document.createElement('div');
	backgroundValue.className = 'lcd-output';
	backgroundValue.innerHTML = '888.888';
	background.appendChild(backgroundValue);
	display.appendChild(background);
	var front = document.createElement('div');
	front.className = 'lcd-front';
	var frontValue = document.createElement('div');
	frontValue.className = 'lcd-output';
	front.appendChild(frontValue);
	display.appendChild(front);
	container.appendChild(display);

	this.value = frontValue;

	// lcd.innerHTML = 
	// "<div class = 'lcd'>" +
	// 	"<div class = 'lcd-background'>" +
	// 		"<div class = 'lcd-output'>888.888</div>" +
	// 	"</div>" +
	// 	"<div class = 'lcd-front'>" +
	// 		"<div id = '" + container +"Value" + "' class = 'lcd-output'></div>" +
	// 	"</div>" +
	// "</div>";
	
};
LCD.prototype.setValue = function (value) {
	this.value.innerHTML = value;
}