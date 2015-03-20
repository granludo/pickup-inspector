function loadCircuit(c) {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	pageLang();
	if(c.type == "serial_1_2") {
		$('#circuitBody').css('visibility', 'visible');
		$('#circuitTemplate').load("/html/serial_1_2.html", function() {
			var lang = getCookie("lang");
			$.get("/lang/serial_1_2.json", function(respons) {
				loadNames("pickup");
				loadPickupMeasured(c.measured);
				loadNames("tone");
				loadNames("volume");
				loadCableName();
				$('#pickupName').html(c.pickup);
				$('#volumeName').html(c.volume);
				$('#toneName').html(c.tone);
				getPickupFromServer(c.pickup);
				getVolumeFromServer(c.volume);
				getToneFromServer(c.tone);
				printInForm("Cc", c.Cc);	
				drawCanvasS12();
				var values = respons[lang];
				for (key in values) textOnInput(key, values[key]);
				textOnClass("name", values["name"]);
				textOnClass("remove", values["remove"]);
				textOnInput("circuitType", values["serial_1_2"]);
			});			
			
		});
	}
}

function loadPickupMeasured(b) {
	var template1 = "<span id=\"measured_title\">To be measured with SAN</span>: ";
	var template2 = "";
	if(b) template2 = "<span id=\"yes\"> Yes </span>";
	else template2 = "<span id=\"no\"> No </span>";
	$('#measured').html(template1 + template2);
}

function pageLang() {
	var lang = getCookie("lang");
	$.get("/lang/circuit_detail.json", function(respons) {
		values = respons[lang];
		for (key in values) textOnInput(key, values[key]);
		textOnClass("remove", values["remove"]);
		valueOnClass("see_detail", values["see_detail"]);
		$(document).prop('title', values["title"]);
	});
}

