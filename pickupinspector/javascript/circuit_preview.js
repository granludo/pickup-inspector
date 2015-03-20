var canvas;
var context;
var canvasPickup;
var canvasTone;
var canvasVolume;
var where = "circuitPreview";
var circuitType;
var lineWidth = 4;

function drawCanvasS12() {
	circuitType = "serial_1_2";
	drawCanvas();
}

function drawCanvas() {
	//CLEAR CANVAS
	if (canvas == undefined) canvas = document.getElementById('circuitPreview');
	if (context == undefined) context = canvas.getContext('2d');
	canvas.width = canvas.width;
	context.clearRect(0,0,canvas.width,canvas.height);

	if(circuitType == "serial_1_2") {
		//REDRAW ACTUAL ELEMENTS
		if(canvasPickup != undefined && canvasPickup != "") printImageCanvas(canvasPickup, "pickup");
		if(canvasTone != undefined && canvasTone != "") printImageCanvas(canvasTone, "tone");
		if(canvasVolume != undefined && canvasVolume != "") printImageCanvas(canvasVolume, "volume");
	}
	
	//FADEIN EFFECT
	$('#' + where).hide();
	$('#' + where).fadeIn(500);
}

function fillFormTone(s) {
	if (s == null) {
		printInForm("Rt", null);
		printInForm("Ct", null);
		canvasTone = "";
	} else {
		var json = JSON.parse(s);
		printInForm("Rt", json["R"]);
		printInForm("Ct", json["Ct"]);
		canvasTone = json["link_img"];		
	}
	drawCanvas();
}

function fillFormVolume(s) {
	if(s == null) {
		printInForm("Rv", null);	
		canvasVolume = "";
	} else {
		var json = JSON.parse(s);
		printInForm("Rv", json["R"]);
		canvasVolume = json["link_img"];
	}
	drawCanvas();
}

function fillFormPickup(s) {
	if (s == null) {
		printInForm("Rp", null);
		printInForm("Lp", null);
		printInForm("Cp", null);
		printInForm("Rpp", null);
		printInForm("Vol", null);
		canvasPickup = "";
	} else { 
		var json = JSON.parse(s);
		if (json["measured"]) {
			printInForm("Rp", "-");
			printInForm("Lp", "-");
			printInForm("Cp", "-");
			printInForm("Rpp", "-");
			printInForm("Vol", "-");
		} else {
			printInForm("Rp", json["Rp"]);
			printInForm("Lp", json["Lp"]);
			printInForm("Cp", json["Cp"]);
			printInForm("Rpp", json["Rpp"]);
			printInForm("Vol", json["Vol"]);
		}
		canvasPickup = json["link_img"];
	}
	drawCanvas();
}


function printImageCanvas(id, elem) {	
	var type = "pot";
	if (elem == "pickup") type = "pickup";
	var res = {id: id};
	var base_image = new Image();
	base_image.src = id;
	base_image.onload = function(){
		var aux = 12;
		if (elem == "pickup") {
			var res = scaleSize(150, 150, base_image.width, base_image.height);
			var x = (canvas.width/2)-(res[0]*3/4);
			var y = 0;
			PickupExtrasCanvas(res[0], res[1], x, y);
		} else if (elem == "tone") {
			var res = scaleSize(100, 100, base_image.width, base_image.height);
			var x = (canvas.width*3/4)-(res[0]/2)-aux;
			var y = (canvas.height/3)-(res[1])+aux;
			ToneExtrasCanvas(res[0], res[1], x, y);
		} else if (elem == "volume") {
			var res = scaleSize(100, 100, base_image.width, base_image.height);
			var x = (canvas.width*3/4)-(res[0]/2)-aux;
			var y = (canvas.height*3/4)-(res[1])+aux;
			VolumeExtrasCanvas(res[0], res[1], x, y);
		}
		context.drawImage(base_image, x, y, res[0], res[1]);
	}
}


