const fs = require('fs');
//flag to change temperature shown during manual setting
var flag = 0;

function getDay(number, settings) {
    switch(number) {
        case 1: return settings.program.monday;
        case 2: return settings.program.tuesday;
        case 3: return settings.program.wednesday;
        case 4: return settings.program.thursday;
        case 5: return settings.program.friday;
        case 6: return settings.program.saturday;
        case 7: return settings.program.sunday;
    }
}

//check periodically if the set temperature is greater than the current one:
//if yes switch on the heating/cooling system, otherwise switch it off
setInterval(() => {
    let rawdata = fs.readFileSync('settings.json');  
    let settings = JSON.parse(rawdata);
    if(settings.mode != 'off' && flag == 0) {
        switch(settings.season) {
            case 'winter':
                if((settings.temp_to_reach > settings.current_temperature) && settings.heating == 0) {
                    settings.heating = 1;
                    console.log('Sending settings to backend...');
                    //trigger the frontend to show the heating logo
                    ws.send('heating:on');
                } else {
                    if((settings.temp_to_reach <= settings.current_temperature) && settings.heating==1) {
                        settings.heating = 0;
                        console.log('Sending settings to backend...');
                        //trigger the frontend to hide the heating logo
                        ws.send('heating:off');
                    }
                };
                break;
            case 'summer':
                if((settings.temp_to_reach < settings.current_temperature) && settings.cooling == 0) {
                    settings.cooling = 1;
                    console.log('Sending settings to backend...');
                    //trigger the frontend to show the cooling logo
                    ws.send('cooling:on');
                } else {
                    if((settings.temp_to_reach >= settings.current_temperature) && settings.cooling == 1) {
                        settings.cooling = 0;
                        console.log('Sending settings to backend...');
                        //trigger the frontend to hide the cooling logo
                        ws.send('cooling:off');
                    }
                };
                break;
        }
    }
}, 20000);

//Check if weekend mode or the prog mode is enabled
setInterval(() => {
    let rawdata = fs.readFileSync('settings.json');  
    let settings = JSON.parse(rawdata);
    let date = new Date();
    if(settings.weekend.enabled == 1) {
        if(date >= settings.weekend.from && date <= settings.weekend.to)
                settings.mode = 'off';
            else {
                settings.mode = 'prog';
            }
            fs.writeFileSync('settings.json', JSON.stringify(settings));
    }
    if(settings.mode == 'prog') {
        let progarray = getDay(date.getDay, settings);
        let index = date.getHours();
        settings.temp_to_reach = progarray[index];
        fs.writeFileSync('settings.json', JSON.stringify(settings));
    }
}, 3600000);