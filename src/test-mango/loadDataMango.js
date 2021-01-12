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
import parse from 'csv-parse';
import { join } from 'path';
const fs = require('fs');
import DocumentDAO from "./DocumentDAO";
dotenv.config();
const documentDAO = new DocumentDAO();
const parseMovies = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        parse();
        const results = [];
        fs.createReadStream(join(__dirname, '../data/quotes_dataset.csv'))
            .pipe(parse({ quote: true, relax_column_count: true }))
            .on('data', (data) => results.push(data))
            .on('end', () => {
            resolve(results);
        });
    });
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield documentDAO.init();
    yield parseMovies().then((data) => {
        // Start at 1 because of headers in data
        for (let i = 1; i < data.length; i++) {
            const quote = {
                _id: i.toString(),
                quote: data[i][0],
                author: data[i][1],
                tags: data[i][2]
            };
            documentDAO.insertQuote(quote);
        }
    });
    const allQuotes = yield documentDAO.getAllQuotes();
    for (let quote of allQuotes) {
        console.log(quote);
    }
}))();
