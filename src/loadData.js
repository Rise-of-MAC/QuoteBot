"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = __importStar(require("dotenv"));
var csv_parse_1 = __importDefault(require("csv-parse"));
var fs_1 = require("fs");
var cli_progress_1 = __importDefault(require("cli-progress"));
var path_1 = require("path");
var DocumentDAO_1 = __importDefault(require("./DocumentDAO"));
var GraphDAO_1 = __importDefault(require("./GraphDAO"));
dotenv.config();
var buildUser = function (id, username, first_name, last_name, language_code, is_bot) { return ({
    id: id,
    username: username,
    first_name: first_name,
    last_name: last_name,
    language_code: language_code,
    is_bot: is_bot
}); };
var shuffle = function (array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * i);
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};
var parseMovies = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, new Promise(function (resolve) {
                fs_1.promises.readFile(path_1.join(__dirname, '../data/movies.csv')).then(function (baseMovies) {
                    csv_parse_1.default(baseMovies, function (err, data) {
                        resolve(data);
                    });
                });
            })];
    });
}); };
var users = [
    buildUser(220987852, 'ovesco', 'guillaume', '', 'fr', false),
    buildUser(136451861, 'thrudhvangr', 'christopher', '', 'fr', false),
    buildUser(136451862, 'NukedFace', 'marcus', '', 'fr', false),
    buildUser(136451863, 'lauralol', 'laura', '', 'fr', false),
    buildUser(136451864, 'Saumonlecitron', 'jean-michel', '', 'fr', false),
];
var graphDAO = new GraphDAO_1.default();
var documentDAO = new DocumentDAO_1.default();
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var parseMoviesBar, parsedMovies, movies, genres, actors, moviesBar, _loop_1, movies_1, movies_1_1, movie, e_1_1, addedPromise, likePromise, actorsPromise, genrePromise, requestedPromise;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log('Starting mongo');
                return [4 /*yield*/, documentDAO.init()];
            case 1:
                _b.sent();
                console.log('Preparing Neo4j');
                return [4 /*yield*/, graphDAO.prepare()];
            case 2:
                _b.sent();
                console.log('Writing users to neo4j');
                return [4 /*yield*/, Promise.all(users.map(function (user) { return graphDAO.upsertUser(user); }))];
            case 3:
                _b.sent();
                // Write movies in mongo
                console.log('Parsing CSV and writing movies to mongo');
                parseMoviesBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
                return [4 /*yield*/, parseMovies()];
            case 4:
                parsedMovies = _b.sent();
                parseMoviesBar.start(parsedMovies.length, 0);
                return [4 /*yield*/, Promise.all(parsedMovies.map(function (it) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, rank, title, genre, description, director, actors, year, runtime, rating, votes, revenue, metascore;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = __read(it, 12), rank = _a[0], title = _a[1], genre = _a[2], description = _a[3], director = _a[4], actors = _a[5], year = _a[6], runtime = _a[7], rating = _a[8], votes = _a[9], revenue = _a[10], metascore = _a[11];
                                    return [4 /*yield*/, documentDAO.insertMovie({
                                            rank: rank, title: title, genre: genre, description: description, director: director,
                                            actors: actors, year: year, runtime: runtime, rating: rating, votes: votes,
                                            revenue: revenue, metascore: metascore
                                        })];
                                case 1:
                                    _b.sent();
                                    parseMoviesBar.increment();
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 5:
                _b.sent();
                parseMoviesBar.stop();
                // Load them back to get their id along
                console.log('Loading movies back in memory');
                return [4 /*yield*/, documentDAO.getAllMovies()];
            case 6:
                movies = _b.sent();
                // Retrieve all genres and actors from all movies, split them and assign a numeric id
                console.log('Calculating genres and actors');
                genres = __spread(new Set(movies.flatMap(function (it) { return it.genre.split(',').map(function (it) { return it.trim(); }); }))).map(function (it, i) { return [i, it]; });
                actors = __spread(new Set(movies.flatMap(function (it) { return it.actors.split(',').map(function (it) { return it.trim(); }); }))).map(function (it, i) { return [i, it]; });
                console.log('Handling movie insertion in Neo4j');
                moviesBar = new cli_progress_1.default.SingleBar({}, cli_progress_1.default.Presets.shades_classic);
                moviesBar.start(movies.length, 0);
                _loop_1 = function (movie) {
                    var movieGenres, movieActors;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                movieGenres = movie.genre.split(',').map(function (i) { return i.trim(); });
                                movieActors = movie.actors.split(',').map(function (i) { return i.trim(); });
                                return [4 /*yield*/, graphDAO.upsertMovie(movie._id, movie.title)];
                            case 1:
                                _a.sent();
                                // Update actor <-> movie links
                                return [4 /*yield*/, Promise.all(movieActors.map(function (name) {
                                        var id = actors.find(function (it) { return it[1] === name; })[0];
                                        return graphDAO.upsertActor(movie._id, { id: id, name: name });
                                    }))];
                            case 2:
                                // Update actor <-> movie links
                                _a.sent();
                                // Update genre <-> movie links
                                return [4 /*yield*/, Promise.all(movieGenres.map(function (name) {
                                        var id = genres.find(function (it) { return it[1] === name; })[0];
                                        return graphDAO.upsertGenre(movie._id, { id: id, name: name });
                                    }))];
                            case 3:
                                // Update genre <-> movie links
                                _a.sent();
                                moviesBar.increment();
                                return [2 /*return*/];
                        }
                    });
                };
                _b.label = 7;
            case 7:
                _b.trys.push([7, 12, 13, 14]);
                movies_1 = __values(movies), movies_1_1 = movies_1.next();
                _b.label = 8;
            case 8:
                if (!!movies_1_1.done) return [3 /*break*/, 11];
                movie = movies_1_1.value;
                return [5 /*yield**/, _loop_1(movie)];
            case 9:
                _b.sent();
                _b.label = 10;
            case 10:
                movies_1_1 = movies_1.next();
                return [3 /*break*/, 8];
            case 11: return [3 /*break*/, 14];
            case 12:
                e_1_1 = _b.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 14];
            case 13:
                try {
                    if (movies_1_1 && !movies_1_1.done && (_a = movies_1.return)) _a.call(movies_1);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 14:
                moviesBar.stop();
                // Add some films added by users
                console.log('Add some films liked by users');
                addedPromise = [400, 87, 0, 34, 58].flatMap(function (quantity, index) {
                    return shuffle(movies).slice(0, quantity).map(function (movie) {
                        return graphDAO.upsertAdded(users[index].id, movie._id, {
                            at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
                        });
                    });
                });
                return [4 /*yield*/, Promise.all(addedPromise)];
            case 15:
                _b.sent();
                // Add some movies liked by users
                console.log('Add some movies liked by users');
                likePromise = [280, 34, 98, 254, 0].flatMap(function (quantity, index) {
                    return shuffle(movies).slice(0, quantity).map(function (movie) {
                        return graphDAO.upsertMovieLiked(users[index], movie._id, {
                            rank: Math.floor(Math.random() * 5) + 1,
                            at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
                        });
                    });
                });
                return [4 /*yield*/, Promise.all(likePromise)];
            case 16:
                _b.sent();
                // Add some actors liked by users
                console.log('Add some actors liked by users');
                actorsPromise = [300, 674, 0, 45, 36].flatMap(function (quantity, index) {
                    return shuffle(actors).slice(0, quantity).map(function (_a) {
                        var _b = __read(_a, 2), actorId = _b[0], actor = _b[1];
                        return graphDAO.upsertActorLiked(users[index].id, actorId, {
                            rank: Math.floor(Math.random() * 5) + 1,
                            at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
                        });
                    });
                });
                return [4 /*yield*/, Promise.all(actorsPromise)];
            case 17:
                _b.sent();
                // Add some genres liked by users
                console.log('Add some genres liked by users');
                genrePromise = [22, 3, 0, 4, 7].flatMap(function (quantity, index) {
                    return shuffle(genres).slice(0, quantity).map(function (_a) {
                        var _b = __read(_a, 2), genreId = _b[0], actor = _b[1];
                        return graphDAO.upsertGenreLiked(users[index].id, genreId, {
                            rank: Math.floor(Math.random() * 5) + 1,
                            at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
                        });
                    });
                });
                return [4 /*yield*/, Promise.all(genrePromise)];
            case 18:
                _b.sent();
                // Add some movies requested
                console.log('Add some requested movies');
                requestedPromise = [560, 12, 456, 25, 387].flatMap(function (quantity, index) {
                    return shuffle(movies).slice(0, quantity).map(function (movie) {
                        return graphDAO.upsertRequested(users[index].id, movie._id, {
                            at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
                        });
                    });
                });
                return [4 /*yield*/, Promise.all(requestedPromise)];
            case 19:
                _b.sent();
                console.log('Done, closing sockets');
                return [4 /*yield*/, Promise.all([
                        documentDAO.close(),
                        graphDAO.close()
                    ])];
            case 20:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); })();
