var program;

function getDailyProg(day) {
    switch(day) {
        case 'Monday': return program.monday;
        case 'Tuesday': return program.tuesday;
        case 'Wednesday': return program.wednesday;
        case 'Thursday': return program.thursday;
        case 'Friday': return program.friday;
        case 'Saturday': return program.saturday;
        case 'Sunday': return program.sunday;
    }
}

//get on program
//get for the antifreeze settings
$.get({url: 'http://localhost:3000/api/settings/prog', async: false}, () => {
    console.log('success');
})
.done((data) => {
  console.log('done');
  program = data;
  console.log(program);
})
.fail(() => {
  console.log('error');
})
.always(() => {
  console.log('finished');
});

//on input, update the value of the slider shown on the right
$('input[type="range"]').on('input', (event) => {
    let elem = event.target;
    let id = elem.getAttribute('data-id');
    $('#' + id).text($('#' + elem.id).val().toString() + ' °C');
  });

//show the previous settings for each slider for the current day
let day = $('#day').children("option:selected").text();
console.log(day);
let myarray = getDailyProg(day);
console.log(myarray);
for(i=1; i<25; i++) {
    $(`#formControlRange${i}`).val(myarray[i-1]);
    $(`#value${i}`).text(myarray[i-1].toString() + ' °C');
}

//when the day is changed, load the corresponding settings on the sliders
$('#day').on('change', () => {
    let myday = $('#day').children("option:selected").text();
    let myarray = getDailyProg(myday);
    for(i=1; i<25; i++) {
        $(`#formControlRange${i}`).val(myarray[i-1]);
        $(`#value${i}`).text(myarray[i-1].toString() + ' °C');
    }
});

$('#save').on('click', () => {
    let day = $('#day').children("option:selected").text();
    let mydayarray = new Array(24);
    for(i=1; i<25; i++) {
        mydayarray[i-1] = Number.parseFloat($(`#formControlRange${i}`).val());
    }
    //put on program
    const url =  `http://localhost:3000/api/settings/prog/${day.toLowerCase()}`;
    const data = `{"${day.toLowerCase()}":` + JSON.stringify(mydayarray) + '}';
    $.ajax({
        url: url,
        data: data, 
        type: 'PUT', 
        contentType: "application/json; charset=utf-8", // this
        dataType: "json"});
    console.log('Sending settings ' + data +' to backend...');
});

//get request for index when exit is pressed
$('#exit').on('click', () => {
    $.get({url: '/', async: false}, () => {
    console.log('success');
    })
    .done((data) => {
    console.log('done');
    })
    .fail(() => {
    console.log('error');
    })
    .always(() => {
    console.log('finished');
    });
});