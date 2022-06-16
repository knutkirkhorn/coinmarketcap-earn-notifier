import discordWebhookWrapper from 'discord-webhook-wrapper';
import {MessageEmbed} from 'discord.js';
import {setTimeout} from 'timers/promises';
import {fetchActiveCampaigns} from './coinmarketcap.js';
import config from './config.js';

const webhookClient = discordWebhookWrapper(config);
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

let activeCampaigns = await fetchActiveCampaigns();

// Make it run forever
while (true) {
    try {
        console.log('Checking for earn campaigns at:', new Date());

        const currentActiveCampaigns = await fetchActiveCampaigns();
        // eslint-disable-next-line no-loop-func
        const newActiveCampaigns = currentActiveCampaigns.filter(campaign => !activeCampaigns.some(activeCampaign => activeCampaign.name === campaign.name));

        if (activeCampaigns.length === currentActiveCampaigns.length && newActiveCampaigns.length === 0) {
            // eslint-disable-next-line no-continue
            continue;
        }

        activeCampaigns = currentActiveCampaigns;

        for (let i = 0; i < newActiveCampaigns.length; i++) {
            await notifyNewCampaign(newActiveCampaigns[i]);
        }
    } catch (error) {
        console.log(error);
    } finally {
        await setTimeout(config.waitTimeout);
    }
}
