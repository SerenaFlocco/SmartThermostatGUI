//flag to change temperature shown during manual setting
var flag = 0;
//timer used when the temperature is increased or decreased
var timer;
//var which stores the current mode
var mode = '';
//antifreeze temperature
var antifreeze;

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
    $('#optionsRadios6').prop('checked', 'checked');
else $('#optionsRadios5').prop('checked', 'checked');
    /*$('#optionsRadios6').prop('checked', true);
else $('#optionsRadios5').prop('checked', true);*/

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
    else antifreeze.enabled = 0;
    //put for the antifreeze
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
