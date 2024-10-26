import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';

async function scrapeWebsite(url: string) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    page.setViewport({ width: 1280, height: 926 });
    await page.waitForSelector('h1');

    const content = await page.content();
    const $ = cheerio.load(content);

    const regex = /^(https?:\/\/[^\/]+)/;
    let match: string | null = url.match(regex)?.[0] || null;

    await page.evaluate(() => {
        document.querySelectorAll('li').forEach((li) => {
            li.addEventListener('click', (event) => event.preventDefault(), true);
        });
    });

    const urlList: string[] = [];

    const listItems = await page.$$('li');

    for (const item of listItems) {
        if (item) {
            try {
                await item.click(); // Click without redirection
            } catch (error) {
                continue;
            }
        }
    }

    const links = await page.$$('a');
    for (const link of links) {
        const href = await (await link.getProperty('href')).jsonValue();
        let domain: string | null = href.match(regex)?.[0] || null;

        if (domain !== null && domain === match) {
            urlList.push(href);
        }
    }

    let data = []

    for (const url of urlList) {

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        page.setViewport({ width: 1280, height: 926 });
        await page.waitForSelector('h1');

        const content = await page.content();
        const $ = cheerio.load(content);

        $('h1, h2, h3, h4, h5, h6').each((i, heading) => {
            const headingText = $(heading).text();
            const headingUrl = $(heading).find('a').attr('href') || url;

            let bodyText = '';
            let nextElem = $(heading).next();

            while (nextElem.length && !nextElem.is('h1, h2, h3, h4, h5, h6')) {
                if (nextElem.is('p')) {
                    bodyText += nextElem.text() + '\n';
                }
                nextElem = nextElem.next();
            }

            data.push({
                heading: headingText,
                url: url,
                link: headingUrl,
                body: bodyText.trim()
            });
        });
    }

    await browser.close();

    fs.writeFile('data.json', JSON.stringify(data, null, 2));

    return data;
}

// Usage
(async () => {
    const result = await scrapeWebsite('http://localhost:3000/docs/keploy-explained/introduction/');
    console.log(result);
})();