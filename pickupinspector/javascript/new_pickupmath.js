//Rp = Resistencia sèrie pastilla (es medeix)
//Rpp = Resistencia paral·lel pastilla (es medeix)
//Lp = Impedancia pastilla (es medeix)
//Cp = Capacitat pastilla (es medeix)
//Rt = Resistencia pot. de to (es sap)
//Ct = Capacitat pot. de to (es sap)
//Rv = Resistencia pot. de volum (es sap)
//Cc = Capacitat del cable (se sap o no, prescindible)
//x = 1 -> potenciador de volum al maxim
//y = 1 -> potenciador de to al maxim
// ft=NUM/DEN
//NUM = w1*s^1 + w0
//w1 = x*Rv*Rpp*Rt*y*Ct
//w0 = x*Rv*Rpp
//DEN = z4*s^4+z3*s^3+z2*s^2+z1*s+z0
//z4 = (1-x)*x*Rv*Rv*Rpp*y*Rt*Cp*Ct*Cc*Lp
//z3 = Rpp*x*Rv*y*Rt*Ct*Cc*Lp + 
//     Rpp*Rv*y*Rt*Ct*Cp*Lp + 
//     (1-x)*Rv*(x*Rv*Cc*Lp*(Rpp*Cp + y*Rt*Ct + Rpp*Ct) + Rpp*Rt*y*Cp*Ct*x*Rv*Rp*Cc)
//z2 = Rpp*x*Rv*y*Rt*Ct*Cc + 
//     Rpp*x*Rv*Cc*Lp + Rpp*Rt*y*Ct*Lp + 
//     Rpp*Rp*y*Rt*Rv*Cp*Ct + 
//     Rv*Lp*(Rpp*Cp + y*Rt*Ct + Rpp*Ct) + 
//     (1-x)*x*Rv*Rv*Rp*Cc*(Rpp*Cp + y*Rt*Ct + Rpp*Ct) + 
//     (1-x)*x*Rv*Rv*Cc*Lp + 
//	   (1-x)*x*Rv*Rv*Rpp*y*Rt*Ct*Cc
//z1 = Rpp*Rt*y*Ct + Rpp*Lp + 
//	   Rpp*x*Rv*Rp*Cc + 
//     Rv*Rp*(Rpp*Cp + y*Rt*Ct + Rpp*Ct) + 
//	   Rv*Lp + (1-x)*x*Rv*Rv*Rp*Cc + 
//	   Rpp*Rv*y*Rt*Ct + (1-x)*x*Rv*Rv*Rpp*Cc
//z0 = Rp*Rpp + Rv*Rp + Rv*Rpp

function new_doTheMath() {
 if (!measureCheck()) return;
 var name = $('#option').val();	

 var Rp = parseFloat($('#Rp').attr('value'));
 var Lp = parseFloat($('#Lp').attr('value'));
 var Cp = parseFloat($('#Cp').attr('value'));

 //NEW PARAM
 var Rpp = parseFloat($('#Rpp').attr('value'));
 var Vol = parseFloat($('#Vol').attr('value'));
 
 var Rt = parseFloat($('#Rt').attr('value'));
 var Ct = parseFloat($('#Ct').attr('value'));
 var Rv = parseFloat($('#Rv').attr('value'));
 
 var Cc = parseFloat($('#Cc').attr('value'));
 var x = parseFloat($('#x').val()/10);
 var y = parseFloat($('#y').val()/10);
  
 var math = mathjs(); 
 var j = math.i;

 var w1 = x*Rv*Rpp*Rt*y*Ct;
 var w0 = x*Rv*Rpp;
 var z4 = (1-x)*x*Rv*Rv*Rpp*y*Rt*Cp*Ct*Cc*Lp;
 var z3 = Rpp*x*Rv*y*Rt*Ct*Cc*Lp + Rpp*Rv*y*Rt*Ct*Cp*Lp + 
		  (1-x)*Rv*(x*Rv*Cc*Lp*(Rpp*Cp + y*Rt*Ct + Rpp*Ct) + 
		  Rpp*Rt*y*Cp*Ct*x*Rv*Rp*Cc);
 var z2 = Rpp*x*Rv*y*Rt*Ct*Cc + Rpp*x*Rv*Cc*Lp + Rpp*Rt*y*Ct*Lp + 
		  Rpp*Rp*y*Rt*Rv*Cp*Ct + Rv*Lp*(Rpp*Cp + y*Rt*Ct + Rpp*Ct) + 
		  (1-x)*x*Rv*Rv*Rp*Cc*(Rpp*Cp + y*Rt*Ct + Rpp*Ct) + (1-x)*x*Rv*Rv*Cc*Lp + 
		  (1-x)*x*Rv*Rv*Rpp*y*Rt*Ct*Cc;
 var z1 = Rpp*Rt*y*Ct + Rpp*Lp + Rpp*x*Rv*Rp*Cc + Rv*Rp*(Rpp*Cp + y*Rt*Ct + Rpp*Ct) + 
		  Rv*Lp + (1-x)*x*Rv*Rv*Rp*Cc + Rpp*Rv*y*Rt*Ct + (1-x)*x*Rv*Rv*Rpp*Cc;
 var z0 = Rp*Rpp + Rv*Rp + Rv*Rpp;
 
 var LIMIT = 20000;
 var THRESHOLD = 1000;

 var vector = [];
 
 var max_f = 0;
 var max_valor = math.pi / 2;
 	
 for(var f = 0; f < LIMIT; ++f) {
   var omega = 2*math.pi*f;
   var re_NUM = w0;
   var im_NUM = w1*omega;
   
   var re_DEN = math.pow(omega, 4)*z4 + math.pow(omega, 2)*z2 + z0;
   var im_DEN = -math.pow(omega, 3)*z3 + omega*z1;

   var phase = math.atan(im_NUM / re_NUM) - math.atan(im_DEN / re_DEN);
   var phase_abs = (math.pi / 2) - math.abs(phase);

   var mod_result = math.sqrt(math.add(math.square(re_NUM), math.square(im_NUM))) /
				    math.sqrt(math.add(math.square(re_DEN), math.square(im_DEN)));
   vector.push(mod_result);
   if (math.abs(phase_abs) < max_valor) {
     max_valor = phase_abs;
     mod_max_valor = mod_result;
     max_f = f;
   }
 }

 var res = {
	name: name, 
	f: max_f, 
	q: mod_max_valor,
	x: x,
	y: y
 };

 if(1) {
	var v100 = vector[100];
	var search_value = v100 / 2;
	var result_f = 0;
	var diff_value = 1;
	for(var i = 0; i < LIMIT; ++i) {
		var diff = search_value - vector[i];
		if(diff < 0) diff = diff * -1;
		if(diff < diff_value) {
			result_f = i;
			diff_value = diff;
		}
	}
	res.f = result_f;
	res.q = vector[result_f];
 }
 return res;
}

