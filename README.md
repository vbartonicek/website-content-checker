# Website content checker
TODO

## INPUT

- `email` - Email address to send the task report to.
- `sitemap` - URL to website sitemap file to visit all listed pages
- `url` - Array of manually specified URLs to scrape with possiblity to define CSS selector for specific content check

Example input:
```json
{
  "email": "john@doe.xx",
  "sitemap": "",
  "urls": [
    {
      "url": "http://www.apify.com",
      "method": "GET",
      "userData": {
        "cssSelector": "footer #foot-tweet-text"
      }
    },
    {
      "url": "https://www.vbartonicek.cz",
      "method": "GET"
    }
  ]
}

```
On this input the actor checks...TODO

## OUTPUT
Once the actor finishes, it outputs results to actor default dataset. In addition it will send a report email if input contained valid email address.

Example results item:

```text
[{
  "title": "Vratislav Bartonicek",
  "url": "https://www.vbartonicek.cz",
  "httpStatus": 200,
  "cssSelector": {
    "query": "",
    "result": 0
  }
},
{
  "title": "Web Scraping, Data Extraction and Automation - Apify",
  "url": "http://www.apify.com",
  "httpStatus": 200,
  "cssSelector": {
    "query": "",
    "result": 1
  }
}]
```
