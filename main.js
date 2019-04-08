const Apify = require('apify');

Apify.main(async () => {
    const requestList = new Apify.RequestList({
        sources: [
            { url: 'http://www.apify.com/library', userData: { query: '.itemsWrapper .item' } },
            { url: 'http://www.apify.com', userData: { query: 'footer #foot-tweet-text' } },
            { url: 'http://www.apify.com/pricing', userData: { query: 'footer #xxx' } },
        ],
    });

// This call loads and parses the URLs from the remote file.
    await requestList.initialize();

    // Create an instance of the PuppeteerCrawler class - a crawler
    // that automatically loads the URLs in headless Chrome / Puppeteer.
    const crawler = new Apify.PuppeteerCrawler({
        requestList,

        // Here you can set options that are passed to the Apify.launchPuppeteer() function.
        // For example, you can set "slowMo" to slow down Puppeteer operations to simplify debugging
        launchPuppeteerOptions: {
            slowMo: 0,
            headless: true,
        },

        handlePageFunction: async ({ request, page }) => {
            // User email for reports
            const dataset = await Apify.openDataset('default');

            // A function to be evaluated by Puppeteer within the browser context.
            const pageFunction = ($items) => {
                const data = [];

                $items.forEach(($item) => {
                    data.push({
                        content: $item.innerText,
                    });
                });

                return data;
            };

            const data = await page.$$eval(request.userData.query, pageFunction);

            // Store the results to the default dataset.
            await dataset.pushData({
                title: await page.title(),
                url: request.url,
                query: request.userData.query,
                status: data.length ? true : false,
                // response: data,
            });

            // Report result and send email if the test failed
            if (data.length) {
                console.log(`Test succeeded - ${request.url} - ${request.userData.query}`);
            }
            else {
                console.log(`Test failed - ${request.url} - ${request.userData.query}`);
            }
        },

        // This function is called if the page processing failed more than maxRequestRetries+1 times.
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request ${request.url} failed too many times`);
            await Apify.pushData({
                '#debug': Apify.utils.createRequestDebugInfo(request),
            });
        },
    });

    // Run the crawler and wait for it to finish.
    await crawler.run();

    // Create report email
    const dataset = await Apify.openDataset('default');
    const userEmail = 'vratislav@apify.com';

    let emailText = '<h1>Website Content Checker report</h1>';
    emailText += '<table border="1" bordercolor="#a0a9af">';
    emailText += '<thead><tr><th>Status</th><th>URL</th><th>Query</th></tr></thead>';
    emailText += '<tbody>';

    await dataset.forEach(async (item) => {
        emailText += `<tr><td>${item.status ? 'OK' : 'Failed'}</td><td>${item.url}</td><td>${item.query}</td></tr>`;
    });
    emailText += '</tbody>';
    emailText += '</table>';

    //send mail
    console.log(`Sending email with the report to ${userEmail}.`);
    await Apify.call('apify/send-mail', {
        to: userEmail,
        subject: 'Apify Website Content Checker report',
        html: emailText,
    });


    console.log('Website content checker finished.');
});
