var awsIot = require('aws-iot-device-sdk');

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
  keyPath: './PL-student.private.key',
  certPath: './PL-student.cert.pem',
  caPath: './root-CA.crt',
  clientId: 'sdk-nodejs-5',
  host: 'a3cezb6rg1vyed-ats.iot.us-west-2.amazonaws.com',
  port: '8883',
  expires: 600,
  protocol: 'mqtts'
});
//console.log("New device created with id: basicPubSub");


    //device.subscribe('pl19/debug');
    //device.publish('pl19/debug', JSON.stringify({ test_data: 1}));


  device
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
      });
