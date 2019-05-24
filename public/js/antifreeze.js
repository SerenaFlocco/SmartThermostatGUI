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

//flag to change temperature shown during manual setting
var flag = 0;
//timer used when the temperature is increased or decreased
var timer;
//var which stores the current mode
var mode = '';
//antifreeze temperature
var antifreeze;

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

//get for the antifreeze settings
$.get({url: 'http://localhost:3000/api/settings/antifreeze', async: false}, () => {
    console.log('success');
})
.done((data) => {
  console.log('done');
  antifreeze = data;
  console.log(antifreeze);
})
.fail(() => {
  console.log('error');
})
.always(() => {
  console.log('finished');
});
antifreeze.temp = Number.parseFloat(antifreeze.temp);
$('#temperature_af').text(antifreeze.temp.toFixed(1));
antifreeze.enabled = Number.parseInt(antifreeze.enabled);

if(antifreeze.enabled == 0)
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
    antifreeze.temp = Number.parseFloat($('#temperature_af').text());
    if($('#optionsRadios5').prop('checked'))
        antifreeze.enabled = 1;
    //put for the antifreezeconst 
    url = 'http://localhost:3000/api/settings/antifreeze';
    const data = '{"temp":' + antifreeze.temp.toFixed(1) + ', "enabled":' + antifreeze.enabled.toString() + '}';
    $.ajax({
        url: url,
        data: data, 
        type: 'PUT', 
        contentType: "application/json; charset=utf-8", // this
        dataType: "json"});
    console.log('Sending settings ' + data +' to backend...');
});
