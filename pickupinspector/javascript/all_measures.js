function loadPage() {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	pageLang();
}

function pageLang() {
	var lang = getCookie("lang");
	$.get("/lang/all_measures.json", function(respons) {
		var values = respons[lang];
		for (key in values) textOnInput(key, values[key]);
		
		valueOnClass("see_detail", values["see_detail"]);
		textOnClass("remove", values["remove"]);
		$(document).prop('title', values["title"]);
	});


}
