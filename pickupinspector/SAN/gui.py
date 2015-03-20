from Tkinter import *
import math, urllib, urllib2, json, serial, re, time

### YOUR SERIAL PORT NUMBER ###
serialNo = '/dev/ttyACM1'


### CONSTANTS ###
ser = serial.Serial(serialNo, 9600)
circuit = ""
title = "SAN"
urlDirection = "http://localhost:8080"
#urlDirection = "http://4.pickupinspector.appspot.com/"

### LANGUAGES ###

EN = {
	"welcome": "Welcome to SAN. First, select a language", 
	"enter" : "Enter",
	"cancel": "Cancel",
	"start_measure":"Start Measure",
	"select_circuit":"Select a circuit",
	"no_circuits":"No circuits to measure!",
	"http_error":"An HTTP error has ocurred",
	"url_error":"An URL error has ocurred",
	"more_measures":"More measures",
	"success":"Success!",
	"connect": "Connect the volume measure circuit to the pickup",
	"gstring": "Hit the G string on the Bridge pickup position",
	"measuring":"Measuring...",
	"pickup":"Pickup",
	"pot_tone":"Pot. tone",
	"resistance":"Resistance",
	"capacitance":"Capacitance",
	"pot_volume":"Pot. volume",
	"cable_capacitance":"Cable capacitance",
}

CAST = {
	"welcome": "Bienvenido a SAN. Primero, elige un idioma", 
	"enter" : "Entra",
	"cancel": "Cancela",
	"start_measure":"Haz la medida",
	"select_circuit":"Elige un circuito",
	"no_circuits":"No hay circuitos a medir!",
	"not_a_circuit":"Esto no es un circuito",
	"http_error":"Un error tipo HTTP ha ocurrido",
	"url_error":"Un error tipo URL ha ocurrido",
	"more_measures":"M" + unichr(0xe1) + "s medidas",
	"success": unichr(0xC9) + "xito!",
	"connect": "Conecta el circuito de medida de volumen a la pastilla",
	"gstring": "Golpea la tercera cuerda (G) en la posicion de pastilla de Puente",
	"measuring":"Midiendo...",
	"pickup":"Pastilla",
	"pot_tone":"Pot. de tono",
	"resistance":"Resistencia",
	"capacitance":"Capacitancia",
	"pot_volume":"Pot. de volumen",
	"cable_capacitance":"Capacidad del cable",
}

CAT = {
	"welcome": "Benvingut a SAN. Primer tria un idioma", 
	"enter" : "Entra",
	"cancel": "Cancela",
	"start_measure":"F" + unichr(0xE9) + "s la mesura",
	"select_circuit":"Tria un circuit",
	"no_circuits":"Cap circuit a mesurar!",
	"not_a_circuit":"Aix" + unichr(0xF2) + " no " + unichr(0xE9) + "s un circuit!",
	"http_error":"Un error tipus HTTP ha passat",
	"url_error":"Un error tipos URL ha passat",
	"more_measures":"M" + unichr(0xE9) + "s mesures",
	"success": unichr(0xC8) + "xit!",
	"connect": "Conecta el circuit de mesura de volum a la pastilla",
	"gstring": "Colpeja la tercera corda (G) a la posici" + unichr(0xF3) + " de pastilla de Pont",
	"measuring":"Mesurant...",
	"pickup":"Pastilla",
	"pot_tone":"Pot. de to",
	"resistance":"Resist" + unichr(0xE8) + "ncia",
	"capacitance":"Capacit" + unichr(0xE0) + "ncia",
	"pot_volume":"Pot. de volum",
	"cable_capacitance":"Capacitat del cable",
}

windowSize = "510x90"
textHeight = 20
textWidth = 25
border = 5
totalWidth = 510
totalHeight = 80
vMiddle = 40
hMiddle = 255
border2 = 15
border3 = 30
vborder = 5
aux_c_names = []
message = ""

def multFactor(x) :
	factor = 0
	while x > 1:
		x = x/10
		factor = factor + 1
	factor = int(factor/3)
	if factor == 0:
		return {'s': "", 'ex': 0}
	elif factor == 1:
		return {'s': "k", 'ex': 1}
	elif factor == 2:
		return {'s': "M", 'ex': 2}
	elif factor == 3:
		return {'s': "G", 'ex': 3}
	else:
		return None

def divFactor(x) :
	if x == 0:
		return None
	factor = 0
	while x < 1: 
		x = x*10
		factor = factor + 1
	factor = int(factor/3);
	if factor == 0: 
		return {'s': "", 'ex': 0}
	elif factor == 1:
		return {'s': "m", 'ex': -1}
	elif factor == 2:
		return {'s': "u", 'ex': -2}
	elif factor == 3:
		return {'s': "n", 'ex': -3}
	elif factor == 4: 
		return {'s': "p", 'ex': -4}
	else:
		return None

