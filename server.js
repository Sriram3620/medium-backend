
const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json());

let articles = [];

app.post('/scrape', async (req, res) => {
    const topic = req.body.topic;
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }
    try {
        articles = await scrapeMedium(topic);
        res.json({ message: 'Scraping successful', articles });
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ error: 'Scraping failed', details: error.message });
    }
});

app.get('/articles', (req, res) => {
    res.json(articles);
});

async function scrapeMedium(topic) {
  try {
      const browser = await puppeteer.launch({ headless: true},{executablePath: '/path/to/chrome' });
      const page = await browser.newPage();

      // Navigate to the Medium search results page for the given topic
      await page.goto(`https://medium.com/search?q=${topic}`, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for individual articles to be loaded
      // await page.waitForSelector('a', { timeout: 60000 });
  
      // publish_date[7].substring(12

      const articles = await page.evaluate(() => {
          const articleElements =Array.from(document.body.querySelectorAll('article'));
          

          const res = articleElements.slice(0, 5).map(articleElement => {
            const linkElement = articleElement.querySelector('div > div > div > div > div:nth-child(1)');
            const headingElement = articleElement.querySelector('h2');
            const authorElement = articleElement.querySelector('a p');
            const publishDateElement = articleElement.querySelector('span div');
            const imageElement = articleElement.querySelector(' div.h.k.i > img');
             

           
           

             function convertDate(date)
             {
               console.log(date);   
                let d="3";
                for(let i=0;i<=date.length;i++){
                if(parseInt(date[i])>=0)
                    {
                        d= date[i];
                    }
                }
                  return d;
             }


            return {
                link: linkElement ? linkElement.getAttribute("data-href") : '',
                heading: headingElement ? headingElement.innerText : '',
                author: authorElement ? authorElement.innerText : '',
                publishDate: publishDateElement ?convertDate(publishDateElement.textContent.substring(3,18      )) : '',
                imgUrl: imageElement ? imageElement.src : ''
            };
        });
           return res;
      });
      
      await browser.close();
      console.log(articles);
      return articles;
  } catch (error) {
      console.error('Error during scraping:', error);
      throw error;
  }
}

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
