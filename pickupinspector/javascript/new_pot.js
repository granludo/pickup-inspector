function loadPage() {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	pageLang();
	var images = ["pot_blue.png", "pot_BW.png", "pot_green.png", "pot_red.png","pot_yellow.png"];
	loadImageOptions(images, "/images/pots/");
}

function pageLang() {
	var lang = getCookie("lang");
	$.get("/lang/new_pot.json", function(respons) {
		var values = respons[lang];
		for (key in values) textOnInput(key, values[key]);
		$(document).prop('title', values["title"]);
	});
}

function getPot() {
	var potType = $('#potType').val();  	
	var name = $('#name').val();
	var res = getImageValues();
	var link_img = res;	
	if(!potCheck(potType)) return;
	else {
		var R = parseFloat($('#R').val())*parseFloat($('#RScale').attr("value"));
		if(potType == 'volume') {
			var res = {
				name: name, 
				potType: potType,
				Ct: null,
				R: R,
				link_img: link_img,
	 		};
		} else {
			var Ct = parseFloat($('#Ct').val())*parseFloat($('#CtScale').val());
			res = {
				name: name, 
				potType: potType,
				Ct: Ct,
				R: R,
				link_img: link_img,
	 		};
		}	
	}
	return res;
}

function potTypeChange() {
	var potType = $('#potType').val(); 
	if(potType == 'volume') $('#Ct').prop('disabled', true);
	else $('#Ct').prop('disabled', false);
} 

function potCheck(potType){
	var name = $('#name').val();
	if(name.length == 0) {
		manageError(400, ERNO_EMPTY_NAME); 	
		return false;	
	} else if (name.length > 20) {
		manageError(400, ERNO_NAME_TOO_LARGE); 	
		return false;	
	}
	if(!isAlphaNumeric(name)){
		manageError(400, ERNO_PARAM_AN); 	
		return false;
	}

	var checkV = [];
	checkV.push(parseFloat($('#R').val()));
	if(potType == 'tone') checkV.push(parseFloat($('#Ct').val()));
	
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

	if (!imageCheck()) return false;
	
	return true;
}

function savePot() {
	var res = getPot();
	if (res != null) {
		$.ajax({
		  type : "POST",
		  url : "/pot/save/",
		  data : res,
		  success : function(s, textStatus, jqXHR) {
			var lang = getCookie("lang");
			$.get("/lang/errors.json", function(respons) {
				var values = respons[lang];
				var template1 = values["create_pot_final"];
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
