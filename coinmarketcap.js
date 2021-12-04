import puppeteer from 'puppeteer';

const userAgent = 'coinmarketcap-earn-notifier (https://github.com/knutkirkhorn/coinmarketcap-earn-notifier)';
const earnUrl = 'https://coinmarketcap.com/earn';

// eslint-disable-next-line import/prefer-default-export
export async function fetchActiveCampaigns() {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage'
        ]
    });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    await page.goto(earnUrl);

    const activeCampaigns = await page.evaluate(() => {
        const campaignElements = document.querySelectorAll('.earninitial-proj');
        console.log(campaignElements.innerText);

        const campaigns = [...campaignElements].map(element => {
            const topDiv = element.querySelector('.earninitial-proj > div:first-child');
            const bottomDiv = element.querySelector('.earninitial-proj > div:nth-child(2)');

            const name = topDiv.querySelector('div:nth-child(2) > h2').innerText;
            const symbol = topDiv.querySelector('div:nth-child(2) > .earn-symbol-initial').innerText;
            const description = topDiv.querySelector('.project-p-initial').innerText;
            const imageUrl = topDiv.querySelector('div:first-child > img').src;
            const url = bottomDiv.querySelector('a').href;
            const isActive = !bottomDiv.querySelector('div > div:nth-child(2)').classList.contains('w-condition-invisible');

            return {
                name,
                symbol,
                description,
                imageUrl,
                url,
                isActive
            };
        });

        return campaigns.filter(campaign => campaign.isActive);
    });

    return activeCampaigns;
}
