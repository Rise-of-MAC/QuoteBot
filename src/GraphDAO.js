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
Object.defineProperty(exports, "__esModule", { value: true });
var neo4j_driver_1 = __importStar(require("neo4j-driver"));
var GraphDAO = /** @class */ (function () {
    function GraphDAO() {
        this.driver = neo4j_driver_1.default.driver("bolt://" + process.env.GRAPHDB_HOST, neo4j_driver_1.default.auth.basic('neo4j', process.env.GRAPHDB_PASSWORD));
    }
    GraphDAO.prototype.prepare = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("CREATE CONSTRAINT ON (n:Movie) ASSERT n.id IS UNIQUE", {})];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.run("CREATE CONSTRAINT ON (u:User) ASSERT u.id IS UNIQUE", {})];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GraphDAO.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.driver.close()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GraphDAO.prototype.upsertMovieLiked = function (user, movieId, liked) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (m:Movie {id: $movieId})\n        MERGE (u:User {id: $userId})\n          ON CREATE SET u.isBot = $isBot,\n                        u.firstName = $firstName,\n                        u.lastName = $lastName,\n                        u.username = $username,\n                        u.languageCode = $languageCode\n          ON MATCH SET  u.isBot = $isBot,\n                        u.firstName = $firstName,\n                        u.lastName = $lastName,\n                        u.username = $username,\n                        u.languageCode = $languageCode\n        MERGE (u)-[l:LIKED]->(m)\n          ON CREATE SET l.rank = $likedRank,\n                        l.at = $likedAt\n          ON MATCH SET  l.rank = $likedRank,\n                        l.at = $likedAt\n    ", {
                            movieId: movieId,
                            isBot: user.is_bot,
                            firstName: user.first_name,
                            lastName: user.last_name,
                            languageCode: user.language_code,
                            username: user.username,
                            userId: this.toInt(user.id),
                            likedRank: liked.rank,
                            likedAt: this.toDate(liked.at),
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GraphDAO.prototype.getMovieLiked = function (userId, movieId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run('MATCH (:User{id: $userId})-[l:LIKED]-(:Movie{id: $movieId}) RETURN l', {
                            userId: userId,
                            movieId: movieId,
                        }).then(function (res) {
                            if (res.records.length === 0)
                                return null;
                            else {
                                var record = res.records[0].get('l');
                                return {
                                    rank: record.properties.rank,
                                    at: record.properties.at,
                                };
                            }
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertMovie = function (movieId, movieTitle) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run('MERGE (m:Movie{id: $movieId}) ON CREATE SET m.title = $movieTitle RETURN m', {
                            movieId: movieId,
                            movieTitle: movieTitle,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertActor = function (movieId, actor) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (m:Movie{ id: $movieId })\n      MERGE (a:Actor{id: $actorId})\n        ON CREATE SET a.name = $actorName\n      MERGE (a)-[r:PLAYED_IN]->(m)\n    ", {
                            movieId: movieId,
                            actorId: actor.id,
                            actorName: actor.name,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertGenre = function (movieId, genre) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (m:Movie{ id: $movieId })\n      MERGE (g:Genre{id: $genreId})\n        ON CREATE SET g.name = $genreName\n      MERGE (m)-[r:BELONGS_TO]->(g)\n    ", {
                            movieId: movieId,
                            genreId: genre.id,
                            genreName: genre.name,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertUser = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MERGE (u:User {id: $userId})\n      ON CREATE SET u.isBot = $isBot,\n                    u.firstName = $firstName,\n                    u.lastName = $lastName,\n                    u.username = $username,\n                    u.languageCode = $languageCode\n      ON MATCH SET  u.isBot = $isBot,\n                    u.firstName = $firstName,\n                    u.lastName = $lastName,\n                    u.username = $username,\n                    u.languageCode = $languageCode\n    ", {
                            userId: this.toInt(user.id),
                            firstName: user.first_name,
                            lastName: user.last_name,
                            username: user.username,
                            languageCode: user.language_code,
                            isBot: user.is_bot,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertAdded = function (userId, movieId, added) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (m:Movie{ id: $movieId })\n      MATCH (u:User{ id: $userId })\n      MERGE (u)-[r:ADDED]->(m)\n        ON CREATE SET r.at = $at\n        ON MATCH SET  r.at = $at\n    ", {
                            userId: this.toInt(userId),
                            movieId: movieId,
                            at: this.toDate(added.at),
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertMovieUserLiked = function (userId, movieId, liked) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (m:Movie{ id: $movieId })\n      MATCH (u:User{ id: $userId })\n      MERGE (u)-[r:LIKED]->(m)\n        ON CREATE SET r.at = $at,\n                      r.rank = $rank\n        ON MATCH SET  r.at = $at,\n                      r.rank = $rank\n    ", {
                            userId: this.toInt(userId),
                            movieId: movieId,
                            at: this.toDate(liked.at),
                            rank: this.toInt(liked.rank)
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertGenreLiked = function (userId, genreId, liked) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (g:Genre{ id: $genreId })\n      MATCH (u:User{ id: $userId })\n      MERGE (u)-[r:LIKED]->(g)\n      ON CREATE SET r.at = $at,\n                    r.rank = $rank\n      ON MATCH SET  r.at = $at,\n                    r.rank = $rank\n    ", {
                            userId: this.toInt(userId),
                            genreId: this.toInt(genreId),
                            at: this.toDate(liked.at),
                            rank: liked.rank
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertActorLiked = function (userId, actorId, liked) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (a:Actor{ id: $actorId })\n      MATCH (u:User{ id: $userId })\n      MERGE (u)-[r:LIKED]->(g)\n      ON CREATE SET r.at = $at,\n                    r.rank = $rank\n      ON MATCH SET  r.at = $at,\n                    r.rank = $rank\n    ", {
                            userId: this.toInt(userId),
                            actorId: this.toInt(actorId),
                            at: this.toDate(liked.at),
                            rank: this.toInt(liked.rank)
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertRequested = function (userId, movieId, requested) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (m:Movie{ id: $movieId })\n      MATCH (u:User{ id: $userId })\n      MERGE (u)-[r:REQUESTED]->(m)\n        ON CREATE SET r.at = $at\n        ON MATCH SET  r.at = $at\n    ", {
                            userId: this.toInt(userId),
                            movieId: movieId,
                            at: this.toDate(requested.at),
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertCommentAboutMovie = function (userId, movieId, comment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (m:Movie{ id: $movieId })\n      MATCH (u:User{ id: $userId })\n      MERGE (c:Comment{ id: $commentId })\n        ON CREATE SET c.text = $commentText,\n                      c.at = $commentAt\n        ON MATCH SET  c.text = $commentText,\n                      c.at = $commentAt\n      MERGE (u)-[r:WROTE]->(c)\n      MERGE (c)-[r:ABOUT]->(m)\n    ", {
                            userId: this.toInt(userId),
                            movieId: movieId,
                            commentId: this.toInt(comment.id),
                            commentAt: this.toDate(comment.at),
                            commentText: comment.text
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.upsertCommentAbountComment = function (userId, commentId, comment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      MATCH (cc:Comment{ id: $commentId })\n      MATCH (u:User{ id: $userId })\n      MERGE (c:Comment{ id: $subCommentId })\n        ON CREATE SET c.text = $subCommentText,\n                      c.at = $subCommentAt\n        ON MATCH SET  c.text = $subCommentText,\n                      c.at = $subCommentAt\n      MERGE (u)-[r:WROTE]->(c)\n      MERGE (c)-[r:ABOUT]->(cc)\n    ", {
                            userId: this.toInt(userId),
                            commentId: this.toInt(commentId),
                            subCommentId: this.toInt(comment.id),
                            subCommentAt: this.toDate(comment.at),
                            subCommentText: comment.text
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.recommendActors = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.run("\n      match (u:User{id: $userId})-[l:LIKED]->(m:Movie)<-[:PLAYED_IN]-(a:Actor)\n      return a, count(*)\n      order by count(*) desc\n      limit 5\n    ", {
                            userId: userId
                        }).then(function (result) { return result.records; })];
                    case 1: 
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
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GraphDAO.prototype.toDate = function (value) {
        return neo4j_driver_1.types.DateTime.fromStandardDate(value);
    };
    GraphDAO.prototype.toInt = function (value) {
        return neo4j_driver_1.int(value);
    };
    GraphDAO.prototype.run = function (query, params) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.driver.session();
                        return [4 /*yield*/, session.run(query, params)];
                    case 1:
                        result = _a.sent();
                        return [4 /*yield*/, session.close()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return GraphDAO;
}());
exports.default = GraphDAO;
