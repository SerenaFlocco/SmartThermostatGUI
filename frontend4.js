let day_array = new Array(24);

day_array.fill(18.0);

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

function getDailyProg(day) {
    switch(day) {
        case 'Monday': return settings.program.monday;
        case 'Tuesday': return settings.program.tuesday;
        case 'Wednesday': return settings.program.wednesday;
        case 'Thursday': return settings.program.thursday;
        case 'Friday': return settings.program.friday;
        case 'Saturday': return settings.program.saturday;
        case 'Friday': return settings.program.sunday;
    }
}

//Take the array and fill the sliders
function fillSliders(myarray) {
    let index = 0;
    $('input[type="range"]').forEach((elem) => {
        elem.val(myarray[index]);
        index++;
    });
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

$('input[type="range"]').on('input', (event) => {
    let elem = event.target;
    let id = elem.getAttribute('data-id');
    $('#' + id).text($('#' + elem.id).val().toString() + ' °C');
  });

let day = $('#day').text();
let myarray = getDailyProg(day);
fillSliders(myarray);

$('#day').on('change', () => {
    let myday = $('#day').text();
    let myarray = getDailyProg(myday);
    fillSliders(myarray);
});

$('#save').on('click', () => {
    let day = $('#day').text();
    let mydayarray = new Array(24);
    let index = 0;
    $('input[type="range"]').forEach((elem) => {
        mydayarray[index] = elem.val();
        index++;
    });
    switch(day) {
        case 'Monday': settings.program.monday = mydayarray;
        case 'Tuesday': settings.program.tuesday = mydayarray;
        case 'Wednesday': settings.program.wednesday = mydayarray;
        case 'Thursday': settings.program.thursday = mydayarray;
        case 'Friday': settings.program.friday = mydayarray;
        case 'Saturday': settings.program.saturday = mydayarray;
        case 'Friday': settings.program.sunday = mydayarray;
    }
    wsc.send(JSON.stringify(settings));
});