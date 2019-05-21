# Website content checker
Simple Apify actor for checking website pages and its content. URLs to check can be set manually or via provided sitemap file. Optionally it can send a report via email.

Typical use cases are healtchecks of websites, dynamic page content and third party plugins. 

## INPUT

- `email` - Optional email address to send the report to.
- `sitemap` - Optional URL to a sitemap file to visit all pages it contains
- `urls` - Array of manually specified URLs to check
    - `method` - HTTP method, GET method set by default
    - `userData` - Object of custom input data
        - `cssSelector` - Optional CSS selector to check specific content of the page

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
On this input the actor first checks `Apify.com` website whether embedded Twitter post is properly loaded and then it check whether `vbartonicek.cz` website is live. After the check is finished it sends a report email to `john@doe.xx`.

## OUTPUT
Once the actor finishes, it outputs results to actor default dataset. In addition it will send a report email if input contained valid email address.

Example results item:

```json
[{
  "title": "Vratislav Bartonicek",
  "url": "https://www.vbartonicek.cz",
  "httpStatus": 200
},
{
  "title": "Web Scraping, Data Extraction and Automation - Apify",
  "url": "http://www.apify.com",
  "httpStatus": 200,
  "cssSelector": {
    "query": "footer #foot-tweet-text",
    "results": 1
  }
}]
```

- `title` - Visited page title
- `url` - Visited page URL
- `httpStatus` - HTTPS response status
- `cssSelector` - Object containing information about checked CSS selector
    - `query` - CSS selector
    - `results` - Count of found items
