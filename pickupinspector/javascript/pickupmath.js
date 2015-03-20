//Rp = Resistencia pastilla (es medeix)
//Lp = Impedancia pastilla (es medeix)
//Cp = Capacitat pastilla (es medeix)

//Rt = Resistencia pot. de to (es sap)
//Ct = Capacitat pot. de to (es sap)
//Rv = Resistencia pot. de volum (es sap)

//Cc = Capacitat del cable (se sap o no, prescindible)

//y = 1 -> potenciador de volum al maxim
//x = 1 -> potenciador de to al maxim

// ft=NUM/DEN
//NUM = A*s+1
//A = x*Rv*y*Rt*Ct
//DEN = z4*s^4+z3*s^3+z2*s^2+z1*s+z0
//z4 = (1-x)*x*Rv^2*y*Rt*Ct*Cp*Cc*Lp
//z3 = x*Rv*y*Rt*Ct*Cc*Lp + Rv*y*Rt*Ct*Cp*Lp + (1-x)*x*Rv^2*y*Rp*Rt*Ct*Cp*Cc + (1-x)*x*Rv^2*Cc*Lp*(Ct+Cp)
//z2 = x*Rv*y*Rt*Ct*Cc + x*Rv*Cc*Lp + y*Rt*Ct*Lp + 
//     Rv*Rp*y*Rt*Ct*Cp + Rv*Ct*Lp + Rv*Cp*Lp + 
//     (1-x)*x*Rv^2*Rp*Cc*(Cp+Ct) + (1-x)*x*Rv^2*y*Rt*Ct*Cc
//z1 = y*Rt*Ct + Lp + x*Rv*Cp*Cc + Rv*Rp*(Cp+Ct) + Rv*y*Rt*Ct + (1-x)*x*Rv^2*Cc
//z0 = Rp + Rv

function doTheMath() {
 if (!measureCheck()) return;
 var name = $('#option').val();	

 var Rp = parseFloat($('#Rp').attr('value'));
 var Lp = parseFloat($('#Lp').attr('value'));
 var Cp = parseFloat($('#Cp').attr('value'));
 
 var Rt = parseFloat($('#Rt').attr('value'));
 var Ct = parseFloat($('#Ct').attr('value'));
 var Rv = parseFloat($('#Rv').attr('value'));
 
 var Cc = parseFloat($('#Cc').attr('value'));
 var x = parseFloat($('#x').val()/10);
 var y = parseFloat($('#y').val()/10);
  
 var math = mathjs(); 
 var j = math.i;

 var A = x*Rv*y*Rt*Ct;
 var B = 1;
 var z4 = (1-x)*x*(Rv*Rv)*y*Rt*Ct*Cp*Cc*Lp;
 var z3 = x*Rv*y*Rt*Ct*Cc*Lp + Rv*y*Rt*Ct*Cp*Lp + (1-x)*x*(Rv*Rv)*y*Rp*Rt*Ct*Cp*Cc + (1-x)*x*(Rv*Rv)*Cc*Lp*(Ct+Cp);
 var z2 = x*Rv*y*Rt*Ct*Cc + x*Rv*Cc*Lp + y*Rt*Ct*Lp + 
		  Rv*Rp*y*Rt*Ct*Cp + Rv*Ct*Lp + Rv*Cp*Lp + 
		  (1-x)*x*(Rv*Rv)*Rp*Cc*(Cp+Ct) + (1-x)*x*(Rv*Rv)*y*Rt*Ct*Cc;
 var z1 = y*Rt*Ct + Lp + x*Rv*Cp*Cc + Rv*Rp*(Cp+Ct) + Rv*y*Rt*Ct + (1-x)*x*(Rv*Rv)*Cc;
 var z0 = Rp + Rv;
 
 var LIMIT = 20000;
 var THRESHOLD = 1000;

 var vector = [];
 
 var max_f = 0;
 var max_valor = math.pi / 2;
 //var mod_max_valor = math.sqrt(math.add(math.square(max_valor.re), math.square(max_valor.im)));
 	
 for(var f = 0; f < LIMIT; ++f) {
   var omega = 2*math.pi*f;
   var s = math.complex(0, omega);
   var NUM = math.complex(1, A*omega);
   var s4 = math.pow(s,4);
   var s3 = math.pow(s,3);
   var s2 = math.pow(s,2);
   var s1 = math.pow(s,1);
   
   var b4 = math.multiply(z4, s4);
   var b3 = math.multiply(z3, s3);
   var b2 = math.multiply(z2, s2);
   var b1 = math.multiply(z1, s1);
   var b0 = z0;
   
   var re_DEN = math.pow(omega, 4)*z4 + math.pow(omega, 2)*z2 + z0;
   var im_DEN = -math.pow(omega, 3)*z3 + omega*z1;

   var re_NUM = 1;
   var im_NUM = A*omega;

   var DEN = math.add(b4, math.add(b3, math.add(b2, math.add(b1, b0))));
   var result = math.divide(NUM, DEN);
   if (f == 1000) {
		// NO DONEN EL MATEIX RESULTAT CAGUNDEU!
		var valor1 = DEN.re;
		var valor2 = re_DEN;
		alert("Valor complex = " + valor1 + ", Valor normal = " + valor2);

   }
   var phase = math.atan(NUM.im / NUM.re) - math.atan(DEN.im / DEN.re);
   var phase_abs = (math.pi / 2) - math.abs(phase);
   var mod_result = math.sqrt(math.add(math.square(result.re), math.square(result.im)));
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

 return res;
}

function measureCheck(){
	var Rp = parseFloat($('#Rp').attr('value'));
	if (isNaN(Rp)) {
		manageError(400, ERNO_PARAMS_NUM); 	
		return false;
	}
	if (Rp < 0) {
		manageError(400, ERNO_PARAMS_NEG);
		return false;
	}

	var x = parseFloat($('#x').val()/10);
	var y = parseFloat($('#y').val()/10);
	
	return true;
}
