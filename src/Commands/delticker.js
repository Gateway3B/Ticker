const {MessageEmbed} = require('discord.js');
const {PrimaryColor} = require('../../config.json')

module.exports = {
    name: 'delticker',
    async execute(interaction, Favorite) {
        const embed = new MessageEmbed();

        return await Favorite.find({ticker: interaction.options.getString('ticker').toUpperCase()}).then(async (tickers) => {
            if(tickers.length != 0) {

                await Favorite.deleteOne({ticker: interaction.options.getString('ticker').toUpperCase()});

                embed.setTitle(interaction.options.getString('ticker').toUpperCase() + " Removed From Favoites List")
                    .setColor(PrimaryColor);
                
                interaction.reply({embeds: [embed]});

            } else {

                embed.setTitle(interaction.options.getString('ticker').toUpperCase() + " Is Not On Favoites List")
                    .setColor(PrimaryColor);
                
                interaction.reply({embeds: [embed]});

            }
        });

    }
}