function loadPage() {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	pageLang();
}

function pageLang() {
	var lang = getCookie("lang");
	$.get("/lang/all_circuits.json", function(respons) {
		var values = respons[lang];
		for (key in values) textOnInput(key, values[key]);
		
		textOnClass("custom", values["custom"]);
		textOnClass("serial_1_2", values["serial_1_2"]);
		valueOnClass("see_detail", values["see_detail"]);
		textOnClass("remove", values["remove"]);
		$(document).prop('title', values["title"]);
	});


}
