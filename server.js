const http = require('http');
const express = require('express');
const path = require('path');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const PORT = 9630;
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'web')));

app.post('/scrape', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto('https://www.missionchief.com/users/sign_in');

        await page.type('#user_email', username);
        await page.type('#user_password', password);
        await page.click('input[name="commit"]');
        await page.waitForNavigation();

        const userIdElement = await page.$('a[href^="/profile/"]');
        const userIdHref = await userIdElement.evaluate(node => node.getAttribute('href'));
        const userId = userIdHref.split('/').pop();

        await page.goto(`https://www.missionchief.com/profile/${userId}`);

        const usernameText = await page.evaluate(() => {
            const usernameElement = document.querySelector('h1');
            return usernameElement ? usernameElement.innerText.trim() : null;
        });

        const rankText = await page.evaluate(() => {
            const rankElement = document.querySelector('div#userinfo');
            const text = rankElement ? rankElement.innerText : null;
            if (!text) return null;
            const startIndex = text.indexOf('Current Rank:') + 'Current Rank:'.length;
            const endIndex = text.indexOf('<br>', startIndex);
            return text.substring(startIndex, endIndex).trim();
        });

        const creditsText = await page.evaluate(() => {
            const creditsElement = document.querySelector('div#userinfo');
            const text = creditsElement ? creditsElement.innerText : null;
            if (!text) return null;
            const startIndex = text.indexOf('earned Credits') - 1;
            const endIndex = text.lastIndexOf('\n', startIndex) + 1;
            return text.substring(endIndex, startIndex).trim();
        });

        const data = {
            username: usernameText,
            rank: rankText,
            credits: creditsText
        };

        const fs = require('fs');
        fs.writeFileSync('profile_data.json', JSON.stringify(data, null, 2));

        await browser.close();
        res.send(data);
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('An error occurred while scraping');
    }
});

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
