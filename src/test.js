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
import MangoDataLoader from "./loadDataMango";
const bot = new Telegraf(process.env.BOT_TOKEN);
const graphDAO = new GraphDAO();
const documentDAO = new DocumentDAO();
const mangoDataLoader = new MangoDataLoader(documentDAO);
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield documentDAO.init();
    //Write movies in Mango
    // console.log('Parsing CSV and writing movies to mongo');
    // await mangoDataLoader.load('../data/quotes_dataset.csv')
    const q = yield documentDAO.getRandomQuote(2);
    console.log(q[0].text);
}))();
