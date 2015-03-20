#include <math.h>

#define M_PI_2 1.57079632679489661923
#define V_hold 70 //The value in order to start the acquisition
#define L 100

int flag_loop = 0;
int flag_switch = 0;
int timer = 0;
int V_adc[10];
double Vm = 0;
int i = 0;
double f_m = 0;
double f_test = 0;
double f_ph = 0;
double f_test_ph = 0;
double phi_m = 0;
double phi_test = 0;
double phi_ph = 0;
double phi_test_ph = 0;
double a = 0;
double b = 0;
double wo2 = 0;
double wo2_test = 0;
double f0 = 0;
double C = 0;
double Cp = 0;
double Req = 0;
double Rp = 0;
double Rpp = 0;
double Rs = 0;
double Rs_eq = 0;
double R7_D = 300000; 
double Rt = 0;  
double Rv = 0;  
double R1 = 200000;
double C_trt = 6E-12;
double C_ph = 68E-12;
double Ctest = 205E-12;
double Cadc = 20E-12;
double Lp = 0;
int Vol = 0;
int MUX = 0;
//variable usada para contabilizar el rising edge en el comparador
boolean toggleCount = 0;

//variables usadas para sincronizar timer con main loop
boolean flag_init = 0;
boolean flag_sincro = 0;

 ISR(TIMER1_COMPA_vect){//timer1 interrupt 1Hz 
    //
    if(flag_init){
      if(flag_sincro){
        
          timer = 1;
          
      }
      flag_sincro = 1;
    }
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
  return res;
}
void stringToValues(String s) {
   int i = 0;
   int j = 0;
   float values[2];
   String aux = "";
   while(i < s.length()) {
      if(s[i] != '&') {
        aux = aux + String(s[i]);
      } else {
         values[j] = stringToFloat(aux);
         aux = "";
         ++j; 
      }
     ++i;
   }
  values[j] = stringToFloat(aux);
  Rt = values[0];
  Rv = values[1];
}

int volumeMeasure(){
  int flag_end = 0;
  int flag_print = 0;
  int V_trigger  = 0;
  int V_pickup[L];
  int V_mean = 0;

  
  while(!flag_end){
    if(flag_print == 0){
      Serial.println("Connect the volume measuring circuit to the Guitar");
      flag_print =1;
    }
    flag_switch = digitalRead(11);
    if(flag_switch){
      delay(3000); //Para que el circuito a la salida no tenga un +Vdd y baje a 0V
      if(flag_print == 1){
        Serial.println("Hit the 3rd string (G), pushing it in the 12th fret touching the 2nd string (B) and releasing");
        flag_print = 2;
      }
      int local_flag = 0;
      while(!local_flag){
      V_trigger = analogRead(A0);
      //Serial.println(V_trigger);
      if(V_trigger > V_hold){
        delay(1000);
        for(i = 0; i < L; i++){
        V_pickup[i] = analogRead(A0);
        delay(10);
        }
        for(i = 0; i < L; i++){
          V_mean = V_mean + V_pickup[i];
        }

        V_mean = V_mean / L;
        flag_end = 1;
        local_flag = 1;
      }
     }
    }
  }
  return V_mean;
}

void setup(){
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  pinMode(8,OUTPUT);
  pinMode(9,OUTPUT);
  pinMode(10,OUTPUT);
  //digitalWrite(8,LOW); 
  cli();//stop interrupts
  
  //set timer1 interrupt at 1Hz
    TCCR1A = 0;// set entire TCCR1A register to 0
    TCCR1B = 0;// same for TCCR1B
    TCNT1  = 0;//initialize counter value to 0
    // set compare match register for 1hz increments
    OCR1A = 15624;// = (16*10^6) / (1*1024) - 1 (must be <65536)
    // turn on CTC mode
    TCCR1B |= (1 << WGM12);
    // Set CS12 and CS10 bits for 1024 prescaler
    TCCR1B |= (1 << CS12) | (1 << CS10);  
    // enable timer compare interrupt
    TIMSK1 |= (1 << OCIE1A);
    
    sei();//allow interrupts
    
}

