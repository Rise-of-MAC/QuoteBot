import neo4j, { Driver, types, int, auth } from 'neo4j-driver';

import {
    User,
    Quote,
    Tag,
    Author,
    Liked,
} from './Model';

class GraphDAO {

  private driver: Driver;

  constructor() {
    console.log("graphdb host = " + process.env.GRAPHDB_HOST);
    console.log("graphdb password = " + process.env.GRAPHDB_PASSWORD);
    console.log("process.env = " + process.env);
    this.driver = neo4j.driver(`bolt://${process.env.GRAPHDB_HOST}`, neo4j.auth.basic('neo4j', process.env.GRAPHDB_PASSWORD));
  }

  async prepare() {
    await this.run("CREATE CONSTRAINT ON (q:Quote) ASSERT q.id IS UNIQUE", {});
    await this.run("CREATE CONSTRAINT ON (a:Author) ASSERT a.id IS UNIQUE", {});
    await this.run("CREATE CONSTRAINT ON (t:Tag) ASSERT t.id IS UNIQUE", {});
    await this.run("CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE", {});
  }

  async close() {
    await this.driver.close();
  }

  async upsertQuote(quoteId: string) {
    return await this.run('MERGE (q:Quote{id: $quoteId}) RETURN q', {
      quoteId,
    })
  }


   //Link an author to a quote. If it did not exist, creates the author
   async upsertAuthor(quoteId: string, author: Author) {
    return await this.run(`
      MATCH (q:Quote{id: $quoteId})
      MERGE (a:Author{id: $authorId})
        ON CREATE SET a.name = $authorName
      MERGE (a)-[r:WROTE]->(q)
    `, {
      quoteId,
      authorId: author.id,
      authorName: author.name,
    })
  }

  //Link a tag to a quote. If it did not exist, creates the author
  async upsertTag(quoteId: string, tag: Tag) {
    return await this.run(`
      MATCH (q:Quote{ id: $quoteId })
      MERGE (t:Tag{id: $tagId})
        ON CREATE SET t.name = $tagName
      MERGE (q)-[r:LABELS]->(t)
    `, {
      quoteId,
      tagId: tag.id,
      tagName: tag.name,
    })
  }

  async upsertUser(user: User) {
    return await this.run(`
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
  }



  async upsertQuoteLiked(user: User, quoteId: string) {
    await this.run(`
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
  }

  

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

  private toDate(value: Date) {
    return types.DateTime.fromStandardDate(value);
  }

  private toInt(value: number | string) {
    return int(value);
  }

  private async run(query: string, params: any) {
    const session = this.driver.session();
    const result = await session.run(query, params);
    await session.close();
    return result;
  }
}

export default GraphDAO;