def showFactor(x) :
	factor = 0
	if x > 1:
		factor = multFactor(x)
	else:
		factor = divFactor(x)
	if factor != None:
		x = float('%.2f'%(x / math.pow(10, 3*factor['ex'])))
		return {'x': str(x), 's': factor['s']}
	else:
		return {'x': str(x), 's': ""}

def getPotFromServer(name):
	response = ""
	try:
		query_args = {'name':name}
		data = urllib.urlencode(query_args)
		req = urllib2.Request(urlDirection + "/pot/load/", data)
		response = urllib2.urlopen(req)
		response = json.load(response)
	except urllib2.HTTPError, e:
		print(lang["http_error"] + ":")
		print(e)
		root.destroy()
	except urllib2.URLError, e:
		print(lang["url_error"] + ":")
		print(e)
		root.destroy()
	return response

def drawTemplate(c):
	global frame
	if c['type'] == 'serial_1_2':
		frame.destroy()
		frame = Frame(None, bg="white")
		frameHeight = 80
		root.geometry("510x200")
		frame.pack()
		frame.place(x=0,y=totalHeight+textHeight+5, height=frameHeight, width=totalWidth)

		### variables for frame ###	
		varPickup = StringVar()
		varTone = StringVar()
		varRt = StringVar()
		varCt = StringVar()
		varVolume = StringVar()
		varRv = StringVar()
		varCc = StringVar()
		
		### we need to load volume and tone ###
		tone_pot = getPotFromServer(str(c['tone']))
		volume_pot = getPotFromServer(str(c['volume']))
		varPickup.set(lang["pickup"] + ": " + str(c['pickup']))
		varTone.set(lang["pot_tone"] + ": " + str(c['tone']))
		Rt = showFactor(tone_pot['R'])
		varRt.set(lang["resistance"] + ": " + Rt['x'] + " " + Rt['s'] + "ohm")
		Ct = showFactor(tone_pot['Ct'])
		varCt.set(lang["capacitance"] + ": " + Ct['x'] + " " + Ct['s'] + "F")
		varVolume.set(lang["pot_volume"] + ": " + str(c['volume']))
		Rv = showFactor(volume_pot['R'])
		varRv.set(lang["resistance"] + ": " + Rv['x'] + " " + Rv['s'] + "ohm")
		Cc = showFactor(c['Cc'])
		varCc.set(lang["cable_capacitance"] + ": " + Cc['x'] + Cc['s'] + "F") 

		labelPickup = Label(frame, textvariable=varPickup, bg="white", justify="left")
		labelTone = Label(frame, textvariable=varTone, bg="white", justify="left")
		labelRt = Label(frame, textvariable=varRt, bg="white", justify="left")
		labelCt = Label(frame, textvariable=varCt, bg="white", justify="left")
		labelVolume = Label(frame, textvariable=varVolume, bg="white", justify="left")
		labelRv = Label(frame, textvariable=varRv, bg="white", justify="left")
		labelCc = Label(frame, textvariable=varCc, bg="white", justify="left")
		
		labelPickup.pack()
		labelTone.pack()
		labelRt.pack()
		labelCt.pack()
		labelVolume.pack()
		labelRv.pack()
		labelCc.pack()

		labelPickup.place(x=border3,y=0, height=20)
		labelTone.place(x=border3,y=20, height=20)
		labelRt.place(x=border3,y=40, height=20)
		labelCt.place(x=border3,y=60, height=20)
		labelVolume.place(x=border3+totalWidth/2,y=20, height=20)
		labelRv.place(x=border3+totalWidth/2,y=40, height=20)
		labelCc.place(x=border3+totalWidth/2,y=60, height=20)

		
		res = str(tone_pot['R']) + "&" + str(volume_pot['R'])
		return res

def lineToJSON(line):
	modeVar = True
	result = "{"
	var = ""
	value = ""
	for c in line:
		if modeVar:
			if c != '=':
				var += c
			else: 
				modeVar = False
		else:
			if c != ',' and c != '\n':
				value += c
			else:
				result += "\"" + var + "\":" + value + ", " 
				modeVar = True
				var = ""
				value = ""
	return result

def getCircuits(measured):
	global aux_c_names
	if (measured):
		action = "list_measured"
	else:
		action = "list"
	try:
		f = urllib2.urlopen(urlDirection + "/circuit/" + action + "/")
		j = json.load(f)
		aux_c_names = j['c_names']
		c_names = []
		for c in aux_c_names:
			c_names.append(c['id'].encode('utf-8'))
		f.close()
	except urllib2.HTTPError, e:
		print(lang["http_error"] + ":")
		print(e)
		root.destroy()
	except urllib2.URLError, e:
		print(lang["url_error"] + ":")
		print(e)
		root.destroy()
	return c_names

