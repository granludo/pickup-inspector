//CONSTANTS

var reader;
var file;
var MAX_SIZE = 750000;

//ERRORS
NO_ERROR = 0;
ERNO_ELEM_LINKED = 1;
ERNO_EMPTY_NAME = 2;
ERNO_NAME_TOO_LONG = 3;
ERNO_NAME_AN = 4;
ERNO_PARAM_NUM = 5;
ERNO_PARAM_NEG = 6;
ERNO_CIRCUIT_EXISTS = 7;
ERNO_IMG_NOT_LOADED = 8;
ERNO_IMG_EMPTY = 9;
ERNO_IMG_TOO_LARGE = 10;
ERNO_NOT_IMG = 11;
ERNO_NO_IMG_SELECTED = 12;
ERNO_IMG_EXISTS = 13;
ERNO_PICKUP_EXISTS = 14;
ERNO_POT_EXISTS = 15;
ERNO_CIRCUIT_NOT_EXISTS = 16;
ERNO_MEASURE_NOT_EXISTS = 17;
ERNO_PICKUP_NOT_EXISTS = 18;
ERNO_IMG_NOT_EXISTS = 19;
ERNO_POT_NOT_EXISTS = 20;

//FUNCTIONS

function manageError(status, erno) {
	var errorMessage = "";
	var no_error = false;
	var lang = getCookie("lang");
	$.get("/lang/errors.json", function(respons) {
		var values = respons[lang];
		switch(parseInt(erno)) {
			case NO_ERROR:
				no_error = true;
				$('#result').html("");
				break;
			case ERNO_ELEM_LINKED: 
				errorMessage = values["erno_elem_linked"];
				break;
			case ERNO_EMPTY_NAME:
				errorMessage = values["erno_empty_name"];
				break;
			case ERNO_NAME_TOO_LONG:
				errorMessage = values["erno_name_too_long"];
				break;
			case ERNO_NAME_AN:
				errorMessage = values["erno_name_an"];
				break;
			case ERNO_PARAM_NUM:
				errorMessage = values["erno_param_num"];
				break;
			case ERNO_PARAM_NEG:
				errorMessage = values["erno_param_neg"];
				break;
			case ERNO_CIRCUIT_EXISTS:
				errorMessage = values["erno_circuit_exists"];
				break;
			case ERNO_IMG_NOT_LOADED:
				errorMessage = values["erno_img_not_loaded"];
				break;
			case ERNO_IMG_EMPTY:
				errorMessage = values["erno_img_empty"];
				break;
			case ERNO_IMG_TOO_LARGE:
				errorMessage = values["erno_img_too_large"];
				errorMessage = errorMessage.replace("%", MAX_SIZE / 1000);
				break;
			case ERNO_NOT_IMG:
				errorMessage = values["erno_not_img"];
				break;
			case ERNO_NO_IMG_SELECTED:
				errorMessage = values["erno_no_img_selected"];
				break;
			case ERNO_IMG_EXISTS:
				errorMessage = values["erno_img_exists"];
				break;
			case ERNO_PICKUP_EXISTS:
				errorMessage = values["erno_pickup_exists"];
				break;
			case ERNO_POT_EXISTS:
				errorMessage = values["erno_pot_exists"];
				break;
			case ERNO_CIRCUIT_NOT_EXISTS:
				errorMessage = values["erno_circuit_not_exists"];
				break;
			case ERNO_MEASURE_NOT_EXISTS:
				errorMessage = values["erno_measure_not_exists"];
				break;
			case ERNO_PICKUP_NOT_EXISTS:
				errorMessage = values["erno_pickup_not_exists"];
				break;
			case ERNO_IMG_NOT_EXISTS:
				errorMessage = values["erno_img_not_exists"];
				break;
			case ERNO_POT_NOT_EXISTS:
				errorMessage = values["erno_pot_not_exists"];
				break;
			default:
				errorMessage = values["erno_default"];

		}
		if (!no_error) $('#result').html("<p> Error: " + errorMessage + "</p>");
	});
}

function isAlphaNumeric(x) {	
	var rexp = /^[0-9a-zA-Z_-]+$/;
	return rexp.test(x);
}

function imageCheck() {
	if ($('#fileImage').val() == "") {
		manageError(400, ERNO_NO_IMG_SELECTED);
		return false;
	}
	return true;
}

