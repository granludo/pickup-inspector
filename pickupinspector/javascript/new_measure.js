function loadPage() {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	pageLang();
}

function pageLang() {
	var lang = getCookie("lang");
	$.get("/lang/new_measure.json", function(respons) {
		values = respons[lang];
		for (key in values) textOnInput(key, values[key]);
		$(document).prop('title', values["title"]);
	});
}


function changePotPos(s) {
	var value = $("#" + s + "").val();
	$("#span" + s + "").html(value);
}

function loadCircuit() {
	name = $('#option').val();
	if (name == "...") {
		fillFormCircuit(null);
		mathEnabled(false);
	} else {
		cname = {name : name};
		$.ajax({
			  type : "POST",
			  url : "/circuit/load/",
			  data : cname,
			  success : function(s) {
				json = JSON.parse(s);
				type = json["type"];
				if(type == "serial_1_2") {
					$('#circuitBody').css('visibility', 'visible');
					$('#circuitTemplate').load("/html/serial_1_2.html", function() {
						var lang = getCookie("lang");
						$.get("/lang/serial_1_2.json", function(respons) {
							loadNames("pickup");
							loadNames("tone");
							loadNames("volume");
							loadCableName();
							loadSlidersOption(type);
							fillFormCircuit(s, type);
							var values = respons[lang];
							for (key in values) textOnInput(key, values[key]);
							textOnClass("name", values["name"]);
							textOnInput("circuitType", values["serial_1_2"]);
						});		
						
					});
				}
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
		})
		mathEnabled(true);
	}
}

function fillFormCircuit(s) {
	if (s == null) {
		$('#circuit').css('visibility', 'hidden');
	} else {
		if (type == 'serial_1_2') {
			$('#circuit').css('visibility', 'visible');
			var json = JSON.parse(s);
			$('#circuitType').html("Serial: 1 pickup, 2 potentiometers"); 
			$('#pickupName').html(json["pickup"]);
			$('#volumeName').html(json["volume"]);
			$('#toneName').html(json["tone"]);
			getPickupFromServer(json["pickup"]);
			getVolumeFromServer(json["volume"]);
			getToneFromServer(json["tone"]);
			printInForm("Cc", json["Cc"]);
			drawCanvasS12();
		}
	}
	$('#result').html("");
}

function saveMeasure(){
	var res = new_doTheMath();
	if (res != null) {
		$.ajax({
		  type : "POST",
		  url : "/measure/save/",
		  data : res,
		  success : function(s) {
			var lang = getCookie("lang");
			$.get("/lang/errors.json", function(respons) {
				var values = respons[lang];
				var aux = values["see_detail"];
				var json = JSON.parse(s);
				$('#result').html("<p>" +
							  " <b>ID: </b>" + json["id"] + " " + 
							  " <b>F: </b>" + res.f/1000 + " kHz," + 
							  " <b>Q: </b>" + res.q + 
							  "</p>" +
   							  "<form action=\"/measure/list/" + json["id"] + "\" method=\"get\">" +
							  "<input id=\"see_detail\" type=\"submit\" value=\"" + aux + "\"></input>" +
							  "</form>" );
			});
			
		  },
		  error : function(request, textStatus, error) {
			  manageError(request.status, request.responseText);
		  }
	  	})
	}
}
