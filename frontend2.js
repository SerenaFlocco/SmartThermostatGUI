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
    weekend: {from: parseDate('Friday', '7:00', 'p.m.'), to: parseDate('Sunday', '7:00', 'p.m.')},
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

//check periodically if the set temperature is greater than the current one: 
//if yes switch on the heating system
setInterval(() => {
    if(settings.mode != 'off' && flag == 0) {
        switch(settings.season) {
            case 'winter':
                if((settings.temp_to_reach > settings.current_temperature) && settings.season == 'winter' && settings.heating == 0) {
                    $('#on').text('whatshot'); //switch on
                    settings.heating = 1;
                    console.log('Sending settings to backend...');
                    wsc.send(JSON.stringify(settings)); //check if it works
                };
            case 'summer':
                if((settings.temp_to_reach < settings.current_temperature) && settings.season == 'summer' && settings.cooling == 0) {
                    $('#on').text('toys'); //switch on
                    settings.cooling = 1;
                    console.log('Sending settings to backend...');
                    wsc.send(JSON.stringify(settings));
                };
        }
    }
}, 20000);

//check periodically if the set temperature is less or equal than the current one: 
//if yes switch off the heating system
setInterval(() => {
    if(settings.mode != 'off' && flag == 0) {
        switch(settings.season) {
            case 'winter':
                if((settings.temp_to_reach <= settings.current_temperature) && settings.heating==1) {
                    $('#on').empty(); //switch off
                    settings.heating = 0;
                    console.log('Sending settings to backend...');
                    wsc.send(JSON.stringify(settings));
                };
            case 'summer':
                if((settings.temp_to_reach >= settings.current_temperature) && settings.cooling == 1) {
                    $('#on').empty(); //switch off
                    settings.cooling = 0;
                    console.log('Sending settings to backend...');
                    wsc.send(BSON.stringify(settings));
                };
        }
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
    if(counter == 0 && msg.data != 'No json available') {
            settings = JSON.parse(msg);
	    console.log(msg);
    }
    else {
        counter++;
        console.log(`received ${msg.data} from websocket`);
        settings.current_temperature = Number.parseFloat(msg.data);
        if($('#loader').length)
            $('#loader').remove();
        if(flag == 0)
            $('#temperature').text(settings.current_temperature.toFixed(1) + "°C");
    }
};

//When mode is 'man', check the temperature periodically to switch on/off the heating system
$('#man').on('click', () => {
    settings.mode = 'man';
    console.log('Sending settings to backend...');
    wsc.send(JSON.stringify(settings));
});

//increase of 0.1 the value of the current temperature when + is clicked
$('#increase').on('click', () => {
    if(settings.mode == 'man') {
        clearTimeout(timer);
        flag = 1;
        if(!$('#temperature').hasClass('text-primary'))
            $('#temperature').addClass('text-primary');
        timer = setTimeout(() => {
            console.log('Reset css and temperature.');
            // reset CSS
            $('#temperature').removeClass('text-primary');
            //reset temperature
            if(settings.current_temperature != 0.0)
                $('#temperature').text(settings.current_temperature.toFixed(1) + "°C");
            //reset flag
            flag = 0;
            settings.temp_to_reach = settings.last_man_temperature;
            console.log('Sending settings to backend...');
            wsc.send(JSON.stringify(settings));
        }, 10000);
        settings.last_man_temperature += 0.1;
        $('#temperature').text(settings.last_man_temperature.toFixed(1) + "°C"); //round to first decimal digit
    }
});

//decrease of 0.1 the value of the current temperature when - is clicked
$('#decrease').on('click', () => {
    if(settings.mode == 'man') {
        clearTimeout(timer);
        flag = 1;
        if(!$('#temperature').hasClass('text-primary'))
            $('#temperature').addClass('text-primary');
        timer = setTimeout(() => {
            console.log('Reset css and temperature.');
            // reset CSS
            $('#temperature').removeClass('text-primary');
            //reset temperature
            if(settings.current_temperature != 0.0)
                $('#temperature').text(settings.current_temperature.toFixed(1) + "°C");
            //reset flag
            flag = 0;
            settings.temp_to_reach = settings.last_man_temperature;
            console.log('Sending settings to backend...');
            wsc.send(JSON.stringify(settings));
        }, 10000);
        settings.last_man_temperature -= 0.1;
        $('#temperature').text(settings.last_man_temperature.toFixed(1) + "°C"); //round to first decimal digit
    }
});

$('#off').on('click', () => {
    settings.mode = 'off';
    $('#on').empty();
    settings.heating = 0;
    settings.cooling = 0;
    console.log('Sending settings to backend...');
    wsc.send(JSON.stringify(settings));
});

$('#winter').on('click', () => {
    settings.season = 'winter';
    if(settings.cooling == 1) {
        $('#on').empty();
        settings.cooling = 0;
    }
    console.log('Sending settings to backend...');
    wsc.send(JSON.stringify(settings));
});

$('#summer').on('click', () => {
    settings.season = 'summer';
    if(settings.heating == 1) {
        $('#on').empty();
        settings.heating = 0;
    }
    console.log('Sending settings to backend...');
    wsc.send(JSON.stringify(settings));
});

$('#prog').on('click', () => {
    settings.mode = 'prog';
    console.log('Sending settings to backend...');
    wsc.send(JSON.stringify(settings));
});
