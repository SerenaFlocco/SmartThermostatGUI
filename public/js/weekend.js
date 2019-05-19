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

function getHour(mydate) {
    let myhour = mydate.getHours();
    if(myhour >= 13)
        myhour -= 12;
    return myhour;
}

function getSpec(mydate) {
    if(mydate.getHours() >= 13)
        return 'p.m.';
    else return 'a.m.';
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

$('#weekend_day1').val(settings.weekend.from.getDay());
$('#weekend_time1').val(getHour(settings.weekend.from));
if(getSpec(settings.weekend.from) == 'a.m')
    $('[name="optionsRadios4"]:checked').val('option7');
else $('[name="optionsRadios4"]:checked').val('option8');

$('#weekend_day2').val(settings.weekend.to.getDay());
$('#weekend_time2').val(getHour(settings.weekend.to));
if(getSpec(settings.weekend.to) == 'a.m')
    $('[name="optionsRadios5"]:checked').val('option9');
else $('[name="optionsRadios5"]:checked').val('option10');

if(settings.weekend.enabled == 0)
    $('[name="optionsRadios6"]:checked').val('option12');
else $('[name="optionsRadios6"]:checked').val('option11');

$('#conf_weekend').on('click', () => {
    let day1 = $('#weekend_day1').children("option:selected").text();
    let time1 = $('#weekend_time1').children("option:selected").text();
    let spec1;
    if($('#optionsRadios7').prop('checked'))
        spec1 = 'a.m.';
    else spec1 = 'p.m.';
    settings.weekend.from = parseDate(day1, time1, spec1);
    let day2 = $('#weekend_day2').children("option:selected").text();
    let time2 = $('#weekend_time2').children("option:selected").text();
    let spec2;
    if($('#optionsRadios9').prop('checked'))
        spec2 = 'a.m.';
    else spec2 = 'p.m.';
    settings.weekend.to = parseDate(day2, time2, spec2);
    if($('#optionsRadios11').prop('checked')) 
        settings.weekend.enabled = 1;
    else settings.weekend.enabled = 0;
    wsc.send(JSON.stringify(settings));
});