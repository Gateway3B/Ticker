const {MessageEmbed} = require('discord.js');
const {PrimaryColor} = require('../../config.json')
var yahooFinance = require('yahoo-finance');

module.exports = {
    name: 'showtickers',
    async execute(interaction, Favorite) {
        const embed = new MessageEmbed();

        var tickers = '';
        var prices = '';
        var highsLows = '';

        const favorites = await Favorite.find({});

        if(favorites.length == 0) {
            embed.setTitle("Favorites List Empty. Use /addticker")
                .setColor(PrimaryColor);
            
            interaction.reply({embeds: [embed]});
            return;
        }

        for(var i = 0; i < favorites.length; i++)
        {
            const quote = await yahooFinance.quote({
                symbol: favorites[i].ticker,
                modules: [ 'price' ]
            }).catch(() => {});

            if(!quote)
            {
                embed.setTitle("Error Recieving Data From Yahoo")
                .setColor(PrimaryColor);
            
                interaction.reply({embeds: [embed]});
                return;
            }
    
            tickers += quote.price.symbol + "\n";
            prices += '$' + parseFloat(quote.price.regularMarketPrice).toFixed(2) + '\n';
            highsLows += '$' + parseFloat(quote.price.regularMarketDayHigh).toFixed(2) + '/' + '$' + parseFloat(quote.price.regularMarketDayLow).toFixed(2) + '\n';
        }

        embed.setTitle("Favorite Tickers List")
            .setColor(PrimaryColor)
            .addFields(
                { name: 'Ticker', value: tickers, inline: true },
                { name: 'Price', value: prices, inline: true },
                { name: 'High/Low', value: highsLows, inline: true },
            );

        interaction.reply({embeds: [embed]});
    }
}