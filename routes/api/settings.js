const express = require('express');
const router = express.Router();
const fs = require('fs');
const filename = 'settings.json';
var settings = require('../../settings.json');

//Get All Settings
router.get('/', (req, res) => res.json(settings));

//Get the current mode
router.get('/mode', (req, res) => res.json(settings.mode));

//Modify the current mode
router.put('/mode', (req, res) => {
    const updated = req.body;
    settings.mode = updated.mode;
    fs.writeFileSync(filename, JSON.stringify(settings));
    res.status(201).json(settings.mode);
});

//Get the current season
router.get('/season', (req, res) => res.json(settings.season));

//Modify the current season
router.put('/season', (req, res) => {
    const updated = req.body;
    settings.season = updated.season;
    fs.writeFileSync(filename, JSON.stringify(settings));
    res.status(201).json(settings.season);
});

//Get the current manual temperature
router.get('/manual', (req, res) => res.json(settings.last_man_temperature));

//Modify the current manual temperature
router.put('/manual', (req, res) => {
    const updated = req.body;
    settings.last_man_temperature = updated.last_man_temperature;
    fs.writeFileSync(filename, JSON.stringify(settings));
    res.status(201).json(settings.last_man_temperature);
});

//Get the heating status
router.get('/heating', (req, res) => res.json(settings.heating));

//Modify the heating status
router.put('/heating', (req, res) => {
    const updated = req.body;
    settings.heating = updated.heating;
    fs.writeFileSync(filename, JSON.stringify(settings));
    res.status(201).json(settings.heating);
});

//Get the cooling status
router.get('/cooling', (req, res) => res.json(settings.cooling));

//Modify the cooling status
router.put('/cooling', (req, res) => {
    const updated = req.body;
    settings.cooling = updated.cooling;
    fs.writeFileSync(filename, JSON.stringify(settings));
    res.status(201).json(settings.cooling);
});

//Get the antifreeze settings
router.get('/antifreeze', (req, res) => res.json(settings.cooling));

//Modify the antifreeze settings
router.put('/antifreeze', (req, res) => {
    const updated = req.body;
    settings.antifreeze = updated.antifreeze;
    fs.writeFileSync(filename, JSON.stringify(settings));
    res.status(201).json(settings.antifreeze);
});

//Get the weekend settings
router.get('/weekend', (req, res) => res.json(settings.weekend));

//Modify the weekend settings
router.put('/weekend', (req, res) => {
    const updated = req.body;
    settings.weekend = updated.weekend;
    fs.writeFileSync(filename, JSON.stringify(settings));
    res.status(201).json(settings.weekend);
});

//Get the program settings
router.get('/prog', (req, res) => res.json(settings.program));

//Modify the program settings of a day
router.put('/prog/:day', (req, res) => {
    const updated = req.body;
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
    fs.writeFileSync(filename, JSON.stringify(settings));
    res.status(201).json(to_return);
});

module.exports = router;