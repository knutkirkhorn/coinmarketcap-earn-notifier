import {MessageEmbed, WebhookClient} from 'discord.js';
// eslint-disable-next-line import/no-unresolved
import {setTimeout} from 'timers/promises';
import {fetchActiveCampaigns} from './coinmarketcap.js';
import config from './config.js';

const {discordWebhookUrl, discordWebhookId, discordWebhookToken} = config;

// Check if either Discord Webhook URL or Discord Webhook ID and token is provided
if (!(discordWebhookUrl || (discordWebhookId !== '' && discordWebhookToken !== ''))) {
    throw new Error('You need to specify either Discord Webhook URL or both Discord Webhook ID and token!');
}

const webhookClient = discordWebhookUrl ? new WebhookClient({url: discordWebhookUrl}) : new WebhookClient({id: discordWebhookId, token: discordWebhookToken});
const webhookUsername = 'CoinMarketCap Earn Notifier';

async function notifyNewCampaign(campaign) {
    const embedMessage = new MessageEmbed()
        .setTitle(':coin:🎓 **New Earn Campaign**')
        .setThumbnail(new URL(campaign.imageUrl))
        .addField('Name', `${campaign.name} ($${campaign.symbol})`)
        .addField('Description', campaign.description)
        .addField('URL', `Learn and earn [here](${campaign.url})`);

    await webhookClient.send({
        username: webhookUsername,
        embeds: [embedMessage]
    });
}

(async () => {
    let activeCampaigns = await fetchActiveCampaigns();

    // Make it run forever
    while (true) {
        try {
            console.log('Checking for earn campaigns at:', new Date());

            // eslint-disable-next-line no-await-in-loop
            const currentActiveCampaigns = await fetchActiveCampaigns();
            // eslint-disable-next-line no-loop-func
            const newActiveCampaigns = currentActiveCampaigns.filter(campaign => !activeCampaigns.some(activeCampaign => activeCampaign.name === campaign.name));

            if (activeCampaigns.length === currentActiveCampaigns.length && newActiveCampaigns.length === 0) {
                // eslint-disable-next-line no-continue
                continue;
            }

            activeCampaigns = currentActiveCampaigns;

            for (let i = 0; i < newActiveCampaigns.length; i++) {
                // eslint-disable-next-line no-await-in-loop
                await notifyNewCampaign(newActiveCampaigns[i]);
            }
        } catch (error) {
            console.log(error);
        } finally {
            // eslint-disable-next-line no-await-in-loop
            await setTimeout(config.waitTimeout);
        }
    }
})();
