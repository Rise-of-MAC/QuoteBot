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
class DocumentDAO {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                MongoClient.connect(`mongodb://${process.env.DOCUMENTDB_HOST}`, (err, client) => {
                    if (err !== null)
                        throw err;
                    this.client = client;
                    this.db = client.db(process.env.DOCUMENTDB_NAME);
                    this.collection = this.db.collection('movies-mac');
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
    insertMovie(movie) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.collection.insertOne(movie);
        });
    }
    getMovies(search) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.collection.find({ 'title': new RegExp(search) }).limit(10).toArray();
        });
    }
    getMovieById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.collection.findOne({ _id: id });
        });
    }
    getRandomMovies(n) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.collection.find().limit(n).toArray();
        });
    }
    getAllMovies() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.collection.find().toArray()).map((it) => (Object.assign(Object.assign({}, it), { _id: it._id.toString() })));
        });
    }
}
export default DocumentDAO;
