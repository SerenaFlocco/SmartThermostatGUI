/**
 * Web socket client: when a web socket msg is received from the backend-->update the temperature value
 * on index.html
 */

const wsc = new WebSocket('ws://localhost:8080');
//active contains the last pressed button, i.e. the current active mode in the 
//thermostat: can be 'man', 'prog', 'off' or 'antifreeze'
var active = '';
//variable in wich the last temperature set manually is stored: it is set to 18 by default
var last_man_temperature = 18.0;
//variable which contains the value of the temperature to be reached
var temp_to_reach = 0.0;
//variable containing the current temperature value received by the sensor
var current_temperature = 0.0;
//variable which registers if the heating system is on or off: it is 0 if it's off, 1 otherwise
var heating = 0;
//flag to change temperature shown during manual setting
var flag = 0;

//check periodically if the set temperature is greater than the current one: 
//if yes switch on the heating system
setInterval(() => {
    if(active == 'man' && flag == 1) {
        console.log('Reset css and temperature.');
        // reset CSS
        $('#temperature').removeClass('text-primary');
        //reset temperature
        if(current_temperature != 0.0)
            $('#temperature').text(current_temperature.toFixed(1) + "°C");
        //reset flag
        flag = 0;
        temp_to_reach = last_man_temperature;
    }
    if(active != 'off') {
        if((temp_to_reach > current_temperature) && heating == 0) {
            $('#on').text('whatshot'); //switch on
            heating = 1;
        }
    }
}, 20000);

//check periodically if the set temperature is less or equal than the current one: 
//if yes switch off the heating system
setInterval(() => {
    if(active =='man' && flag == 1) {
        console.log('Reset css and temperature.');
        // reset CSS
        $('#temperature').removeClass('text-primary');
        //reset temperature
        $('#temperature').text(current_temperature.toFixed(1) + "°C");
        //reset flag
        flag = 0;
        temp_to_reach = last_man_temperature;
    }
    if((temp_to_reach <= current_temperature) && heating==1) {
        $('#on').empty(); //switch off
        heating = 0;
    }
}, 20000);

//clock and calendar functions
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

//WebSocket communication with the backend
wsc.onopen = () => {
    console.log('Web Socket client waiting for data from server on port 8080...');
};

//When a new temperature is received, update the html page
wsc.onmessage = (msg) => {
    console.log(`received ${msg.data} from websocket`);
    current_temperature = Number.parseFloat(msg.data);
    if(active != 'off')
        $('#temperature').text(current_temperature.toFixed(1) + "°C");
    //console.log(typeof(current_temperature));
};

//When mode is 'man', check the temperature periodically to switch on/off the heating system
$('#man').on('click', () => {
    active = 'man';
    $('#temperature').text(current_temperature.toFixed(1) + "°C");
});

//increase of 0.1 the value of the current temperature when + is clicked
$('#increase').on('click', () => {
    if(active == 'man') {
        if(!$('#temperature').hasClass('text-primary'))
            $('#temperature').addClass('text-primary');
        last_man_temperature += 0.1;
        $('#temperature').text(last_man_temperature.toFixed(1) + "°C"); //round to first decimal digit
        flag = 1;
    }
});

//decrease of 0.1 the value of the current temperature when - is clicked
$('#decrease').on('click', () => {
    if(active == 'man') {
        if(!$('#temperature').hasClass('text-primary'))
            $('#temperature').addClass('text-primary');
        last_man_temperature -= 0.1;
        $('#temperature').text(last_man_temperature.toFixed(1) + "°C"); //round to first decimal digit
        flag = 1;
    }
});

//Ask to the teacher
$('#off').on('click', () => {
    active = 'off';
    $('#temperature').text('OFF');
    $('#on').empty();
    heating = 0;
});

$('#antifreeze').on('click', () => {
    active = 'antifreeze';
    $('#temperature').text(current_temperature.toFixed(1) + "°C");
    temp_to_reach = 10.0;
});

$('#prog').on('click', () => {
    active = 'prog';
    $('#temperature').text(current_temperature.toFixed(1) + "°C");
});