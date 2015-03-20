import os
import urllib
import jinja2
import webapp2

from google.appengine.ext import ndb, db
from google.appengine.ext.ndb import polymodel
import json as simplejson

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

MEASURE_TABLE = 'default_bd'
CIRCUIT_TABLE = 'circuit_table'
PICKUP_TABLE = 'pickup_table'
POT_TABLE = 'pot_table'
PICKUP_IMG_TABLE = 'pickup_img_table'
POT_IMG_TABLE = 'pot_img_table'

CIRCUIT_TYPES = ["serial_1_2"]

## ERRORS ##
NO_ERROR = 0
ERNO_ELEM_LINKED = 1
ERNO_EMPTY_NAME = 2
ERNO_NAME_TOO_LONG = 3
ERNO_NAME_AN = 4
ERNO_PARAM_NUM = 5
ERNO_PARAM_NEG = 6
ERNO_CIRCUIT_EXISTS = 7
ERNO_IMG_NOT_LOADED = 8
ERNO_IMG_EMPTY = 9
ERNO_IMG_TOO_LARGE = 10
ERNO_NOT_IMG = 11
ERNO_NO_IMG_SELECTED = 12
ERNO_IMG_EXISTS = 13
ERNO_PICKUP_EXISTS = 14
ERNO_POT_EXISTS = 15
ERNO_CIRCUIT_NOT_EXISTS = 16
ERNO_MEASURE_NOT_EXISTS = 17
ERNO_PICKUP_NOT_EXISTS = 18
ERNO_IMG_NOT_EXISTS = 19
ERNO_POT_NOT_EXISTS = 20

def measure_key(measure_name):
	return ndb.Key('Measure', measure_name)

def circuit_key(circuit_name):
	return ndb.Key('Circuit', circuit_name)

def pickup_key(pickup_name):
	return ndb.Key('Pickup', pickup_name)

def pot_key(pot_name):
	return ndb.Key('Potentiometer', pot_name)

def img_key(img_name):
	return ndb.Key('Image', img_name)

class Measure(polymodel.PolyModel): 
	name = ndb.StringProperty()
	date = ndb.DateTimeProperty(auto_now_add=True)
	q = ndb.FloatProperty(indexed=False)
	f = ndb.IntegerProperty(indexed=False)

class M_Serial_1_2(Measure):
	x = ndb.FloatProperty(indexed=False)
	y = ndb.FloatProperty(indexed=False)

class Circuit(polymodel.PolyModel):
	Pickup = ndb.StringProperty()
	measured = ndb.BooleanProperty()
	
class C_Serial_1_2(Circuit):
	Volume = ndb.StringProperty()	
	Tone = ndb.StringProperty()
	Cc = ndb.FloatProperty(indexed=False)

class Image(ndb.Model):
	img = ndb.BlobProperty(indexed=False)

class Pickup(ndb.Model):
	Rp = ndb.FloatProperty(indexed=False)
	Lp = ndb.FloatProperty(indexed=False)
	Cp = ndb.FloatProperty(indexed=False)
	Rpp = ndb.FloatProperty(indexed=False)
	Vol = ndb.IntegerProperty(indexed=False)
	link_img = ndb.StringProperty(indexed=False)
	measured = ndb.BooleanProperty()	

class Potentiometer(ndb.Model):
	R = ndb.FloatProperty(indexed=False)
	tone = ndb.BooleanProperty()
	Ct = ndb.FloatProperty(indexed=False)
	link_img = ndb.StringProperty(indexed=False)
	
class MainPage(webapp2.RequestHandler):
    def get(self):
		template = JINJA_ENVIRONMENT.get_template('index.html')
		self.response.write(template.render())

class WikiHandler(webapp2.RequestHandler):
	def get(self, language):
		if(language == "en"):
			template = JINJA_ENVIRONMENT.get_template("en.html")
			self.response.write(template.render())
		elif (language == "cat"):
			template = JINJA_ENVIRONMENT.get_template("cat.html")
			self.response.write(template.render())
		elif (language == "cast"):
			template = JINJA_ENVIRONMENT.get_template("cast.html")
			self.response.write(template.render())

class SourceHandler(webapp2.RequestHandler):
	def get(self):
		template = JINJA_ENVIRONMENT.get_template('source.html')
		self.response.write(template.render())

