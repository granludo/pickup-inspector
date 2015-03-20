function loadPickups(pickup_names) {
	for (i = 0; i < pickup_names.length; ++i) {
		var p = pickup_names[i];
		var template1 = "<tr id=\"p" + p.name + "\"><td>" + p.name + "</td>";
		var template2;
		if (p.measured) template2 = "<td> - </td><td> - </td><td> - </td><td> - </td><td class=\"yes\"> Yes </td>"
		else {
			auxRp = showFactor(p.Rp);
			auxLp = showFactor(p.Lp);
			auxCp = showFactor(p.Cp);
			auxRpp = showFactor(p.Rpp);
			template2 = "<td>" + auxRp.x + " " + auxRp.s + "&#937;</td>" + 
						"<td>" + auxRpp.x + " " + auxRpp.s + "&#937;</td>" +
						"<td>" + auxLp.x + " " + auxLp.s + "H</td>" + 
						"<td>" + auxCp.x + " " + auxCp.s + "F</td><td class=\"no\"> No </td>";
		}
		var template3 = "<td><button class=\"remove\" onclick=\"removePickup('" + p.name + "')\">remove</button></td>";
		var template4 = "</tr>";
		if (p.link_img) template4 = "<td><button class=\"view_image\" onclick=\"showImage('" + 
									p.link_img + "', 'pickup')\">view image</button></td></tr>";
		$('#pickup_table').append(template1 + template2 + template3 + template4);
	}
}

function showImage(id, elem) {
	var where = 'imgPopUp img';		  
	var res = {id: id,};
	var json;
	var base_image = new Image();
			base_image.src = id;
			base_image.onload = function(){
				$('#' + where).attr('src', base_image.src).css('visibility', 'visible');;
			};
	/*$.ajax({
		  type : "GET",
		  url : "/image/load/" + elem + "/",
		  data : res,
		  success : function(s) {
			json = JSON.parse(s);
			var src = json["img"];
			var img = $('#' + where);
			img.attr('src', src);
			img.css('visibility', 'visible');
		  },
		  error : function(request, textStatus, error) {
			  manageError(request.status, request.responseText);
		  }
	 });*/
}

function hideImage(){
	var img = $('#imgPopUp img');
	img.attr('src', "");
	img.css('visibility', 'hidden');
}

function loadPots(pot_names) {
	for (i = 0; i < pot_names.length; ++i) {
		var p = pot_names[i];
		auxR = showFactor(p.R);
		var template1 = "<tr id=\"pot" + p.name + "\"><td>" +  p.name + "</td><td>" + auxR.x + " " + auxR.s + "&#937;</td>";
		var template2;
		if (p.tone) {
			auxCt = showFactor(p.Ct);
			template2 = "<td class=\"tone\"> tone </td><td>" + auxCt.x + " " + auxCt.s + "F</td>";
		} else template2 = "<td class=\"volume\"> volume </td><td> - </td>";
		var template3 = "<td><button class=\"remove\" onclick=\"removePot('" + p.name + "')\">remove</button></td>";
		var template4 = "</tr>";
		if (p.link_img) template4 = "<td><button class=\"view_image\" onclick=\"showImage('" + 
									p.link_img + "', 'pot')\">view image</button></td></tr>";
		$('#pot_table').append(template1 + template2 + template3 + template4);
	}
}

function loadElements(pickup_names, pot_names) {
	$('#headerLoader').load("/html/header.html", function() {
		headerLang();
	});
	loadPickups(pickup_names);
	loadPots(pot_names);	
	pageLang();
}

function pageLang() {
	var lang = getCookie("lang");
	$.get("/lang/all_elements.json", function(respons) {
		var values = respons[lang];
		for (key in values) textOnInput(key, values[key]);
		
		textOnClass("yes", values["yes"]);
		textOnClass("elem_name", values["elem_name"]);
		textOnClass("no", values["no"]);
		textOnClass("tone", values["tone"]);
		textOnClass("volume", values["volume"]);
		textOnClass("view_image", values["view_image"]);
		textOnClass("remove", values["remove"]);
		$(document).prop('title', values["title"]);
	});
}

function removePot(potId) {
	var lang = getCookie("lang");
	$.get("/lang/errors.json", function(respons) {
		var values = respons[lang];
		var template1 = values["remove_pot_confirm"];
		if(confirm(template1 + potId + "?")) {
			res = {'name':potId};
			$.ajax({
			  type : "POST",
			  url : "/pot/delete/",
			  data : res,
			  success : function(s, textStatus, jqXHR) {	
					$('#pot' + potId).remove();
					manageError(100, NO_ERROR);
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
		  	})
		}
	});
}

function removePickup(pickupId) {
	var lang = getCookie("lang");
	$.get("/lang/errors.json", function(respons) {
		var values = respons[lang];
		var template1 = values["remove_pickup_confirm"];
		if(confirm(template1 + pickupId + "?")) {
			res = {'name':pickupId};
			$.ajax({
			  type : "POST",
			  url : "/pickup/delete/",
			  data : res,
			  success : function(s, textStatus, jqXHR) {	
					$('#p' + pickupId).remove();
					manageError(100, NO_ERROR);
			  },
			  error : function(request, textStatus, error) {
				  manageError(request.status, request.responseText);
			  }
		  	})
		}
	});
}
