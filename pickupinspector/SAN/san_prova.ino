float rT = 0;
float rV = 0;
float cP = 0;
float lP = 0;
float rP = 0;
float rPp = 0;
int vol = 0;
boolean start = false;

void initMeasurement() {
    
}

String floatToString(float x) {
	if (x == 0.0) return "0";
	String s = "0.";
        x = x*10;
	while(x < 1.0) {
		s += (int)x;
		x = x*10;
	}
        while((float)((float)x-(int)x) > 0) {
          s+= (int)x%10;
          x = x*10;
          x = (float)((float)x-(int)x) + (int)x%10;
        }
        s+=(int)x%10;
	return s;
}

void doMeasure() {
  rP = 8820;
  lP = 4.72;
  cP = 0.00000000101;
  rPp = 250000;

  Serial.println("Conecte el circuito de medida de volumen a la pastilla");
  delay(2000);
  Serial.println("Golpee la tercera cuerda (G) en la posicion de pickup de Puente, Arrastrandola hasta la cuerda inferior (B)");
  delay(1000);
  vol = 97;
}

void setup() {
  // initialize serial:
  Serial.begin(9600);
  // init something
  initMeasurement();
  
}

float getDecimal(String x, int i) {
  int j = 0;
  float res = 0;
  while(i < x.length()) {
     int aux = x[i]-'0';
     res = (res*10) + aux;
     ++i;
     ++j;
  }
  while(j > 0) {
    res = (float) res / 10.0;
    --j;
  } 
  return res;
}

float stringToFloat(String x) {
  float res = 0;
  int i = 0;
  boolean decimal = false;
  while(i < x.length() && !decimal) {
     if(x[i] == '.') decimal = true;
     else if(!decimal) {
       int aux = x[i]-'0';
       res = (res*10) + aux;
     } 
     ++i; 
  }
  res = res + getDecimal(x, i);
  return res;
}

void stringToValues(String s) {
   int i = 1;
   int j = 0;
   float values[2];
   String aux = "";
   while(i < s.length()) {
      if(s[i] == 'e') {
         aux = "0.0";
         values[j] = stringToFloat(aux);
         ++j;
         while(s[i] != '&') ++i; 
      }
      else if(s[i] != '&') {
        aux = aux + String(s[i]);
      } else {
         values[j] = stringToFloat(aux);
         aux = "";
         ++j; 
      }
     ++i;
   }
  values[j] = stringToFloat(aux);
  rT = values[0];
  rV = values[1];
 
}

void printFloat(float res) {
   if (res >= 1) Serial.print(res, 5);
   else Serial.print(floatToString(res)); 
  
}

void loop() {
  if (Serial.available() && !start) {
    String s = Serial.readString();
    start = true;
    stringToValues(s);
  } else if (start) {
    doMeasure();
    Serial.print("Rp=");
    Serial.print(rP);
    Serial.print(",Lp=");
    Serial.print(lP);
    Serial.print(",Cp=");
    Serial.print(floatToString(cP));
	Serial.print(",Rpp=");
	Serial.print(rPp);
	Serial.print(",Vol=");
	Serial.print(vol);
    Serial.print("\n");
    start = false;
    initMeasurement();
  }  
}
