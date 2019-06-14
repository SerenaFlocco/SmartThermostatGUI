#!/usr/bin/env python

import paho.mqtt.client as paho
import Adafruit_DHT as dht
import time
broker = "localhost"
port = 1883
temperature = 0
dht_pin = 4 #pin


# publisher callback
def on_publish(client,userdata,result):
	#print("...publishing")
	pass

publisher = paho.Client("TemperaturePublisher");
publisher.on_publish = on_publish
publisher.connect(broker,port)


while True:
	#read temp and hum
	h,t = dht.read_retry(dht.DHT22, dht_pin)
	publisher.publish("temperature",t)
	print(t)
	time.sleep(10)
