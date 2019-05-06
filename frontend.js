/**
 * Web socket client: when a web socket msg is received from the backend-->update the temperature value
 * on index.html
 */

const wsc = new WebSocket('ws://localhost:8080');

wsc.onopen = () => {
    console.log('Web Socket client waiting for data from server on port 8080...');
};

wsc.onmessage = (msg) => {

    console.log(`received ${msg.data} from websocket`);
    $('#temperature').text(msg.data + "°C");
};
