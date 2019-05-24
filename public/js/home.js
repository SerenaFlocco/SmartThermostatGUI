const wsc = new WebSocket('ws://localhost:8080');
//flag to change temperature shown during manual setting
var flag = 0;
//timer used when the temperature is increased or decreased
var timer;
//var which stores the current temperature
var current_temperature = 0.0;
//var which stores the last manual temperature
var temp = 18.0;
//var which stores the mode
var mode = '';

/*function parseDay(day) {
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
}*/

//WebSocket communication with the backend
wsc.onopen = () => {
    console.log('Web Socket client waiting for data from server on port 8080...');
};

//When a new temperature is received, update the html page
wsc.onmessage = (msg) => {
        let splittedmsg = msg.data.split(':');
        console.log(`received ${msg.data} from websocket`);
        switch(splittedmsg[0]) {
            case 'temp': current_temperature = Number.parseFloat(msg.data);
                         console.log(current_temperature);
                         if($('#loader').length)
                             $('#loader').remove();
                         if(flag == 0)
                             $('#temperature').text(settings.current_temperature.toFixed(1) + "°C");
                         break;
            case 'heating': if(splittedmsg[1] == 'on')
                                $('#on').text('whatshot'); //switch on
                            else $('#on').empty();
                            break;
            case 'cooling': if(splittedmsg[1] == 'on')
                                $('#on').text('toys'); //switch on
                            else $('#on').empty();
                            break;
        }
};

//When mode is 'man', check the temperature periodically to switch on/off the heating system
$('#man').on('click', () => {
    const url = 'http://localhost:3000/api/settings/mode';
    const data = '{"mode":"man"}';
    $.ajax({
        url: url,
        data: data, 
        type: 'PUT', 
        contentType: "application/json; charset=utf-8", // this
        dataType: "json"});
    console.log('Sending settings to backend...');
});

//increase of 0.1 the value of the current temperature when + is clicked
$('#increase').on('click', () => {
    if(flag == 0) {
        //get the current mode
        $.get({url: 'http://localhost:3000/api/settings/mode', async: false}, () => {
            console.log('success');
        })
        .done((data) => {
          console.log('done');
          mode = data;
          console.log(mode);
        })
        .fail(() => {
          console.log('error');
        })
        .always(() => {
          console.log('finished');
        });
        //get the last manual temperature
        $.get({url:'http://localhost:3000/api/settings/manualtemp', async:false}, () => {
            console.log('success');
        })
        .done((data) => {
        console.log('done');
        temp = data;
        console.log(temp);
        })
        .fail(() => {
        console.log('error');
        })
        .always(() => {
        console.log('finished');
        });
        temp = Number.parseFloat(temp);
    }
    if(mode == 'man') {
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
            else $('#temperature').empty();
            //reset flag
            flag = 0;
            //put on manual temp
            const url = 'http://localhost:3000/api/settings/manualtemp';
            const data = '{"last_man_temperature":"' + temp.toFixed(1) + '"}';
            $.ajax({
                url: url,
                data: data, 
                type: 'PUT', 
                contentType: "application/json; charset=utf-8", // this
                dataType: "json"});
            console.log('Sending settings to backend...');
        }, 10000);
        temp += 0.1;
        $('#temperature').text(temp.toFixed(1) + "°C"); //round to first decimal digit
    }
});

//decrease of 0.1 the value of the current temperature when - is clicked
$('#decrease').on('click', () => {
    if(flag == 0) {
        //get the current mode
        $.get({url: 'http://localhost:3000/api/settings/mode', async: false}, () => {
            console.log('success');
        })
        .done((data) => {
          console.log('done');
          mode = data;
          console.log(mode);
        })
        .fail(() => {
          console.log('error');
        })
        .always(() => {
          console.log('finished');
        });
        //get the last manual temperature
        $.get({url:'http://localhost:3000/api/settings/manualtemp', async:false}, () => {
            console.log('success');
        })
        .done((data) => {
        console.log('done');
        temp = data;
        console.log(temp);
        })
        .fail(() => {
        console.log('error');
        })
        .always(() => {
        console.log('finished');
        });
        temp = Number.parseFloat(temp);
    }
    if(mode == 'man') {
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
            else $('#temperature').empty();
            //reset flag
            flag = 0;
            //put on manual temp
            const url = 'http://localhost:3000/api/settings/manualtemp';
            const data = '{"last_man_temperature":"' + temp.toFixed(1) + '"}';
            $.ajax({
                url: url,
                data: data, 
                type: 'PUT', 
                contentType: "application/json; charset=utf-8", // this
                dataType: "json"});
            console.log('Sending settings to backend...');
        }, 10000);
        temp -= 0.1;
        $('#temperature').text(temp.toFixed(1) + "°C"); //round to first decimal digit
    }
});

$('#off').on('click', () => {
    $('#on').empty();
    console.log('Sending settings to backend...');
    //put on mode
    const url = 'http://localhost:3000/api/settings/mode';
    const data = '{"mode":"off"}';
    $.ajax({
        url: url,
        data: data, 
        type: 'PUT', 
        contentType: "application/json; charset=utf-8", // this
        dataType: "json"});
});

$('#winter').on('click', () => {
    //reset heating or cooling logo if any
    $('#on').empty();
    console.log('Sending settings to backend...');
    //put on season
    const url = 'http://localhost:3000/api/settings/season';
    const data = '{"season":"winter"}';
    $.ajax({
        url: url,
        data: data, 
        type: 'PUT', 
        contentType: "application/json; charset=utf-8", // this
        dataType: "json"});
});

$('#summer').on('click', () => {
    //reset heating or cooling logo if any
    $('#on').empty();
    console.log('Sending settings to backend...');
    //put on season
    const url = 'http://localhost:3000/api/settings/season';
    const data = '{"season":"summer"}';
    $.ajax({
        url: url,
        data: data, 
        type: 'PUT', 
        contentType: "application/json; charset=utf-8", // this
        dataType: "json"});
});

$('#prog').on('click', () => {
    //put on mode
    const url = 'http://localhost:3000/api/settings/mode';
    const data = '{"mode":"prog"}';
    $.ajax({
        url: url,
        data: data, 
        type: 'PUT', 
        contentType: "application/json; charset=utf-8", // this
        dataType: "json"});
    console.log('Sending settings to backend...');
});
