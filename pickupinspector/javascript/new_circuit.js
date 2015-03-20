function loadPage() {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	pageLang();
}

function pageLang() {
	var lang = getCookie("lang");
	$.get("/lang/new_circuit.json", function(respons) {
		values = respons[lang];
		for (key in values) textOnInput(key, values[key]);
		$(document).prop('title', values["title"]);
	});
}

function loadCircuitTemplate() {
	var type = $('#optionCircuit').val();
	if (type == "serial_1_2") {
			circuitType = type;
			$('#circuitBody').css('visibility', 'visible');
			$('#circuitTemplate').load("/html/serial_1_2.html", function() {
				var lang = getCookie("lang");
				$.get("/lang/serial_1_2.json", function(respons) {
					var values = respons[lang];
					for (key in values) textOnInput(key, values[key]);
					loadOptions(type, values);
					loadCableOption();
					textOnInput("Cc_name", values["Cc_name"]);
				});		
			});		
	}
	else $('#circuitBody').css('visibility', 'hidden');
}

function loadOptions(type, values) {
	if (type == "serial_1_2") {
		$.ajax({
			  type : "GET",
			  url : "/circuit/new/" + type,
			  success : function(s) {
				loadSelector("pickup");
				loadSelector("tone");
				loadSelector("volume");
				var json = JSON.parse(s);
				loadElementOptions(json['p_names'], "pickup");
				loadElementOptions(json['t_names'], "tone");
				loadElementOptions(json['v_names'], "volume");
				for (key in values) textOnInput(key, values[key]);				
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
		})
	}
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

function loadTone() {
	name = $('#optionTone').val();
	if (name == "...") {
		fillFormTone(null);
		mathEnabled(false);
	} else getToneFromServer(name);
}

function loadVolume() {
	name = $('#optionVolume').val();
	if (name == "...") {
		fillFormVolume(null);
		mathEnabled(false);
	} else getVolumeFromServer(name);
}

function loadPickup() {
	name = $('#optionPickup').val();
	if (name == "...") {
		fillFormPickup(null);
		mathEnabled(false);
	} else getPickupFromServer(name);
}

function circuitCheck(){
	var name = $('#name').val();
	if (name.length == 0) {
		manageError(400, ERNO_EMPTY_NAME); 	
		return false;	
	} else if (name.length > 20) {
		manageError(400, ERNO_NAME_TOO_LONG); 	
		return false;	
	}
	if(!isAlphaNumeric(name)){
		manageError(400, ERNO_NAME_AN); 	
		return false;
	}

	var pname = $('#optionPickup').val();
	if (pname == "...") {
		manageError(400, ERNO_PARAM_NUM);
		return false;
	}
	var checkV = [];
	/*checkV.push(parseFloat($('#Rp').attr('value')));*/
	checkV.push(parseFloat($('#Rt').attr('value')));
	checkV.push(parseFloat($('#Rv').attr('value')));
	checkV.push(parseFloat($('#Cc').val()));
	for(i = 0; i < checkV.length; ++i) {
		if(isNaN(checkV[i])) {
			manageError(400, ERNO_PARAM_NUM); 	
			return false;
		}
		if(checkV[i] < 0) {
			manageError(400, ERNO_PARAM_NEG);
			return false;
		}
	}
	return true;
}

function hasToBeMeasured() {
	var Rp = parseFloat($('#Rp').attr('value'));
	return isNaN(Rp);
}

function getCircuit() {
	if (!circuitCheck()) return null;	
 	var name = $('#name').val();	
	var pickup = $('#optionPickup').val();
	var measured = hasToBeMeasured();
	var volume = $('#optionVolume').val();
	var tone = $('#optionTone').val();
	var type = $('#optionCircuit').val();
	var Cc = parseFloat($('#Cc').val())*parseFloat($('#CcScale').val());
	
	var res = {
		name: name, 
		pickup: pickup,
		volume: volume,
		tone: tone,
		Cc: Cc,
		type: type,
		measured: measured,
 	};
	return res;
}

function saveCircuit() {
	var res = getCircuit();
	if (res != null) {
		$.ajax({
		  type : "POST",
		  url : "/circuit/save/",
		  data : res,
		  success : function(s, textStatus, jqXHR) {
			var lang = getCookie("lang");
			$.get("/lang/errors.json", function(respons) {
				var values = respons[lang];
				var template1 = values["create_circuit_final"];
				template1 = template1.replace("%", "<b>" + res.name + "</b>");
				$('#result').html(template1);
			});
		  },
		  error : function(request, textStatus, error) {
			  manageError(request.status, request.responseText);
		  }
	  	})
	}
}
