const Apify = require('apify');

Apify.main(async () => {
    const requestList = new Apify.RequestList({
        sources: [
            { url: 'http://www.apify.com/library', userData: { query: '.itemsWrapper .item:first-child h3' } },
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
        launchPuppeteerOptions: { slowMo: 500 },

        // Stop crawling after several pages
        maxRequestsPerCrawl: 10,

        handlePageFunction: async ({ request, page }) => {
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

            console.log(`${data.length ? 'SUCCESS' : 'FAILED'} - ${request.url} - ${request.userData.query}`)

            // Store the results to the default dataset.
            await Apify.pushData(data);
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