class ElementHandler(webapp2.RequestHandler):
	def get(self, action):
		if(action=='list'):
			pickup_query = Pickup.query(ancestor=pickup_key(PICKUP_TABLE))
			pickups = pickup_query.fetch()
			pickup_names = []
			for p in pickups:
				pickup_names.append(PickupHandler().serialize(p))
			
			pot_query = Potentiometer.query(ancestor=pot_key(POT_TABLE))
			pots = pot_query.fetch()
			pot_names = []
			for p in pots:
				pot_names.append(PotHandler().serialize(p))
			template_values = {'pickup_names': pickup_names, 'pot_names': pot_names}
			template = JINJA_ENVIRONMENT.get_template('all_elements.html')
			self.response.write(template.render(template_values))
	

class PotHandler(webapp2.RequestHandler):
	def serialize(self, p):
		tone = 0
		if p.tone:
			tone = 1
		Ct = 0
		if p.Ct:
			Ct = p.Ct
		link_img = ""
		if p.link_img:
			link_img = p.link_img
		result = {'R': p.R, 'tone': tone, 'Ct': Ct, 'name': p.key.id(), 'link_img':str(link_img)}
		return result
	def get(self, action):
		if(action == 'new'):
			img_names = ImageHandler().ImageList(POT_IMG_TABLE)	
			template_values = {'img_names': img_names}	
			template = JINJA_ENVIRONMENT.get_template('new_potentiometer.html')
			self.response.write(template.render(template_values))
	
	def post(self, action):
		if (action == 'save'):	
			link_img = str(self.request.get('link_img'))
			name = self.request.get('name')
			p = Potentiometer.get_by_id(id=name, parent=pot_key(POT_TABLE))
			if not p:
				p = Potentiometer(id=name, parent=pot_key(POT_TABLE))
				if (self.request.get('potType') == 'volume'):
					p.tone = False
				else:					
					p.Ct = float(self.request.get('Ct'))
					p.tone = True
				p.R = float(self.request.get('R'))
				p.link_img = str(link_img)
				p.put()
			else:
				self.error(400)
				self.response.out.write(ERNO_POT_EXISTS)
				return
			

		elif(action == 'load'):
			pname = self.request.get('name')
			p = Potentiometer.get_by_id(id=pname, parent=pot_key(POT_TABLE))
			p = self.serialize(p)
			json = simplejson.dumps(p)
			self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
			self.response.write(json)
		elif (action == 'delete'):
			pname = self.request.get('name')
			p = Potentiometer.get_by_id(id=pname, parent=pot_key(POT_TABLE))
			if p:
				i = CircuitHandler().getPotCircuits(pname)
				if len(i) == 0:
					p.key.delete()
				else:
					self.error(403)
					self.response.out.write(ERNO_ELEM_LINKED)
					
			else:
				self.error(404)
				self.response.out.write(ERNO_POT_NOT_EXISTS)

class ImageHandler(webapp2.RequestHandler):
	def ImageList(self, db):
		img_query = Image.query(ancestor=img_key(db))
		imgs = img_query.fetch()
		img_names = []
		for i in imgs:
			img_names.append(i.key.id())
		return img_names

	def saveImage(self, name, img, db):
		i = Image.get_by_id(id=name, parent=img_key(db))
		if not i:
			i = Image(id=name, parent=img_key(db))
			i.img = img
			i.put()
			return True
		else:
			return False

	def get(self, action, param):
		if (action == "load"):
			if (param == "pickup"):
				db = PICKUP_IMG_TABLE
			elif(param == "pot"):
				db = POT_IMG_TABLE
			name = self.request.get('id')
			i = Image.get_by_id(id=name, parent=img_key(db))
			if i:
				i = {'id': i.key.id(), 'img':i.img}
				json = simplejson.dumps(i)
				self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
				self.response.write(json)
			else:
				self.error(404)
				self.response.out.write(ERNO_IMG_NOT_EXISTS)

