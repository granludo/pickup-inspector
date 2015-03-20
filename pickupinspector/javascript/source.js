function loadPage() {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	pageLang();
}

function pageLang() {
	var lang = getCookie("lang");
	$.get("/lang/source.json", function(respons) {
		var values = respons[lang];
		for (key in values) textOnInput(key, values[key]);
		$(document).prop('title', values["title"]);
	});


}