function removeMeasure(measureId) {
	var lang = getCookie("lang");
	$.get("/lang/errors.json", function(respons) {
		var values = respons[lang];
		var template1 = values["remove_measure_confirm"];
		if(confirm(template1 + measureId.toString() + "?")) {
			res = {'name':measureId};
			$.ajax({
			  type : "POST",
			  url : "/measure/delete/",
			  data : res,
			  success : function(s, textStatus, jqXHR) {	
				if( $('#m' + measureId).length > 0 ) {
					$('#m' + measureId).remove();
				} else {
					template1 = values["remove_measure_final"];
					template1 = template1.replace("%", measureId);
					var template2 = values["all_measures"];
					$('#measureBody').html("<div class=\"main\">" + template1 +
								   "</br><form action=\"/measure/list/\" method=\"get\">" +
									"<input type=\"submit\" value=\""+ template2 +" >>\"></input></form></div>");
				}
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
		  	})
		}
	});
}

function removeCircuit(circuitId) {
	var lang = getCookie("lang");
	$.get("/lang/errors.json", function(respons) {
		var values = respons[lang];
		var template1 = values["remove_circuit_confirm1"];
		var template2 = values["remove_circuit_confirm2"];
		if(confirm(template1 + circuitId + template2)) {
			res = {'name':circuitId};
			$.ajax({
			  type : "POST",
			  url : "/circuit/delete/",
			  data : res,
			  success : function(s, textStatus, jqXHR) {	
				if( $('#c' + circuitId).length > 0 ) {
					$('#c' + circuitId).remove();
				} else {
					template1 = values["remove_circuit_final"];
					template1 = template1.replace("%", circuitId);
					var template2 = values["all_circuits"];
					$('#circuitContent').html("<div class=\"main\">" + template1 +
								   "</br><form action=\"/circuit/list/\" method=\"get\">" +
									"<input type=\"submit\" value=\"" + template2 + " >>\"></input></form></div>");
				}
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
		  	})
		}
	});	
}

function printInForm(name, value) {
	if (value == null) {
		$('#'+name).html("");
		$('#'+name).attr('value', "");
		$('#'+name+'F').html("");
	} else if (value == "-") {
		$('#'+name).html("-");
		$('#'+name).attr('value', "-");
		$('#'+name+'F').html("");
	} else {
		var aux = showFactor(value);
		$('#'+name).html(aux.x);
		$('#'+name).attr('value', value);
		$('#'+name+'F').html(aux.s);
	}
}


function mathEnabled(enabled){
	if(enabled) $('#math').prop("disabled", false);
	else $('#math').prop("disabled", true);
}

function scaleSize(maxW, maxH, currW, currH){
	var ratio = currH / currW;
	if(currW >= maxW && ratio <= 1){
		currW = maxW;
		currH = currW * ratio;
	} else if(currH >= maxH){
		currH = maxH;
		currW = currH / ratio;
	}
	return [currW, currH];
}

function loadImageOption(link) {
	template1 = "<option value=\"" + link + "\">" + link + "</option>";
	$('#fileImage').append(template1);

}

function loadImageOptions(images, direction) {
	for (i = 0; i < images.length; ++i) {
		var template1 = "<option value=\"" + direction + images[i] + "\">" + images[i] + "</option>";
		$("#fileImage").append(template1);
	}
}

function handleImg(input, elem){
	if (input.id == 'fileImage') {
		id = $('#' + input.id).val();
		if (id != "") {
			var base_image = new Image();
			base_image.src = id;
			base_image.onload = function(){
				$('#preview').attr('src', base_image.src);
			};
		} else $('#preview').attr('src', id);
	}
}

function getImageValues() {
	var link_img = $('#fileImage').val();
	return link_img;
}

function getToneFromServer(name) {
	pname = {name : name};
		$.ajax({
			  type : "POST",
			  url : "/pot/load/",
			  data : pname,
			  success : function(s) {
				fillFormTone(s);
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
	})
}

function getPickupFromServer(name) {
	pname = {name : name};
		$.ajax({
			  type : "POST",
			  url : "/pickup/load/",
			  data : pname,
			  success : function(s) {
				fillFormPickup(s);
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
	})
}

function getVolumeFromServer(name) {
	pname = {name : name};
		$.ajax({
			  type : "POST",
			  url : "/pot/load/",
			  data : pname,
			  success : function(s) {
				fillFormVolume(s);
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
	})
}


function multFactor(x) {
	var factor = 0;
	while (x > 1) {
		x /= 10;
		factor++;
	}
	factor = parseInt(factor/3);
	switch(factor){
		case 0:
			return {s: "", ex: 0};
		case 1: 
			return {s: "k", ex: 1};
		case 2: 
			return {s: "M", ex: 2};
		case 3: 
			return {s: "G", ex: 3};
		default: 
			return null;
		
	}
}

function divFactor(x) {
	if (x == 0) return null;
	var factor = 0;
	while(x < 1) {
		x*=10;
		factor++;
	}
	factor = parseInt(factor/3);
	switch (factor) {
		case 0: 
			return {s: "", ex: 0};
		case 1:
			return {s: "m", ex: -1};
		case 2:
			return {s: "&mu;", ex: -2};
		case 3:
			return {s: "n", ex: -3};
		case 4: 
			return {s: "p", ex: -4};
		default:
			return null;
	}
}

function showFactor(x) {
	var factor;
	if (x > 1) factor = multFactor(x);
	else factor = divFactor(x);
	if (factor != null) { //si factor == null, no canviem res
		x = (x / Math.pow(10, 3*factor.ex)).toFixed(2);
		return {x: x, s: factor.s};
	} else return {x: x, s: ""};
	
}

function valueOnClass(key, value) {
	$("."+key).attr('value', value);
}

function textOnClass(key, value) {
	$("."+key).text(value);
}

function valueOnInput(key, value) {
	$('#'+key).attr('value', value);
}

function textOnInput(key, value) {
	$('#'+key).text(value);
}

