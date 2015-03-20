window.onload=init;

var createCookie = function(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}

function init(){
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
}

function changeLang(lang) {
	createCookie("lang", lang, 365);
	location.reload(true);
}

function headerLang() {
	var lang = getCookie("lang");
	$.get("/lang/header.json", function(respons) {
		var values = respons[lang];
		for (key in values) valueOnInput(key, values[key]);
		
		textOnInput("measures", values["measures"]);
		textOnInput("circuits", values["circuits"]);
		textOnInput("elements", values["elements"]);
		textOnInput("others", values["others"]);
	});
	
}

function showMenu(button) {
	$(button).children().each(function() {
		$(this).css('display', 'block');
	});
}

function hideMenu(button) {
	$(button).children().each(function() {
		$(this).css('display', 'none');
	});
	$(button).children('.first').each(function() {
		$(this).css('display', 'block');
	});
}






