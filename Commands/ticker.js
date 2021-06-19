const Discord = require('discord.js');
var yahooFinance = require('yahoo-finance');

module.exports = {
    name: 'ticker',
    async execute(interaction, Favorite) {
        const embed = new Discord.MessageEmbed();

        const quote = await yahooFinance.quote({
            symbol: interaction.data.options[0].value,
            modules: [ 'price' ]
        }).catch((err) => {
            embed.setTitle("Error Recieving Data From Yahoo")
            .setColor(0x30972D);
        
            return [embed];
        });

        if(!quote.price) {
            embed.setTitle("Invalid Ticker")
            .setColor(0x30972D);
        
            return [embed];
        }

        embed.setTitle(quote.price.symbol)
            .setColor(0x30972D)
            .addFields(
                { name: 'Price', value: '$' + parseFloat(quote.price.regularMarketPrice).toFixed(2), inline: true },
                { name: 'High', value: '$' + parseFloat(quote.price.regularMarketDayHigh).toFixed(2), inline: true },
                { name: 'Low', value: '$' + parseFloat(quote.price.regularMarketDayLow).toFixed(2), inline: true }
            );
        return [embed];
    }
}