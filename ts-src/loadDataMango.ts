import parse from 'csv-parse';
import { join } from 'path';
const fs = require('fs')
import {Author, Quote} from "./Model";
import DocumentDAO from "./DocumentDAO";

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

    console.log("starting!..");
    await documentDAO.init();

    await parseMovies().then((data:string[]) => {
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
            documentDAO.insertQuote(quote);
        }
    });

    const allQuotes = await documentDAO.getAllQuotes();
    for(let quote of allQuotes){
        console.log(quote)
    }
})();
