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
import { promises as fs } from 'fs';
import cliProgress from 'cli-progress';
import { join } from 'path';
import DocumentDAO from "./DocumentDAO";
import GraphDAO from "./GraphDAO";
dotenv.config();
const buildUser = (id, username, first_name, last_name, language_code, is_bot) => ({
    id,
    username,
    first_name,
    last_name,
    language_code,
    is_bot
});
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
};
const parseMovies = () => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => {
        fs.readFile(join(__dirname, '../data/movies.csv')).then((baseMovies) => {
            parse(baseMovies, (err, data) => {
                resolve(data);
            });
        });
    });
});
const users = [
    buildUser(220987852, 'ovesco', 'guillaume', '', 'fr', false),
    buildUser(136451861, 'thrudhvangr', 'christopher', '', 'fr', false),
    buildUser(136451862, 'NukedFace', 'marcus', '', 'fr', false),
    buildUser(136451863, 'lauralol', 'laura', '', 'fr', false),
    buildUser(136451864, 'Saumonlecitron', 'jean-michel', '', 'fr', false),
];
const graphDAO = new GraphDAO();
const documentDAO = new DocumentDAO();
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Starting mongo');
    yield documentDAO.init();
    console.log('Preparing Neo4j');
    yield graphDAO.prepare();
    console.log('Writing users to neo4j');
    yield Promise.all(users.map((user) => graphDAO.upsertUser(user)));
    // Write movies in mongo
    console.log('Parsing CSV and writing movies to mongo');
    const parseMoviesBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    const parsedMovies = yield parseMovies();
    parseMoviesBar.start(parsedMovies.length, 0);
    yield Promise.all(parsedMovies.map((it) => __awaiter(void 0, void 0, void 0, function* () {
        const [rank, title, genre, description, director, actors, year, runtime, rating, votes, revenue, metascore] = it;
        yield documentDAO.insertMovie({
            rank, title, genre, description, director,
            actors, year, runtime, rating, votes,
            revenue, metascore
        });
        parseMoviesBar.increment();
    })));
    parseMoviesBar.stop();
    // Load them back to get their id along
    console.log('Loading movies back in memory');
    const movies = yield documentDAO.getAllMovies();
    // Retrieve all genres and actors from all movies, split them and assign a numeric id
    console.log('Calculating genres and actors');
    const genres = [...new Set(movies.flatMap((it) => it.genre.split(',').map(it => it.trim())))].map((it, i) => [i, it]);
    const actors = [...new Set(movies.flatMap((it) => it.actors.split(',').map(it => it.trim())))].map((it, i) => [i, it]);
    console.log('Handling movie insertion in Neo4j');
    const moviesBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    moviesBar.start(movies.length, 0);
    for (let movie of movies) {
        const movieGenres = movie.genre.split(',').map(i => i.trim());
        const movieActors = movie.actors.split(',').map(i => i.trim());
        yield graphDAO.upsertMovie(movie._id, movie.title);
        // Update actor <-> movie links
        yield Promise.all(movieActors.map((name) => {
            const id = actors.find((it) => it[1] === name)[0];
            return graphDAO.upsertActor(movie._id, { id, name });
        }));
        // Update genre <-> movie links
        yield Promise.all(movieGenres.map((name) => {
            const id = genres.find((it) => it[1] === name)[0];
            return graphDAO.upsertGenre(movie._id, { id, name });
        }));
        moviesBar.increment();
    }
    moviesBar.stop();
    // Add some films added by users
    console.log('Add some films liked by users');
    const addedPromise = [400, 87, 0, 34, 58].flatMap((quantity, index) => {
        return shuffle(movies).slice(0, quantity).map((movie) => {
            return graphDAO.upsertAdded(users[index].id, movie._id, {
                at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
            });
        });
    });
    yield Promise.all(addedPromise);
    // Add some movies liked by users
    console.log('Add some movies liked by users');
    const likePromise = [280, 34, 98, 254, 0].flatMap((quantity, index) => {
        return shuffle(movies).slice(0, quantity).map((movie) => {
            return graphDAO.upsertMovieLiked(users[index], movie._id, {
                rank: Math.floor(Math.random() * 5) + 1,
                at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
            });
        });
    });
    yield Promise.all(likePromise);
    // Add some actors liked by users
    console.log('Add some actors liked by users');
    const actorsPromise = [300, 674, 0, 45, 36].flatMap((quantity, index) => {
        return shuffle(actors).slice(0, quantity).map(([actorId, actor]) => {
            return graphDAO.upsertActorLiked(users[index].id, actorId, {
                rank: Math.floor(Math.random() * 5) + 1,
                at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
            });
        });
    });
    yield Promise.all(actorsPromise);
    // Add some genres liked by users
    console.log('Add some genres liked by users');
    const genrePromise = [22, 3, 0, 4, 7].flatMap((quantity, index) => {
        return shuffle(genres).slice(0, quantity).map(([genreId, actor]) => {
            return graphDAO.upsertGenreLiked(users[index].id, genreId, {
                rank: Math.floor(Math.random() * 5) + 1,
                at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
            });
        });
    });
    yield Promise.all(genrePromise);
    // Add some movies requested
    console.log('Add some requested movies');
    const requestedPromise = [560, 12, 456, 25, 387].flatMap((quantity, index) => {
        return shuffle(movies).slice(0, quantity).map((movie) => {
            return graphDAO.upsertRequested(users[index].id, movie._id, {
                at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
            });
        });
    });
    yield Promise.all(requestedPromise);
    console.log('Done, closing sockets');
    yield Promise.all([
        documentDAO.close(),
        graphDAO.close()
    ]);
}))();