function VolumeExtrasCanvas(width, height, x, y) {
	var margin_bottom = 30;

	//DRAW LINE TO MAIN LINE
	context.beginPath();
	context.strokeStyle = "#00ff00";
	context.lineWidth = lineWidth;
	context.moveTo(canvas.width*3/4-width/2, canvas.height*3/4);
	context.lineTo(canvas.width/2-context.lineWidth/2, canvas.height*3/4);
	context.stroke();


	//DRAW GROUND
	var base_image2 = new Image();
	base_image2.src = "/images/canvas/ground_0.png";
	base_image2.onload = function(){
					var aux = 10;
					var res = scaleSize(50, 50, base_image2.width, base_image2.height);
    				context.drawImage(base_image2, x+width+aux, y+height, res[0], res[1]);
					//DRAW LINES TO GROUND
					context.beginPath();
					context.strokeStyle = "#000000";
					context.moveTo(x+width, y+height/2);
					context.lineTo(x+width+res[0]/2+aux, y+height/2);
					context.lineTo(x+width+res[0]/2+aux, y+height);
					context.moveTo(x+width-aux, y+height-aux);				
					context.lineTo(x+width+res[0]/2+aux, y+height-aux);
					context.stroke();	
  	};
	

	//DRAW LINES TO INPUT
	context.beginPath();
	context.strokeStyle = "#0000ff";
	context.moveTo(x+width/2, x+height/2);
	context.lineTo(x+width/2, canvas.height-margin_bottom);
	context.lineTo(canvas.width/2, canvas.height-margin_bottom);
	context.stroke();
	


}


function ToneExtrasCanvas(width, height, x, y) {
	var aux = 6;
	//DRAW LINE TO PICKUP
	context.beginPath();
	context.lineWidth = lineWidth;
	context.strokeStyle = "#dd0000";
	context.moveTo(x+aux, canvas.height/3);
	context.lineTo(canvas.width/2, canvas.height/3);
	context.stroke();

	//DRAW LINES TO VOLUME
	context.beginPath();
	context.strokeStyle = "#00ff00";
	context.moveTo(x+aux, canvas.height/3+context.lineWidth);
	context.lineTo(canvas.width/2, canvas.height/3+context.lineWidth);
	context.lineTo(canvas.width/2, canvas.height*3/4);
	context.stroke();
	
	//DRAW CAPACITOR
	var base_image = new Image();
	base_image.src = "/images/canvas/capacitor_0.png";
	base_image.onload = function(){
					var aux = 5;
					var res = scaleSize(50, 50, base_image.width, base_image.height);
    				context.drawImage(base_image, x+width-res[0]/2, y+height-aux, res[0], res[1]);
					//DRAW CAPACITOR LINES
					context.beginPath();
					context.strokeStyle = "#000000";
					context.moveTo(x+width+res[0]/2-aux, y+height-aux);
					context.lineTo(x+width+res[0]/2-aux, y+height/2+aux);
					context.lineTo(x+width-res[0]/2, y+height/2+aux);	
					context.stroke();

  	};

	

	//DRAW GROUND
	var base_image2 = new Image();
	base_image2.src = "/images/canvas/ground_2.png";
	base_image2.onload = function(){
					var aux = 20;
					var res = scaleSize(50, 50, base_image2.width, base_image2.height);
    				context.drawImage(base_image2, x+width+res[0]/2, y+height/2-aux, res[0], res[1]);
					//DRAW GROUND LINES
					context.beginPath();
					context.strokeStyle = "#000000";
					context.moveTo(x+width+res[0]/2, y+height/2-aux+res[1]/2);
					context.lineTo(x+width-res[0]/2, y+height/2-aux+res[1]/2);
					context.stroke();
					
  	};	
}

function PickupExtrasCanvas(width, height, x, y) {
	var first_q = width / 4;
	var third_q = first_q*3;
	var margin_bottom = 5;

	//DRAW LINE TO INPUT
	context.beginPath();
	context.lineWidth = lineWidth;
	context.strokeStyle = "#dd0000";
	context.moveTo(canvas.width/2, height);
	context.lineTo(canvas.width/2, canvas.height/3);
	context.stroke();
	
	
	//DRAW PICKUP GROUND
	var base_image = new Image();
	base_image.src = "/images/canvas/ground_0.png";
	base_image.onload = function(){
					var res = scaleSize(50, 50, base_image.width, base_image.height);
    				context.drawImage(base_image, first_q+x-(res[0]/2), height, res[0], res[1]);
  	};	
	
	//DRAW INPUT
	var base_image2 = new Image();
	base_image2.src = "/images/canvas/input_1.png";
	base_image2.onload = function(){
		var res = scaleSize(70, 70, base_image2.width, base_image2.height);
		context.drawImage(base_image2, canvas.width/2-res[0]*3/4, canvas.height-res[1], res[0], res[1]);
		//DRAW INPUT GROUND
		var input_w = res[0];
		var input_h = res[1];
		var base_image3 = new Image();
		base_image3.src = "/images/canvas/ground_1.png";
		base_image3.onload = function(){
			var res = scaleSize(50, 50, base_image3.width, base_image3.height);
			context.drawImage(base_image3, canvas.width/2-(input_w*3/4)-res[0], 
										   canvas.height-input_h-res[1], res[0], res[1]);
			//DRAW LINES TO INPUT
			context.beginPath();
			context.strokeStyle = "#000000";
			context.moveTo(canvas.width/2-(input_w*3/4)-res[0]/2, canvas.height-input_h-res[1]/2);
			context.lineTo(canvas.width/2-(input_w*3/4)+res[0], canvas.height-input_h-res[1]/2);
			context.lineTo(canvas.width/2-(input_w*3/4)+res[0], canvas.height-input_h);
			context.stroke();
	  	};
  	};

	
	
}

