/**
 * Web socket client: when a web socket msg is received from the backend-->update the temperature value
 * on index.html
 */

const wsc = new WebSocket('ws://localhost:8080');
let date = new Date();
$('#readOnlyInput1').val(date.toDateString());
$('#readOnlyInput2').val(date.toLocaleTimeString());

setInterval(() => {
    date = new Date();
    $('#readOnlyInput1').val(date.toDateString());
}, 36000000);

setInterval(() => {
    date = new Date();
    $('#readOnlyInput2').val(date.toLocaleTimeString());
}, 1000);

wsc.onopen = () => {
    console.log('Web Socket client waiting for data from server on port 8080...');
};

wsc.onmessage = (msg) => {

    console.log(`received ${msg.data} from websocket`);
    $('#temperature').text(msg.data + "°C");
};
