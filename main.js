const Apify = require('apify');
const { sendEmail } = require('./src/send_email');

Apify.main(async () => {
    const { email, sitemap, urls } = await Apify.getInput();

    const requestList = new Apify.RequestList({
        sources:
            sitemap ? [
                ...urls,
                {
                    requestsFromUrl: sitemap,
                }
            ] : [
                ...urls
            ]
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

        handlePageFunction: async ({ request, response, page }) => {
            console.log(`Processing ${request.url}`);

            // User email for reports
            const dataset = await Apify.openDataset();

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

            const data = await page.$$eval(request.userData.cssSelector, pageFunction);

            // Store the results to the default dataset.
            await dataset.pushData({
                title: await page.title(),
                url: request.url,
                httpStatus: response.status(),
                cssSelector: {
                    query: request.userData.query || '',
                    result: data.length
                }
            });
        },

        // This function is called if the page processing failed more than maxRequestRetries+1 times.
        handleFailedRequestFunction: async ({ request, error }) => {
            console.log(`Request ${request.url} failed too many times`);
            await Apify.pushData({
                '#debug': Apify.utils.createRequestDebugInfo(request),
            });

            const dataset = await Apify.openDataset();

            await dataset.pushData({
                title: '',
                url: request.url,
                httpStatus: error.message.substr(0,error.message.indexOf(' ')),
                cssSelector: {
                    query: request.userData.query,
                    result: 0
                }
            });
        },
    });

    // Run the crawler and wait for it to finish.
    await crawler.run();

    // Create report email
    const dataset = await Apify.openDataset();
    if (email) await sendEmail(email, dataset);

    console.log('Website content checker finished.');
});
