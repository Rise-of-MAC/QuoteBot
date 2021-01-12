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
        this.driver = neo4j.driver(`bolt://${process.env.GRAPHDB_HOST}`, neo4j.auth.basic('neo4j', process.env.GRAPHDB_PASSWORD));
    }
    prepare() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.run("CREATE CONSTRAINT ON (n:Movie) ASSERT n.id IS UNIQUE", {});
            yield this.run("CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE", {});
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.driver.close();
        });
    }
    upsertMovieLiked(user, movieId, liked) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.run(`
      MATCH (m:Movie {id: $movieId})
        MERGE (u:User {id: $userId})
          ON CREATE SET u.isBot = $isBot,
                        u.firstName = $firstName,
                        u.lastName = $lastName,
                        u.username = $username,
                        u.languageCode = $languageCode
          ON MATCH SET  u.isBot = $isBot,
                        u.firstName = $firstName,
                        u.lastName = $lastName,
                        u.username = $username,
                        u.languageCode = $languageCode
        MERGE (u)-[l:LIKED]->(m)
          ON CREATE SET l.rank = $likedRank,
                        l.at = $likedAt
          ON MATCH SET  l.rank = $likedRank,
                        l.at = $likedAt
    `, {
                movieId,
                isBot: user.is_bot,
                firstName: user.first_name,
                lastName: user.last_name,
                languageCode: user.language_code,
                username: user.username,
                userId: this.toInt(user.id),
                likedRank: liked.rank,
                likedAt: this.toDate(liked.at),
            });
        });
    }
    getMovieLiked(userId, movieId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run('MATCH (:User{id: $userId})-[l:LIKED]-(:Movie{id: $movieId}) RETURN l', {
                userId,
                movieId,
            }).then((res) => {
                if (res.records.length === 0)
                    return null;
                else {
                    const record = res.records[0].get('l');
                    return {
                        rank: record.properties.rank,
                        at: record.properties.at,
                    };
                }
            });
        });
    }
    upsertMovie(movieId, movieTitle) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run('MERGE (m:Movie{id: $movieId}) ON CREATE SET m.title = $movieTitle RETURN m', {
                movieId,
                movieTitle,
            });
        });
    }
    upsertActor(movieId, actor) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (m:Movie{ id: $movieId })
      MERGE (a:Actor{id: $actorId})
        ON CREATE SET a.name = $actorName
      MERGE (a)-[r:PLAYED_IN]->(m)
    `, {
                movieId,
                actorId: actor.id,
                actorName: actor.name,
            });
        });
    }
    upsertGenre(movieId, genre) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (m:Movie{ id: $movieId })
      MERGE (g:Genre{id: $genreId})
        ON CREATE SET g.name = $genreName
      MERGE (m)-[r:BELONGS_TO]->(g)
    `, {
                movieId,
                genreId: genre.id,
                genreName: genre.name,
            });
        });
    }
    upsertUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MERGE (u:User {id: $userId})
      ON CREATE SET u.isBot = $isBot,
                    u.firstName = $firstName,
                    u.lastName = $lastName,
                    u.username = $username,
                    u.languageCode = $languageCode
      ON MATCH SET  u.isBot = $isBot,
                    u.firstName = $firstName,
                    u.lastName = $lastName,
                    u.username = $username,
                    u.languageCode = $languageCode
    `, {
                userId: this.toInt(user.id),
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                languageCode: user.language_code,
                isBot: user.is_bot,
            });
        });
    }
    upsertAdded(userId, movieId, added) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (m:Movie{ id: $movieId })
      MATCH (u:User{ id: $userId })
      MERGE (u)-[r:ADDED]->(m)
        ON CREATE SET r.at = $at
        ON MATCH SET  r.at = $at
    `, {
                userId: this.toInt(userId),
                movieId,
                at: this.toDate(added.at),
            });
        });
    }
    upsertMovieUserLiked(userId, movieId, liked) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (m:Movie{ id: $movieId })
      MATCH (u:User{ id: $userId })
      MERGE (u)-[r:LIKED]->(m)
        ON CREATE SET r.at = $at,
                      r.rank = $rank
        ON MATCH SET  r.at = $at,
                      r.rank = $rank
    `, {
                userId: this.toInt(userId),
                movieId,
                at: this.toDate(liked.at),
                rank: this.toInt(liked.rank)
            });
        });
    }
    upsertGenreLiked(userId, genreId, liked) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (g:Genre{ id: $genreId })
      MATCH (u:User{ id: $userId })
      MERGE (u)-[r:LIKED]->(g)
      ON CREATE SET r.at = $at,
                    r.rank = $rank
      ON MATCH SET  r.at = $at,
                    r.rank = $rank
    `, {
                userId: this.toInt(userId),
                genreId: this.toInt(genreId),
                at: this.toDate(liked.at),
                rank: liked.rank
            });
        });
    }
    upsertActorLiked(userId, actorId, liked) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (a:Actor{ id: $actorId })
      MATCH (u:User{ id: $userId })
      MERGE (u)-[r:LIKED]->(g)
      ON CREATE SET r.at = $at,
                    r.rank = $rank
      ON MATCH SET  r.at = $at,
                    r.rank = $rank
    `, {
                userId: this.toInt(userId),
                actorId: this.toInt(actorId),
                at: this.toDate(liked.at),
                rank: this.toInt(liked.rank)
            });
        });
    }
    upsertRequested(userId, movieId, requested) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (m:Movie{ id: $movieId })
      MATCH (u:User{ id: $userId })
      MERGE (u)-[r:REQUESTED]->(m)
        ON CREATE SET r.at = $at
        ON MATCH SET  r.at = $at
    `, {
                userId: this.toInt(userId),
                movieId,
                at: this.toDate(requested.at),
            });
        });
    }
    upsertCommentAboutMovie(userId, movieId, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (m:Movie{ id: $movieId })
      MATCH (u:User{ id: $userId })
      MERGE (c:Comment{ id: $commentId })
        ON CREATE SET c.text = $commentText,
                      c.at = $commentAt
        ON MATCH SET  c.text = $commentText,
                      c.at = $commentAt
      MERGE (u)-[r:WROTE]->(c)
      MERGE (c)-[r:ABOUT]->(m)
    `, {
                userId: this.toInt(userId),
                movieId,
                commentId: this.toInt(comment.id),
                commentAt: this.toDate(comment.at),
                commentText: comment.text
            });
        });
    }
    upsertCommentAbountComment(userId, commentId, comment) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.run(`
      MATCH (cc:Comment{ id: $commentId })
      MATCH (u:User{ id: $userId })
      MERGE (c:Comment{ id: $subCommentId })
        ON CREATE SET c.text = $subCommentText,
                      c.at = $subCommentAt
        ON MATCH SET  c.text = $subCommentText,
                      c.at = $subCommentAt
      MERGE (u)-[r:WROTE]->(c)
      MERGE (c)-[r:ABOUT]->(cc)
    `, {
                userId: this.toInt(userId),
                commentId: this.toInt(commentId),
                subCommentId: this.toInt(comment.id),
                subCommentAt: this.toDate(comment.at),
                subCommentText: comment.text
            });
        });
    }
    recommendActors(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
            return await this.run(`
              match (u:User{id: $userId})-[l:LIKED]->(m:Movie)<-[:PLAYED_IN]-(a:Actor)-[:PLAYED_IN]->(m2:Movie)<-[l2:LIKED]-(u)
              where id(m) < id(m2) and l.rank > 3 and l2.rank > 3
              return a, count(*)
              order by count(*) desc
              limit 5
            `, {
              userId
            }).then((result) => result.records);
            */
            return yield this.run(`
      match (u:User{id: $userId})-[l:LIKED]->(m:Movie)<-[:PLAYED_IN]-(a:Actor)
      return a, count(*)
      order by count(*) desc
      limit 5
    `, {
                userId
            }).then((result) => result.records);
        });
    }
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
