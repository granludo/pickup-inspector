// Events
// init() once the page has finished loading.

var filter;
var filter2;
var gain;
var gain2;

var canvas;
var canvasContext;
var canvasWidth = 0;
var canvasHeight = 0;

var playheadColor = "rgb(80, 100, 80)";
var gridColor = "rgb(100,100,100)";
var textColor = "rgb(200,200,200)";

var dbScale = 50;
var range = 10;
var QUAL_MUL = 1;
var noctaves = 11;
var pixelsPerDb;
var width;
var height;
var vol1 = 0;
var vol2 = 0;
var maxvol = 200;

function dbToY(db) {
    var y = (0.5 * height) - pixelsPerDb * db;
    return y;
}

function drawCurve2() {
	var filterAux = context.createBiquadFilter();
	
	filterAux = filter2;
	canvas = document.getElementById('canvasID');
	canvasContext = canvas.getContext('2d');
	var curveColor = "rgb(27,106,224)";
	
    // draw center
    width = canvas.width;
    height = canvas.height;

    canvasContext.strokeStyle = curveColor;
    canvasContext.lineWidth = 3;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);

    pixelsPerDb = (0.5 * height) / dbScale;
    
    noctaves = 11;
    
    var frequencyHz = new Float32Array(width);
    var magResponse = new Float32Array(width);
    var phaseResponse = new Float32Array(width);
    var nyquist = 0.5 * context.sampleRate;
    // First get response.
    for (var i = 0; i < width; ++i) {
        var f = i / width;
        
        // Convert to log frequency scale (octaves).
        f = nyquist * Math.pow(2.0, noctaves * (f - 1.0));
        frequencyHz[i] = f;
    }

    filterAux.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
    
    for (var i = 0; i < width; ++i) {
        var f = magResponse[i];
        var response = magResponse[i];
        var dbResponse = 20.0 * Math.log(response) / Math.LN10;
		dbResponse *= 2; // simulate two chained Biquads (for 4-pole lowpass)
        
        var x = i;
        var y = dbToY(dbResponse+Math.log(vol2/20)*20);
        
        canvasContext.lineTo(x, y);
    }
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.lineWidth = 1;
    canvasContext.strokeStyle = gridColor;
}

function drawCurve(n) {
	var filterAux = context.createBiquadFilter();
	filterAux = filter;
	canvas = document.getElementById('canvasID');
	canvasContext = canvas.getContext('2d');
	var curveColor = "rgb(224,27,106)";

	
    // draw center
    width = canvas.width;
    height = canvas.height;

    canvasContext.clearRect(0, 0, width, height);

    canvasContext.fillStyle = "rgb(0, 0, 0)";
    canvasContext.fillRect(0, 0, width, height);

    canvasContext.strokeStyle = curveColor;
    canvasContext.lineWidth = 3;
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0);

    pixelsPerDb = (0.5 * height) / dbScale;
    
    noctaves = 11;
    
    var frequencyHz = new Float32Array(width);
    var magResponse = new Float32Array(width);
    var phaseResponse = new Float32Array(width);
    var nyquist = 0.5 * context.sampleRate;
    
	// First get response.
    for (var i = 0; i < width; ++i) {
        var f = i / width;
        
        // Convert to log frequency scale (octaves).
        f = nyquist * Math.pow(2.0, noctaves * (f - 1.0));
        frequencyHz[i] = f;
    }

    filterAux.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
    
    for (var i = 0; i < width; ++i) {
        var f = magResponse[i];
        var response = magResponse[i];
        var dbResponse = 20.0 * Math.log(response) / Math.LN10;
		dbResponse *= 2; // simulate two chained Biquads (for 4-pole lowpass)
        
        var x = i;
        var y = dbToY(dbResponse+Math.log(vol1/20)*20);
        canvasContext.lineTo(x, y);
    }

    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.lineWidth = 1;
    canvasContext.strokeStyle = gridColor;

	if (n == 2) drawCurve2();
    
    // Draw frequency scale.
    for (var octave = 0; octave <= noctaves; octave++) {
        var x = octave * width / noctaves;
        
        canvasContext.strokeStyle = gridColor;
        canvasContext.moveTo(x, 30);
        canvasContext.lineTo(x, height);
        canvasContext.stroke();

        var f = nyquist * Math.pow(2.0, octave - noctaves);
        canvasContext.textAlign = "center";
        canvasContext.strokeStyle = textColor;
        canvasContext.strokeText(f.toFixed(0) + "Hz", x, 10);
    }

    // Draw 0dB line.
    canvasContext.beginPath();
    canvasContext.moveTo(0, 0.5 * height);
    canvasContext.lineTo(width, 0.5 * height);
    canvasContext.stroke();
    
    // Draw decibel scale.
    for (var db = -dbScale; db < dbScale; db += range) {
        var y = dbToY(db);
        canvasContext.strokeStyle = textColor;
        canvasContext.strokeText(db.toFixed(2) + "dB", width - 40, y);

        canvasContext.strokeStyle = gridColor;
        canvasContext.beginPath();
        canvasContext.moveTo(0, y);
        canvasContext.lineTo(width, y);
        canvasContext.stroke();
    }
}


function initAudio() {
	if (typeof AudioContext !== "undefined") {
		context = new AudioContext();
	} else if (typeof webkitAudioContext !== "undefined") {
		context = new webkitAudioContext();
	} else {
		throw new Error('AudioContext not supported. :(');
	}
    filter = context.createBiquadFilter();
    var f = parseFloat($('#f').text())*1000;
	var q = parseFloat($('#q').text());
	filter.type = filter.LOWPASS;
    filter.Q.value = q;
    filter.frequency.value = f;
    filter.connect(context.destination);
}


function initAudio2() {
	filter2 = context.createBiquadFilter();
	f = parseFloat($('#f2').text())*1000;
	q = parseFloat($('#q2').text());
	filter2.type = filter2.LOWPASS;
    filter2.Q.value = q;
    filter2.frequency.value = f;
    filter2.connect(context.destination);
}

function playAudio(fileName, n){	
	var filterAux = context.createBiquadFilter();
	var fraction = 1;
	if (n == 1) {
		filterAux = filter;
		fraction = vol1/maxvol;

	} else if (n == 2) {
		filterAux = filter2;
		fraction = vol2/maxvol;
	} else alert("No filters!");


	var gainNode = context.createGain();	
	gainNode.gain.value = fraction;

	var audio = new Audio();
  	source = context.createMediaElementSource(audio);
  	source.connect(gainNode);
	gainNode.connect(filterAux);
  	filterAux.connect(context.destination);
	
  	audio.src = "/audio/" + fileName + ".wav";
	audio.play();

}

function initMeasureDetail(f, vol) {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	vol1 = vol;
	pageLang(f);
    initAudio();
    
    canvas = document.getElementById('canvasID');
    canvasContext = canvas.getContext('2d');
    
    canvasWidth = parseFloat(window.getComputedStyle(canvas, null).width);
    canvasHeight = parseFloat(window.getComputedStyle(canvas, null).height);
    drawCurve(1);
}

