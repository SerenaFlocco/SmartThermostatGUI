/**
 * Web socket client: when a web socket msg is received from the backend-->update the temperature value
 * on index.html
 */
const wsc = new WebSocket('ws://localhost:8080');
//active contains the last pressed button, i.e. the current active mode in the 
//thermostat: can be 'man', 'prog', 'off', 'antifreeze' or 'weekend'
var active = '';
//variable in wich the last temperature set manually is stored: it is set to 18 by default
var last_man_temperature = 18.0;
//variable which contains the value of the temperature to be reached
var temp_to_reach = 0.0;
//variable containing the current temperature value received by the sensor
var current_temperature = 0.0;
//antifreeze temperature, set to 10.0°C by default
var antifreeze_temp = 10.0;
//variable which registers if the heating system is on or off: it is 0 if it's off, 1 otherwise
var heating = 0;
//variable which registers if the cooling system is on or off: it is 0 if it's off, 1 otherwise
var cooling = 0;
//flag to change temperature shown during manual setting
var flag = 0;
//it can be 'summer' or 'winter' ('winter' is set by default)
var season = 'winter';
//timer used when the temperature is increased or decreased
var timer;
//parameters for the weekend mode; this are the default value
var weekend =  {from: parseDate('Friday', '7:00', 'p.m.'), to: parseDate('Sunday', '7:00', 'p.m.')};

//check periodically if the set temperature is greater than the current one: 
//if yes switch on the heating system
setInterval(() => {
    if(active != 'off' && flag == 0) {
        switch(season) {
            case 'winter':
                if((temp_to_reach > current_temperature) && season == 'winter' && heating == 0) {
                    $('#on').text('whatshot'); //switch on
                    heating = 1;
                };
            case 'summer':
                if((temp_to_reach < current_temperature) && season == 'summer' && cooling == 0) {
                    $('#on').text('toys'); //switch on
                    cooling = 1;
                };
        }
    }
}, 20000);

//check periodically if the set temperature is less or equal than the current one: 
//if yes switch off the heating system
setInterval(() => {
    if(active != 'off' && flag == 0) {
        switch(season) {
            case 'winter':
                if((temp_to_reach <= current_temperature) && heating==1) {
                    $('#on').empty(); //switch off
                    heating = 0;
                };
            case 'summer':
                if((temp_to_reach >= current_temperature) && cooling == 1) {
                    $('#on').empty(); //switch off
                    cooling = 0;
                };
        }
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
    if($('#loader').length)
        $('#loader').remove();
    if(flag == 0)
        $('#temperature').text(current_temperature.toFixed(1) + "°C");
};

//When mode is 'man', check the temperature periodically to switch on/off the heating system
$('#man').on('click', () => {
    active = 'man';
});

//increase of 0.1 the value of the current temperature when + is clicked
$('#increase').on('click', () => {
    if(active == 'man') {
        clearTimeout(timer);
        flag = 1;
        if(!$('#temperature').hasClass('text-primary'))
            $('#temperature').addClass('text-primary');
        timer = setTimeout(() => {
            console.log('Reset css and temperature.');
            // reset CSS
            $('#temperature').removeClass('text-primary');
            //reset temperature
            if(current_temperature != 0.0)
                $('#temperature').text(current_temperature.toFixed(1) + "°C");
            //reset flag
            flag = 0;
            temp_to_reach = last_man_temperature;
        }, 10000);
        last_man_temperature += 0.1;
        $('#temperature').text(last_man_temperature.toFixed(1) + "°C"); //round to first decimal digit
    }
});

//decrease of 0.1 the value of the current temperature when - is clicked
$('#decrease').on('click', () => {
    if(active == 'man') {
        clearTimeout(timer);
        flag = 1;
        if(!$('#temperature').hasClass('text-primary'))
            $('#temperature').addClass('text-primary');
        timer = setTimeout(() => {
            console.log('Reset css and temperature.');
            // reset CSS
            $('#temperature').removeClass('text-primary');
            //reset temperature
            if(current_temperature != 0.0)
                $('#temperature').text(current_temperature.toFixed(1) + "°C");
            //reset flag
            flag = 0;
            temp_to_reach = last_man_temperature;
        }, 10000);
        last_man_temperature -= 0.1;
        $('#temperature').text(last_man_temperature.toFixed(1) + "°C"); //round to first decimal digit
    }
});

$('#off').on('click', () => {
    active = 'off';
    $('#on').empty();
    heating = 0;
    cooling = 0;
});

$('#winter').on('click', () => {
    season = 'winter';
    if(cooling == 1) {
        $('#on').empty();
        cooling = 0;
    }
});

$('#summer').on('click', () => {
    season = 'summer';
    if(heating == 1) {
        $('#on').empty();
        heating = 0;
    }
});

$('#prog').on('click', () => {
    active = 'prog';
});

$('#increase_af').on('click', () => {
    clearTimeout(timer);
    flag = 1;
    if(!$('#temperature_af').hasClass('text-primary'))
        $('#temperature_af').addClass('text-primary');
    timer = setTimeout(() => {
        console.log('Reset css and temperature.');
        // reset CSS
        $('#temperature_af').removeClass('text-primary');
        //reset flag
        flag = 0;
    }, 10000);
    let tmp = Number.parseFloat($('#temperature_af').text());
    tmp += 0.1;
    $('#temperature_af').text(tmp.toFixed(1) + "°C"); //round to first decimal digit
});

$('#decrease_af').on('click', () => {
    clearTimeout(timer);
    flag = 1;
    if(!$('#temperature_af').hasClass('text-primary'))
        $('#temperature_af').addClass('text-primary');
    timer = setTimeout(() => {
        console.log('Reset css and temperature.');
        // reset CSS
        $('#temperature_af').removeClass('text-primary');
        //reset flag
        flag = 0;
    }, 10000);
    let tmp = Number.parseFloat($('#temperature_af').text());
    tmp -= 0.1;
    $('#temperature_af').text(tmp.toFixed(1) + "°C"); //round to first decimal digit
});

$('#conf_antifreeze').on('click', () => {
    antifreeze_temp = Number.parseFloat($('#temperature_af').text());
    if($('#optionsRadios5').prop('checked')) {
        active = 'antifreeze';
        temp_to_reach = antifreeze_temp;
    }
    else active = 'prog';
});

$('#conf_weekend').on('click', () => {
    let day1 = $('#weekend_day1').children("option:selected").text();
    let time1 = $('#weekend_time1').children("option:selected").text();
    let spec1;
    if($('#optionsRadios7').prop('checked'))
        spec1 = 'a.m.';
    else spec1 = 'p.m.';
    weekend.from = parseDate(day1, time1, spec1);
    let day2 = $('#weekend_day2').children("option:selected").text();
    let time2 = $('#weekend_time2').children("option:selected").text();
    let spec2;
    if($('#optionsRadios9').prop('checked'))
        spec2 = 'a.m.';
    else spec2 = 'p.m.';
    weekend.to = parseDate(day2, time2, spec2);
    if($('#optionsRadios11').prop('checked')) {
        let myinterval = setInterval(() => {
           if(date >= weekend.from && date <= weekend.to)
                active = 'off';
            else {
                active = 'prog';
                clearInterval(myinterval);
            }
        }, 60000);
    }
});