class PickupHandler(webapp2.RequestHandler):
	def serialize(self, p):
		measured = 0
		Rp = p.Rp
		if not p.Rp:
			Rp = 0
		Lp = p.Lp
		if not p.Lp:
			Lp = 0
		Cp = p.Cp
		if not p.Cp:
			Cp = 0
		Rpp = p.Rpp
		if not p.Rpp:
			Rpp = 0
		Vol = p.Vol
		if not p.Vol:
			Vol = 0
		if p.measured:
			measured = 1
		link_img = ""
		if p.link_img:
			link_img = p.link_img

		result = {'Rp': Rp, 'Lp': Lp, 'Cp': Cp, 'Rpp': Rpp, 'Vol': Vol, 
				  'measured': measured, 'name': p.key.id(), 'link_img':str(link_img)}
		return result
	def getPickupById(self, name):
		p = Pickup.get_by_id(id=name, parent=pickup_key(PICKUP_TABLE))
		if p:
			return self.serialize(p)
		else:
			return
	def updatePickup(self, request, name, measured):
		p = Pickup.get_by_id(id=name, parent=pickup_key(PICKUP_TABLE))
		if p:
			p.Rp = float(request.get('Rp'))
			p.Lp = float(request.get('Lp'))
			p.Cp = float(request.get('Cp'))
			p.Rpp = float(request.get('Rpp'))
			p.Vol = int(request.get('Vol'))
			p.measured = measured
			p.put()
			CircuitHandler().updateCircuits(name)
		else:
			self.error(400)
			self.response.out.write(ERNO_PICKUP_NOT_EXISTS)
	def savePickup(self, request, measured):
		link_img = str(request.get('link_img'))
		b = False
		if measured:
			name = request.get('name')
			p = Pickup(id=name, parent=pickup_key(PICKUP_TABLE))
			p.measured = measured
			p.link_img = str(link_img)
			p.put()
		
	def get(self, action):
		if(action == 'new'):
			img_names = ImageHandler().ImageList(PICKUP_IMG_TABLE)	
			template_values = {'img_names': img_names}	
			template = JINJA_ENVIRONMENT.get_template('new_pickup.html')
			self.response.write(template.render(template_values))		
		
	def post(self, action):
			if (action == 'save'):
				name = self.request.get('name')
				p = Pickup.get_by_id(id=name, parent=pickup_key(PICKUP_TABLE))
				if not p:
					if (self.request.get('measured') == 'true'):
						self.savePickup(self.request, True)
					else:					
						self.savePickup(self.request, False)
				else:
					self.error(400)
					self.response.out.write(ERNO_PICKUP_EXISTS)
					return
			elif(action == 'load'):
				pname = self.request.get('name')
				p = Pickup.get_by_id(id=pname, parent=pickup_key(PICKUP_TABLE))
				p = self.serialize(p)
				json = simplejson.dumps(p)
				self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
				self.response.write(json)
			elif (action == 'delete'):
				pname = self.request.get('name')
				p = Pickup.get_by_id(id=pname, parent=pickup_key(PICKUP_TABLE))
				if p:
					i = CircuitHandler().getPickupCircuits(pname)
					if len(i) == 0:
						p.key.delete()
					else:
						self.error(403)
						self.response.out.write(ERNO_ELEM_LINKED)
				else:
					self.error(404)
					self.response.out.write(ERNO_PICKUP_NOT_EXISTS)

class MeasureHandler(webapp2.RequestHandler):
	def getMeasureType(self, name):
		m = Measure.get_by_id(id=name, parent=measure_key(MEASURE_TABLE))
		if m: 
			if isinstance(m,M_Serial_1_2):
				return 'serial_1_2'
			else:
				return 'custom'
		else:
			return None
	def serialize(self, m):
		pickup = CircuitHandler().getCircuitPickup(m.name)
		if self.getMeasureType(m.key.id()) == 'serial_1_2':
			result = {'id': str(m.key.id()), 
					  'name': m.name, 
					  'date': str(m.date), 
					  'f': m.f, 
					  'q': str(m.q), 
					  'x': m.x, 
					  'y': m.y,
					  'pickup': pickup['name'],
					  'vol': pickup['Vol'],
					  'type': 'serial_1_2'}
			return result
		else:
			return None
	def post(self, action, param1):
		if (action == 'save'):
			name = self.request.get('name')
			if CircuitHandler().getCircuitType(name) == 'serial_1_2':
				m = M_Serial_1_2(parent=measure_key(MEASURE_TABLE))
				m.name = name
				m.q = float(self.request.get('q'))
				m.f = int(self.request.get('f'))
				m.x = float(self.request.get('x'))
				m.y = float(self.request.get('y'))
				m.put()
				template_values = {'id':m.key.id()}
				json = simplejson.dumps(template_values)
				self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
				self.response.write(json)
		elif (action == 'load'):
			mname = self.request.get('name')
			m = Measure.get_by_id(id=int(mname), parent=measure_key(MEASURE_TABLE))
			m = self.serialize(m)
			json = simplejson.dumps(m)
			self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
			self.response.write(json)
		elif (action == 'delete'):
			mname = self.request.get('name')
			m = Measure.get_by_id(id=int(mname), parent=measure_key(MEASURE_TABLE))
			if m:
				m.key.delete()
			else:
				self.error(404)
				self.response.out.write(ERNO_MEASURE_NOT_EXISTS)

	def get(self, action, param1):
		if(action == 'new'):
			c_names = CircuitHandler().getCircuitNames()
			template_values = {'c_names': c_names}
			template = JINJA_ENVIRONMENT.get_template('new_measure.html')
			self.response.write(template.render(template_values))
		elif(action == 'list'):
			if (param1 == ""):
				measures_query = Measure.query(ancestor=measure_key(MEASURE_TABLE)).order(-Measure.date)
				measures = measures_query.fetch()
				m_names = []
				for m in measures:
					m = self.serialize(m)
					m_names.append(m)
				template_values = {'m_names':m_names}
				template = JINJA_ENVIRONMENT.get_template('all_measures.html')
				self.response.write(template.render(template_values))
			else:
				m = Measure.get_by_id(id=int(param1), parent=measure_key(MEASURE_TABLE))
				if m:
					measures_query = Measure.query(ancestor=measure_key(MEASURE_TABLE)).order(-Measure.date)
					measures = measures_query.fetch()
					m_names = []
					for m1 in measures:
						res = {'name': m1.name, 'pickup': CircuitHandler().getCircuitPickup(m1.name)['name'], 'id': m1.key.id()}
						m_names.append(res)
					template_values = {
						'm': self.serialize(m),
						'm_names':m_names,
					}
					template = JINJA_ENVIRONMENT.get_template('measure_detail.html')
					self.response.write(template.render(template_values))
				else:
					self.error(404)
					self.response.out.write(ERNO_MEASURE_NOT_EXISTS)
			

