import * as dotenv from 'dotenv';

dotenv.config();

import { Telegraf } from 'telegraf';
import { InlineKeyboardMarkup, InlineQueryResultArticle } from 'telegraf/typings/telegram-types';
import DocumentDAO from './DocumentDAO';
import GraphDAO from './GraphDAO';
import {Liked} from "./Model";
import MangoDataLoader from "./loadDataMango";

const bot = new Telegraf(process.env.BOT_TOKEN);
const graphDAO = new GraphDAO();
const documentDAO = new DocumentDAO();
const mangoDataLoader = new MangoDataLoader(documentDAO);


(async () => {
  await documentDAO.init();

 //Write movies in Mango
 // console.log('Parsing CSV and writing movies to mongo');
  // await mangoDataLoader.load('../data/quotes_dataset.csv')

  const q = await documentDAO.getQuotesByAuthor('John Green');
  console.log(q[0].text);
  console.log(q[0].author);
  console.log(q[0].tags);
})();