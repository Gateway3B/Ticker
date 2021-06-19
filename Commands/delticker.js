const Discord = require('discord.js');
var yahooFinance = require('yahoo-finance');

module.exports = {
    name: 'delticker',
    async execute(interaction, Favorite) {
        const embed = new Discord.MessageEmbed();

        await Favorite.find({ticker: interaction.data.options[0].value}).then(async (err, tickers) => {
            if(err)
                console.log(err);
            else if(tickers.length != 0) {
                
                await Favorite.deleteOne({ticker: interaction.data.options[0].value});

                embed.setTitle(interaction.data.options[0].value + " Removed From Favoites List")
                    .setColor(0x30972D);
                
                return [embed];
            } else {
                embed.setTitle(interaction.data.options[0].value + " Is Not On Favoites List")
                    .setColor(0x30972D);
                
                return [embed];
            }
        });

    }
}