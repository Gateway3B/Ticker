const {MessageEmbed} = require('discord.js');
const {PrimaryColor} = require('../../config.json')
var yahooFinance = require('yahoo-finance');

module.exports = {
    name: 'ticker',
    async execute(interaction, Favorite) {
        const embed = new MessageEmbed();

        const quote = await yahooFinance.quote({
            symbol: interaction.options.getString('ticker'),
            modules: [ 'price' ]
        }).catch((err) => {
            embed.setTitle("Error Recieving Data From Yahoo")
                .setColor(PrimaryColor);
        
            interaction.reply({embeds: [embed]});
            return;
        });

        if(!quote.price) {
            embed.setTitle("Invalid Ticker")
                .setColor(PrimaryColor);
        
            interaction.reply({embeds: [embed]});
            return;
        }

        embed.setTitle(quote.price.symbol)
            .setColor(PrimaryColor)
            .addFields(
                { name: 'Price', value: '$' + parseFloat(quote.price.regularMarketPrice).toFixed(2), inline: true },
                { name: 'High', value: '$' + parseFloat(quote.price.regularMarketDayHigh).toFixed(2), inline: true },
                { name: 'Low', value: '$' + parseFloat(quote.price.regularMarketDayLow).toFixed(2), inline: true }
            );
        interaction.reply({embeds: [embed]});
    }
}