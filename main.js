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
            slowMo: 500,
            headless: true,
        },

        // Stop crawling after several pages
        maxRequestsPerCrawl: 10,

        handlePageFunction: async ({ request, page }) => {
            // User email for reports
            const userEmail = 'vratislav@apify.com';

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

            if (data.length) {
                console.log(`Test succeeded - ${request.url} - ${request.userData.query}`);
            }
            else {
                console.log(`Test failed - ${request.url} - ${request.userData.query}`);

                //send mail
                console.log('Sending mail...');
                await Apify.call('apify/send-mail', {
                    to: userEmail,
                    subject: 'Apify Website Content Checker - test failed!',
                    text: 'URL: ' + request.url + '\n' +
                        'Selector: "' + request.userData.query + '"\n',
                });
            }

            // Store the results to the default dataset.
            await Apify.pushData({
                title: await page.title(),
                url: request.url,
                query: request.userData.query,
                status: data.length ? true : false,
                response: data,
            });
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

    console.log('Crawler finished.');
});
