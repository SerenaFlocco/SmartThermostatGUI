const fs = require('fs');

function getSettings(filename){
    const jsonString = fs.readFileSync(filename, 'utf8');
    try {
        //console.log(jsonString);
        const configuration = JSON.parse(jsonString);
        return configuration;
    } catch(err) {
	    console.log('Error parsing JSON string:', err);
    }
}

function updateSettings(filename, settings) {
				//console.log("sto scrivendo: ");
				//console.log(settings);

    /*fs.writeFile(filename, JSON.stringify(settings), (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });*/
				
			try {
							fs.writeFileSync(filename, JSON.stringify(settings), 'utf8');
			} catch(err) {
							console.log('Error writing file: ' + err);
			}
}

module.exports = {
    getSettings: getSettings,
    updateSettings: updateSettings
}
