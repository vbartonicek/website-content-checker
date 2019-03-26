const Apify = require('apify');

// Apify.utils contains various utilities, e.g. for logging.
// Here we turn off the logging of unimportant messages.
const {log} = Apify.utils;
log.setLevel(log.LEVELS.WARNING);


// Apify.main() function wraps the crawler logic (it is optional).
Apify.main(async () => {
    // Prepare a list of URLs to crawl
    const requestList = new Apify.RequestList({
        sources: [
            { url: 'https://apify.com/library', userData: { query: '.itemsWrapper .item h3' } },
            // { url: 'http://www.example.com/page-2' },
        ],
    });
    await requestList.initialize();

    // Create an instance of the CheerioCrawler class - a crawler
    // that automatically loads the URLs and parses their HTML using the cheerio library.
    const crawler = new Apify.CheerioCrawler({
        requestList,
        handlePageFunction: async ({request, response, html, $}) => {
            const data = [];

            // console.log(request.url);
            console.log($(request.userData.query).text());
            // console.log($(request.query));

            // data.push();

            // Do some data extraction from the page with Cheerio.
            // $('.some-collection').each((index, el) => {
            //     data.push({title: $(el).find('.some-title').text()});
            // });

            // Save the data to dataset.
            await Apify.pushData({
                url: request.url,
                // html,
                data,
            })
        },
    });

    // Run the crawler and wait for it to finish.
    await crawler.run();

    console.log('Crawler finished.');
});

