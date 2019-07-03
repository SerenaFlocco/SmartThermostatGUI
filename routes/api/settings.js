const express = require('express');
const router = express.Router();
const filename = 'settings.json';
const timestamp = require('time-stamp');
const syncfiles = require('../syncfiles.js');

//Get All Settings
router.get('/', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.event);
});

//Get the current temperature
router.get('/currenttemp', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.current_temperature);
});

//Get the current mode
router.get('/mode', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.mode);
});

//Modify the current mode
router.put('/mode', (req, res) => {
    const updated = req.body;
    console.log(updated);
    console.log('Received put request for mode settings');
    const settings = syncfiles.getSettings(filename);
    settings.mode = updated.mode;
    if(settings.mode == 'off') {
        settings.heating = 0;
        settings.cooling = 0;
    }
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    settings.lastchange = timestamp('DD/MM/YYYY:HH:mm:ss');
    syncfiles.updateSettings(filename, settings);

    //send post request to configuration
    //AWSclient.authenticate(AWSclient.postConfig);

    res.status(201).json(settings.mode);
});

//Get the manual temperature
router.get('/manualtemp', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.last_man_temperature);
});

//Modify the manual temperature
router.put('/manualtemp', (req, res) => {
    const updated = req.body;
    const settings = syncfiles.getSettings(filename);
    settings.temp_to_reach = settings.last_man_temperature = updated.last_man_temperature;
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    settings.lastchange = timestamp('DD/MM/YYYY:HH:mm:ss');
    syncfiles.updateSettings(filename, settings);
    //send post request to configuration
    //AWSclient.authenticate(AWSclient.postConfig);

    res.status(201).json(settings.last_man_temperature);
});

//Get the current season
router.get('/season', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.season);
});

//Modify the current season
router.put('/season', (req, res) => {
    console.log("after");
    const updated = req.body;
    const settings = syncfiles.getSettings(filename);
    settings.season = updated.season;
    if(settings.season == 'winter')
        settings.cooling = 0;
    else settings.heating = 0;
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    settings.lastchange = timestamp('DD/MM/YYYY:HH:mm:ss');
    syncfiles.updateSettings(filename, settings);
    //send post request to configuration
    //AWSclient.authenticate(AWSclient.postConfig);
    res.status(201).json(settings.season);
});

//Get the heating status
router.get('/heating', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.heating);
});

//Modify the heating status-->notify to mqtts
router.put('/heating', (req, res) => {
    const updated = req.body;
    const settings = syncfiles.getSettings(filename);
    settings.heating = updated.heating;
    //SET ONLY THE PASSIVE TIMESTAMP
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    syncfiles.updateSettings(filename, settings);
    //send post request to configuration
    //AWSclient.authenticate(AWSclient.postConfig);
    res.status(201).json(settings.heating);
});


//Get the cooling status
router.get('/cooling', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.cooling);
});

//Modify the cooling status-->MQTTS
router.put('/cooling', (req, res) => {
    const updated = req.body;
    const settings = syncfiles.getSettings(filename);
    settings.cooling = updated.cooling;
    //SET ONLY THE PASSIVE TIMESTAMP
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    syncfiles.updateSettings(filename, settings);
    //send post request to configuration
    //AWSclient.authenticate(AWSclient.postConfig);
    res.status(201).json(settings.cooling);
});

//Get the antifreeze settings
router.get('/antifreeze', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.antifreeze);
});

//Modify the antifreeze settings
router.put('/antifreeze', (req, res) => {
    const updated = req.body;
    console.log('Received put request for antifreeze settings');
    const settings = syncfiles.getSettings(filename);
    settings.antifreeze = updated;
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    settings.lastchange = timestamp('DD/MM/YYYY:HH:mm:ss');
    syncfiles.updateSettings(filename, settings);
    //send post request to configuration
    //AWSclient.authenticate(AWSclient.postConfig);
    res.status(201).json(settings.antifreeze);
});

//Get the weekend settings
router.get('/weekend', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.weekend);
});

//Modify the weekend settings
router.put('/weekend', (req, res) => {
    const updated = req.body;
    const settings = syncfiles.getSettings(filename);
    settings.weekend = updated;
    console.log('Received put request for weekend mode settings');
    settings.timestamp = timestamp('DD/MM/YYYY:HH:mm:ss');
    settings.lastchange = timestamp('DD/MM/YYYY:HH:mm:ss');
    syncfiles.updateSettings(filename, settings);
    //send post request to configuration
    //AWSclient.authenticate(AWSclient.postConfig);
    res.status(201).json(settings.weekend);
});

//Get the program settings
router.get('/prog', (req, res) => {
    const settings = syncfiles.getSettings(filename);
    res.json(settings.program);
});

//Modify the program settings of a day
router.put('/prog/:day', (req, res) => {
    const updated = req.body;
    console.log('Received put request for program mode settings');
    const settings = syncfiles.getSettings(filename);
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
    settings.lastchange = timestamp('DD/MM/YYYY:HH:mm:ss');
    syncfiles.updateSettings(filename, settings);
    //send post request to configuration
    //AWSclient.authenticate(AWSclient.postConfig);
    res.status(201).json(to_return);
});

module.exports = router;