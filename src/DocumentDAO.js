var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MongoClient } from "mongodb";
// import * as dotenv from "dotenv";
class DocumentDAO {
    constructor() {
        this.DB_HOST = "root:toor@localhost:27017";
        this.DB_NAME = "quote-db";
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                MongoClient.connect('mongodb://' + this.DB_HOST, (err, client) => {
                    if (err !== null)
                        throw err;
                    this.client = client;
                    this.db = client.db(this.DB_NAME);
                    this.collection = this.db.collection('quote-db');
                    this.db.dropDatabase();
                    resolve(null);
                });
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.close();
        });
    }
    insertQuote(quote) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.collection.insertOne(quote);
        });
    }
    getQuotes(search) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.collection.find({ 'text': new RegExp(search) }).limit(10).toArray();
        });
    }
    getQuoteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.collection.findOne({ _id: id });
        });
    }
    getRandomQuote(n) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.collection.find().limit(n).toArray();
        });
    }
    getAllQuotes() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.collection.find().toArray()).map((it) => (Object.assign(Object.assign({}, it), { _id: it._id.toString() })));
        });
    }
}
export default DocumentDAO;
