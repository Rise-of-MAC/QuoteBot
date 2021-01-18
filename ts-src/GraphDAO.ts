import neo4j, { Driver, types, int, auth } from 'neo4j-driver';

import {
    User,
    Quote,
    Tag,
    Author,
    Liked,
} from './Model';

export const amountOfRecommendedTags = 5;

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
      MERGE (q)-[r:HASTAG]->(t)
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

  async getMyTopFiveTags(user: User) : Promise<Tag[]>{
    return await this.run(`
    MATCH (u:User{id: $userId})-[l:LIKED]->(q:Quote)-[l2:HASTAG]->(t:Tag) 
    RETURN t, count(*)
    ORDER BY count(*) desc
    LIMIT ` + amountOfRecommendedTags + `
  `, {
    userId: user.id
  }).then((res) => {
      if (res.records.length === 0) return [];
      else {
        return res.records.map(q => ({id: q.get('t').properties.id, name:  q.get('t').properties.name}));
      }
    });
  }

  async getRecommendation(user: User, tagId: number){
    return await this.run(`
    MATCH (u:User{id: $userId})-[l:LIKED]->(q:Quote)<-[w:WROTE]-(a:Author)
    MATCH (a)-[w2:WROTE]->(q2:Quote)-[l2:HASTAG]->(t:Tag{id:$tagId})
    WHERE NOT (u)-[:LIKED]->(q2)
    WITH q2, rand() AS r
    ORDER BY r
    RETURN q2
    LIMIT 1
  `, {
    userId: user.id,
    tagId: tagId
  }).then((res) => {
      if (res.records.length === 0) return [];
      else {
        return res.records[0].get('q2').properties.id;
      }
    });
  }

 
  async getQuotesLiked(userId: number, limit: number, page: number): Promise<string[]> {
    const offset = page * limit;
    return await this.run('MATCH (:User{id: $userId})-[LIKED]-(q:Quote) RETURN q ORDER BY q.id SKIP $offset LIMIT $limit', {
      userId,
      offset,
      limit,
    }).then((res) => {
      if (res.records.length === 0) return [];
      else {
        return res.records.map(q => q.get('q').properties.id);
      }
    });
  }

  async getQuoteLiked(userId: number, quoteId: string): Promise<boolean> {
    return await this.run('MATCH (:User{id: $userId})-[l:LIKED]-(:Quote{id: $quoteId}) RETURN l', {
      userId,
      quoteId,
    }).then((res) => !!res.records.length);
  }

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
