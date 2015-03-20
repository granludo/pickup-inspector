function loadPage() {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	pageLang();
	var images = ["humbucker_black.png", "humbucker_gold.png", "single_silver.png", "single_white.png"];
	loadImageOptions(images, "/images/pickups/");
}

function pageLang() {
	var lang = getCookie("lang");
	$.get("/lang/pickup.json", function(respons) {
		var values = respons[lang];
		for (key in values) textOnInput(key, values[key]);
		$(document).prop('title', values["title"]);
	});
}

function getPickup() {
	var measured = true;
	var name = $('#name').val();
	var res = getImageValues();
	var link_img = res;
	if(!pickupCheck()) return;
	else if (measured) var res = {name: name, Rp: null, Lp: null, Cpp: null, 
								  measured: measured, link_img: link_img};
	return res;
}

function pickupCheck(){
	var name = $('#name').val();
	if(name.length == 0) {
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
	
	if (!imageCheck()) return false;
	return true;
}

function savePickup() {
	var res = getPickup();
	if (res != null) {
		$.ajax({
		  type : "POST",
		  url : "/pickup/save/",
		  enctype: "multipart/form-data",
		  data : res,
		  success : function(s, textStatus, jqXHR) {
			var lang = getCookie("lang");
			$.get("/lang/errors.json", function(respons) {
				var values = respons[lang];
				var template1 = values["create_pickup_final"];
				template1 = template1.replace("%", "<b>" + res.name + "</b>");
				$('#result').html(template1);
				if(res.option == "upload") loadImageOption(res.link_img);
			});
		  },
		  error : function(request, textStatus, error) {
			  manageError(request.status, request.responseText);
		  }
	  	})
	}

}

