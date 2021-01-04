const { Telegraf } = require('telegraf')
require('dotenv').config();

// Token INDIVIDUEL (pour les dév.), a mettre dans le fichier .env
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => {
    ctx.reply('Hello world!')
})
// Commande "/help"
bot.help((ctx) => {
    ctx.reply('TODO : < liste des commandes possibles > ')
})
// Message "quote"
bot.hears('quote', (ctx) => {
    ctx.reply('"L\'éternité, c\'est long...surtout vers la fin." - Woody Allen')
})

bot.launch()
