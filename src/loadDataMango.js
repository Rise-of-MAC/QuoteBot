var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import parse from 'csv-parse';
import { join } from 'path';
const fs = require('fs');
class MangoDataLoader {
    constructor(documentDAO) {
        this.documentDAO = documentDAO;
    }
    parseQuotes(file) {
        return __awaiter(this, void 0, void 0, function* () {
            parse();
            const results = [];
            return new Promise((resolve => {
                fs.createReadStream(join(__dirname, file))
                    .pipe(parse({ quote: true, relax_column_count: true }))
                    .on('data', (data) => results.push(data))
                    .on('end', () => {
                    resolve(results);
                });
            }));
        });
    }
    load(file) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("starting!..");
            yield this.parseQuotes(file).then((data) => {
                // Start at 1 because of headers in data
                for (let i = 1; i < data.length; i++) {
                    //Added an id field in Author so this was not viable anymore
                    // const author : Author = {
                    //     name: data[i][1],
                    // }
                    const quote = {
                        _id: i.toString(),
                        text: data[i][0],
                        author: data[i][1],
                        tags: data[i][2],
                        language: "en",
                        likes: 0,
                        added: new Date(),
                    };
                    this.documentDAO.insertQuote(quote);
                }
            });
        });
    }
}
export default MangoDataLoader;
