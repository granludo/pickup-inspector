function fillFormMeasure(s) {
	if (s == null) {
		$('#compare').css('visibility', 'hidden');
	} else {
		$('#compare').css('visibility', 'visible');
		var json = JSON.parse(s);
		$('#id').html(json["id"]);
		$('#name').html(json["name"]);
		$('#circuitName').attr('action', '/circuit/list/'+ json["name"]);
		var date = json["date"].toString();
		$('#date').html(date.substring(0, 19));
		$('#f2').html(parseFloat(json["f"])/1000);
		$('#q2').html(json["q"]);
		if(json["type"] == 'serial_1_2') loadSlidersSpan(json["x"], json["y"]);
		
		vol2 = json["vol"];
		freqTags(json["f"], "tags2");
	}
}

function loadSlidersSpan(x, y) {
	var template1 = "<div><b><span id=\"pos_pot_title2\">Potentiometers position</span></b>" + 
					"<div><b>V: </b><span id=\"x\">" + x + "</span></div>" + 
					"<div><b>T: </b><span id=\"y\">" + y + "</span></div></div>";
	$('#pos_pot').html(template1);
	var lang = getCookie("lang");
	$.get("/lang/measure_detail.json", function(respons) {
		values = respons[lang];
		textOnInput("pos_pot_title2", values["pos_pot_title"]);
	});
}

function freqTags(f, where) {
	f = parseInt(f);
	var res = "";
	var lang = getCookie("lang");
	$.get("/lang/tags.json", function(respons) {
		values = respons[lang];
		if (f < 2000) res = values["tag1"];
		else if (f >= 2000 && f < 2500) res = values["tag2"];
		else if (f >= 2500 && f < 3000) res = values["tag3"];
		else if (f >= 3000 && f < 4000) res = values["tag4"];
		else if (f >= 4000 && f < 5000) res = values["tag5"];
		else if (f >= 5000 && f < 7000) res = values["tag6"];
		else res = values["tag7"];
		$('#' + where).html(res);
	});	
}

function pageLang(f) {
	var lang = getCookie("lang");
	$.get("/lang/measure_detail.json", function(respons) {
		values = respons[lang];
		for (key in values) textOnClass(key, values[key]);
		valueOnClass("see_detail", values["see_detail"]);
		$(document).prop('title', values["title"]);
	});
	freqTags(f, "tags1");	
}

function loadMeasure() {
	name = $('#option').val();
	if (name == "...") {
		fillFormMeasure(null);
		drawCurve(1);
	} else {
		mname = {name : name};
		$.ajax({
			  type : "POST",
			  url : "/measure/load/",
			  data : mname,
			  success : function(s) {
				fillFormMeasure(s);
				initAudio2();
				drawCurve(2);
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
		})
	}
}
