const Apify = require('apify');

const sendEmail = async (email, dataset) => {
    let emailText = '<h1>Website Content Checker report</h1>';
    emailText += '<table border="1" bordercolor="#a0a9af" cellspacing=”0” cellpadding=”0”>';
    emailText += '<thead style="background:#d6d6d6"><tr><th>HTTP status</th><th>URL</th><th>Page title</th><th>CSS Selector</th><th>Items found</th></tr></thead>';
    emailText += '<tbody>';

    await dataset.forEach(async (item) => {
        if (item.url) {
            emailText += `<tr>
                <td style="color:${item.httpStatus < 400 ? '#00710e' : '#8e0000'};padding: 5px">${item.httpStatus}</td>
                <td style="padding: 5px">${item.url}</td>
                <td style="padding: 5px">${item.title}</td>
                <td style="padding: 5px">${item.cssSelector.query}</td>
                <td style="color:${item.cssSelector.result > 0 ? '#00710e' : '#8e0000'};padding: 5px">${item.cssSelector.result}</td>
            </tr>`;
        }
    });
    emailText += '</tbody>';
    emailText += '</table>';

    //send mail
    console.log(`Sending email with the report to ${email}.`);
    await Apify.call('apify/send-mail', {
        to: email,
        subject: 'Apify Website Content Checker report',
        html: emailText,
    });
};

module.exports = {
    sendEmail,
};
