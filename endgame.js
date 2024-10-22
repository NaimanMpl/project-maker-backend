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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var _this = this;
var Player = /** @class */ (function () {
    function Player(name, position, health) {
        if (position === void 0) { position = [0, 0]; }
        if (health === void 0) { health = 100; }
        this.name = name;
        this.position = position;
        this.health = health;
        this.alive = true;
    }
    Player.prototype.moveTo = function (newPosition) {
        this.position = newPosition;
        console.log("".concat(this.name, " moved to position ").concat(this.position));
    };
    Player.prototype.takeDamage = function (damage) {
        this.health -= damage;
        console.log("".concat(this.name, " takes ").concat(damage, " damage. Health: ").concat(this.health));
        if (this.health <= 0) {
            this.alive = false;
            console.log("".concat(this.name, " has died!"));
        }
    };
    return Player;
}());
var Game = /** @class */ (function () {
    function Game(player, jobPosition, timeLimit) {
        this.player = player;
        this.jobPosition = jobPosition;
        this.timeLimit = timeLimit;
        this.startTime = Date.now();
    }
    Game.prototype.checkVictory = function () {
        if (this.player.position[0] === this.jobPosition[0] && this.player.position[1] === this.jobPosition[1]) {
            console.log("Victory! You have reached your job!");
            return true;
        }
        return false;
    };
    Game.prototype.checkDefeat = function () {
        var currentTime = Date.now();
        var elapsedTime = (currentTime - this.startTime) / 1000; // Convert to seconds
        if (!this.player.alive) {
            console.log("Game Over! You died from a trap.");
            return true;
        }
        if (elapsedTime > this.timeLimit) {
            console.log("Game Over! Time limit exceeded.");
            return true;
        }
        return false;
    };
    Game.prototype.runGame = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!true) return [3 /*break*/, 2];
                        if (this.checkVictory()) {
                            return [3 /*break*/, 2];
                        }
                        if (this.checkDefeat()) {
                            return [3 /*break*/, 2];
                        }
                        // Simulate game actions (moving, traps, etc.)
                        return [4 /*yield*/, this.delay(1000)];
                    case 1:
                        // Simulate game actions (moving, traps, etc.)
                        _a.sent(); // Simulate 1 second passing (you can modify this logic)
                        return [3 /*break*/, 0];
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Game.prototype.delay = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    return Game;
}());
// Example usage
var main = function () { return __awaiter(_this, void 0, void 0, function () {
    var player, jobPosition, timeLimit, game;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                player = new Player("Martin");
                jobPosition = [10, 10];
                timeLimit = 60;
                game = new Game(player, jobPosition, timeLimit);
                // Move player to simulate gameplay (you can replace this with your game logic)
                player.moveTo([5, 5]); // Move to an intermediate position
                player.takeDamage(30); // Simulate trap damage
                return [4 /*yield*/, game.delay(2000)];
            case 1:
                _a.sent(); // Simulate 2 seconds passing
                player.moveTo([10, 10]); // Move to the job (goal)
                // Run the game loop
                return [4 /*yield*/, game.runGame()];
            case 2:
                // Run the game loop
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
main();
