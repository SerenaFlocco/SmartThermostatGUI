$('#newtoken').on('click', () => {
    //get for a new token
    $.get({url: 'http://localhost:3000/api/settings/token', async: false}, () => {
        console.log('success');
    })
    .done((data) => {
        console.log('done');
        $('#token').text(data);
    })
    .fail(() => {
        console.log('error');
    })
    .always(() => {
        console.log('finished');
    });
});