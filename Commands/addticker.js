const Discord = require('discord.js');
var yahooFinance = require('yahoo-finance');

module.exports = {
    name: 'addticker',
    async execute(interaction, Favorite) {
        const embed = new Discord.MessageEmbed();

        await Favorite.find().count().then((err, count) => {
            if(err)
                console.log(err);
            else if(count >= 10) {
                embed.setTitle("Limit of 10 Favorites Reached")
                    .setColor(0x30972D);
                
                return [embed];
            }
        });

        await Favorite.find({ticker: interaction.data.options[0].value}).count().then((err, count) => {
            if(err)
                console.log(err);
            else if(count != 0) {
                embed.setTitle("Ticker " + interaction.data.options[0].value + " Is Already On Favoites List")
                    .setColor(0x30972D);
                
                return [embed];
            }
        });

        const quote = await yahooFinance.quote({
            symbol: interaction.data.options[0].value,
            modules: [ 'price' ]
        }).catch((err) => {
            embed.setTitle("Error Recieving Data From Yahoo")
            .setColor(0x30972D);
        
            return [embed];
        });
        
        if(!quote.price) {
            embed.setTitle("Ticker " + interaction.data.options[0].value + " Is Invalid")
                .setColor(0x30972D);
            
            return [embed];

        } else {

            // If ticker exists, add to Favorites

            const fav = new Favorite({
                ticker: quote.price.symbol,
            });
    
            await fav.save();

            embed.setTitle(quote.price.symbol + " Added to Favorites")
                .setColor(0x30972D);
            
            return [embed];
        }

    }
}