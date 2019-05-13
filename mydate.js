module.exports {
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
}