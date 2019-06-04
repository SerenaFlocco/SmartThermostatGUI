const express = require('express');
const router = express.Router();
const fs = require('fs');
const filename = 'settings.json';
var settings = require('../../settings.json');
const timestamp = require('time-stamp');

//Get All Settings
router.get('/', (req, res) => res.json(settings));

//Get the current temperature
router.get('/currenttemp', (req, res) => res.json(settings.current_temperature));

//Get the current mode
router.get('/mode', (req, res) => res.json(settings.mode));

//Modify the current mode
router.put('/mode', (req, res) => {
    const updated = req.body;
    console.log(updated);
    console.log('Received put request for mode settings');
    settings.mode = updated.mode;
    if(settings.mode == 'off') {
        settings.heating = 0;
        settings.cooling = 0;
    }
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
    res.status(201).json(settings.mode);
});

//Get the manual temperature
router.get('/manualtemp', (req, res) => {
    res.json(settings.last_man_temperature);
});

//Modify the manual temperature
router.put('/manualtemp', (req, res) => {
    const updated = req.body;
    settings.temp_to_reach = settings.last_man_temperature = updated.last_man_temperature;
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
    res.status(201).json(settings.last_man_temperature);
});

//Get the current season
router.get('/season', (req, res) => res.json(settings.season));

//Modify the current season
router.put('/season', (req, res) => {
    console.log("after");
    const updated = req.body;
    settings.season = updated.season;
    if(settings.season == 'winter')
        settings.cooling = 0;
    else settings.heating = 0;
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
    res.status(201).json(settings.season);
});

//Get the heating status
router.get('/heating', (req, res) => res.json(settings.heating));

//Modify the heating status
router.put('/heating', (req, res) => {
    const updated = req.body;
    settings.heating = updated.heating;
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
    res.status(201).json(settings.heating);
});

//Get the cooling status
router.get('/cooling', (req, res) => res.json(settings.cooling));

//Modify the cooling status
router.put('/cooling', (req, res) => {
    const updated = req.body;
    settings.cooling = updated.cooling;
    //fs.writeFileSync(filename, JSON.stringify(settings));
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
    res.status(201).json(settings.cooling);
});

//Get the antifreeze settings
router.get('/antifreeze', (req, res) => res.json(settings.antifreeze));

//Modify the antifreeze settings
router.put('/antifreeze', (req, res) => {
    const updated = req.body;
    console.log('Received put request for antifreeze settings');
    settings.antifreeze = updated;
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
    res.status(201).json(settings.antifreeze);
});

//Get the weekend settings
router.get('/weekend', (req, res) => res.json(settings.weekend));

//Modify the weekend settings
router.put('/weekend', (req, res) => {
    const updated = req.body;
    settings.weekend = updated;
    console.log('Received put request for weekend mode settings');
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
    res.status(201).json(settings.weekend);
});

//Get the program settings
router.get('/prog', (req, res) => res.json(settings.program));

//Modify the program settings of a day
router.put('/prog/:day', (req, res) => {
    const updated = req.body;
    console.log('Received put request for program mode settings');
    let day = req.params.day;
    let to_return;
    switch(day) {
        case 'monday': settings.program.monday = updated.monday;
                        to_return = settings.program.monday;
                        break;
        case 'tuesday': settings.program.tuesday = updated.tuesday;
                        to_return = settings.program.tuesday;
                        break;
        case 'wednesday': settings.program.wednesday = updated.wednesday;
                          to_return = settings.program.wednesday;
                          break;
        case 'thursday': settings.program.thursday = updated.thursday;
                         to_return = settings.program.thursday;
                         break;
        case 'friday': settings.program.friday = updated.friday;
                       to_return = settings.program.friday;
                       break;
        case 'saturday': settings.program.saturday = updated.saturday;
                         to_return = settings.program.saturday;
                         break;
        case 'sunday': settings.program.sunday = updated.sunday;
                       to_return = settings.program.sunday;
                       break;
    }
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
    res.status(201).json(to_return);
});

module.exports = router;