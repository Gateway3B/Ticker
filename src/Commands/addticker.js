const {MessageEmbed} = require('discord.js');
const {PrimaryColor} = require('../../config.json')
var yahooFinance = require('yahoo-finance');

module.exports = {
    name: 'addticker',
    async execute(interaction, Favorite) {
        const embed = new MessageEmbed()
            .setColor(PrimaryColor);
        

        const count = await Favorite.find().count().catch(err => {throw new Error(err)});
        if(count >= 10) {
            embed.setTitle("Limit of 10 Favorites Reached");
            
            interaction.reply({embeds: [embed]});
            return;
        }

        const existing = await Favorite.find({ticker: interaction.options.getString('ticker').toUpperCase()}).count().catch(err => {throw new Error(err)});
        if(existing != 0) {
            embed.setTitle("Ticker " + interaction.options.getString('ticker') + " Is Already On Favoites List");
            
            interaction.reply({embeds: [embed]});
            return;
        }

        const quote = await yahooFinance.quote({
            symbol: interaction.options.getString('ticker'),
            modules: [ 'price' ]
        }).catch(() => {});

        if(!quote)
        {
            embed.setTitle("Ticker " + interaction.options.getString('ticker') + " Is Invalid");

            interaction.reply({embeds: [embed]});
            return;
        }
        
        // If ticker exists, add to Favorites
        const fav = new Favorite({
            ticker: quote.price.symbol,
        });

        await fav.save();

        embed.setTitle(quote.price.symbol + " Added to Favorites");
        
        interaction.reply({embeds: [embed]});
    }
}