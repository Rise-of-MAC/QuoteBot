import parse from 'csv-parse';
import { join } from 'path';
const fs = require('fs')
import {Author, Quote} from "./Model";
import DocumentDAO from "./DocumentDAO";

class MangoDataLoader {

    private documentDAO;

    constructor(documentDAO : DocumentDAO) {
        this.documentDAO = documentDAO;
    }

    private async parseQuotes(file : string) {
        parse();
        const results = [];
        return new Promise<any[]>((resolve => {
            fs.createReadStream(join(__dirname, file))
                .pipe(parse({quote : true, relax_column_count : true}))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    resolve(results)
                });
        }));
    }

    public async load (file : string) {
        console.log("starting!..");
        await this.parseQuotes(file).then((data:string[]) => {
            // Start at 1 because of headers in data
            for (let i = 1; i < data.length; i++) {
                const author : Author = {
                    name: data[i][1],
                }
                const quote : Quote = {
                    _id: i.toString(),
                    text: data[i][0],
                    author: author,
                    tags: data[i][2],
                    language: "en",
                    likes: 0,
                    added: new Date(),
                }
                this.documentDAO.insertQuote(quote);
            }
        });
        const allQuotes = await this.documentDAO.getAllQuotes();
        for(let quote of allQuotes){
            console.log(quote)
        }
    }
}
export default MangoDataLoader;
