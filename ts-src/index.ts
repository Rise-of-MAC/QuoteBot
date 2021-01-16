import * as dotenv from 'dotenv';

dotenv.config();

import { Context, Telegraf } from 'telegraf';
import { InlineKeyboardMarkup, InlineQueryResultArticle } from 'telegraf/typings/telegram-types';
import DocumentDAO from './DocumentDAO';
import GraphDAO from './GraphDAO';
import {Liked, User, Quote} from "./Model";

enum CallbackCommand {
  LIKE = 'like',
  STARRED = 'starred',
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const graphDAO = new GraphDAO();
const documentDAO = new DocumentDAO();

const callbackSep = '__';
const quotesPerPage = 5;

function stripMargin(template: TemplateStringsArray, ...expressions: any[]) {
  const result = template.reduce((accumulator, part, i) => {
      return accumulator + expressions[i - 1] + part;
  });
  return result.replace(/(\n|\r|\r\n)\s*\|/g, '$1');
}

function buildQuoteKeyboard(quoteId: string, currentLike?: Liked): InlineKeyboardMarkup {
  return {
    inline_keyboard: [[
      {
        text: "Love it! 💓",
        callback_data: CallbackCommand.LIKE + callbackSep + quoteId, // payload that will be retrieved when button is pressed
      },
      {
        text: "Share",
        switch_inline_query: quoteId
      }
    ]],
  }
}

function buildPaginationKeyboard(page: number, callbackCmd: CallbackCommand, end?: boolean): InlineKeyboardMarkup {
  const buttons = []
  if (page > 0) {
    buttons.push({
      text: "« Previous",
      callback_data: callbackCmd + callbackSep + (page - 1)
    })
  }

  if (!end) {
    buttons.push({
      text: "Next »",
      callback_data: callbackCmd + callbackSep + (page + 1)
    })
  }
  
  return {
    inline_keyboard: [buttons]
  };
}

function formatQuote(content: string, author: string): string {
  return '*' + content + '*\n\n_' + author + '_'
}

function formatQuotes(quotes: Quote[]): string {
  const text = quotes.map(q => formatQuote(q.text, q.author)).reduce((p, c) => p + c + '\n\n\n', '');
  return text.length ? text : 'Like more quotes to see them here!';
}

async function getQuotesLiked(userId: number, page: number): Promise<Quote[]> {
  const quotesId = await graphDAO.getQuotesLiked(userId, quotesPerPage, page);
  const quotes = [];
  for (const id of quotesId) {
    const quote = await documentDAO.getQuoteById(id)
    quotes.push(quote);
  }
  return quotes;
}

// User is using the inline query mode on the bot
bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery;
  if (query) {
    const quotes = [];

    // First search by id (for share function)
    const quote = await documentDAO.getQuoteById(query.query);
    if (quote !== null) {
      quotes.push(quote); 
    } else { // if no id matches, then search by author and text
      quotes.push(...(await documentDAO.getQuotesByAuthor(query.query)));
      quotes.push(...((await documentDAO.getQuotes(query.query))
        .filter(q => !quotes.map(q => q._id).includes(q._id))));
    }

    const answer: InlineQueryResultArticle[] = quotes.map((quote) => ({
      id: quote._id,
      type: 'article',
      title: quote.author,
      description: quote.text,
      reply_markup: buildQuoteKeyboard(quote._id),
      input_message_content: {
        message_text: formatQuote(quote.text, quote.author),
        parse_mode: "Markdown"
      },
    }));
    ctx.answerInlineQuery(answer);
  }
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

async function likeCallbackHandler(quoteId: string, user : User ) {
    await graphDAO.upsertQuoteLiked(user, quoteId);
}

async function starredCallbackHandler(page: number, ctx: Context) {
  const quotes = await getQuotesLiked(ctx.from.id, page);
  ctx.editMessageText(formatQuotes(quotes), {
    parse_mode: 'Markdown', 
    reply_markup: buildPaginationKeyboard(page, CallbackCommand.STARRED, !quotes.length)
  });
}

bot.on('callback_query', async (ctx) => {

  if (ctx.callbackQuery && ctx.from) {
    const args = ctx.callbackQuery.data.split(callbackSep);

    //args[0] == type of callback
    switch (args[0]) {
      case CallbackCommand.LIKE:
        //args[1] == id of quote
        await likeCallbackHandler(args[1], ctx.from)
        break;
      case CallbackCommand.STARRED:
        //args[1] == page number
        await starredCallbackHandler(parseInt(args[1]), ctx);
        break;
    }
    ctx.answerCbQuery();
  }
});


bot.command('random', async (ctx) => {
  const randomQuote = await documentDAO.getRandomQuote();
  const answer : string = randomQuote.author + " once said : " + randomQuote.text; 
  ctx.replyWithMarkdown(formatQuote(randomQuote.text, randomQuote.author), {
    reply_markup: buildQuoteKeyboard(randomQuote._id)
  });
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

bot.command('starred', async (ctx) => {
  if (ctx.from && ctx.from.id) {
    const quotes = await getQuotesLiked(ctx.from.id, 0);
    ctx.replyWithMarkdown(formatQuotes(quotes), {
      reply_markup: buildPaginationKeyboard(0, CallbackCommand.STARRED)
    });
  }
});


// Initialize mongo connexion
// before starting bot
documentDAO.init().then(() => {
  bot.startPolling();
});
