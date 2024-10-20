import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';

async function scrapeWebsite(url: string) {
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // Go to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('h1');

    // Get the HTML content of the page
    const content = await page.content();

    console.log(content);

    // Load HTML into cheerio for parsing
    const $ = cheerio.load(content);

    const urlList: string[] = [];

    $('a').each((i, link) => {
        const href = $(link).attr('href');
        if (href) {
            urlList.push(href);
        }
    });

    return urlList;

    // Extract sections: heading, url (if available), and body text below the heading
    // let data = [];

    // // Loop through headings (h1, h2, h3, etc.)
    // $('h1, h2, h3, h4, h5, h6').each((i, heading) => {
    //     const headingText = $(heading).text();
    //     const headingUrl = $(heading).find('a').attr('href') || url;  // Get URL if it's within the heading

    //     // Find the next sibling elements that contain the body text
    //     let bodyText = '';
    //     let nextElem = $(heading).next();

    //     // Loop through siblings until you hit another heading or non-text element
    //     while (nextElem.length && !nextElem.is('h1, h2, h3, h4, h5, h6')) {
    //         if (nextElem.is('p')) {
    //             bodyText += nextElem.text() + '\n';
    //         }
    //         nextElem = nextElem.next();
    //     }

    //     // Push the object into the data array
    //     data.push({
    //         heading: headingText,
    //         url: headingUrl,  // You can resolve relative URL here if needed
    //         body: bodyText.trim()
    //     });
    // });

    // // Close the browser
    // await browser.close();

    // return data;
}

// Usage
(async () => {
    const result = await scrapeWebsite('http://localhost:3000/docs/keploy-explained/introduction/');
    console.log(result);
    // fs.writeFile('output.json', JSON.stringify(result, null, 2));
})();