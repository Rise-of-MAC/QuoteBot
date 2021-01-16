var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';
import DocumentDAO from './DocumentDAO';
import GraphDAO from './GraphDAO';
const bot = new Telegraf(process.env.BOT_TOKEN);
const graphDAO = new GraphDAO();
const documentDAO = new DocumentDAO();
function stripMargin(template, ...expressions) {
    const result = template.reduce((accumulator, part, i) => {
        return accumulator + expressions[i - 1] + part;
    });
    return result.replace(/(\n|\r|\r\n)\s*\|/g, '$1');
}
function buildLikeKeyboard(quoteId, currentLike) {
    return {
        inline_keyboard: [[
                {
                    text: "Love it! 💓",
                    callback_data: 'like__' + quoteId,
                },
                {
                    text: "Share",
                    switch_inline_query: quoteId
                }
            ]],
    };
}
function buildRecommandationsKeyboard(tags) {
    return {
        inline_keyboard: [[
                {
                    text: tags[0].name,
                    callback_data: 'like__' + quoteId,
                },
                {
                    text: "Share",
                    switch_inline_query: quoteId
                }
            ]],
    };
}
function formatQuote(content, author) {
    return '*' + content + '*\n\n_' + author + '_';
}
// User is using the inline query mode on the bot
bot.on('inline_query', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const query = ctx.inlineQuery;
    if (query) {
        const quotes = [];
        // First search by id (for share function)
        const quote = yield documentDAO.getQuoteById(query.query);
        if (quote != null) {
            quotes.push(quote);
        }
        else { // if no id matches, then search by author and text
            quotes.push(...(yield documentDAO.getQuotesByAuthor(query.query)));
            quotes.push(...(yield (yield documentDAO.getQuotes(query.query))
                .filter(q => !quotes.map(q => q._id).includes(q._id))));
        }
        const answer = quotes.map((quote) => ({
            id: quote._id,
            type: 'article',
            title: quote.author,
            description: quote.text,
            reply_markup: buildLikeKeyboard(quote._id),
            input_message_content: {
                message_text: formatQuote(quote.text, quote.author),
                parse_mode: "Markdown"
            },
        }));
        ctx.answerInlineQuery(answer);
    }
}));
// User chose a movie from the list displayed in the inline query
// Used to update the keyboard and show filled stars if user already liked it
bot.on('chosen_inline_result', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // TODO: decide if we need something similar
    // if (ctx.from && ctx.chosenInlineResult) {
    //   const liked = await graphDAO.getMovieLiked(ctx.from.id, ctx.chosenInlineResult.result_id);
    //   if (liked !== null) {
    //     ctx.editMessageReplyMarkup(buildLikeKeyboard(ctx.chosenInlineResult.result_id, liked));
    //   }
    // }
}));
function likeCallbackHandler(quoteId, user) {
    return __awaiter(this, void 0, void 0, function* () {
        yield graphDAO.upsertQuoteLiked(user, quoteId);
    });
}
bot.on('callback_query', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.callbackQuery && ctx.from) {
        const args = ctx.callbackQuery.data.split('__');
        //args[0] == type of callback
        //args[1] == id of quote
        switch (args[0]) {
            case 'like':
                yield likeCallbackHandler(args[1], ctx.from);
                break;
            case 'recommandation':
                break;
        }
        ctx.answerCbQuery();
    }
}));
bot.command('random', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    const randomQuote = yield documentDAO.getRandomQuote();
    const answer = randomQuote.author + " once said : " + randomQuote.text;
    ctx.replyWithMarkdown(formatQuote(randomQuote.text, randomQuote.author), {
        reply_markup: buildLikeKeyboard(randomQuote._id)
    });
}));
bot.command('recommand', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield graphDAO.upsertUser(ctx.from);
    const tags = yield graphDAO.getMyTopFiveTags(ctx.from);
    const answer = randomQuote.author + " once said : " + randomQuote.text;
    ctx.replyWithMarkdown(formatQuote(randomQuote.text, randomQuote.author), {
        reply_markup: buildLikeKeyboard(randomQuote._id)
    });
}));
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
    }
    else {
        // TODO: call Geo4J (and MongoDB?) backend
    }
});
// Initialize mongo connexion
// before starting bot
documentDAO.init().then(() => {
    bot.startPolling();
});
