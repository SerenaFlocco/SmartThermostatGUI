var weekend;
var address = 'ec2-52-47-113-242.eu-west-3.compute.amazonaws.com';

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

//get for settings.weekend
$.get({url: 'http://' + address + ':3000/api/settings/weekend', async: false}, () => {
    console.log('success');
})
.done((data) => {
  console.log('done');
  weekend = data;
  console.log(weekend);
})
.fail(() => {
  console.log('error');
})
.always(() => {
  console.log('finished');
});

weekend.enabled = Number.parseInt(weekend.enabled);
console.log(weekend.from);
console.log(weekend.to[2])

$('#weekend_day1').val(parseDay(weekend.from[0]));
$('#weekend_time1').val(weekend.from[1]);
if(weekend.from[2] == 'a.m.')
    $('#optionsRadios7').prop('checked', true);
else $('#optionsRadios8').prop('checked', true);

$('#weekend_day2').val(parseDay(weekend.to[0]));
$('#weekend_time2').val(weekend.to[1]);
if(weekend.to[2] == 'a.m.')
    $('#optionsRadios9').prop('checked', true);
else $('#optionsRadios10').prop('checked', true);

if(weekend.enabled == 0)
    $('#optionsRadios12').prop('checked', true);
else $('#optionsRadios11').prop('checked', true);

$('#conf_weekend').on('click', () => {
    let day1 = $('#weekend_day1').children("option:selected").text();
    let time1 = $('#weekend_time1').children("option:selected").text();
    let spec1;
    if($('#optionsRadios7').prop('checked'))
        spec1 = 'a.m.';
    else spec1 = 'p.m.';
    weekend.from = [day1, time1, spec1];
    let day2 = $('#weekend_day2').children("option:selected").text();
    let time2 = $('#weekend_time2').children("option:selected").text();
    let spec2;
    if($('#optionsRadios9').prop('checked'))
        spec2 = 'a.m.';
    else spec2 = 'p.m.';
    weekend.to = [day2, time2, spec2];
    if($('#optionsRadios11').prop('checked')) 
        weekend.enabled = 1;
    else weekend.enabled = 0;
    //put request
    url = 'http://' + address + ':3000/api/settings/weekend';
    const data = '{"from":["' + weekend.from[0] + '","' + weekend.from[1] + '","' + weekend.from[2] + '"],"to":["' + weekend.to[0] + '","' + weekend.to[1] + '","' + weekend.to[2] + '"],"enabled":' + weekend.enabled.toString() + '}';
    $.ajax({
        url: url,
        data: data, 
        type: 'PUT', 
        contentType: "application/json; charset=utf-8", // this
        dataType: "json"});
    console.log('Sending settings ' + data +' to backend...');
});
