"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = __importStar(require("dotenv"));
dotenv.config();
var telegraf_1 = require("telegraf");
var DocumentDAO_1 = __importDefault(require("./DocumentDAO"));
var GraphDAO_1 = __importDefault(require("./GraphDAO"));
var Model_1 = require("./Model");
var bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
var graphDAO = new GraphDAO_1.default();
var documentDAO = new DocumentDAO_1.default();
function stripMargin(template) {
    var expressions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        expressions[_i - 1] = arguments[_i];
    }
    var result = template.reduce(function (accumulator, part, i) {
        return accumulator + expressions[i - 1] + part;
    });
    return result.replace(/(\n|\r|\r\n)\s*\|/g, '$1');
}
function buildLikeKeyboard(movieId, currentLike) {
    return {
        inline_keyboard: [
            Model_1.likedValues.map(function (v) { return ({
                text: currentLike && currentLike.rank === v ? "★".repeat(v) : "☆".repeat(v),
                callback_data: v + '__' + movieId,
            }); }),
        ],
    };
}
// User is using the inline query mode on the bot
bot.on('inline_query', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var query, movies, answer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = ctx.inlineQuery;
                if (!query) return [3 /*break*/, 2];
                return [4 /*yield*/, documentDAO.getMovies(query.query)];
            case 1:
                movies = _a.sent();
                answer = movies.map(function (movie) { return ({
                    id: movie._id,
                    type: 'article',
                    title: movie.title,
                    description: movie.description,
                    reply_markup: buildLikeKeyboard(movie._id),
                    input_message_content: {
                        message_text: stripMargin(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n          |Title: ", "\n          |Description: ", ",\n          |Year: ", "\n          |Actors: ", "\n          |Genres: ", "\n        "], ["\n          |Title: ", "\n          |Description: ", ",\n          |Year: ", "\n          |Actors: ", "\n          |Genres: ", "\n        "])), movie.title, movie.description, movie.year, movie.actors, movie.genre)
                    },
                }); });
                ctx.answerInlineQuery(answer);
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
// User chose a movie from the list displayed in the inline query
// Used to update the keyboard and show filled stars if user already liked it
bot.on('chosen_inline_result', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var liked;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(ctx.from && ctx.chosenInlineResult)) return [3 /*break*/, 2];
                return [4 /*yield*/, graphDAO.getMovieLiked(ctx.from.id, ctx.chosenInlineResult.result_id)];
            case 1:
                liked = _a.sent();
                if (liked !== null) {
                    ctx.editMessageReplyMarkup(buildLikeKeyboard(ctx.chosenInlineResult.result_id, liked));
                }
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
bot.on('callback_query', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, rank, movieId, liked;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(ctx.callbackQuery && ctx.from)) return [3 /*break*/, 2];
                _a = __read(ctx.callbackQuery.data.split('__'), 2), rank = _a[0], movieId = _a[1];
                console.log(rank, movieId);
                liked = {
                    rank: parseInt(rank, 10),
                    at: new Date()
                };
                return [4 /*yield*/, graphDAO.upsertMovieLiked(__assign({ first_name: 'unknown', last_name: 'unknown', language_code: 'fr', is_bot: false, username: 'unknown' }, ctx.from), movieId, liked)];
            case 1:
                _b.sent();
                ctx.editMessageReplyMarkup(buildLikeKeyboard(movieId, liked));
                _b.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
bot.command('help', function (ctx) {
    ctx.reply("\nTODO\n  ");
});
bot.command('start', function (ctx) {
    ctx.reply('You\'re doing quite well.\n\nGlaDOS (ironically)');
});
bot.command('recommendactor', function (ctx) {
    if (!ctx.from || !ctx.from.id) {
        ctx.reply('We cannot guess who you are');
    }
    else {
        graphDAO.recommendActors(ctx.from.id).then(function (records) {
            if (records.length === 0)
                ctx.reply("You haven't liked enough movies to have recommendations");
            else {
                var actorsList = records.map(function (record) {
                    var name = record.get('a').properties.name;
                    var count = record.get('count(*)').toInt();
                    return name + " (" + count + ")";
                }).join("\n\t");
                ctx.reply("Based your like and dislike we recommend the following actor(s):\n\t" + actorsList);
            }
        });
    }
});
// Initialize mongo connexion
// before starting bot
documentDAO.init().then(function () {
    bot.startPolling();
});
var templateObject_1;
