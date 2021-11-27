const {MessageEmbed, MessageActionRow, MessageButton} = require('discord.js');
const {PrimaryColor, SecondaryColor} = require('../../config.json')
const yahooFinance = require('yahoo-finance');
const vega = require('vega');
const sharp = require('sharp');

module.exports = {
    name: 'ticker',
    async execute(interaction, Favorite) {
        const embed = new MessageEmbed();

        const quote = await yahooFinance.quote({
            symbol: interaction.options.getString('ticker'),
            modules: ['price']
        }).catch();

        if (!quote) {
            embed.setTitle("Invalid Ticker")
                .setColor(PrimaryColor);

            interaction.reply({ embeds: [embed] });
            return;
        }

        embed.setTitle(quote.price.symbol)
            .setColor(PrimaryColor)
            .addFields(
                { name: 'Day Price', value: '$' + parseFloat(quote.price.regularMarketPrice).toFixed(2), inline: true },
                { name: 'Day High', value: '$' + parseFloat(quote.price.regularMarketDayHigh).toFixed(2), inline: true },
                { name: 'Day Low', value: '$' + parseFloat(quote.price.regularMarketDayLow).toFixed(2), inline: true }
            )
            .setImage(`attachment://stockhistory.png`);

        const stockhistory = await generateGraph(interaction.options.getString('ticker'), 5)

        const ticker = {};
        ticker.embed = embed;

        const buttonRows = setupButtons(interaction, ticker);
        ticker.buttonRows = buttonRows;

        interaction.reply({embeds: [embed], components: buttonRows, files: [{ attachment: stockhistory, name: `stockhistory.png` }]});
    }
}

function setupButtons(interaction, ticker) {
    const buttonRows = [];
    buttonRows.push(new MessageActionRow());

    const labels = ['5 Days', '1 Month', '6 Months', '1 Year'];
    const days = [5, 30, 182, 365];

    ticker.active = 0;

    for (let i = 0; i < 4; i++) {
        const customId = `${i}${interaction.options.getString('ticker')}${Math.floor(Math.random() * 1000)}`
        buttonRows[0].addComponents(
            new MessageButton()
                .setCustomId(customId)
                .setLabel(labels[i])
                .setStyle(i === 0 ? 'SUCCESS' : 'PRIMARY')
                .setDisabled(i === 0)
        );

        const filter = i => i.customId === customId && i.user.id === interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000});

        collector.on('collect', async buttonHit => {
            const stockhistory = await generateGraph(interaction.options.getString('ticker'), days[i])

            ticker.buttonRows[0].components[ticker.active].setStyle('PRIMARY').setDisabled(false);

            const active = buttonHit.customId.substring(0, 1);
            ticker.buttonRows[0].components[active].setStyle('SUCCESS').setDisabled(true);
            ticker.active = active;

            await interaction.editReply({embeds: [ticker.embed], components: ticker.buttonRows, attachments: [], files: []});
            buttonHit.update({embeds: [ticker.embed], components: ticker.buttonRows, files: [{attachment: stockhistory, name: `stockhistory.png`}]});
        });
    }

    setTimeout(() => {
        ticker.buttonRows[0].components.forEach(button => button.setDisabled(true));
        interaction.editReply({embeds: [ticker.embed], components: ticker.buttonRows});
    }, 60000);

    return buttonRows;
}

async function generateGraph(ticker, days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const quotes = await yahooFinance.historical({
        symbol: ticker,
        from: startDate.toISOString(),
        to: new Date().toISOString(),
        period: 'd'
    }).catch();

    let pollResults =
    {
        $schema: 'https://vega.github.io/schema/vega/v5.json',
        width: 500,
        height: 200,
        padding: 5,
        config: {
            range: {
                category: [
                    `#${SecondaryColor.substring(2)}`,
                    `#${PrimaryColor.substring(2)}`
                ],
                ordinal: {scheme: 'green'},
                ramp: {scheme: 'purples'}
            }
        },
        data: [
            {
                name: 'table',
                values: quotes.map(value => ({ x: value.date.toISOString().substring(0, 10).replace(/-/g, '/'), y: value.low, c: 0 })).concat(quotes.map(value => ({ x: value.date.toISOString().substring(0, 10).replace(/-/g, '/'), y: value.high - value.low, c: 1 }))),
                transform: [
                    {
                        type: 'stack',
                        groupby: ['x'],
                        sort: { field: 'c' },
                        field: 'y'
                    }
                ]
            }
        ],

        scales: [
            {
                name: 'x',
                type: 'point',
                range: 'width',
                domain: { data: 'table', field: 'x' },
                reverse: true
            },
            {
                name: 'y',
                type: 'linear',
                range: 'height',
                nice: true, zero: false,
                domain: { data: 'table', field: 'y' }
            },
            {
                name: 'color',
                type: 'ordinal',
                range: 'category',
                domain: { data: 'table', field: 'c' }
            }
        ],

        axes: [
            {
                orient: 'bottom',
                scale: 'x',
                zindex: 1,
                labelColor: 'white',
                labelFontSize: 20,
                labelLimit: 300,
                labelOverlap: 'greedy'
            },
            {
                orient: 'left',
                scale: 'y',
                zindex: 1,
                labelColor: 'white',
                labelFontSize: 18,
            }
        ],

        marks: [
            {
                type: 'group',
                from: {
                    facet: {
                        name: 'series',
                        data: 'table',
                        groupby: 'c'
                    }
                },
                marks: [
                    {
                        type: 'area',
                        from: { data: 'series' },
                        encode: {
                            enter: {
                                interpolate: { value: 'monotone' },
                                x: { scale: 'x', field: 'x', },
                                y: { scale: 'y', field: 'y0' },
                                y2: { scale: 'y', field: 'y1' },
                                fill: { scale: 'color', field: 'c' }
                            }
                        }
                    }
                ]
            }
        ]
    }

    const view = new vega.View(vega.parse(pollResults), { renderer: 'none' });

    const svg = await view.toSVG();

    return await sharp(Buffer.from(svg)).toFormat('png').toBuffer();
}