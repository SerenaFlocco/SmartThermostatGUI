var awsIot = require('aws-iot-device-sdk');
const timestamp = require('time-stamp');
const path      = require('path');

//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts 
// to connect with a client identifier which is already in use, the existing 
// connection will be terminated.
//

// mosquitto_sub -d -h a3cezb6rg1vyed-ats.iot.us-west-2.amazonaws.com -p 8443 --cafile root-CA.crt --cert PL-student.cert.pem --key PL-student.private.key -t pl19/notifications
// openssl s_client -connect a3cezb6rg1vyed-ats.iot.us-west-2.amazonaws.com:8443 -CAfile root-CA.crt -cert PL-student.cert.pem -key PL-student.private.key


var device = awsIot.device({
  keyPath: path.resolve(__dirname + '/../certs/PL-student.private.key'),
  certPath: path.resolve(__dirname + '/../certs/PL-student.cert.pem'),
  caPath: path.resolve(__dirname + '/../certs/root-CA.crt'),
  clientId: 'pl19-11',
  host: 'a3cezb6rg1vyed-ats.iot.us-west-2.amazonaws.com',
  port: '8883',
  expires: 600,
  protocol: 'mqtts'
});


    //device.subscribe('pl19/debug');
    //device.publish('pl19/debug', JSON.stringify({ test_data: 1}));


  /*device
      .on('connect', function() {
         console.log('connect');
         device.subscribe('pl19/notification');
      });
   device
      .on('close', function() {
         console.log('close');
      });
   device
      .on('reconnect', function() {
         console.log('reconnect');
         device.subscribe('pl19/notification');
      });
   device
      .on('offline', function() {
         console.log('offline');
      });
   device
      .on('error', function(error) {
         console.log('error', error);
      });
   device
      .on('message', function(topic, payload) {
         console.log('message', topic, payload.toString());
      });*/

function sendEvent(event_id, device_mac, event){
    jsonObject = {
        event_id: event_id,
        timestamp: timestamp('YYYY-MM-DD HH:mm:ss.ms'),
        device_mac: device_mac,
        event: event
    }
    device.publish('pl19/event', JSON.stringify(jsonObject));
    console.log("sending to event...")
}

module.exports = {
   sendEvent: sendEvent
}