class CircuitHandler(webapp2.RequestHandler):
	def getCircuitType(self, name):
		c = Circuit.get_by_id(id=name, parent=circuit_key(CIRCUIT_TABLE))
		if c: 
			if isinstance(c,C_Serial_1_2):
				return 'serial_1_2'
			else:
				return 'custom'
		else:
			return None
	def updateCircuits(self, name):
		circuits = self.getPickupCircuits(name)
		for c in circuits:
			c.measured = False
			c.put()
	def getCircuitNames(self):
		circuits_query = Circuit.query(Circuit.measured == False, ancestor=circuit_key(CIRCUIT_TABLE))
		circuits = circuits_query.fetch()
		c_names = []
		for c in circuits:
			c_names.append(c.key.id())
		return c_names
	def getPickupCircuits(self, pname):
		circuits_query = Circuit.query(Circuit.Pickup == pname, ancestor=circuit_key(CIRCUIT_TABLE))
		circuits = circuits_query.fetch()
		return circuits
	def getPotCircuits(self, pname):
		### CHECK FOR ALL CIRCUIT MODELS ###
		circuits_query = C_Serial_1_2.query(ndb.OR(C_Serial_1_2.Tone == pname, 
				C_Serial_1_2.Volume == pname), 
				ancestor=circuit_key(CIRCUIT_TABLE))
		circuits = circuits_query.fetch()
		return circuits
	def getCircuitPickup(self, name):
		c = Circuit.get_by_id(id=name, parent=circuit_key(CIRCUIT_TABLE))
		if c:
			pickup = PickupHandler().getPickupById(c.Pickup)
			return pickup
		else:
			return
	def get(self, action, name):
		if(action == 'new'):
			if (name == ""):
				template_values = {'types':CIRCUIT_TYPES}
				template = JINJA_ENVIRONMENT.get_template('new_circuit.html')
				self.response.write(template.render(template_values))
			elif (name == 'serial_1_2'):				
				pickup_query = Pickup.query(ancestor=pickup_key(PICKUP_TABLE))
				pickups = pickup_query.fetch()
				p_names = []
				for p in pickups:
					p_names.append(p.key.id())
			
				pot_query = Potentiometer.query(ancestor=pot_key(POT_TABLE))
				pots = pot_query.fetch()
				t_names = []
				v_names = []
				for p in pots:
					if p.tone:
						t_names.append(p.key.id())
					else:
						v_names.append(p.key.id())
				
				m = {'p_names': p_names, 't_names':t_names, 'v_names':v_names}
				json = simplejson.dumps(m)
				self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
				self.response.write(json)

		elif(action == 'list'):
			if(name == ""):
				circuits_query = Circuit.query(ancestor=circuit_key(CIRCUIT_TABLE))
				circuits = circuits_query.fetch()
				c_names = []
				for c in circuits:
					c = self.serialize(c)
					c_names.append(c)
				template_values = {'c_names': c_names}
				template = JINJA_ENVIRONMENT.get_template('all_circuits.html')
				self.response.write(template.render(template_values))
				
			else:	
				c = Circuit.get_by_id(id=name, parent=circuit_key(CIRCUIT_TABLE))
				if c:
					measures_query = Measure.query(Measure.name == name).order(-Measure.date)
					measures = measures_query.fetch()
					m_names = []
					for m in measures:
						m = MeasureHandler().serialize(m)
						m_names.append(m)
					template_values = {'c': self.serialize(c), 'm_names':m_names}
					template = JINJA_ENVIRONMENT.get_template('circuit_detail.html')
					self.response.write(template.render(template_values))
				else:
					self.error(404)
					self.response.out.write(ERNO_CIRCUIT_NOT_EXISTS)
		elif(action == 'list_measured'):
			circuit_query = Circuit.query(Circuit.measured == True, ancestor=circuit_key(CIRCUIT_TABLE))
			circuits = circuit_query.fetch()
			c_names = []
			for c in circuits:
				res = self.serialize(c)
				c_names.append(res)
			template_values = {'c_names': c_names}
			json = simplejson.dumps(template_values)
			self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
			self.response.write(json)

	def serialize(self, c):
		if self.getCircuitType(c.key.id()) == 'serial_1_2':
			measured = 0
			if c.measured:
				measured = 1
			result = {'id': str(c.key.id()), 
					  'pickup': str(c.Pickup), 
					  'tone': str(c.Tone), 
					  'volume': str(c.Volume), 
					  'Cc': c.Cc, 
					  'type':'serial_1_2',
					  'measured': measured}
			return result
		else:
			return None
		
	def post(self, action, param1):
		if (action == 'save'):
			name = self.request.get('name')
			c = Circuit.get_by_id(id=name, parent=circuit_key(CIRCUIT_TABLE))
			if not c:
				circuitType = self.request.get('type')
				if (circuitType == 'serial_1_2'):
					c = C_Serial_1_2(id=name, parent=circuit_key(CIRCUIT_TABLE))
					c.Pickup = str(self.request.get('pickup'))
					c.Volume = str(self.request.get('volume'))
					c.Tone = str(self.request.get('tone'))
					c.Cc = float(self.request.get('Cc'))
					if (self.request.get('measured') == 'true'):
						c.measured = True
					else:
						c.measured = False
					c.put()
			else:
				self.error(400)
				self.response.out.write(ERNO_CIRCUIT_EXISTS)
				return
		elif (action == 'update'):
				request = simplejson.loads(self.request.body)
				cname = request.get('name')
				c = Circuit.get_by_id(id=cname, parent=circuit_key(CIRCUIT_TABLE))
				if c:
					c.measured = False
					PickupHandler().updatePickup(request, c.Pickup, False)
					c.put()
				else:
					self.error(400)
					self.response.out.write(ERRNO_CIRCUIT_NOT_EXISTS)
		elif(action == 'load'):
			cname = self.request.get('name')
			c = Circuit.get_by_id(id=cname, parent=circuit_key(CIRCUIT_TABLE))
			c = self.serialize(c)
			json = simplejson.dumps(c)
			self.response.headers.add_header('content-type', 'application/json', charset='utf-8')
			self.response.write(json)
		elif (action == 'delete'):
			cname = self.request.get('name')
			c = Circuit.get_by_id(id=cname, parent=circuit_key(CIRCUIT_TABLE))
			if c:
				c.key.delete()
				measures_query = Measure.query(Measure.name == cname)
				measures = measures_query.fetch()
				for m in measures:
					m.key.delete()
			else:	
				self.error(404)
				self.response.out.write(ERNO_CIRCUIT_NOT_EXISTS)
	
application = webapp2.WSGIApplication([
    ('/', MainPage),
	('/measure/([^/]+)/([^/]*)', MeasureHandler),
	('/circuit/([^/]+)/([^/]*)', CircuitHandler),
	('/pickup/([^/]+)/', PickupHandler),
	('/image/([^/]+)/([^/]*)/', ImageHandler),
	('/pot/([^/]+)/', PotHandler),
	('/element/([^/]+)/', ElementHandler),
	('/wiki/([^/]+)/', WikiHandler),
	('/source/', SourceHandler),
], debug=True)