def saveCircuit(action):
	global message
	ser.write(message)
	textVar.set(lang["measuring"])
	console.update()
	line = ser.readline() ###"Conecte el circuito de medida de volumen a la pastilla"###
	textVar2.set(lang["connect"])
	console2.update()
	print lang["connect"]
	line = ser.readline() ###"Golpee la tercera cuerda (G)..."###
	textVar2.set(lang["gstring"])
	console2.update()
	print lang["gstring"]

	line = ser.readline()
	print line
	res = lineToJSON(line)
	res += "\"name\":\"" + name + "\"}"
	res = json.loads(res)

    ### Cp multiply by 10e-12 ###
	Cp = res['Cp']*math.pow(10, -12)

	textVar2.set("Rp: " + str(res['Rp']) + ", Lp: " + str(res['Lp']) + 
			   ", Cp: " + str(Cp) + ", Rpp: " + str(res['Rpp']) + ", Vol: " + str(res['Vol']) )

	textVar.set(lang["success"])
	try:
		req = urllib2.Request(urlDirection + "/circuit/" + action + "/")
		req.add_header('Content-Type', 'application/json')
		response = urllib2.urlopen(req, json.dumps(res))
		button.bind('<Button-1>', moar)
		button.configure(text=lang["more_measures"])
	except urllib2.HTTPError, e:
		print(lang["http_error"] + ":")
		print(e)
		root.destroy()
	except urllib2.URLError, e:
		print(lang["url_error"] + ":")
		print(e)
		root.destroy()

def optionChange(event):
	global name, aux_c_names, message
	name = w.cget("text")
	for c in aux_c_names:
		if(name == c['id'].encode('utf-8')):
			message = drawTemplate(c)
			break

def getLang(lang):
	if lang == "English":
		return EN
	elif lang == "Castellano":
		return CAST
	else:
		return CAT

def langChange(event):
	global lang, button, textVar
	lang = langOption.cget("text")
	lang = getLang(lang)
	button.configure(text=lang["enter"])
	textVar.set(lang["welcome"])
		

def measureUpdate(event):
	global name 
	name = w.cget("text")
	if(name == lang["select_circuit"]):
		print(lang["not_circuit"])
		textVar2.set(lang["not_circuit"])
	else:
		saveCircuit("update")

def moar(event):
	global frame
	frame.destroy()
	root.geometry(windowSize)
	initMore("")

def moar2(event):
	lang = langOption.cget("text")
	if lang != "...":
		global frame
		frame.destroy()
		root.geometry(windowSize)
		initMore("")

def initMore(message):
	textVar.set(lang["select_circuit"])
	textVar2.set(message)
	global w, p_names
	p_names = getCircuits(True)
	if len(p_names) == 0:
		textVar2.set(lang["no_circuits"])
		p_names = ["", ""]
		w = OptionMenu(None, option, *p_names)
	else:
		w = OptionMenu(None, option, *p_names, command=optionChange)
	w.pack()
	option.set(lang["select_circuit"])		
	w.place(x=200+border, y=vMiddle-textWidth+border2, height=30, width=200)
	w.configure(background="black", fg="white", highlightbackground="white")

	button.configure(text=lang["start_measure"])
	button.bind('<Button-1>', measureUpdate)
	
	button3.bind('<Button-1>', moar)
	button3.configure(text=lang["cancel"])
	

def initLanguage():
	textVar.set("Welcome to SAN. First select a language.")
	button.bind('<Button-1>', moar2)
	button.configure(text="Enter")
	button.pack()
	button.place(x=border, y=vMiddle-textWidth+border2, width=200)
	langOption.pack()
	option2.set("...")		
	langOption.place(x=200+border, y=vMiddle-textWidth+border2, height=30, width=200)
	langOption.configure(background="black", fg="white", highlightbackground="white")
	
def initGUI():
	root.geometry(windowSize)
	root.title("SAN")
	console = Label(None, textvariable=textVar, justify="left", bg="white", font="Verdana 10 bold")
	console.pack()
	console.place(x=border, y=vborder, height=textWidth, width=500)
	console2 = Label(None, textvariable=textVar2, justify="left", bg="white", font="Verdana 10")
	console2.pack()
	console2.place(x=border, y=totalHeight-textWidth+border2/2, height=textWidth, width=500)
	button3.pack()
	button3.place(x=400+border,y=vMiddle-textWidth+border2, width=100)
	
	initLanguage()

root = Tk()
root.resizable(0,0)
root.configure(background="white")
p_names = ["", ""]
lang_names = ["English", "Castellano", "Catal" + unichr(0xe0)]
option = StringVar()
textVar = StringVar()
textVar2 = StringVar()
option2 = StringVar()
w = OptionMenu(None, option, *p_names)
langOption = OptionMenu(None, option2, *lang_names, command=langChange)
console = Label(None)
console2 = Label(None)
button = Button(None, bg="black", fg="white", highlightbackground="white")
button2 = Button(None, bg="black", fg="white", highlightbackground="white")
button3 = Button(None, bg="black", fg="white", highlightbackground="white")
frame = Frame(None, bg="white")
initGUI()
root.mainloop()




