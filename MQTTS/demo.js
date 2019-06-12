var awsIot = require('aws-iot-device-sdk');

//
// Replace the values of '<YourUniqueClientIdentifier>' and '<YourCustomEndpoint>'
// with a unique client identifier and custom host endpoint provided in AWS IoT.
// NOTE: client identifiers must be unique within your AWS account; if a client attempts 
// to connect with a client identifier which is already in use, the existing 
// connection will be terminated.
//


var device = awsIot.device({
  keyPath: './PL-student.private.key',
  certPath: './PL-student.cert.pem',
  caPath: './root-CA.crt',
  clientId: 'PL19-11',
  host: 'a3cezb6rg1vyed-ats.iot.us-west-2.amazonaws.com',
  port: '8883'
});
console.log("New device created...");


    //device.subscribe('pl19/notification');
    //device.publish('pl19/event', JSON.stringify({ test_data: 1}));


  device
      .on('connect', function() {
         console.log('connect');
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