import { Collection, Db, MongoClient } from "mongodb";
import { Quote } from "./Model";
// import * as dotenv from "dotenv";


class DocumentDAO {

    private DB_HOST : string = "root:toor@localhost:27017"
    private DB_NAME : string = "quote-db"
    private client: MongoClient;

    private db: Db;

    private collection: Collection;

    async init(): Promise<any> {

        return new Promise((resolve) => {
            MongoClient.connect('mongodb://'+ this.DB_HOST, (err, client) => {
                if (err !== null) throw err;
                this.client = client;
                this.db = client.db(this.DB_NAME);
                this.collection = this.db.collection('quote-db');
                resolve(null);
            });
        });
    }

    async close() {
        await this.client.close();
    }

    async insertQuote(quote: Partial<Quote>) {
        await this.collection.insertOne(quote, function(err, res) {
          if (err) throw err;
          console.log("1 document inserted");
        });
    }

    async getQuotes(search: string): Promise<Quote[]> {
        return await this.collection.find({ 'text': new RegExp(search) }).limit(10).toArray();
    }

    async getQuotesByAuthor(search: string): Promise<Quote[]> {
        return await this.collection.find({ 'author': new RegExp(search) }).limit(10).toArray();
    }

    async getQuoteById(id: string): Promise<Quote> {
        return await this.collection.findOne({ _id: id });
    }

    async getRandomQuote() {

        const quotes = await this.getAllQuotes();
        const r =  Math.floor(Math.random() * (0 - quotes.length) + quotes.length);
        const randomQuote = quotes[r];
        return randomQuote;
    }

    async getAllQuotes(): Promise<Quote[]> {
        return (await this.collection.find().toArray()).map((it) => ({
            ...it,
            _id: it._id.toString()
        }));
    }
}

export default DocumentDAO;
