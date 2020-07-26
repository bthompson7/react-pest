import os,requests,keras,sys
from flask import Flask,render_template,jsonify, request
from twisted.internet import reactor
from twisted.web.proxy import ReverseProxyResource
from twisted.web.resource import Resource
from twisted.web.server import Site
from twisted.web.wsgi import WSGIResource
import numpy as np
from keras.models import load_model
from skimage.io import imread
from skimage.transform import resize
import json,re,h5py,base64,keras
from io import BytesIO
from PIL import Image
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.errorhandler(404)
def page_not_found(e):
    return jsonify(error="Resource not found"), 404

'''
API that attempts to guess the insect in an image

    Returns:
        the guess in json

Make sure to send the api an image in base64 and then turn that into json so that
the api can read it

Then it would return:

200 OK
{"img_guess":"Hornworm","is_pest":"yes"}

'''

inputTest = re.compile("^data:image")
pests = ["Hornworm","Japanese Beetle","Browntail Moth"]
@app.route('/detect', methods=['POST'])
def detectInsect():
	print("Incoming request...")
	jsonData = request.get_json()
	image_data = jsonData['img']
	inputResult = inputTest.match(image_data)
	if inputResult == None:
		print("Invalid Input")
		return jsonify(error="Invalid input"), 400
	else:
		print("Input is good")
	image_data2 = re.sub(r'[^data:image/[jpeg|jpg|png]+;base64]{1}', '', image_data)
	image_data2 = image_data.replace("data:image/jpeg;base64,", "")
	#print(image_data2) #for debugging 

	image_bytes = str.encode(image_data2)
	type(image_bytes)
	class_labels = {0: 'Browntail Moth', 1: 'Hornworm',2: 'Japanese Beetle', 3:'Ladybug'}
	model = load_model('insect_model2.h5')
	print("Reading image...\n")
	image_to_test = 'image_to_test.jpg'
	with open(image_to_test, "wb") as fh:
		 fh.write(base64.decodebytes(image_bytes))

	print("Detecting image...")
	img = imread(image_to_test)
	img = resize(img, (150, 150))
	img = np.expand_dims(img, axis=0)
	if(np.max(img)>1):
    		img = img/255.0
	pred = model.predict_classes(img,verbose=1)
	guess = class_labels[pred[0]]
	print("I think its a %s\n"%guess)

	is_pest = 'no'
	for insect in pests:
		if guess == insect:
			is_pest = 'yes'
	keras.backend.clear_session()
	return jsonify(img_guess=guess,is_pest=is_pest),200

resource = WSGIResource(reactor, reactor.getThreadPool(), app)
site = Site(resource)
reactor.listenTCP(3001, site)
reactor.run()