function loadPickupOptions() {
	for (i = 0; i < pickup_names.length; ++i) {
		var p = pickup_names[i];
		var template1 = "<tr id=\"p" + p.name + "\"><td>" + p.name + "</td>";
		var template2;
		if (p.measured) template2 = "<td> - </td><td> - </td><td> - </td><td> Yes </td>"
		else {
			auxRp = showFactor(p.Rp);
			auxLp = showFactor(p.Lp);
			auxCp = showFactor(p.Cp);
			template2 = "<td>" + auxRp.x + " " + auxRp.s + "&#937;</td>" + 
						"<td>" + auxLp.x + " " + auxLp.s + "H</td>" + 
						"<td>" + auxCp.x + " " + auxCp.s + "F</td><td> No </td>";
		}
		var template3 = "<td><button onclick=\"removePickup('" + p.name + "')\">remove</button></td>";
		var template4 = "</tr>";
		if (p.link_img) template4 = "<td><button onclick=\"showImage('" + p.link_img + "', 'pickup')\">view image</button></td></tr>";
		$('#pickup_table').append(template1 + template2 + template3 + template4);
	}
}

function loadElementOptions(list, name) {
	for(i = 0; i < list.length; ++i) {
		var template1 = "<option>" + list[i] + "</option>";
		$('#option' + camelWord(name)).append(template1);
	}
}

function camelWord(s) {
	return s[0].toUpperCase() + s.substring(1);
}

function loadSelector(elem) {
	var elem1 = camelWord(elem);
	var name = "";
	if (elem == "pickup") name = "pickup";
	else if (elem == "tone") name = "tone potentiometer";
	else if (elem == "volume") name = "volume potentiometer";
	var template1 = "<b><span id=\"choose_" + elem + "\" >Choose a " + name + "</span>: </b><select id=\"option" + 
					elem1 + "\" onChange=\"load" + elem1 + "()\"><option> ... </option></select>";
	$('#params' + elem1).html(template1);
}

function loadCableOption(){
	var template1 = "<span id=\"Cc_name\">Cable capacitance</span>: <input type=\"text\" id=\"Cc\" value=\"0\"></input>" +
					"<select id= \"CcScale\">" + 
						 "<option value=0.000000000001> pF</option>" +
	  					 "<option value=0.000000001> nF</option>" + 
						 "<option value=0.000001> &mu;F</option>" +
						 "</select>";
	$('#paramsCable').html(template1);
}

function loadCableName() {
	var template1 = "<span id=\"Cc_name\">Cable capacitance</span>: <span id=\"Cc\"></span> <span id=\"CcF\"></span>F";
	$('#paramsCable').html(template1);

}

function loadSlidersOption(type) {
	if (type == "serial_1_2") {
		var template1 = "<div><b><span id=\"pos_pot_title\">Potentiometers position</span></b></div>";
		var template2 = "<div>V: <input oninput=\"changePotPos('x')\" id=\"x\" " + 
						"type=\"range\" min=1 max=10 value=\"5\"/><span id=\"spanx\">5</span></div>";
		var template3 =	"<div>T: <input oninput=\"changePotPos('y')\" id=\"y\" " + 
						"type=\"range\" min=0 max=10 value=\"5\" /><span id=\"spany\">5</span></div></br>";
		$('#circuitTemplate').append(template1+template2+template3);
	}

}

function loadNames(elem) {
	if (elem == "pickup") name = "Pickup";
	else if (elem == "tone") name = "Tone Potentiometer";
	else if (elem == "volume") name = "Volume Potentiometer";

	var template1 = "<div><b><span id=\"title_" + elem +"\">" + name + "</span></b></div>";
	var template2 = "<div><span class=\"name\">Name</span>: <span id=\"" + elem + "Name\"></span></div>";
	$('#params' + camelWord(elem)).html(template1+template2);
}


