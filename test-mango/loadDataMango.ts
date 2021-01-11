import * as dotenv from 'dotenv';
import parse from 'csv-parse';
import { join } from 'path';
const fs = require('fs')
import { Quote } from "./Model";
import DocumentDAO from "./DocumentDAO";

dotenv.config();

const documentDAO = new DocumentDAO();

const parseMovies = async (): Promise<any[]> => new Promise((resolve) => {
    parse();
    const results = [];
    fs.createReadStream(join(__dirname, '../data/quotes_dataset.csv'))
        .pipe(parse({quote : true, relax_column_count : true}))
        .on('data', (data) => results.push(data))
        .on('end', () => {
            resolve(results)
        });
});

(async () => {

    await documentDAO.init();

    const parsedMovies = await parseMovies().then((data:string[]) => {
        // Start at 1 because of headers in data
        for (let i = 1; i < data.length; i++) {
            const quote : Quote = {
                _id: i.toString(),
                quote: data[i][0],
                author: data[i][1],
                tags: data[i][2]
            }
            documentDAO.insertQuote(quote);
        }
    });

    const allQuotes = await documentDAO.getAllQuotes();
    for(let quote of allQuotes){
        console.log(quote)
    }
})();
