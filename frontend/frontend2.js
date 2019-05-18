let day_array = new Array(24);

day_array.fill(18.0);

console.log(day_array);

var settings = {
    mode: '',
    temp_to_reach: 0.0,
    last_man_temperature: 18.0,
    current_temperature: 18.0,
    antifreeze_temp: 10.0,
    season: 'winter',
    heating: 0,
    cooling: 0,
    weekend: {from: parseDate('Friday', '7:00', 'p.m.'), to: parseDate('Sunday', '7:00', 'p.m.'), enabled: 0},
    program: {
        monday: day_array,
        tuesday: day_array,
        wednesday: day_array,
        thursday: day_array,
        friday: day_array,
        saturday: day_array,
        sunday: day_array,
    }
}

const wsc = new WebSocket('ws://localhost:8080');
//flag to change temperature shown during manual setting
var flag = 0;
//timer used when the temperature is increased or decreased
var timer;
//var to keep the count of messages received from the backend
var counter = 0;

function parseDay(day) {
    switch(day) {
        case 'Monday': return 1;
        case 'Tuesday': return 2;
        case 'Wednesday': return 3;
        case 'Thursday': return 4;
        case 'Friday': return 5;
        case 'Saturday': return 6;
        case 'Sunday': return 7;
    }
}

function parseTime(time, spec) {
    if(spec == 'p.m.')
        time += 12;
    return time;
}

function parseDate(day, time, spec) {
    let date = new Date();
    let mydate = new Date();
    let currentday = date.getDay();
    let myday = parseDay(day);
    let splittedtime = time.split(':');
    if(currentday > myday)
        mydate.setDate(date.getDate() + (currentday - myday));
    if(currentday < myday)
        mydate.setDate(date.getDate() - (myday - currentday));
    mydate.setHours(parseTime(splittedtime[0], spec));
    if(splittedtime[1] != '00')
        mydate.setMinutes(splittedtime[1]);
    return mydate;
}

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
    if(counter == 0 && msg.data != 'No json available') {
            settings = JSON.parse(msg);
	        console.log(msg);
    }
    else {
        counter++;
        console.log(`received ${msg.data} from websocket`);
        settings.current_temperature = Number.parseFloat(msg.data);
        wsc.send(JSON.stringify(settings));
    }
};

$('#temperature_af').text(settings.antifreeze_temp.toFixed(1));

if(settings.mode != 'antifreeze')
    $('[name="optionsRadios3"]:checked').val('option6');
else $('[name="optionsRadios3"]:checked').val('option5');

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
    settings.antifreeze_temp = Number.parseFloat($('#temperature_af').text());
    if($('#optionsRadios5').prop('checked')) {
        settings.mode = 'antifreeze';
        settings.temp_to_reach = settings.antifreeze_temp;
    }
    else settings.mode = 'prog';
    wsc.send(JSON.stringify(settings));
});
