import * as dotenv from 'dotenv';

dotenv.config();

import { Telegraf } from 'telegraf';
import { InlineKeyboardMarkup, InlineQueryResultArticle } from 'telegraf/typings/telegram-types';
import DocumentDAO from './DocumentDAO';
import GraphDAO from './GraphDAO';
import { Liked, likedValues } from './Model';

const bot = new Telegraf(process.env.BOT_TOKEN);
const graphDAO = new GraphDAO();
const documentDAO = new DocumentDAO();

function stripMargin(template: TemplateStringsArray, ...expressions: any[]) {
  const result = template.reduce((accumulator, part, i) => {
      return accumulator + expressions[i - 1] + part;
  });
  return result.replace(/(\n|\r|\r\n)\s*\|/g, '$1');
}

function buildLikeKeyboard(quoteId: string, currentLike?: Liked): InlineKeyboardMarkup {
  return {
    inline_keyboard: [[
      {
        text: "Love it! 💓",
        callback_data: 'like__' + quoteId, // payload that will be retrieved when button is pressed
      },
    ]],
  }
}

function formatQuote(content: string, author: string): string {
  return '*' + content + '*\n\n_' + author + '_'
}

// User is using the inline query mode on the bot
bot.on('inline_query', async (ctx) => {
  // TODO: Uncomment when DAO is ready
  
  // const query = ctx.inlineQuery;
  // if (query) {
  //   const quotes = await documentDAO.getQuotes(query.query);
  //   const answer: InlineQueryResultArticle[] = quotes.map((quote) => ({
  //     id: quote._id,
  //     type: 'article',
  //     title: quote.author,
  //     description: quote.content,
  //     reply_markup: buildLikeKeyboard(quote._id),
  //     input_message_content: {
  //       message_text: formatQuote(quote.content, quote.author)
  //     },
  //   }));
  //   ctx.answerInlineQuery(answer);
  // }
});

// User chose a movie from the list displayed in the inline query
// Used to update the keyboard and show filled stars if user already liked it
bot.on('chosen_inline_result', async (ctx) => {

  // TODO: decide if we need something similar

  // if (ctx.from && ctx.chosenInlineResult) {
  //   const liked = await graphDAO.getMovieLiked(ctx.from.id, ctx.chosenInlineResult.result_id);
  //   if (liked !== null) {
  //     ctx.editMessageReplyMarkup(buildLikeKeyboard(ctx.chosenInlineResult.result_id, liked));
  //   }
  // }
});

function likeCallbackHandler(args: string[]) {
  // TODO: call Geo4J backend
}

bot.on('callback_query', async (ctx) => {
  if (ctx.callbackQuery && ctx.from) {
    const args = ctx.callbackQuery.data.split('__');
    
    switch (args[0]) {
      case 'like':
        likeCallbackHandler(args)
    }
  }
});


bot.command('help', (ctx) => {
  ctx.reply(`
TODO
  `);
});

bot.command('start', (ctx) => {
  ctx.replyWithMarkdown('*You\'re doing quite well.*\n\n_GlaDOS (ironically)_');
});

bot.command('recommendquote', (ctx) => {
  if (!ctx.from || !ctx.from.id) {
    ctx.reply('We cannot guess who you are');
  } else {
    // TODO: call Geo4J (and MongoDB?) backend
  }
});


// Initialize mongo connexion
// before starting bot
documentDAO.init().then(() => {
  bot.startPolling();
});