void loop(){
    //Todo el proceso empezará cuando se pida desde la aplicación
    if(Serial.available() > 0){
      flag_switch = digitalRead(11);
      if(!flag_switch){
        flag_loop = 0;
        /*****ATENCION: los valores de Rt y Rv llegan por s1 en el siguiente formato: Rt&Rv
              Ejemplo: 250000.00&250000.00*****/
        String s1 = Serial.readString();
        stringToValues(s1);
        //Empezamos las medidas
        digitalWrite(8,LOW);
        digitalWrite(9,LOW);
        //Hasta que no recibe el string 'Start', MATLAB no espera los valores de pickup
        //Serial.println("Start");
        flag_init = 1;
        while(flag_init){
          if(MUX == 0){
            //Hasta que no empiece a contar de 0 el timer no se contabiliza la frecuencia
            while(flag_sincro){
              if(timer == 0){
                if((ACSR & 0x20) == 32){
                  if(toggleCount == 0){
                    f_m++;
                    toggleCount = 1;
                  }
                }
                else{
                 toggleCount = 0; 
                }    
              }
              else{
                //Serial.print("Freq0m = ");
                //Serial.println(f_m);
                MUX = 1;
                digitalWrite(8,HIGH);
                delay(100);
                flag_sincro = 0;
                timer = 0;
              }        
            }
          }
          if(MUX == 1){
            while(flag_sincro){
              if(timer == 0){
                if((ACSR & 0x20) == 32){
                  if(toggleCount == 0){
                    f_test++;
                    toggleCount = 1;
                  }
                }
                else{
                 toggleCount = 0; 
                }    
              }
              else{
                //Serial.print("Freq Testm = ");
                //Serial.println(f_test);
                MUX = 2;
                digitalWrite(8,LOW);
                digitalWrite(9,HIGH);
                delay(100);
                flag_sincro = 0;
                timer = 0;
                
              }
            }
          }
          if(MUX == 2){
            while(flag_sincro){
              if(timer == 0){
                if((ACSR & 0x20) == 32){
                  if(toggleCount == 0){
                    f_ph++;
                    toggleCount = 1;
                  }
                }
                else{
                 toggleCount = 0; 
                }    
              }
              else{
                //Serial.print("Freq f_ph = ");
                //Serial.println(f_ph);
                MUX = 3;
                digitalWrite(8,HIGH);
                digitalWrite(9,HIGH);
                delay(100);
                flag_sincro = 0;
                timer = 0;
                
              }
            }
          }
          if(MUX == 3){
            while(flag_sincro){
              if(timer == 0){
                if((ACSR & 0x20) == 32){
                  if(toggleCount == 0){
                    f_test_ph++;
                    toggleCount = 1;
                  }
                }
                else{
                 toggleCount = 0; 
                }    
              }
              else{
                //Serial.print("Freq F test ph = ");
                //Serial.println(f_test_ph);
                MUX = 4;
                digitalWrite(8,LOW);
                digitalWrite(9,LOW);
                delay(100);
                flag_sincro = 0;
                timer = 0;
                
              }
            }
          }
          if(MUX == 4){
            flag_init = 0;
            flag_sincro = 0;
            timer = 0;
            MUX = 0;
            /////////////////////////////////////////////////////////
            /////// MEDIDA DE RESISTENCIA SERIE /////////////////////
            /////////////////////////////////////////////////////////
                  
            digitalWrite(10,HIGH);
            delay(100);
            for(i = 0; i < 10;i++){
              V_adc[i] = analogRead(A1);
              //Serial.print("V ");
              //Serial.print(i);
              //Serial.print("=");
              //Serial.println(V_adc[i]);
              //delay(100);
            }
            for(i = 0;i < 10; i++){
              Vm = Vm + V_adc[i];
            }
            Vm = Vm/10;
            Rs_eq = 200000 * Vm /(1000 - Vm); //1023 representa Vdd, 5V
            //En nuestro circuito tenemos 4.88V medidos en el osciloscopio,
            //es decir Vin=1000
            Rs = 1 / (1/Rs_eq - 1/Rv - 1/Rt);
            
            digitalWrite(10,LOW);
            //////////////////////////////////////////////////////////
            //////////////////////////////////////////////////////////
            
            phi_m = atan(2*M_PI*f_m*C_trt*84000);
            phi_ph = atan(2*M_PI*f_ph*C_ph*84000);
            phi_test = atan(2*M_PI*f_test*C_trt*84000);
            phi_test_ph = atan(2*M_PI*f_test_ph*C_ph*84000);
            //Serial.print("phi_m = ");
            //Serial.println(phi_m,4);
            a = tan(M_PI_2 - phi_m)*f_ph / f_m / tan(M_PI_2 - phi_ph);
            b = tan(M_PI_2 - phi_test)*f_test_ph / f_test / tan(M_PI_2 - phi_test_ph);
            
            wo2 = (a*square(2*M_PI*f_m) - square(2*M_PI*f_ph)) / (a-1);
            wo2_test = (b*square(2*M_PI*f_test) - square(2*M_PI*f_test_ph)) / (b-1);
            
            f0 = sqrt(wo2) / (2*M_PI);
            //Serial.print("Freq f0 = ");
            //Serial.println(f0);
            C = Ctest / ((wo2/wo2_test) - 1);
            Cp = C - C_trt - Cadc;
            Req = 2*M_PI*f_m / (C*(wo2 - square(2*M_PI*f_m))*tan(M_PI_2 - phi_m));
            //Serial.print("Req = ");
            //Serial.println(Req);
            Rp = Req*R1 / (R1- Req);
            //Serial.print("Rp = ");
            //Serial.println(Rp);
            Rpp = 1/(1/Rp -1/Rv - 1/Rt -1/R7_D);
            Lp = 1 / (wo2*C);
            //Serial.print("Rpp = ");
            //Serial.println(Rpp);
            
			Vol = volumeMeasure();
            
            
           	Serial.print("Rp=");
		    Serial.print(Rs);
		    Serial.print(",Lp=");
		    Serial.print(Lp);
		    Serial.print(",Cp=");
		    Serial.print(Cp*1E+12);
		    Serial.print(",Rpp=");
		    Serial.print(Rpp);
			Serial.print(",Vol=");
			Serial.println(Vol);
            
                    
            f_m = 0;
            f_test = 0;
            f_ph = 0;
            f_test_ph = 0;
            Rs = 0;
            Vm = 0;
          }
        }
      }
      else{
       if(!flag_loop){
        //Serial.println("Connect the oscillator circuit to the Guitar");
        flag_loop = 1; 
      }
    }
  }
}

