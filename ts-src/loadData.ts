import * as dotenv from 'dotenv';
import parse from 'csv-parse';
import { promises as fs } from 'fs';
import cliProgress from 'cli-progress';
import { join } from 'path';

import DocumentDAO from "./DocumentDAO";
import GraphDAO from "./GraphDAO";
import { Quote, User } from "./Model";
import MangoDataLoader from "./loadDataMango";

dotenv.config();

const buildUser = (id: number, username: string, first_name: string, last_name: string, language_code: string, is_bot: boolean): User => ({
  id,
  username,
  first_name,
  last_name,
  language_code,
  is_bot
});

const shuffle = (array: any[]): any[] => {

  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * i);
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
};

const users: User[] = [
  buildUser(220987852, 'mle', 'Maurice', 'Lehmann', 'fr', false),
  buildUser(136451861, 'thrudhvangr', 'christopher', '', 'fr', false),
  buildUser(136451862, 'NukedFace', 'marcus', '', 'fr', false),
];

const graphDAO = new GraphDAO();
const documentDAO = new DocumentDAO();
const mangoDataLoader = new MangoDataLoader(documentDAO);

(async () => {
    console.log('Starting mongo');
    await documentDAO.init();

    console.log('Preparing Neo4j');
    await graphDAO.prepare();

    console.log('Writing users to neo4j');
    await Promise.all(users.map((user) => graphDAO.upsertUser(user)));


    //Write movies in Mango
    console.log('Parsing CSV and writing movies to mongo');
    await mangoDataLoader.load('../data/quotes_dataset.csv')

    //Load them back to get their id along
    console.log('Loading quotes back in memory');
    const quotes = await documentDAO.getAllQuotes();

    // TODO : Neo4j stufffff :'(
    // Retrieve all tags and authors from all quotes, split them and assign a numeric id
    console.log('Calculating authors and tags');
    const tags = [...new Set(quotes.flatMap((it) => it.tags.split(',').map(it => it.trim())))].map((it, i) => [i, it]);
    const authors = [...new Set(quotes.flatMap((it) => it.author))].map((it, i) => [i, it]);
    //
    console.log('Handling quote insertion in Neo4j');
    const quotesBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    quotesBar.start(quotes.length, 0);
    for (let quote of quotes) {
      const quoteTags = quote.tags.split(',').map(i => i.trim());;
    
      await graphDAO.upsertQuote(quote._id);
    
      // Update tags <-> quote links
      await Promise.all(quoteTags.map((name) => {
        const id = tags.find((it) => it[1] === name)[0] as number;
        return graphDAO.upsertTag(quote._id, { id, name });
      }));

      // Update authors <-> quote links
      const name = quote.author;
      const id = authors.find((it) => it[1] === name)[0] as number;
      await graphDAO.upsertAuthor(quote._id, { id, name})

      quotesBar.increment();
    }
    quotesBar.stop();
    
    // // Add some films added by users
    // console.log('Add some films liked by users');
    // const addedPromise = [400, 87, 0, 34, 58].flatMap((quantity, index) => {
    //   return shuffle(movies).slice(0, quantity).map((movie: Movie) => {
    //     return graphDAO.upsertAdded(users[index].id, movie._id, {
    //       at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
    //     });
    //   });
    // });
    // await Promise.all(addedPromise);
    //
    // // Add some movies liked by users
    // console.log('Add some movies liked by users');
    // const likePromise = [280, 34, 98, 254, 0].flatMap((quantity, index) => {
    //   return shuffle(movies).slice(0, quantity).map((movie: Movie) => {
    //     return graphDAO.upsertMovieLiked(users[index], movie._id, {
    //       rank: Math.floor(Math.random() * 5) + 1 as 1 | 2 | 3 | 4 | 5,
    //       at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
    //     });
    //   });
    // });
    // await Promise.all(likePromise);
    //
    // // Add some actors liked by users
    // console.log('Add some actors liked by users');
    // const actorsPromise = [300, 674, 0, 45, 36].flatMap((quantity, index) => {
    //   return shuffle(actors).slice(0, quantity).map(([actorId, actor]) => {
    //     return graphDAO.upsertActorLiked(users[index].id, actorId, {
    //       rank: Math.floor(Math.random() * 5) + 1 as 1 | 2 | 3 | 4 | 5,
    //       at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
    //     });
    //   });
    // });
    // await Promise.all(actorsPromise);
    //
    // // Add some genres liked by users
    // console.log('Add some genres liked by users');
    // const genrePromise = [22, 3, 0, 4, 7].flatMap((quantity, index) => {
    //   return shuffle(genres).slice(0, quantity).map(([genreId, actor]) => {
    //     return graphDAO.upsertGenreLiked(users[index].id, genreId, {
    //       rank: Math.floor(Math.random() * 5) + 1 as 1 | 2 | 3 | 4 | 5,
    //       at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
    //     });
    //   });
    // });
    // await Promise.all(genrePromise);
    //
    // // Add some movies requested
    // console.log('Add some requested movies');
    // const requestedPromise = [560, 12, 456, 25, 387].flatMap((quantity, index) => {
    //   return shuffle(movies).slice(0, quantity).map((movie: Movie) => {
    //     return graphDAO.upsertRequested(users[index].id, movie._id, {
    //       at: new Date(160613000 * 1000 + (Math.floor(Math.random() * 3124) * 1000))
    //     });
    //   });
    // });
    // await Promise.all(requestedPromise);
    //
    // console.log('Done, closing sockets');
    // await Promise.all([
    //   documentDAO.close(),
    //   graphDAO.close()
    // ]);
})();
