var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import neo4j, { types, int } from 'neo4j-driver';
class GraphDAO {
    constructor() {
        console.log("graphdb host = " + process.env.GRAPHDB_HOST);
        console.log("graphdb password = " + process.env.GRAPHDB_PASSWORD);
        console.log("process.env = " + process.env);
        this.driver = neo4j.driver(`bolt://${process.env.GRAPHDB_HOST}`, neo4j.auth.basic('neo4j', process.env.GRAPHDB_PASSWORD));
    }
    prepare() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.run("CREATE CONSTRAINT ON (q:Quote) ASSERT q.id IS UNIQUE", {});
            yield this.run("CREATE CONSTRAINT ON (a:Author) ASSERT a.id IS UNIQUE", {});
            yield this.run("CREATE CONSTRAINT ON (t:Tag) ASSERT t.id IS UNIQUE", {});
            yield this.run("CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE", {});
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.driver.close();
        });
    }
    upsertQuote(quoteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run('MERGE (q:Quote{id: $quoteId}) RETURN q', {
                quoteId,
            });
        });
    }
    //Link an author to a quote. If it did not exist, creates the author
    upsertAuthor(quoteId, author) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (q:Quote{id: $quoteId})
      MERGE (a:Author{id: $authorId})
        ON CREATE SET a.name = $authorName
      MERGE (a)-[r:WROTE]->(q)
    `, {
                quoteId,
                authorId: author.id,
                authorName: author.name,
            });
        });
    }
    //Link a tag to a quote. If it did not exist, creates the author
    upsertTag(quoteId, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (q:Quote{ id: $quoteId })
      MERGE (t:Tag{id: $tagId})
        ON CREATE SET t.name = $tagName
      MERGE (q)-[r:LABELS]->(t)
    `, {
                quoteId,
                tagId: tag.id,
                tagName: tag.name,
            });
        });
    }
    upsertUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MERGE (u:User {id: $userId})
      ON CREATE SET u.isBot = $isBot,
                    u.firstName = $firstName,
                    u.username = $username,
                    u.languageCode = $languageCode
      ON MATCH SET  u.isBot = $isBot,
                    u.firstName = $firstName,
                    u.username = $username,
                    u.languageCode = $languageCode
    `, {
                userId: this.toInt(user.id),
                firstName: user.first_name,
                username: user.username,
                languageCode: user.language_code,
                isBot: user.is_bot,
            });
        });
    }
    upsertQuoteLiked(user, quoteId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.run(`
      MATCH (q:Quote {id: $quoteId})
        MERGE (u:User {id: $userId})
          ON CREATE SET u.isBot = $isBot,
                        u.firstName = $firstName,
                        u.username = $username,
                        u.languageCode = $languageCode
          ON MATCH SET  u.isBot = $isBot,
                        u.firstName = $firstName,
                        u.username = $username,
                        u.languageCode = $languageCode
        MERGE (u)-[l:LIKED]->(q)
    `, {
                quoteId,
                isBot: user.is_bot,
                firstName: user.first_name,
                languageCode: user.language_code,
                username: user.username,
                userId: this.toInt(user.id),
            });
        });
    }
    getMyTopFiveTags(user) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.run(`
      MATCH (u:User{id: $userId})-[l:LIKED]->(q:Quote)-[l2:LABELS]->(t:Tag) 
      RETURN t, count(*)
      ORDER BY count(*) desc
      LIMIT 5
    `, {
                userId: user.id
            });
        });
    }
    getRecommandation(user, tag) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.run(`
      MATCH (u:User{id: $userId})-[l:LIKED]->(q:Quote)<-[w:WROTE]-(a:Author)
      MATCH (a)-[w2:WROTE]->(q2:Quote)-[l2:LABELS]->(t:Tag{id:$tagId})
      WHERE NOT (u)-[:LIKED]->(q2)
      WITH q2, rand() AS r
      ORDER BY r
      RETURN q2
      LIMIT 1
    `, {
                userId: user.id,
                $tagId: tag.id
            });
        });
    }
    //LIKE a quote: MATCH (u:User{id: "1"}) MERGE (u)-[l:LIKED]->(q:Quote{id:13 })
    //-------------------------WIP Complex request--------------------------
    //Get the tags that belong to the quotes a user liked and the amount of likes
    //MATCH (u:User{id: "1"})-[l:LIKED]->(q:Quote)-[l2:LABELS]->(t:Tag) RETURN t, count(*)
    //Get my top authors that wrote quotes I liked
    // MATCH (u:User{id: "1"})-[l:LIKED]->(q:Quote)<-[w:WROTE]-(a:Author) RETURN a LIMIT 10
    //MATCH (u:User{id: "1"})-[l:LIKED]->(q:Quote)<-[w:WROTE]-(a:Author)-[w2:WROTE]->(q2:Quote)-[l2:LABELS]->(t:Tag{id: "1"})
    //RETURN q2
    // Complex recomandation request! (manque: top x des auteurs, mais c'est pas une bonne idée; filter par nombre de likes)
    // MATCH (u:User{id: 136451861})-[l:LIKED]->(q:Quote)<-[w:WROTE]-(a:Author)
    // MATCH (a)-[w2:WROTE]->(q2:Quote)-[l2:LABELS]->(t:Tag{id:30})
    // WHERE NOT (u)-[:LIKED]->(q2)
    // WITH q2, rand() AS r
    // ORDER BY r
    // RETURN q2
    // LIMIT 1
    //---------------------------OLD CODE BUT USEFUL TO COPY -----------------------------------------------------------------
    // async getMovieLiked(userId: number, movieId: string): Promise<Liked | null> {
    //   return await this.run('MATCH (:User{id: $userId})-[l:LIKED]-(:Movie{id: $movieId}) RETURN l', {
    //     userId,
    //     movieId,
    //   }).then((res) => {
    //     if (res.records.length === 0) return null;
    //     else {
    //       const record = res.records[0].get('l');
    //       return {
    //         rank: record.properties.rank,
    //         at: record.properties.at,
    //       }
    //     }
    //   });
    // }
    // async upsertMovie(movieId: string, movieTitle: string) {
    //   return await this.run('MERGE (m:Movie{id: $movieId}) ON CREATE SET m.title = $movieTitle RETURN m', {
    //     movieId,
    //     movieTitle,
    //   })
    // }
    // async upsertActor(movieId: string, actor: Actor) {
    //   return await this.run(`
    //     MATCH (m:Movie{ id: $movieId })
    //     MERGE (a:Actor{id: $actorId})
    //       ON CREATE SET a.name = $actorName
    //     MERGE (a)-[r:PLAYED_IN]->(m)
    //   `, {
    //     movieId,
    //     actorId: actor.id,
    //     actorName: actor.name,
    //   })
    // }
    // async upsertGenre(movieId: string, genre: Genre) {
    //   return await this.run(`
    //     MATCH (m:Movie{ id: $movieId })
    //     MERGE (g:Genre{id: $genreId})
    //       ON CREATE SET g.name = $genreName
    //     MERGE (m)-[r:BELONGS_TO]->(g)
    //   `, {
    //     movieId,
    //     genreId: genre.id,
    //     genreName: genre.name,
    //   });
    // }
    // async upsertAdded(userId: number, movieId: string, added: Added) {
    //   return await this.run(`
    //     MATCH (m:Movie{ id: $movieId })
    //     MATCH (u:User{ id: $userId })
    //     MERGE (u)-[r:ADDED]->(m)
    //       ON CREATE SET r.at = $at
    //       ON MATCH SET  r.at = $at
    //   `, {
    //     userId: this.toInt(userId),
    //     movieId,
    //     at: this.toDate(added.at),
    //   });
    // }
    // async upsertMovieUserLiked(userId: number, movieId: string, liked: Liked) {
    //   return await this.run(`
    //     MATCH (m:Movie{ id: $movieId })
    //     MATCH (u:User{ id: $userId })
    //     MERGE (u)-[r:LIKED]->(m)
    //       ON CREATE SET r.at = $at,
    //                     r.rank = $rank
    //       ON MATCH SET  r.at = $at,
    //                     r.rank = $rank
    //   `, {
    //     userId: this.toInt(userId),
    //     movieId,
    //     at: this.toDate(liked.at),
    //     rank: this.toInt(liked.rank)
    //   });
    // }
    // async upsertGenreLiked(userId: number, genreId: number, liked: Liked) {
    //   return await this.run(`
    //     MATCH (g:Genre{ id: $genreId })
    //     MATCH (u:User{ id: $userId })
    //     MERGE (u)-[r:LIKED]->(g)
    //     ON CREATE SET r.at = $at,
    //                   r.rank = $rank
    //     ON MATCH SET  r.at = $at,
    //                   r.rank = $rank
    //   `, {
    //     userId: this.toInt(userId),
    //     genreId: this.toInt(genreId),
    //     at: this.toDate(liked.at),
    //     rank: liked.rank
    //   });
    // }
    // async upsertActorLiked(userId: number, actorId: number, liked: Liked) {
    //   return await this.run(`
    //     MATCH (a:Actor{ id: $actorId })
    //     MATCH (u:User{ id: $userId })
    //     MERGE (u)-[r:LIKED]->(g)
    //     ON CREATE SET r.at = $at,
    //                   r.rank = $rank
    //     ON MATCH SET  r.at = $at,
    //                   r.rank = $rank
    //   `, {
    //     userId: this.toInt(userId),
    //     actorId: this.toInt(actorId),
    //     at: this.toDate(liked.at),
    //     rank: this.toInt(liked.rank)
    //   });
    // }
    // async upsertRequested(userId: number, movieId: string, requested: Requested) {
    //   return await this.run(`
    //     MATCH (m:Movie{ id: $movieId })
    //     MATCH (u:User{ id: $userId })
    //     MERGE (u)-[r:REQUESTED]->(m)
    //       ON CREATE SET r.at = $at
    //       ON MATCH SET  r.at = $at
    //   `, {
    //     userId: this.toInt(userId),
    //     movieId,
    //     at: this.toDate(requested.at),
    //   });
    // }
    // async upsertCommentAboutMovie(userId: number, movieId: string, comment: Comment) {
    //   return await this.run(`
    //     MATCH (m:Movie{ id: $movieId })
    //     MATCH (u:User{ id: $userId })
    //     MERGE (c:Comment{ id: $commentId })
    //       ON CREATE SET c.text = $commentText,
    //                     c.at = $commentAt
    //       ON MATCH SET  c.text = $commentText,
    //                     c.at = $commentAt
    //     MERGE (u)-[r:WROTE]->(c)
    //     MERGE (c)-[r:ABOUT]->(m)
    //   `, {
    //     userId: this.toInt(userId),
    //     movieId,
    //     commentId: this.toInt(comment.id),
    //     commentAt: this.toDate(comment.at),
    //     commentText: comment.text
    //   });
    // }
    // async upsertCommentAbountComment(userId: number, commentId: number, comment: Comment) {
    //   return await this.run(`
    //     MATCH (cc:Comment{ id: $commentId })
    //     MATCH (u:User{ id: $userId })
    //     MERGE (c:Comment{ id: $subCommentId })
    //       ON CREATE SET c.text = $subCommentText,
    //                     c.at = $subCommentAt
    //       ON MATCH SET  c.text = $subCommentText,
    //                     c.at = $subCommentAt
    //     MERGE (u)-[r:WROTE]->(c)
    //     MERGE (c)-[r:ABOUT]->(cc)
    //   `, {
    //     userId: this.toInt(userId),
    //     commentId: this.toInt(commentId),
    //     subCommentId: this.toInt(comment.id),
    //     subCommentAt: this.toDate(comment.at),
    //     subCommentText: comment.text
    //   });
    // }
    // async recommendActors(userId: number) {
    //   /*
    //   return await this.run(`
    //     match (u:User{id: $userId})-[l:LIKED]->(m:Movie)<-[:PLAYED_IN]-(a:Actor)-[:PLAYED_IN]->(m2:Movie)<-[l2:LIKED]-(u)
    //     where id(m) < id(m2) and l.rank > 3 and l2.rank > 3
    //     return a, count(*)
    //     order by count(*) desc
    //     limit 5
    //   `, {
    //     userId
    //   }).then((result) => result.records);
    //   */
    //  return await this.run(`
    //     match (u:User{id: $userId})-[l:LIKED]->(m:Movie)<-[:PLAYED_IN]-(a:Actor)
    //     return a, count(*)
    //     order by count(*) desc
    //     limit 5
    //   `, {
    //     userId
    //   }).then((result) => result.records);
    // }
    toDate(value) {
        return types.DateTime.fromStandardDate(value);
    }
    toInt(value) {
        return int(value);
    }
    run(query, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const session = this.driver.session();
            const result = yield session.run(query, params);
            yield session.close();
            return result;
        });
    }
}
export default GraphDAO;
