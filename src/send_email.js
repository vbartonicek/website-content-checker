const Apify = require('apify');

const sendEmail = async (email, dataset) => {

    let content=
        '<html xmlns="http://www.w3.org/1999/xhtml">\n' +
        '<head>\n' +
        '<title>Apify Website Content Checker report</title>\n' +
        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />\n' +
        '<meta http-equiv="X-UA-Compatible" content="IE=edge" />\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0 " />';

    // TODO: STYLES

    content += '</head>';
    content += '<body>';

    content = '<h1>Apify Website Content Checker report</h1>';
    content += '<table border="1" bordercolor="#a0a9af" cellspacing=”0” cellpadding=”0”>';
    content += '<thead style="background:#d6d6d6"><tr><th>HTTP status</th><th>URL</th><th>Page title</th><th>CSS Selector</th><th>Items found</th></tr></thead>';
    content += '<tbody>';

    await dataset.forEach(async (item) => {
        if (item.url) {
            content += `<tr>
                <td style="color:${item.httpStatus < 400 ? '#00710e' : '#8e0000'};padding: 5px">${item.httpStatus}</td>
                <td style="padding: 5px">${item.url}</td>
                <td style="padding: 5px">${item.title}</td>
                <td style="padding: 5px">${item.cssSelector.query}</td>
                <td style="color:${item.cssSelector.results > 0 ? '#00710e' : '#8e0000'};padding: 5px">${item.cssSelector.results}</td>
            </tr>`;
        }
    });
    content += '</tbody>';
    content += '</table>';
    content += '<footer><p>Powered by <a href="https://apify.com">Apify</a></p></footer>';

    content += '</body></html>';

    //send mail
    console.log(`Sending email with the report to ${email}.`);
    await Apify.call('apify/send-mail', {
        to: email,
        subject: 'Apify Website Content Checker report',
        html: content,
    });
};

module.exports = {
    sendEmail,
};
